import React, { useState, useEffect } from "react"
import { Row, Col, Button } from "react-bootstrap"
import { DropdownComponent } from "../Components/DropdownComponent"
import {
    Chart,
    SplitColorChart,
    TotalTelemetryChart,
} from "../Components/ChartComponents"
import { TyreChartAlternate } from "../Components/TyreChartAlternate"

import "bootstrap/dist/css/bootstrap.min.css"
import { dummyTelemetryData } from "../Data/telemetryData"
import arrow2 from "../images/arrow2.jpg"
import car2 from "../images/car2.jpg"

export const Analysis = () => {
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
                background: "#202020",
                fontFamily: "Futura",
                color: "white",
                position: "relative", // Make sure the parent div has a position to accommodate the absolutely positioned div
            }}
        >
            <Row>
                <Col>
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
                </Col>
                <Col>
                    {/* <TyreChartAlternate tireData={telemetryData} /> */}
                </Col>
            </Row>
        </div>
    )
}
