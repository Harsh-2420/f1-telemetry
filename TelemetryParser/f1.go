package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"net"
	"net/netip"
	"reflect"
	"time"
)

const REPLAY_DATA_PORT = 9000
const F1_TELEMETRY_DATA_PORT = 20777
const UDP_MAX_PACKET_SIZE = 4096
const PROCESSING_BUFFER_SIZE = UDP_MAX_PACKET_SIZE * 8
const F1_PACKET_HEADER_PACKED_SIZE = 29
const F1_MAX_NUM_CARS = 22

const (
	PacketID_Motion uint8 = iota
	PacketID_Session
	PacketID_LapData
	PacketID_Event
	PacketID_Participants
	PacketID_CarSetups
	PacketID_CarTelemetry
	PacketID_CarStatus
	PacketID_FinalClassification
	PacketID_LobbyInfo
	PacketID_CarDamage
	PacketID_SessionHistory
	PacketID_TyreSets
	PacketID_MotionEx

	PacketID_Count
)

var PACKET_ID_SIZE_MAP = [PacketID_Count]uint32{1349, 644, 1131, 45, 1306, 1107, 1352, 1239, 1020, 1218, 953, 1460, 231, 217}

type F1Packet interface {
	Header() *F1PacketHeader
}

type F1PacketHeader struct {
	PacketFormat            uint16  `json:"-"` // Version of the packet format, e.g., 2023
	GameYear                uint8   `json:"-"` // Game year - last two digits, e.g., 23
	GameMajorVersion        uint8   `json:"-"` // Game major version - "X.00"
	GameMinorVersion        uint8   `json:"-"` // Game minor version - "1.XX"
	PacketVersion           uint8   `json:"-"` // Version of this packet type, all start from 1
	PacketId                uint8   // Identifier for the packet type
	SessionUID              uint64  // Unique identifier for the session
	SessionTime             float32 // Session timestamp
	FrameIdentifier         uint32  // Identifier for the frame the data was retrieved on
	OverallFrameIdentifier  uint32  // Overall identifier for the frame the data was retrieved on, doesn't go back after flashbacks
	PlayerCarIndex          uint8   // Index of player's car in the array
	SecondaryPlayerCarIndex uint8   // Index of secondary player's car in the array (splitscreen), 255 if no second player
}

type F1EventDataDetails struct {
	f1PacketHeader  *F1PacketHeader
	EventStringCode [4]byte
}

const (
	BUTTON_NONE  uint32 = 0x00
	BUTTON_LEFT  uint32 = 0x10
	BUTTON_RIGHT uint32 = 0x20
	BUTTON_UP    uint32 = 0x40
	BUTTON_DOWN  uint32 = 0x80
)

type F1ButtonEvent struct {
	f1EventDataDetails *F1EventDataDetails
	ButtonStatus       uint32 // Bit flags specifying which buttons are being pressed
}

type F1CarMotionData struct {
	WorldPositionX     float32 `json:"-"` // World space X position - metres
	WorldPositionY     float32 `json:"-"` // World space Y position
	WorldPositionZ     float32 `json:"-"` // World space Z position
	WorldVelocityX     float32 `json:"-"` // Velocity in world space X – metres/s
	WorldVelocityY     float32 `json:"-"` // Velocity in world space Y
	WorldVelocityZ     float32 `json:"-"` // Velocity in world space Z
	WorldForwardDirX   int16   `json:"-"` // World space forward X direction (normalised)
	WorldForwardDirY   int16   `json:"-"` // World space forward Y direction (normalised)
	WorldForwardDirZ   int16   `json:"-"` // World space forward Z direction (normalised)
	WorldRightDirX     int16   `json:"-"` // World space right X direction (normalised)
	WorldRightDirY     int16   `json:"-"` // World space right Y direction (normalised)
	WorldRightDirZ     int16   `json:"-"` // World space right Z direction (normalised)
	GForceLateral      float32 // Lateral G-Force component
	GForceLongitudinal float32 // Longitudinal G-Force component
	GForceVertical     float32 // Vertical G-Force component
	Yaw                float32 `json:"-"` // Yaw angle in radians
	Pitch              float32 `json:"-"` // Pitch angle in radians
	Roll               float32 `json:"-"` // Roll angle in radians
}

type F1CarMotionDataPacket struct {
	f1PacketHeader *F1PacketHeader
	CarMotionData  [F1_MAX_NUM_CARS]F1CarMotionData
}

