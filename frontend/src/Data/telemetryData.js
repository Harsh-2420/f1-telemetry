export const dummyTelemetryData = {
    sessions: ["Race", "Qualifying"],
    tracks: [
        "Bahrain International Race Circuit",
        "Spanish Grand Prix",
        "Canadian Gilles Villneauve Cicuit Canadian Gilles Villneauve Cicuit",
    ],
    laps: [1, 2, 3, 4, 5],
    telemetry: [
        {
            id: 0,
            distance: 0,
            speed: 0,
            throttle: 0.5,
            brake: 0.2,
            drs: 0,
            steering: 0.1,
            gear: 1,
            engineRPM: 3000,
            time: 0,
            brakeTemperature: 100,
            tyre: {
                temperature: {
                    frontLeft: 80,
                    frontRight: 80,
                    rearLeft: 75,
                    rearRight: 75,
                },
                wear: {
                    frontLeft: 10,
                    frontRight: 10,
                    rearLeft: 8,
                    rearRight: 8,
                },
            },
        },
        {
            id: 1,
            distance: 100,
            speed: 150,
            throttle: 0.7,
            brake: 0.1,
            drs: 1,
            steering: -0.05,
            gear: 2,
            engineRPM: 5000,
            time: 30,
            brakeTemperature: 160,
            tyre: {
                temperature: {
                    frontLeft: 85,
                    frontRight: 85,
                    rearLeft: 80,
                    rearRight: 80,
                },
                wear: {
                    frontLeft: 15,
                    frontRight: 15,
                    rearLeft: 13,
                    rearRight: 12,
                },
            },
        },
        {
            id: 2,
            distance: 200,
            speed: 180,
            throttle: 0.8,
            brake: 0.15,
            drs: 0,
            steering: 0.08,
            gear: 3,
            engineRPM: 5500,
            time: 60,
            brakeTemperature: 200,
            tyre: {
                temperature: {
                    frontLeft: 90,
                    frontRight: 90,
                    rearLeft: 85,
                    rearRight: 85,
                },
                wear: {
                    frontLeft: 18,
                    frontRight: 19,
                    rearLeft: 17,
                    rearRight: 16,
                },
                age: 10,
            },
        },
        {
            id: 3,
            distance: 300,
            speed: 200,
            throttle: 0.6,
            brake: 0.1,
            drs: 0,
            steering: 0.06,
            gear: 4,
            engineRPM: 6000,
            time: 90,
            brakeTemperature: 150,
            tyre: {
                temperature: {
                    frontLeft: 95,
                    frontRight: 95,
                    rearLeft: 90,
                    rearRight: 90,
                },
                wear: {
                    frontLeft: 25,
                    frontRight: 25,
                    rearLeft: 23,
                    rearRight: 23,
                },
            },
        },
        {
            id: 4,
            distance: 400,
            speed: 190,
            throttle: 0.75,
            brake: 0.1,
            drs: 0,
            steering: -57,
            gear: 5,
            engineRPM: 6200,
            time: 120,
            brakeTemperature: 105,
            tyre: {
                temperature: {
                    frontLeft: 145,
                    frontRight: 120,
                    rearLeft: 95,
                    rearRight: 70,
                },
                wear: {
                    frontLeft: 79,
                    frontRight: 57,
                    rearLeft: 25,
                    rearRight: 5,
                },
                age: 10,
                type: "C4",
            },
        },
    ],
}
