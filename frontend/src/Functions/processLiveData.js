export class Queue {
  /**
   * @param {{ packetID: number, packetName: string }} dataSource
   * @param {function} newDataCallback
   */
  constructor(dataSource, newDataCallback) {
    this.items = [];
    this.enqueuedFrameNums = new Set();
    this.dataSource = dataSource;
    this.newDataCallback = newDataCallback;
  }

  setNewDataCallback(callbackFn) {
    this.newDataCallback = callbackFn;
    console.log(
      `Registered new data callback for ${this.dataSource.packetName}`,
    );
  }

  enqueue(element) {
    this.items.push(element);
    this.newDataCallback && this.newDataCallback();
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  reset() {
    this.items = [];
  }
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
  const ws = new WebSocket(`ws://localhost:8000/api/live`);

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
