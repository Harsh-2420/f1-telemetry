
const MAX_SAVED_FRAME_NUMBERS = 64
const processedFrames = new Set()

export class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
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
		this.items = []
	}
}

/**
 * @param {Queue} frameQueue 
 */
export async function fetchTelemetryData(frameQueue) {
	try {
		const response = await fetch("/api/live")
		if (!response.ok) {
			throw new Error("Failed to fetch telemetry data")
		}
		const telemetryData = await response.json()

		for (
			let i = 0;
			i < telemetryData.CarTelemetryDataPackets.length;
			i++
		) {
			const frame = telemetryData.CarTelemetryDataPackets[i]
			const overallFrameIdentifier =
				frame.Header.OverallFrameIdentifier
			if (!processedFrames.has(overallFrameIdentifier))
			{
				processedFrames.add(overallFrameIdentifier)
				if (processedFrames.size > MAX_SAVED_FRAME_NUMBERS) {
					const oldestFrameNumber = Math.min(...[...processedFrames.values()])
					processedFrames.delete(oldestFrameNumber)
				}

				const playerIndex = frame.Header.PlayerCarIndex
				const playerData = frame.Body.CarTelemetryData[playerIndex]

				frameQueue.enqueue(playerData)
			}
		}
	} catch (error) {
		console.error("Error fetching telemetry data:", error)
	}
}
