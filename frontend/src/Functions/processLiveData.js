import data from "../Data/telemetry.json"
export function processLiveData() {
    // Initialise Telemetry
    const carTelemetry = data.CarTelemetryDataPackets
    const sessionId = carTelemetry[0].Header.SessionUID

    // Initialise Stores
    const playerTelemetry = []
    const processedFrames = new Set()

    for (let i = 0; i < carTelemetry.length; i++) {
        const frame = carTelemetry[i]
        const overallFrameIdentifier = frame.Header.OverallFrameIdentifier
        if (processedFrames.has(overallFrameIdentifier)) {
            console.log("Previously processed ", overallFrameIdentifier)
        } else {
            processedFrames.add(overallFrameIdentifier)
            const playerIndex = frame.Header.PlayerCarIndex
            playerTelemetry.push(frame.Body.CarTelemetryData[playerIndex])
        }
    }
    return playerTelemetry
}
