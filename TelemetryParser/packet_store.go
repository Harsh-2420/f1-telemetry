package main

import (
	"encoding/json"
	"sync"
)

const (
	PACKET_STORE_SIZE uint32 = 128
)

type SavedPacket[T any] struct {
	Header F1PacketHeader
	Body   T
}

type PacketStore struct {
	RWLock                  sync.RWMutex `json:"-"`
	CarTelemetryDataPackets []SavedPacket[F1CarTelemetryDataPacket]
	CarMotionDataPackets    []SavedPacket[F1CarMotionDataPacket]
}

func (store *PacketStore) Init() {
	store.CarTelemetryDataPackets = make([]SavedPacket[F1CarTelemetryDataPacket], 0, PACKET_STORE_SIZE)
	store.CarMotionDataPackets = make([]SavedPacket[F1CarMotionDataPacket], 0, PACKET_STORE_SIZE)
	store.RWLock = sync.RWMutex{}
}

func (store *PacketStore) SavePacket(packet any) {
	store.RWLock.Lock()
	defer store.RWLock.Unlock()

	switch p := packet.(type) {
	case F1CarTelemetryDataPacket:
		if len(store.CarTelemetryDataPackets) >= int(PACKET_STORE_SIZE) {
			store.CarTelemetryDataPackets = store.CarTelemetryDataPackets[1:]
		}
		store.CarTelemetryDataPackets = append(store.CarTelemetryDataPackets, SavedPacket[F1CarTelemetryDataPacket]{*p.f1PacketHeader, p})
	case F1CarMotionDataPacket:
		if len(store.CarMotionDataPackets) >= int(PACKET_STORE_SIZE) {
			store.CarMotionDataPackets = store.CarMotionDataPackets[1:]
		}
		store.CarMotionDataPackets = append(store.CarMotionDataPackets, SavedPacket[F1CarMotionDataPacket]{*p.f1PacketHeader, p})
	default:
		return
	}
}

func (store *PacketStore) GetSavedPacketsJSON() []byte {
	store.RWLock.RLock()
	defer store.RWLock.RUnlock()

	data, err := json.Marshal(store)
	if err != nil {
		GetLogger().Printf("Failed to serialized saved packets to json due to err - %s\n", err.Error())
		return nil
	}

	return data
}
