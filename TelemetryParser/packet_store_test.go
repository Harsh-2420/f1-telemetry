package main

import (
	"bytes"
	"net"
	"os"
	"testing"
	"time"
)

func TestRecording(t *testing.T) {
	packetStore := PacketStore{}
	wss := WebsocketServer{}

	wss.Init()
	packetStore.Init(&wss)

	recordingFileName := "test_recording.ftr"
	recordingConfig := MakeRecordingConfig(recordingFileName, false)
	recordingConfig.RecordAllPackets()

	if !packetStore.StartRecording(recordingConfig) {
		t.FailNow()
	}

	header := F1PacketHeader{PacketId: PacketID_CarDamage}
	damageDataArray := [F1_MAX_NUM_CARS]F1CarDamageData{}
	damageDataArray[0].DRSFault = 1
	damageDataArray[0].BrakesDamage = [4]uint8{50, 20, 0, 0}
	packet := F1CarDamageDataPacket{&header, damageDataArray}

	SavePacket(&packetStore, packet)
	packetStore.StopRecording()

	data, err := os.ReadFile(recordingFileName)
	if err != nil {
		t.Error(err)
	}

	reader := bytes.NewReader(data)
	var rHeader F1PacketHeader
	var rDamageDataArray [F1_MAX_NUM_CARS]F1CarDamageData
	packet = F1CarDamageDataPacket{&rHeader, rDamageDataArray}

	var packetID uint8
	packetID, err = reader.ReadByte()
	if err != nil {
		t.Error(err)
	}

	if packetID != header.PacketId {
		t.Errorf("Packet ID mismatch - '%d' != '%d'\n", packetID, header.PacketId)
	}

	if !ParseStruct(reader, &rHeader) {
		t.FailNow()
	}

	for i := 0; i < F1_MAX_NUM_CARS; i++ {
		if !ParseStruct(reader, &rDamageDataArray[i]) {
			t.FailNow()
		}
	}

	if reader.Len() != 0 {
		t.FailNow()
	}
}

func TestReplayParsing(t *testing.T) {
	InitLogger(false)
	Log = GetLogger()

	port := ":20777"

	// Resolve the UDP address
	udpAddr, err := net.ResolveUDPAddr("udp", port)
	if err != nil {
		Log.Println("Error resolving UDP address:", err)
		os.Exit(1)
	}

	// Listen on the UDP address
	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		Log.Println("Error listening on UDP:", err)
		os.Exit(1)
	}
	defer conn.Close()

	f1UdpClient := F1UdpClient{}
	f1UdpClient.Init(conn)

	wss := WebsocketServer{}
	wss.Init()

	packetStore := PacketStore{}
	packetStore.Init(&wss)
	packetStore.SetUDPClientRequestChannel(f1UdpClient.SwitchSourceRequest)

	go func() {
		for {
			err := f1UdpClient.Poll(&packetStore)
			if err != nil {
				Log.Fatalln(err.Error())
			}
		}
	}()

	packetStore.StartReplay("test_recording.bin")
	time.Sleep(time.Second * 10)
}
