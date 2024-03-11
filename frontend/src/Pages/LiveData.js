import React, { useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { TotalTelemetryChart } from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"
import { TyreChartAlternate } from "../Components/TyreChartAlternate"
import {
    SteeringIndicator,
    NumberChart,
    PitChart,
    RPMIndicator,
    SpeedChart,
    FuelChart,
    LiveBestLapTimes,
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

                                <Row
                                //  style={{ border: "1px solid magenta" }}
                                >
                                    <Col xs={6} style={{}}>
                                        <RPMIndicator
                                            x={200}
                                            y={120}
                                            rpm={
                                                telemetryData[
                                                    telemetryData.length - 1
                                                ].engineRPM
                                            }
                                            gear={
                                                telemetryData[
                                                    telemetryData.length - 1
                                                ].gear
                                            }
                                        />
                                    </Col>
                                    <Col
                                        xs={6}
                                        // style={{ border: "1px solid blue" }}
                                    >
                                        <SpeedChart
                                            x={80}
                                            y={60}
                                            value={
                                                telemetryData[
                                                    telemetryData.length - 1
                                                ].speed
                                            }
                                        />
                                        <SteeringIndicator
                                            value={
                                                telemetryData[
                                                    telemetryData.length - 1
                                                ].steering
                                            }
                                        />
                                    </Col>
                                </Row>
                                {/* <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .speed
                                    }
                                    label="Speed"
                                />

                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .drs
                                    }
                                    label="DRS"
                                /> */}
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </Col>
                <Col>
                    <TyreChartAlternate tireData={telemetryData} />
                    <Row>
                        <Col xs={4}>
                            <PitChart x={100} y={10} pitRec1={9} pitRec2={12} />
                        </Col>
                        <Col xs={4}>
                            <FuelChart x={100} y={10} value={9} />
                        </Col>
                        <Col xs={4}>
                            <LiveBestLapTimes
                                x={100}
                                y={10}
                                personalBest={"1:09:23"}
                                sessionBest={"1:09:23"}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}
