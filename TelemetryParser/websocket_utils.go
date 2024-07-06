package main

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

const CLIENT_TICK_INTERVAL_MS = 8
const CLIENT_NEW_PACKET_CHANNEL_BUFFER_SIZE = 8

type WebsocketClient struct {
	Connection *websocket.Conn
	NewPacket  chan []byte
	exitFlag   bool
}

type WebsocketServer struct {
	Clients map[*WebsocketClient]struct{}
}

func (s *WebsocketServer) Init() {
	for cl := range s.Clients {
		cl.Connection.Close()
	}

	s.Clients = make(map[*WebsocketClient]struct{})
}

func WSSBroadcast[T any](wss *WebsocketServer, f1Packet *SavedPacket[T]) {
	data, err := json.Marshal(f1Packet)
	if err != nil {
		Log.Println("Failed to serialize SavedPacket to JSON")
		Log.Println(err)
		return
	}

	for cl := range wss.Clients {
		select {
		case cl.NewPacket <- data:
		default:
			continue // we don't wait on the channel, just drop the packet for this client
		}
	}
}

func (s *WebsocketServer) SubscribeNewClient(cl *WebsocketClient) {
	if _, ok := s.Clients[cl]; ok {
		Log.Println("WSS: Tried to register a client that is already registered")
		return
	}

	cl.Connection.EnableWriteCompression(true)
	s.Clients[cl] = struct{}{}
	go cl.Run(s)
}

func (cl *WebsocketClient) Run(wss *WebsocketServer) {
	defer cl.Connection.Close()
	defer delete(wss.Clients, cl)

	cl.Connection.SetCloseHandler(func(code int, text string) error {
		Log.Printf("WSS: Client %s disconnected with code %d (reason: %s)\n", cl.Connection.RemoteAddr().String(), code, text)
		cl.exitFlag = true
		return nil
	})

	for {
		if cl.exitFlag {
			break
		}

		select {
		case data := <-cl.NewPacket:
			err := cl.Connection.WriteMessage(websocket.TextMessage, data)
			if err != nil {
				Log.Printf("Error writing packet to client, closing connection - %s\n", err)
				return
			}
		default:
			time.Sleep(time.Millisecond * CLIENT_TICK_INTERVAL_MS)
		}
	}
}
