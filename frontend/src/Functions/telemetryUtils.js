let startTime = Date.now()
export function generateRandomTelemetryData() {
    const currentTimestamp = Date.now()

    // Calculate elapsed time in seconds
    const elapsedTimeInSeconds = (currentTimestamp - startTime) / 1000

    // Calculate increase based on elapsed time
    const increase = elapsedTimeInSeconds / 30 // Increase every 30 seconds
    const rateOfIncrease = Math.floor(Math.random() * 10) + 1 // Random rate of increase between 1 and 10

    const temperatureIncrease = increase * rateOfIncrease
    const wearIncrease = increase * rateOfIncrease

    const randomData = {
        id: Math.floor(Math.random() * 1000), // Generate random ID
        distance: Math.random() * 1000, // Generate random distance
        speed: Math.random() * 300, // Generate random speed
        throttle: Math.random(), // Generate random throttle
        brake: Math.random(), // Generate random brake
        drs: Math.random() > 0.5 ? 1 : 0, // Generate random DRS status (0 or 1)
        steering: Math.random() * 200 - 100, // Generate random steering
        gear: Math.floor(Math.random() * 7) + 1, // Generate random gear (1 to 7)
        engineRPM: Math.random() * 10000, // Generate random engine RPM
        time: currentTimestamp, // Current timestamp
        brakeTemperature: Math.random() * 200, // Generate random brake temperature
        tyre: {
            temperature: {
                frontLeft: temperatureIncrease, // Increase temperature gradually
                frontRight: temperatureIncrease,
                rearLeft: temperatureIncrease,
                rearRight: temperatureIncrease,
            },
            wear: {
                frontLeft: wearIncrease, // Increase wear gradually
                frontRight: wearIncrease,
                rearLeft: wearIncrease,
                rearRight: wearIncrease,
            },
        },
    }

    return randomData
}
