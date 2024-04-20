package main

import (
	"encoding/binary"
	"fmt"
	"os"
	"reflect"
	"sync"
)

const (
	PACKET_STORE_SIZE uint32 = 4
)

type SavedPacket[T any] struct {
	Header F1PacketHeader
	Body   T
}

type RecordingConfig struct {
	RecordingName   string
	CompressPackets bool
	PacketsToRecord uint16 // bitflags to indicate which packets to record (each bit corresponds to a packet ID)
}

type PacketStore struct {
	RWLock                    sync.RWMutex `json:"-"`
	F1CarTelemetryDataPackets []SavedPacket[F1CarTelemetryDataPacket]
	F1CarMotionDataPackets    []SavedPacket[F1CarMotionDataPacket]
	F1LapDataPackets          []SavedPacket[F1LapDataPacket]
	F1CarStatusDataPackets    []SavedPacket[F1CarStatusDataPacket]
	F1CarDamageDataPackets    []SavedPacket[F1CarDamageDataPacket]

	// Recording
	RecordingConfig RecordingConfig `json:"-"`
	RecordingActive bool            `json:"-"`
	RecordingFile   *os.File        `json:"-"`

	// Socket Server
	WSS *WebsocketServer `json:"-"`
}

func (store *PacketStore) Init(wss *WebsocketServer) {
	store.F1CarTelemetryDataPackets = make([]SavedPacket[F1CarTelemetryDataPacket], 0, PACKET_STORE_SIZE)
	store.F1CarMotionDataPackets = make([]SavedPacket[F1CarMotionDataPacket], 0, PACKET_STORE_SIZE)
	store.F1LapDataPackets = make([]SavedPacket[F1LapDataPacket], 0, PACKET_STORE_SIZE)
	store.F1CarStatusDataPackets = make([]SavedPacket[F1CarStatusDataPacket], 0, PACKET_STORE_SIZE)
	store.RWLock = sync.RWMutex{}
	store.WSS = wss
}

func SavePacket[T F1Packet](store *PacketStore, packet T) {
	store.RWLock.Lock()
	defer store.RWLock.Unlock()

	s := SavedPacket[T]{*packet.Header(), packet}
	packetType := reflect.TypeOf(packet)

	field := reflect.ValueOf(store).Elem().FieldByName(packetType.Name() + "s")

	if field.IsValid() && field.Kind() == reflect.Slice {
		if field.Len() >= int(PACKET_STORE_SIZE) {
			field.Set(field.Slice(1, field.Len()))
		}
		field.Set(reflect.Append(field, reflect.ValueOf(s)))
	} else {
		fmt.Println("Unsupported packet type")
	}

	WSSBroadcast[T](store.WSS, &s)

	if store.RecordingConfig.IsRecordingPacket(s.Header.PacketId) {
		RecordSavedPacket(store, &s)
	}
}

// ==== Recording ====

func RecordSavedPacket[T any](store *PacketStore, packet *SavedPacket[T]) {
	if !store.RecordingActive || !store.RecordingConfig.IsRecordingPacket(packet.Header.PacketId) {
		return
	}

	err := binary.Write(store.RecordingFile, binary.LittleEndian, packet.Header)
	if err != nil {
		Log.Println("Error writing packet to recording file")
		Log.Println(err.Error())
		return
	}

	f1Packet := reflect.ValueOf(&packet.Body).Elem().Field(1).Interface()
	err = binary.Write(store.RecordingFile, binary.LittleEndian, f1Packet)
	if err != nil {
		Log.Println("Error writing packet to recording file")
		Log.Println(err.Error())
	}
}

func (store *PacketStore) StartRecording(config RecordingConfig) bool {
	if store.RecordingActive {
		Log.Println("Tried to start recording but a recording is already active")
		return false
	}

	store.RecordingConfig = config

	file, err := os.Create(store.RecordingConfig.RecordingName)
	if err != nil {
		Log.Println("Failed to create recording file")
		Log.Println(err.Error())
		return false
	}

	store.RecordingFile = file
	store.RecordingActive = true
	return true
}

func (store *PacketStore) StopRecording() {
	if !store.RecordingActive {
		Log.Println("Tried to stop recording but no recording is active")
		return
	}

	store.RecordingActive = false
	store.RecordingConfig = MakeRecordingConfig("", false)
	store.RecordingFile.Close()
}

func MakeRecordingConfig(name string, compressPackets bool) RecordingConfig {
	return RecordingConfig{name, compressPackets, 0}
}

func (config *RecordingConfig) RecordAllPackets() {
	config.PacketsToRecord = 0xFFFF
}

func (config *RecordingConfig) RecordPacket(packetID uint8) {
	if packetID >= PacketID_Count {
		Log.Panicf("Tried to record packet with invalid ID '%d'\n", packetID)
	}
	config.PacketsToRecord = config.PacketsToRecord | (1 << packetID)
}

func (config *RecordingConfig) StopRecordingPacket(packetID uint8) {
	if packetID >= PacketID_Count {
		Log.Panicf("Tried to stop recording packet with invalid ID '%d'\n", packetID)
	}

	mask := uint16(1 << packetID)
	config.PacketsToRecord = config.PacketsToRecord & (^mask)
}

func (config *RecordingConfig) IsRecordingPacket(packetID uint8) bool {
	if packetID > PacketID_Count {
		return false
	}

	return (config.PacketsToRecord & (1 << packetID)) != 0
}
