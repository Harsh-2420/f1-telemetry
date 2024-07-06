export const PacketBackupCount = 500;

export const F1PacketID = {
	Motion: 0,
	Session: 1,
	LapData: 2,
	Event: 3,
	Participants: 4,
	CarSetups: 5,
	CarTelemetry: 6,
	CarStatus: 7,
	FinalClassification: 8,
	LobbyInfo: 9,
	CarDamage: 10,
	SessionHistory: 11,
	TyreSets: 12,
	MotionEx: 13,
};

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
