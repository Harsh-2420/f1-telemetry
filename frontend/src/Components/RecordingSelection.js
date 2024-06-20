import React from "react"
import { Row, Col } from "react-bootstrap"
import { DropdownComponent } from "./DropdownComponent" // Adjust the import path as per your project structure

const TelemetryControls = ({
    selectedSession,
    setSelectedSession,
    selectedTrack,
    setSelectedTrack,
    selectedLap,
    setSelectedLap,
    dummyTelemetryData,
}) => (
    <div
        className="telemetry-controls-container"
        style={{
            display: "inline-block", // Make the container inline-block to wrap content
            padding: "20px",
            backgroundColor: "#282c34",
            borderRadius: "12px",
            margin: "20px 0",
            marginLeft: "15px",
        }}
    >
        <Row className="align-items-center">
            <Col xs="auto">
                <DropdownComponent
                    label="SESSION"
                    options={dummyTelemetryData.sessions}
                    selected={selectedSession}
                    onSelect={setSelectedSession}
                />
            </Col>
            <Col xs="auto">
                <DropdownComponent
                    label="TRACK"
                    options={dummyTelemetryData.tracks}
                    selected={selectedTrack}
                    onSelect={setSelectedTrack}
                />
            </Col>
            <Col xs="auto">
                <DropdownComponent
                    label="LAP"
                    options={dummyTelemetryData.laps}
                    selected={selectedLap}
                    onSelect={setSelectedLap}
                />
            </Col>
        </Row>
    </div>
)

export default TelemetryControls