type F1CarTelemetryData struct {
	Speed                   uint16     // Speed of car in kilometres per hour
	Throttle                float32    // Amount of throttle applied (0.0 to 1.0)
	Steer                   float32    // Steering (-1.0 (full lock left) to 1.0 (full lock right))
	Brake                   float32    // Amount of brake applied (0.0 to 1.0)
	Clutch                  uint8      // Amount of clutch applied (0 to 100)
	Gear                    int8       // Gear selected (1-8, N=0, R=-1)
	EngineRPM               uint16     // Engine RPM
	DRS                     uint8      // 0 = off, 1 = on
	RevLightsPercent        uint8      // Rev lights indicator (percentage)
	RevLightsBitValue       uint16     // Rev lights (bit 0 = leftmost LED, bit 14 = rightmost LED)
	BrakesTemperature       [4]uint16  // Brakes temperature (celsius)
	TyresSurfaceTemperature [4]uint8   // Tyres surface temperature (celsius)
	TyresInnerTemperature   [4]uint8   // Tyres inner temperature (celsius)
	EngineTemperature       uint16     // Engine temperature (celsius)
	TyresPressure           [4]float32 // Tyres pressure (PSI)
	SurfaceType             [4]uint8   // Driving surface, see appendices
}

type F1CarTelemetryDataPacket struct {
	f1PacketHeader               *F1PacketHeader
	CarTelemetryData             [F1_MAX_NUM_CARS]F1CarTelemetryData
	MfdPanelIndex                uint8
	MfdPanelIndexSecondaryPlayer uint8
	SuggestedGear                int8
}

type F1CarStatusData struct {
	TractionControl         uint8   // Traction control - 0 = off, 1 = medium, 2 = full
	AntiLockBrakes          uint8   // 0 (off) - 1 (on)
	FuelMix                 uint8   // Fuel mix - 0 = lean, 1 = standard, 2 = rich, 3 = max
	FrontBrakeBias          uint8   // Front brake bias (percentage)
	PitLimiterStatus        uint8   // Pit limiter status - 0 = off, 1 = on
	FuelInTank              float32 // Current fuel mass
	FuelCapacity            float32 // Fuel capacity
	FuelRemainingLaps       float32 // Fuel remaining in terms of laps (value on MFD)
	MaxRPM                  uint16  // Cars max RPM, point of rev limiter
	IdleRPM                 uint16  // Cars idle RPM
	MaxGears                uint8   // Maximum number of gears
	DRSAllowed              uint8   // 0 = not allowed, 1 = allowed
	DRSActivationDistance   uint16  // 0 = DRS not available, non-zero - DRS will be available in [X] metres
	ActualTyreCompound      uint8   // See comments in the original struct for mappings
	VisualTyreCompound      uint8   // See comments in the original struct for mappings
	TyresAgeLaps            uint8   // Age in laps of the current set of tyres
	VehicleFIAFlags         int8    // -1 = invalid/unknown, 0 = none, 1 = green, 2 = blue, 3 = yellow
	EnginePowerICE          float32 // Engine power output of ICE (W)
	EnginePowerMGUK         float32 // Engine power output of MGU-K (W)
	ERSScoreEnergy          float32 // ERS energy store in Joules
	ERSDeployMode           uint8   // ERS deployment mode, 0 = none, 1 = medium, 2 = hotlap, 3 = overtake
	ERSHarvestedThisLapMGUK float32 // ERS energy harvested this lap by MGU-K
	ERSHarvestedThisLapMGUH float32 // ERS energy harvested this lap by MGU-H
	ERSDeployedThisLap      float32 // ERS energy deployed this lap
	NetworkPaused           uint8   // Whether the car is paused in a network game
}

type F1CarStatusDataPacket struct {
	f1PacketHeader *F1PacketHeader
	CarStatusData  [F1_MAX_NUM_CARS]F1CarStatusData
}

