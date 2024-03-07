import React, { useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { TotalTelemetryChart } from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"
import { TyreChartAlternate } from "../Components/TyreChartAlternate"
import { SteeringIndicator, NumberChart } from "../Components/LiveDataCharts"
import "bootstrap/dist/css/bootstrap.min.css"
import { dummyTelemetryData } from "../Data/telemetryData"

export const LiveData = () => {
    const [selectedSession, setSelectedSession] = useState("Race")
    const [selectedTrack, setSelectedTrack] = useState("Track 1")
    const [selectedLap, setSelectedLap] = useState(1)
    const [telemetryData, setTelemetryData] = useState([])
    const [cursorX, setCursorX] = useState(null)

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
            <Row>
                <Col>
                    <div>
                        <TotalTelemetryChart
                            data={telemetryData}
                            syncId="telemetryCharts"
                            onMouseMove={handleCursorMove}
                            throttleKey="throttle"
                            brakeKey="brake"
                            titleLabel="Telemetry v Distance"
                        />
                        <SteeringIndicator value={-90} />
                        <NumberChart value={3} label="Gear" />
                        <NumberChart value={240} label="Speed" />
                    </div>
                </Col>
                <Col>
                    <TyreChartAlternate tireData={telemetryData} />
                </Col>
            </Row>
        </div>
    )
}
