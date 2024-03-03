import React, { useState, useEffect } from "react"
import { Row, Col, Button } from "react-bootstrap"
import { DropdownComponent } from "../Components/DropdownComponent"
import {
    Chart,
    SplitColorChart,
    TotalTelemetryChart,
} from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"

import "bootstrap/dist/css/bootstrap.min.css"
import { dummyTelemetryData } from "../Data/telemetryData"
import arrow2 from "../images/arrow2.jpg"
import car2 from "../images/car2.jpg"

export const Telemetry = () => {
    const [selectedSession, setSelectedSession] = useState("Race")
    const [selectedTrack, setSelectedTrack] = useState("Track 1")
    const [selectedLap, setSelectedLap] = useState(1)
    const [telemetryData, setTelemetryData] = useState([])
    const [cursorX, setCursorX] = useState(null)

    const [combinedTelemetryToggle, setCombinedTelemetryToggle] =
        useState(false)
    const toggleCombinedTelemetry = () => {
        setCombinedTelemetryToggle(!combinedTelemetryToggle)
    }

    useEffect(() => {
        setTelemetryData(dummyTelemetryData.telemetry)
    }, [selectedSession, selectedTrack, selectedLap])

    const handleCursorMove = (e) => {
        if (e && e.activePayload && e.activePayload[0]) {
            setCursorX(e.activePayload[0].payload.distance)
        }
    }

    return (
        <div
            style={{
                background: "black",
                fontFamily: "Futura",
                color: "white",
                position: "relative", // Make sure the parent div has a position to accommodate the absolutely positioned div
            }}
        >
            <div
                style={{
                    backgroundImage: `url(${arrow2})`,
                    opacity: "0.1",
                    position: "absolute", // Set position to absolute
                    top: 0,
                    left: 0,
                    width: "100%", // Set width to 100%
                    height: "100%", // Set height to 100%
                }}
            ></div>

            <div style={{ padding: "30px" }}>
                <Row>
                    <Col xs="auto">
                        <DropdownComponent
                            label="Session:"
                            options={dummyTelemetryData.sessions}
                            selected={selectedSession}
                            onSelect={setSelectedSession}
                        />
                    </Col>
                    <Col xs="auto">
                        <DropdownComponent
                            label="Track:"
                            options={dummyTelemetryData.tracks}
                            selected={selectedTrack}
                            onSelect={setSelectedTrack}
                        />
                    </Col>
                    <Col xs="auto">
                        <DropdownComponent
                            label="Lap:"
                            options={dummyTelemetryData.laps}
                            selected={selectedLap}
                            onSelect={setSelectedLap}
                        />
                    </Col>
                    <Col xs="auto">
                        <Button
                            onClick={toggleCombinedTelemetry}
                            style={{
                                backgroundColor: "#1a5d57",
                                border: "#1a5d57",
                                marginTop: "12%",
                            }}
                        >
                            {combinedTelemetryToggle
                                ? "Toggle Telemetry"
                                : "Toggle Telemetry"}
                        </Button>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col>
                    {combinedTelemetryToggle ? (
                        <div>
                            <TotalTelemetryChart
                                data={telemetryData}
                                syncId="telemetryCharts"
                                onMouseMove={handleCursorMove}
                                throttleKey="throttle"
                                brakeKey="brake"
                                titleLabel="Telemetry v Distance"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <Chart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    dataKey="speed"
                                    titleLabel="Speed v Distance"
                                />
                            </div>
                            <div>
                                <Chart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    dataKey="throttle"
                                    titleLabel="Throttle Input v Distance"
                                />
                            </div>
                            <div>
                                <Chart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    dataKey="brake"
                                    dataKeyTemp="brakeTemperature"
                                    titleLabel="Brake v Distance"
                                />
                            </div>
                            <div>
                                <Chart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    dataKey="gear"
                                    titleLabel="Gear v Distance"
                                />
                            </div>
                            <div>
                                <Chart
                                    data={telemetryData}
                                    syncId="telemetryCharts"
                                    onMouseMove={handleCursorMove}
                                    dataKey="steering"
                                    titleLabel="Steering v Distance"
                                />
                            </div>
                        </>
                    )}
                </Col>
                <Col>
                    {telemetryData ? (
                        <>
                            <TyreChart tireData={telemetryData} />
                        </>
                    ) : (
                        <></>
                    )}
                </Col>
            </Row>
        </div>
    )
}
