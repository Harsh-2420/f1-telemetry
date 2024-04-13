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
