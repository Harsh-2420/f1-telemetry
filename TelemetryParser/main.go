package main

import (
	"log"
	"net"
	"os"
)

var Log *log.Logger

const LOG_TO_FILE = false

func main() {
	InitLogger(LOG_TO_FILE)
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

	Log.Println("UDP server is listening on", port)

	f1UdpClient := F1UdpClient{}
	f1UdpClient.Init(conn)

	wss := WebsocketServer{}
	wss.Init()

	packetStore := PacketStore{}
	packetStore.Init(&wss)

	go RunAPIServer(&wss)

	for {
		err := f1UdpClient.Poll(&packetStore)
		if err != nil {
			Log.Fatalln(err.Error())
		}
	}
}
