import React, { useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { TotalTelemetryChart } from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"
import { TyreChartAlternate } from "../Components/TyreChartAlternate"
import {
    SteeringIndicator,
    NumberChart,
    PitChart,
} from "../Components/LiveDataCharts"
import "bootstrap/dist/css/bootstrap.min.css"
import { dummyTelemetryData } from "../Data/telemetryData"
import { generateRandomTelemetryData } from "../Functions/telemetryUtils"

export const LiveData = () => {
    const [selectedSession, setSelectedSession] = useState("Race")
    const [selectedTrack, setSelectedTrack] = useState("Track 1")
    const [selectedLap, setSelectedLap] = useState(1)
    const [telemetryData, setTelemetryData] = useState([])
    const [cursorX, setCursorX] = useState(null)

    const handleCursorMove = (e) => {
        if (e && e.activePayload && e.activePayload[0]) {
            setCursorX(e.activePayload[0].payload.distance)
        }
    }
    useEffect(() => {
        setTelemetryData(dummyTelemetryData.telemetry)
    }, [selectedSession, selectedTrack, selectedLap])

    // useEffect(() => {
    //     // Generate random telemetry data when selectedSession changes
    //     const intervalId = setInterval(() => {
    //         // Generate random telemetry data
    //         const randomData = generateRandomTelemetryData()

    //         // Update telemetryDataList with the new data
    //         setTelemetryData((prevDataList) => {
    //             // Append the new data to the list
    //             const newDataList = [...prevDataList, randomData]

    //             // Trim the list if it exceeds 150 entries
    //             if (newDataList.length > 80) {
    //                 newDataList.shift() // Remove the oldest entry
    //             }

    //             return newDataList
    //         })
    //     }, 50)
    //
    //     return () => clearInterval(intervalId) // Cleanup interval on component unmount
    // }, [selectedSession, selectedTrack, selectedLap])

    return (
        <div
            style={{
                background: "#202020", //Gunmetal: 2C3539, 202020, 232c30, 262f33// DarkGrey: 1C1C1C
                fontFamily: "Futura",
                color: "white",
                position: "relative",
            }}
        >
            {/* {telemetryData && (
                <pre>{JSON.stringify(telemetryData, null, 2)}</pre>
            )} */}
            <Row>
                <Col>
                    <div>
                        {telemetryData.length > 1 ? (
                            <>
                                <TotalTelemetryChart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    throttleKey="throttle"
                                    brakeKey="brake"
                                    titleLabel="Telemetry v Distance"
                                />
                                <SteeringIndicator
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .steering
                                    }
                                />
                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .gear
                                    }
                                    label="Gear"
                                />
                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .speed
                                    }
                                    label="Speed"
                                />
                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .engineRPM
                                    }
                                    label="RPM"
                                />
                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .drs
                                    }
                                    label="DRS"
                                />
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </Col>
                <Col>
                    <TyreChartAlternate tireData={telemetryData} />
                    <PitChart x={100} y={10} pitRec1={9} pitRec2={12} />
                </Col>
            </Row>
        </div>
    )
}
