package main

import (
	"fmt"
	"io"
	"net/http"
)

const PORT = 8000

var packetStore *PacketStore

func HandleLiveDataRequest(w http.ResponseWriter, req *http.Request) {
	data := packetStore.GetSavedPacketsJSON()
	if data == nil {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Error converting telemetry data to json\n")
		return
	}

	GetLogger().Printf("Live data request, sending live packets (size = %d bytes)\n", len(data))

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func HandleStartRecordingRequest(w http.ResponseWriter, req *http.Request) {
	GetLogger().Printf("Starting telemetry recording\n")

	recordingFileName := "recording.ftr"
	recordingConfig := MakeRecordingConfig(recordingFileName, false)
	recordingConfig.RecordAllPackets()

	if !packetStore.StartRecording(recordingConfig) {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Failed to start recording")
		return
	}

	io.WriteString(w, "Recording Started")
	w.WriteHeader(http.StatusOK)
}

func HandleStopRecordingRequest(w http.ResponseWriter, req *http.Request) {
	GetLogger().Printf("Starting telemetry recording\n")

	packetStore.StopRecording()

	io.WriteString(w, "Recording Stopped")
	w.WriteHeader(http.StatusOK)
}

func HandlePing(w http.ResponseWriter, _ *http.Request) {
	io.WriteString(w, "Pong")
}

func RunAPIServer(ps *PacketStore) {
	packetStore = ps

	http.HandleFunc("/ping", HandlePing)
	http.HandleFunc("/api/live", HandleLiveDataRequest)
	http.HandleFunc("/api/start-recording", HandleStartRecordingRequest)
	http.HandleFunc("/api/stop-recording", HandleStopRecordingRequest)

	GetLogger().Printf("Starting API server on port %d\n", PORT)
	err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil)
	if err != nil {
		GetLogger().Println("Failed to start API Server")
		GetLogger().Fatalln(err)
	}
}
