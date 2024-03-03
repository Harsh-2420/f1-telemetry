package main

import (
	"bytes"
	"encoding/binary"
	"log"
	"net"
	"reflect"
)

const (
	PacketID_Motion uint8 = iota
	PacketID_Session
	PacketID_LapData
	PacketID_Event
)

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

const F1_PACKET_HEADER_PACKED_SIZE = 29

type F1EventDataDetails struct {
	F1PacketHeader
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
	F1EventDataDetails
	ButtonStatus uint32 // Bit flags specifying which buttons are being pressed
}

type F1UdpClient struct {
	conn   *net.UDPConn
	buffer []byte
}

func (cl *F1UdpClient) Init(conn *net.UDPConn) {
	cl.conn = conn
	cl.buffer = make([]byte, 1024)
}

func (cl *F1UdpClient) Poll() {
	var packetHeader F1PacketHeader
	n, _, err := cl.conn.ReadFromUDP(cl.buffer)
	if err != nil {
		log.Println("Error reading from UDP:", err)
		return
	}

	// log.Printf("Read %d bytes\n", n)
	if n > F1_PACKET_HEADER_PACKED_SIZE {
		reader := bytes.NewReader(cl.buffer)
		packetHeader.Parse(reader)
		switch packetHeader.PacketId {
		case PacketID_Event:
			eventDetails := F1EventDataDetails{}
			if !eventDetails.Parse(reader, &packetHeader) {
				log.Panicln("Failed to parse event details, stopping")
			}
			eventDetails.ProcessEvent(reader)
		default:
			log.Panicln("not implemented")
		}
	}
}

func (header *F1PacketHeader) Parse(data *bytes.Reader) bool {
	if data.Len() < F1_PACKET_HEADER_PACKED_SIZE {
		log.Printf("Can't parse header from buffer with %d bytes\n", data.Len())
		return false
	}

	binary.Read(data, binary.LittleEndian, &header.PacketFormat)
	binary.Read(data, binary.LittleEndian, &header.GameYear)
	binary.Read(data, binary.LittleEndian, &header.GameMajorVersion)
	binary.Read(data, binary.LittleEndian, &header.GameMinorVersion)
	binary.Read(data, binary.LittleEndian, &header.PacketVersion)
	binary.Read(data, binary.LittleEndian, &header.PacketId)
	binary.Read(data, binary.LittleEndian, &header.SessionUID)
	binary.Read(data, binary.LittleEndian, &header.SessionTime)
	binary.Read(data, binary.LittleEndian, &header.FrameIdentifier)
	binary.Read(data, binary.LittleEndian, &header.OverallFrameIdentifier)
	binary.Read(data, binary.LittleEndian, &header.PlayerCarIndex)
	binary.Read(data, binary.LittleEndian, &header.SecondaryPlayerCarIndex)

	return true
}

func (details *F1EventDataDetails) Parse(data *bytes.Reader, packetHeader *F1PacketHeader) bool {
	if data.Len() < len(details.EventStringCode) {
		log.Printf("Can't parse EventStringCode, not enough data (%d bytes)\n", data.Len())
		return false
	}

	details.F1PacketHeader = *packetHeader
	binary.Read(data, binary.LittleEndian, &details.EventStringCode)
	return true
}

func (details *F1EventDataDetails) ProcessEvent(data *bytes.Reader) bool {
	eventString := string(details.EventStringCode[:])

	switch eventString {
	case "BUTN":
		event := F1ButtonEvent{}
		if !event.Parse(data, details) {
			log.Panicln("Failed to process button event, stopping")
		}

	default:
		log.Panicln("not implemented")
	}

	return true
}

func (event *F1ButtonEvent) Parse(data *bytes.Reader, eventDetails *F1EventDataDetails) bool {
	bytesNeeded := reflect.TypeOf(event.ButtonStatus).Size()
	if data.Len() < int(bytesNeeded) {
		log.Printf("Can't parse ButtonStatus, not enough data (%d bytes)\n", data.Len())
	}

	binary.Read(data, binary.LittleEndian, &event.ButtonStatus)
	switch event.ButtonStatus {
	case BUTTON_DOWN:
		log.Println("DOWN")
	case BUTTON_UP:
		log.Println("UP")
	case BUTTON_LEFT:
		log.Println("LEFT")
	case BUTTON_RIGHT:
		log.Println("RIGHT")
	default:
	}
	return true
}
