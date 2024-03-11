package main

import (
	"io"
	"net/http"
)

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

func HandlePing(w http.ResponseWriter, _ *http.Request) {
	io.WriteString(w, "Pong")
}

func RunAPIServer(ps *PacketStore) {
	packetStore = ps

	http.HandleFunc("/ping", HandlePing)
	http.HandleFunc("/api/live", HandleLiveDataRequest)

	http.ListenAndServe(":5000", nil)
}
