package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"math"
	"net"
	"reflect"
)

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
)

var PACKET_ID_SIZE_MAP = []uint32{1349, 644, 1131, 45, 1306, 1107, 1352}

type F1PacketHeader struct {
	PacketFormat            uint16  // Version of the packet format, e.g., 2023
	GameYear                uint8   // Game year - last two digits, e.g., 23
	GameMajorVersion        uint8   // Game major version - "X.00"
	GameMinorVersion        uint8   // Game minor version - "1.XX"
	PacketVersion           uint8   // Version of this packet type, all start from 1
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
	WorldPositionX     float32 // World space X position - metres
	WorldPositionY     float32 // World space Y position
	WorldPositionZ     float32 // World space Z position
	WorldVelocityX     float32 // Velocity in world space X – metres/s
	WorldVelocityY     float32 // Velocity in world space Y
	WorldVelocityZ     float32 // Velocity in world space Z
	WorldForwardDirX   int16   // World space forward X direction (normalised)
	WorldForwardDirY   int16   // World space forward Y direction (normalised)
	WorldForwardDirZ   int16   // World space forward Z direction (normalised)
	WorldRightDirX     int16   // World space right X direction (normalised)
	WorldRightDirY     int16   // World space right Y direction (normalised)
	WorldRightDirZ     int16   // World space right Z direction (normalised)
	GForceLateral      float32 // Lateral G-Force component
	GForceLongitudinal float32 // Longitudinal G-Force component
	GForceVertical     float32 // Vertical G-Force component
	Yaw                float32 // Yaw angle in radians
	Pitch              float32 // Pitch angle in radians
	Roll               float32 // Roll angle in radians
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

type F1UdpClient struct {
	conn             *net.UDPConn
	readbuffer       []byte
	processingbuffer []byte
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
	cl.readbuffer = make([]byte, UDP_MAX_PACKET_SIZE)
	cl.processingbuffer = make([]byte, 0, PROCESSING_BUFFER_SIZE) // allow queuing of upto 8 packets in case processing takes time
}

func (cl *F1UdpClient) PacketProcessCleanup(processedPacketHeader *F1PacketHeader) {
	cl.processingbuffer = cl.processingbuffer[PACKET_ID_SIZE_MAP[processedPacketHeader.PacketId]:]
}

func (cl *F1UdpClient) NeedToWaitForMoreData(packetHeader *F1PacketHeader) bool {
	return len(cl.processingbuffer) < int(PACKET_ID_SIZE_MAP[packetHeader.PacketId])
}

func (cl *F1UdpClient) Poll(packetStore *PacketStore) error {
	var packetHeader F1PacketHeader
	n, _, err := cl.conn.ReadFromUDP(cl.readbuffer)
	if err != nil {
		Log.Println("Error reading from UDP:", err)
		return err
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
			}
			packetStore.SavePacket(motiondata)
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
			}
			packetStore.SavePacket(cartelemetry)
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
	if !ParseStruct(data, motiondata) {
		return false
	}

	// if header.PlayerCarIndex == carIndex {
	// 	gForces := Vec3{motiondata.GForceLateral, motiondata.GForceLongitudinal, motiondata.GForceVertical}
	// 	log.Printf("Lateral G: %1.f\n", gForces.X)
	// }

	return true
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

func (carTelemetry *F1CarTelemetryData) Parse(data *bytes.Reader, carIndex uint8, header *F1PacketHeader) bool {
	if !ParseStruct(data, carTelemetry) {
		return false
	}

	if header.PlayerCarIndex == carIndex {
		saveCursorPosition := "\033[s"
		clearLine := "\033[u\033[K"
		fmt.Print(saveCursorPosition)
		fmt.Print(clearLine)
		fmt.Printf("S: %d KM/H T: %d %% B: %d %%\r", carTelemetry.Speed, int(math.Round(float64(carTelemetry.Throttle*100))), int(math.Round(float64(carTelemetry.Brake*100))))
	}

	return true
}

func (carTelemetryPacket *F1CarTelemetryDataPacket) Parse(data *bytes.Reader) bool {
	if data.Len() < int(PACKET_ID_SIZE_MAP[carTelemetryPacket.f1PacketHeader.PacketId])-F1_PACKET_HEADER_PACKED_SIZE {
		Log.Printf("Can't parse F1CarTelemetryDataPacket from buffer with %d bytes left\n", data.Len())
		return false
	}

	for i := 0; i < len(carTelemetryPacket.CarTelemetryData); i++ {
		if !carTelemetryPacket.CarTelemetryData[i].Parse(data, uint8(i), carTelemetryPacket.f1PacketHeader) {
			Log.Printf("Failed to parse CarTelemetryData from buffer with %d bytes left\n", data.Len())
			return false
		}
	}

	err := binary.Read(data, binary.LittleEndian, &carTelemetryPacket.MfdPanelIndex)
	if err != nil {
		Log.Println("Failed to parse MfdPanelIndex")
		return false
	}

	err = binary.Read(data, binary.LittleEndian, &carTelemetryPacket.MfdPanelIndexSecondaryPlayer)
	if err != nil {
		Log.Println("Failed to parse MfdPanelIndexSecondaryPlayer")
		return false
	}

	err = binary.Read(data, binary.LittleEndian, &carTelemetryPacket.SuggestedGear)
	if err != nil {
		Log.Println("Failed to parse SuggestedGear")
		return false
	}

	return true
}
