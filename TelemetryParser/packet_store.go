package main

const (
	PACKET_STORE_SIZE uint32 = 128
)

type PacketStore struct {
	CarTelemetryDataPackets []F1CarTelemetryDataPacket
	CarMotionDataPackets    []F1CarMotionDataPacket
}

func (store *PacketStore) Init() {
	store.CarTelemetryDataPackets = make([]F1CarTelemetryDataPacket, 0, PACKET_STORE_SIZE)
	store.CarMotionDataPackets = make([]F1CarMotionDataPacket, 0, PACKET_STORE_SIZE)
}

func (store *PacketStore) SavePacket(packet any) {
	switch p := packet.(type) {
	case F1CarTelemetryDataPacket:
		if len(store.CarTelemetryDataPackets) >= int(PACKET_STORE_SIZE) {
			store.CarTelemetryDataPackets = store.CarTelemetryDataPackets[1:]
		}
		store.CarTelemetryDataPackets = append(store.CarTelemetryDataPackets, p)
	case F1CarMotionDataPacket:
		if len(store.CarMotionDataPackets) >= int(PACKET_STORE_SIZE) {
			store.CarMotionDataPackets = store.CarMotionDataPackets[1:]
		}
		store.CarMotionDataPackets = append(store.CarMotionDataPackets, p)
	default:
		return
	}
}
