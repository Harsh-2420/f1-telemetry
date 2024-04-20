package main

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gorilla/websocket"
)

const PORT = 8000

var websocketServer *WebsocketServer
var WSUpgrader = websocket.Upgrader{CheckOrigin: CheckWSConnectionOrigin}

func CheckWSConnectionOrigin(r *http.Request) bool {
	return true
}

func HandleLiveDataSubscriptionRequest(w http.ResponseWriter, req *http.Request) {
	Log.Printf("New live data subscription request from %s\n", req.RemoteAddr)
	conn, err := WSUpgrader.Upgrade(w, req, nil)
	if err != nil {
		Log.Printf("Error upgrading client to websocket connection - %s\n", err)
		return
	}

	Log.Printf("%s Subscription successful\n", req.RemoteAddr)
	websocketServer.SubscribeNewClient(&WebsocketClient{conn, make(chan []byte, CLIENT_NEW_PACKET_CHANNEL_BUFFER_SIZE)})
}

func HandlePing(w http.ResponseWriter, _ *http.Request) {
	io.WriteString(w, "Pong")
}

func RunAPIServer(wss *WebsocketServer) {
	websocketServer = wss

	http.HandleFunc("/ping", HandlePing)
	http.HandleFunc("/api/live", HandleLiveDataSubscriptionRequest)

	GetLogger().Printf("Starting API server on port %d\n", PORT)
	err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil)
	if err != nil {
		GetLogger().Println("Failed to start API Server")
		GetLogger().Fatalln(err)
	}
}
