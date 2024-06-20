import React, { useState, useEffect } from "react"
import { Row, Col, Button } from "react-bootstrap"
// import { DropdownComponent } from "../Components/DropdownComponent"
// import Recording from "../Components/RecordingIcon"
// import MultipleSelectChip from "../Components/DropdownComponent"
import {
    Chart,
    SplitColorChart,
    TotalTelemetryChart,
} from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"
import { LiveData } from "./LiveData"
import { Analysis } from "./Analysis"

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

    const [combinedTelemetryToggle, setCombinedTelemetryToggle] = useState(true)

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
                position: "relative",
            }}
        >
            <div style={{ padding: "30px" }}>
                <Row className="align-items-center" style={{}}>
                    {/* {combinedTelemetryToggle ? (
                        <>
                            <Recording />
                        </>
                    ) : (
                        <>
                            <Col xs="auto" style={{}}>
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
                        </>
                    )} */}
                    <Col
                        style={{
                            textAlign: "right",
                        }}
                    >
                        <Button
                            id="live-data-toggle"
                            onClick={toggleCombinedTelemetry}
                        >
                            {combinedTelemetryToggle ? "Live Data" : "Analysis"}
                        </Button>
                    </Col>
                </Row>
            </div>
            {combinedTelemetryToggle ? (
                <>
                    <LiveData />
                </>
            ) : (
                <>
                    <Analysis />
                </>
            )}
        </div>
    )
}
