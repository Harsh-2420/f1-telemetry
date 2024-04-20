const MAX_SAVED_FRAME_NUMBERS = 64

export class Queue {
    /**
     * @param {{ packetParentName: string, packetName: string }} dataSource
     */
    constructor(dataSource) {
        this.items = []
        this.enqueuedFrameNums = new Set()
        this.dataSource = dataSource
    }

    enqueue(element) {
        this.items.push(element)
    }

    dequeue() {
        if (this.isEmpty()) {
            return null
        }

        return this.items.shift()
    }

    isEmpty() {
        return this.items.length === 0
    }

    reset() {
        this.items = []
    }
}

/**
 * @param {{ [key: string]: Queue }} dataQueues
 */
export async function fetchTelemetryData(dataQueues) {
    try {
        const response = await fetch("/api/live")
        if (!response.ok) {
            throw new Error("Failed to fetch telemetry data")
        }
        const telemetryData = await response.json()

        Object.keys(dataQueues).forEach((key) => {
            const queue = dataQueues[key]

            for (
                let i = 0;
                i < telemetryData[queue.dataSource.packetParentName].length;
                i++
            ) {
                const frame =
                    telemetryData[queue.dataSource.packetParentName][i]
                const overallFrameIdentifier =
                    frame.Header.OverallFrameIdentifier
                if (!queue.enqueuedFrameNums.has(overallFrameIdentifier)) {
                    queue.enqueuedFrameNums.add(overallFrameIdentifier)
                    if (
                        queue.enqueuedFrameNums.size > MAX_SAVED_FRAME_NUMBERS
                    ) {
                        const oldestFrameNumber = Math.min(
                            ...[...queue.enqueuedFrameNums.values()]
                        )
                        queue.enqueuedFrameNums.delete(oldestFrameNumber)
                    }

                    const playerIndex = frame.Header.PlayerCarIndex
                    const playerData =
                        frame.Body[queue.dataSource.packetName][playerIndex]

                    queue.enqueue(playerData)
                }
            }
        })
    } catch (error) {
        console.error("Error fetching telemetry data:", error)
    }
}

/**
 * @param {Object} packet
 * @param {{ [key: string]: Queue }} dataQueues
 */
function HandleNewPacket(packet, dataQueues) {
    Object.keys(dataQueues).forEach((key) => {
        // TODO: fix this, it's not ready for use
        const queue = dataQueues[key]
        const frame = telemetryData[queue.dataSource.packetParentName][i]
        const overallFrameIdentifier =
            frame.Header.OverallFrameIdentifier
        if (!queue.enqueuedFrameNums.has(overallFrameIdentifier)) {
            queue.enqueuedFrameNums.add(overallFrameIdentifier)
            if (
                queue.enqueuedFrameNums.size > MAX_SAVED_FRAME_NUMBERS
            ) {
                const oldestFrameNumber = Math.min(
                    ...[...queue.enqueuedFrameNums.values()]
                )
                queue.enqueuedFrameNums.delete(oldestFrameNumber)
            }

            const playerIndex = frame.Header.PlayerCarIndex
            const playerData =
                frame.Body[queue.dataSource.packetName][playerIndex]

            queue.enqueue(playerData)
        }
    })
}

/**
 * @param {{ [key: string]: Queue }} dataQueues
 */
export async function SubscribeToBackend(dataQueues) {
    const ws = new WebSocket(`ws://${window.location.host}/api/live`);
    ws.onopen = function (ev) {
        console.log("Backend connection success");
    }

    ws.onclose = function (ev) {
        console.log("Disconnected from backend");
        console.log(ev.reason);
    }

    ws.onerror = function (ev) {
        console.log("Backend connection error");
    }

    ws.onmessage = function (msgEvent) {
        const packet = JSON.parse(msgEvent.data);
        HandleNewPacket(packet, dataQueues)
    }
}
