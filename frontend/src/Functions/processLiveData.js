import { Queue, F1PacketID } from "../common";

var backendWS = null;

const dataQueues = {
	carTelemetryDataQueue: new Queue({
		packetID: F1PacketID.CarTelemetry,
		packetName: "CarTelemetryData",
	}),
	carStatusDataQueue: new Queue({
		packetID: F1PacketID.CarStatus,
		packetName: "CarStatusData",
	}),
	lapDataQueue: new Queue({
		packetID: F1PacketID.LapData,
		packetName: "LapData",
	}),
};

export function GetDataQueues() {
  return dataQueues;
}

/**
 * @param {Object} packet
 * @param {{ [key: string]: Queue }} dataQueues
 */
function HandleNewPacket(packet, dataQueues) {
  Object.keys(dataQueues).forEach((key) => {
    const queue = dataQueues[key];
    if (queue.dataSource.packetID === packet.Header.PacketId) {
      queue.enqueue(packet);
      return;
    }
  });
}

/**
 * @param {{ [key: string]: Queue }} dataQueues
 */
export async function SubscribeToBackend(dataQueues) {
  if (backendWS !== null) {
  	return;
  }

  const ws = new WebSocket(`ws://localhost:8000/api/live`);
  backendWS = ws;

  ws.onopen = function (ev) {
    console.log("Backend connection success");
  };

  ws.onclose = function (ev) {
    console.log("Disconnected from backend");
    console.log(ev.reason);
  };

  ws.onerror = function (ev) {
    console.log("Backend connection error");
  };

  ws.onmessage = function (msgEvent) {
    const packet = JSON.parse(msgEvent.data);
    HandleNewPacket(packet, dataQueues);
  };
}
