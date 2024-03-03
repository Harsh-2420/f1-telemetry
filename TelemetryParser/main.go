package main

import (
	"fmt"
	"net"
	"os"
	"unsafe"
)

func PrintStructSizes() {
	fmt.Println("F1PacketHeader: ", unsafe.Sizeof(F1PacketHeader{}))
}

func main() {

	// PrintStructSizes()
	// return
	port := ":20777"

	// Resolve the UDP address
	udpAddr, err := net.ResolveUDPAddr("udp", port)
	if err != nil {
		fmt.Println("Error resolving UDP address:", err)
		os.Exit(1)
	}

	// Listen on the UDP address
	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		fmt.Println("Error listening on UDP:", err)
		os.Exit(1)
	}
	defer conn.Close()

	fmt.Println("UDP server is listening on", port)

	f1UdpClient := F1UdpClient{}
	f1UdpClient.Init(conn)

	for {
		f1UdpClient.Poll()
	}
}
