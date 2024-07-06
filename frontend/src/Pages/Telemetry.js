import React, { useState, useEffect } from "react"
import { Row, Col, Button, Navbar, Nav } from "react-bootstrap"
import F1 from "../images/F1.png"
import F123 from "../images/f123-light.png"
// import { DropdownComponent } from "../Components/DropdownComponent"
import Recording from "../Components/RecordingIcon"
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
            <Navbar
                expand="lg"
                style={{
                    padding: "10px",
                    height: "80px",
                    backgroundColor: "#171819", // 282c34
                    borderBottomLeftRadius: "14px",
                    borderBottomRightRadius: "14px",
                    borderRadius: "14px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    marginBottom: "10px",
                }}
            >
                <Navbar.Brand
                    href="#"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <img
                        src={F123}
                        alt="f1-logo"
                        style={{ width: "150px", marginRight: "10px" }}
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav
                        className="ml-auto"
                        style={{
                            width: "100%",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        <Recording />
                        <Button
                            id="live-data-toggle"
                            onClick={toggleCombinedTelemetry}
                            style={{
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                fontSize: "14px",
                                marginLeft: "10px", // Added margin to separate the button from the Recording component
                            }}
                        >
                            {combinedTelemetryToggle ? "Live Data" : "Analysis"}
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            {combinedTelemetryToggle ? <LiveData /> : <Analysis />}
        </div>
    )
}
