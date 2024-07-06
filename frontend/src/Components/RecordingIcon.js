import React, { useState } from "react"
import "../App.css"

const RecordingIcon = () => {
    const [isRecording, setIsRecording] = useState(false)

    const handleToggleRecording = () => {
        const currentTime = new Date().toLocaleTimeString()
        if (isRecording) {
            console.log(`${currentTime} - recording stopped`)
        } else {
            console.log(currentTime)
        }
        setIsRecording(!isRecording)
    }

    const handleRecordClick = () => {
        // Toggle the recording state when clicking on "RECORD"
        handleToggleRecording()
    }

    return (
        <div
            className="recording-container"
            style={{
                display: "inline-block",
                padding: "30px",
                margin: "20px",
                marginLeft: "35px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <div
                    className={`recording-icon ${
                        isRecording ? "recording" : ""
                    }`}
                    onClick={handleToggleRecording}
                    style={{ cursor: "pointer" }}
                ></div>
            </div>
        </div>
    )
}

export default RecordingIcon