type F1LapData struct {
	LastLapTimeInMS             uint32  // Last lap time in milliseconds
	CurrentLapTimeInMS          uint32  // Current time around the lap in milliseconds
	Sector1TimeInMS             uint16  // Sector 1 time in milliseconds
	Sector1TimeMinutes          uint8   // Sector 1 whole minute part
	Sector2TimeInMS             uint16  // Sector 2 time in milliseconds
	Sector2TimeMinutes          uint8   // Sector 2 whole minute part
	DeltaToCarInFrontInMS       uint16  // Time delta to car in front in milliseconds
	DeltaToRaceLeaderInMS       uint16  // Time delta to race leader in milliseconds
	LapDistance                 float32 // Distance vehicle is around current lap in metres – could be negative if line hasn’t been crossed yet
	TotalDistance               float32 // Total distance travelled in session in metres – could be negative if line hasn’t been crossed yet
	SafetyCarDelta              float32 // Delta in seconds for safety car
	CarPosition                 uint8   // Car race position
	CurrentLapNum               uint8   // Current lap number
	PitStatus                   uint8   // 0 = none, 1 = pitting, 2 = in pit area
	NumPitStops                 uint8   // Number of pit stops taken in this race
	Sector                      uint8   // 0 = sector1, 1 = sector2, 2 = sector3
	CurrentLapInvalid           uint8   // Current lap invalid - 0 = valid, 1 = invalid
	Penalties                   uint8   // Accumulated time penalties in seconds to be added
	TotalWarnings               uint8   // Accumulated number of warnings issued
	CornerCuttingWarnings       uint8   // Accumulated number of corner cutting warnings issued
	NumUnservedDriveThroughPens uint8   // Num drive through pens left to serve
	NumUnservedStopGoPens       uint8   // Num stop go pens left to serve
	GridPosition                uint8   // Grid position the vehicle started the race in
	DriverStatus                uint8   // Status of driver - 0 = in garage, 1 = flying lap, 2 = in lap, 3 = out lap, 4 = on track
	ResultStatus                uint8   // Result status - 0 = invalid, 1 = inactive, 2 = active, 3 = finished, 4 = didnotfinish, 5 = disqualified, 6 = not classified, 7 = retired
	PitLaneTimerActive          uint8   // Pit lane timing, 0 = inactive, 1 = active
	PitLaneTimeInLaneInMS       uint16  // If active, the current time spent in the pit lane in ms
	PitStopTimerInMS            uint16  // Time of the actual pit stop in ms
	PitStopShouldServePen       uint8   // Whether the car should serve a penalty at this stop
}

type F1LapDataPacket struct {
	f1PacketHeader       *F1PacketHeader            // Header
	LapData              [F1_MAX_NUM_CARS]F1LapData // Lap data for all cars on track
	TimeTrialPBCarIdx    uint8                      // Index of Personal Best car in time trial (255 if invalid)
	TimeTrialRivalCarIdx uint8                      // Index of Rival car in time trial (255 if invalid)
}

type F1FinalClassificationData struct {
	Position          uint8    // Finishing position
	NumLaps           uint8    // Number of laps completed
	GridPosition      uint8    // Grid position of the car
	Points            uint8    // Number of points scored
	NumPitStops       uint8    // Number of pit stops made
	ResultStatus      uint8    // Result status - 0 = invalid, 1 = inactive, 2 = active, 3 = finished, 4 = didnotfinish, 5 = disqualified, 6 = not classified, 7 = retired
	BestLapTimeInMS   uint32   // Best lap time of the session in milliseconds
	TotalRaceTime     float64  // Total race time in seconds without penalties
	PenaltiesTime     uint8    // Total penalties accumulated in seconds
	NumPenalties      uint8    // Number of penalties applied to this driver
	NumTyreStints     uint8    // Number of tyres stints up to maximum
	TyreStintsActual  [8]uint8 // Actual tyres used by this driver
	TyreStintsVisual  [8]uint8 // Visual tyres used by this driver
	TyreStintsEndLaps [8]uint8 // The lap number stints end on
}

// Keeping this commented out to suppress unused warning
// type F1FinalClassificationDataPacket struct {
// 	f1PacketHeader     *F1PacketHeader // Header
// 	NumCars            uint8           // Number of cars in the final classification
// 	ClassificationData [F1_MAX_NUM_CARS]F1FinalClassificationData
// }

