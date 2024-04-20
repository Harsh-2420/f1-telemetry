package main

import (
	"bytes"
	"os"
	"testing"
)

func TestRecording(t *testing.T) {
	packetStore := PacketStore{}
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
	if !ParseStruct(reader, &rHeader) {
		t.FailNow()
	}

	for i := 0; i < F1_MAX_NUM_CARS; i++ {
		if !ParseStruct(reader, &rDamageDataArray[i]) {
			t.FailNow()
		}
	}

}
