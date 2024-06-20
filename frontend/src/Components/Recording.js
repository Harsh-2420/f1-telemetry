import React, { useState } from "react"
import "../App.css"

const Recording = () => {
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

    return (
        <div className="recording-container">
            <div
                className={`record-button ${isRecording ? "recording" : ""}`}
                onClick={handleToggleRecording}
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
    )
}

export default Recording