type F1CarDamageData struct {
	TyresWear            [4]float32 // Tyre wear (percentage)
	TyresDamage          [4]uint8   // Tyre damage (percentage)
	BrakesDamage         [4]uint8   // Brakes damage (percentage)
	FrontLeftWingDamage  uint8      // Front left wing damage (percentage)
	FrontRightWingDamage uint8      // Front right wing damage (percentage)
	RearWingDamage       uint8      // Rear wing damage (percentage)
	FloorDamage          uint8      // Floor damage (percentage)
	DiffuserDamage       uint8      // Diffuser damage (percentage)
	SidepodDamage        uint8      // Sidepod damage (percentage)
	DRSFault             uint8      // Indicator for DRS fault, 0 = OK, 1 = fault
	ERSFault             uint8      // Indicator for ERS fault, 0 = OK, 1 = fault
	GearBoxDamage        uint8      // Gear box damage (percentage)
	EngineDamage         uint8      // Engine damage (percentage)
	EngineMGUHWear       uint8      // Engine wear MGU-H (percentage)
	EngineESWear         uint8      // Engine wear ES (percentage)
	EngineCEWear         uint8      // Engine wear CE (percentage)
	EngineICEWear        uint8      // Engine wear ICE (percentage)
	EngineMGUKWear       uint8      // Engine wear MGU-K (percentage)
	EngineTCWear         uint8      // Engine wear TC (percentage)
	EngineBlown          uint8      // Engine blown, 0 = OK, 1 = fault
	EngineSeized         uint8      // Engine seized, 0 = OK, 1 = fault
}

type F1CarDamageDataPacket struct {
	f1PacketHeader *F1PacketHeader // Header
	CarDamageData  [22]F1CarDamageData
}

type UDPClientTarget uint8

const (
	UDPClientTarget_LAN UDPClientTarget = iota
	UDPClientTarget_Loopback
)

type F1UdpClient struct {
	conn       *net.UDPConn // connection used to get realtime data from game
	replayConn *net.UDPConn // connection used exclusively for replays
	activeConn *net.UDPConn // the connection to listen to

	readbuffer          []byte
	processingbuffer    []byte
	SwitchSourceRequest chan UDPClientTarget
	targetSource        UDPClientTarget
}

func (p F1CarMotionDataPacket) Header() *F1PacketHeader {
	return p.f1PacketHeader
}

func (p F1CarTelemetryDataPacket) Header() *F1PacketHeader {
	return p.f1PacketHeader
}

func (p F1CarStatusDataPacket) Header() *F1PacketHeader {
	return p.f1PacketHeader
}

func (p F1LapDataPacket) Header() *F1PacketHeader {
	return p.f1PacketHeader
}

func (p F1CarDamageDataPacket) Header() *F1PacketHeader {
	return p.f1PacketHeader
}

func ParseStruct(reader *bytes.Reader, dstStruct any) bool {
	v := reflect.ValueOf(dstStruct).Elem()
	t := v.Type()
	for i := 0; i < t.NumField(); i++ {
		field := v.Field(i)
		if !t.Field(i).IsExported() {
			continue
		}

		if err := binary.Read(reader, binary.LittleEndian, field.Addr().Interface()); err != nil {
			Log.Println("Error reading data into field:", err)
			return false
		}
	}

	return true
}

func (cl *F1UdpClient) Init(conn *net.UDPConn) {
	cl.conn = conn
	cl.activeConn = conn
	cl.readbuffer = make([]byte, UDP_MAX_PACKET_SIZE)
	cl.processingbuffer = make([]byte, 0, PROCESSING_BUFFER_SIZE) // allow queuing of upto 8 packets in case processing takes time
	cl.SwitchSourceRequest = make(chan UDPClientTarget)
	cl.targetSource = UDPClientTarget_LAN
}

func (cl *F1UdpClient) InitLoopbackConnectionForReplay() {
	if cl.replayConn != nil {
		cl.replayConn.Close()
	}

	addr := fmt.Sprintf(":%d", REPLAY_DATA_PORT)
	udpAddr, err := net.ResolveUDPAddr("udp", addr)
	if err != nil {
		Log.Fatalf("Failed to resolve loopback address for replay - %s\n", err)
		return
	}

	cl.replayConn, err = net.ListenUDP("udp", udpAddr)
	if err != nil {
		Log.Fatalf("Error listening on UDP: %s", err)
	}
}

func (cl *F1UdpClient) HandleSourceSwitch(newSource UDPClientTarget) {
	if newSource == cl.targetSource {
		return
	}

	Log.Printf("F1UdpClient: Switching source to %d\n", newSource)

	cl.ResetProcessingBuf()
	cl.targetSource = newSource

	switch newSource {
	case UDPClientTarget_Loopback:
		cl.InitLoopbackConnectionForReplay()
		cl.activeConn = cl.replayConn
	case UDPClientTarget_LAN:
		cl.replayConn.Close()
		cl.activeConn = cl.conn
	default:
		panic("Invalid target for source switch")
	}
}

func (cl *F1UdpClient) ResetProcessingBuf() {
	cl.processingbuffer = make([]byte, 0, PROCESSING_BUFFER_SIZE)
}

func (cl *F1UdpClient) PacketProcessCleanup(processedPacketHeader *F1PacketHeader) {
	cl.processingbuffer = cl.processingbuffer[PACKET_ID_SIZE_MAP[processedPacketHeader.PacketId]:]
}

func (cl *F1UdpClient) NeedToWaitForMoreData(packetHeader *F1PacketHeader) bool {
	return len(cl.processingbuffer) < int(PACKET_ID_SIZE_MAP[packetHeader.PacketId])
}

func (cl *F1UdpClient) Poll(packetStore *PacketStore) error {
	var packetHeader F1PacketHeader
	var n int
	var err error = nil
	var addr netip.AddrPort
	cl.conn.SetReadDeadline(time.Now().Add(time.Duration(time.Second * 1)))

	n, addr, err = cl.activeConn.ReadFromUDPAddrPort(cl.readbuffer)
	if err != nil {
		// timeout, check for requests on channel
		if e, ok := err.(net.Error); ok && e.Timeout() {
			select {
			case target := <-cl.SwitchSourceRequest:
				cl.HandleSourceSwitch(target)
				return nil
			default:
				return nil
			}
		}

		Log.Println("Error reading from UDP:", err)
		return err
	}

	if cl.targetSource == UDPClientTarget_Loopback {
		if addr.Port() == F1_TELEMETRY_DATA_PORT {
			return nil // drop the packet
		}
	}

	cl.processingbuffer = append(cl.processingbuffer, cl.readbuffer[:n]...)

	if len(cl.processingbuffer) > F1_PACKET_HEADER_PACKED_SIZE {
		err = nil
		reader := bytes.NewReader(cl.processingbuffer)
		packetHeader.Parse(reader)

		switch packetHeader.PacketId {
		case PacketID_Motion:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			motiondata := F1CarMotionDataPacket{f1PacketHeader: &packetHeader}
			if !motiondata.Parse(reader) {
				err = fmt.Errorf("failed to parse car motion data")
				Log.Println(err.Error())
				break
			}

			SavePacket(packetStore, motiondata)
		case PacketID_LapData:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			lapdata := F1LapDataPacket{f1PacketHeader: &packetHeader}

			if !lapdata.Parse(reader) {
				err = fmt.Errorf("failed to parse lap data")
				Log.Println(err.Error())
				break
			}
			SavePacket(packetStore, lapdata)
		case PacketID_Event:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			eventDetails := F1EventDataDetails{}
			if !eventDetails.Parse(reader, &packetHeader) {
				err = fmt.Errorf("failed to parse event details")
				Log.Println(err.Error())
			} else {
				eventDetails.ProcessEvent(reader)
			}
		case PacketID_CarTelemetry:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			cartelemetry := F1CarTelemetryDataPacket{f1PacketHeader: &packetHeader}
			if !cartelemetry.Parse(reader) {
				err = fmt.Errorf("failed to parse car telemetry packet")
				Log.Println(err.Error())
				break
			}
			SavePacket(packetStore, cartelemetry)
		case PacketID_CarStatus:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			carstatus := F1CarStatusDataPacket{f1PacketHeader: &packetHeader}
			if !carstatus.Parse(reader) {
				err = fmt.Errorf("failed to parse car status packet")
				Log.Println(err.Error())
				break
			}
			SavePacket(packetStore, carstatus)

		case PacketID_CarDamage:
			if cl.NeedToWaitForMoreData(&packetHeader) {
				return nil
			}

			cardamage := F1CarDamageDataPacket{f1PacketHeader: &packetHeader}
			if !cardamage.Parse(reader) {
				err = fmt.Errorf("failed to parse car status packet")
				Log.Println(err.Error())
				break
			}
			SavePacket(packetStore, cardamage)
		default:
			// Log.Printf("not implemented packet type %d handling\n", packetHeader.PacketId)
			cl.processingbuffer = cl.processingbuffer[n:]
			return nil
		}

		cl.PacketProcessCleanup(&packetHeader)
		return err
	}

	return nil
}

func GenericF1StructParse[T any](data *bytes.Reader, f1PacketStruct *T, header *F1PacketHeader) bool {
	if data.Len() < int(PACKET_ID_SIZE_MAP[header.PacketId])-F1_PACKET_HEADER_PACKED_SIZE {
		Log.Printf("Can't parse %s from buffer with %d bytes left\n", reflect.TypeOf(f1PacketStruct).Name(), data.Len())
		return false
	}

	if !ParseStruct(data, f1PacketStruct) {
		Log.Printf("Failed to parse %s\n", reflect.TypeOf(f1PacketStruct).Name())
		return false
	}

	return true
}

func (header *F1PacketHeader) Parse(data *bytes.Reader) bool {
	if data.Len() < F1_PACKET_HEADER_PACKED_SIZE {
		Log.Printf("Can't parse header from buffer with %d bytes\n", data.Len())
		return false
	}

	if !ParseStruct(data, header) {
		return false
	}

	return true
}

func (details *F1EventDataDetails) Parse(data *bytes.Reader, packetHeader *F1PacketHeader) bool {
	if data.Len() < len(details.EventStringCode) {
		Log.Printf("Can't parse EventStringCode, not enough data (%d bytes)\n", data.Len())
		return false
	}

	details.f1PacketHeader = packetHeader
	binary.Read(data, binary.LittleEndian, &details.EventStringCode)
	return true
}

func (details *F1EventDataDetails) ProcessEvent(data *bytes.Reader) bool {
	eventString := string(details.EventStringCode[:])

	switch eventString {
	case "BUTN":
		event := F1ButtonEvent{}
		if !event.Parse(data, details) {
			Log.Panicln("Failed to process button event, stopping")
		}

	default:
		Log.Printf("Event processing for '%s' not implemented\n", eventString)
	}

	return true
}

func (event *F1ButtonEvent) Parse(data *bytes.Reader, eventDetails *F1EventDataDetails) bool {
	bytesNeeded := reflect.TypeOf(event.ButtonStatus).Size()
	if data.Len() < int(bytesNeeded) {
		Log.Printf("Can't parse ButtonStatus, not enough data (%d bytes)\n", data.Len())
	}

	event.f1EventDataDetails = eventDetails
	binary.Read(data, binary.LittleEndian, &event.ButtonStatus)

	return true
}

func (motiondata *F1CarMotionData) Parse(data *bytes.Reader, carIndex uint8, header *F1PacketHeader) bool {
	return ParseStruct(data, motiondata)
}

func (motiondataPacket *F1CarMotionDataPacket) Parse(data *bytes.Reader) bool {
	if data.Len() < int(PACKET_ID_SIZE_MAP[motiondataPacket.f1PacketHeader.PacketId])-F1_PACKET_HEADER_PACKED_SIZE {
		Log.Printf("Can't parse CarMotionDataPacket from buffer with %d bytes left\n", data.Len())
		return false
	}

	for i := 0; i < len(motiondataPacket.CarMotionData); i++ {
		if !motiondataPacket.CarMotionData[i].Parse(data, uint8(i), motiondataPacket.f1PacketHeader) {
			Log.Printf("Failed to parse CarMotionData from buffer with %d bytes left\n", data.Len())
			return false
		}
	}

	return true
}

func (carTelemetryPacket *F1CarTelemetryDataPacket) Parse(data *bytes.Reader) bool {
	success := GenericF1StructParse(data, carTelemetryPacket, carTelemetryPacket.f1PacketHeader)
	if !success {
		return false
	}

	for i := 0; i < len(carTelemetryPacket.CarTelemetryData); i++ {
		ct := &carTelemetryPacket.CarTelemetryData[i]
		ct.Throttle *= 100
		ct.Brake *= 100
		ct.Steer *= 100
	}
	return true
}

func (packet *F1LapDataPacket) Parse(data *bytes.Reader) bool {
	return GenericF1StructParse(data, packet, packet.f1PacketHeader)
}

func (packet *F1CarStatusDataPacket) Parse(data *bytes.Reader) bool {
	return GenericF1StructParse(data, packet, packet.f1PacketHeader)
}

func (packet *F1CarDamageDataPacket) Parse(data *bytes.Reader) bool {
	return GenericF1StructParse(data, packet, packet.f1PacketHeader)
}
