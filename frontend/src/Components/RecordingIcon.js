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
                backgroundColor: "#282c34",
                borderRadius: "12px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <div
                    style={{
                        marginRight: "20px",
                        fontWeight: "600",
                        color: "#ef5a52",
                        letterSpacing: "2px",
                        cursor: "pointer", // Make the text clickable
                    }}
                    onClick={handleRecordClick} // Attach onClick handler to the text
                >
                    RECORD
                </div>
                <div
                    className={`record-button ${
                        isRecording ? "recording" : ""
                    }`}
                    onClick={handleToggleRecording}
                    style={{ cursor: "pointer" }}
                >
                    <div className="record-square"></div>
                </div>
                {isRecording && (
                    <div className="dots-animation">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecordingIcon
