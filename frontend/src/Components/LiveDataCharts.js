import React from "react"

export const SteeringIndicator = ({ value }) => {
    const fillPercentage = Math.min(Math.abs(value) / 100, 1)
    const isPositive = value >= 0
    const fillWidth = `${fillPercentage * 50}%`
    const fillX = isPositive ? "50%" : `${50 - fillPercentage * 50}%` // Flipped direction

    return (
        <div style={{ padding: "2%", marginLeft: "3%" }}>
            <span style={{ marginRight: "5%" }}>Steering</span>
            <svg width="200" height="40">
                <rect
                    x="0"
                    y="10"
                    width="200"
                    height="20"
                    fill="#333"
                    rx="10"
                    ry="10"
                />

                <rect
                    x={fillX}
                    y="10"
                    width={fillWidth}
                    height="20"
                    fill="#1a5d57"
                    rx="10"
                    ry="10"
                />

                <line
                    x1="100"
                    y1="0"
                    x2="100"
                    y2="40"
                    stroke="white"
                    strokeWidth="1"
                    opacity={0.3}
                />

                <text
                    x="100"
                    y="26"
                    textAnchor="middle"
                    fill="white"
                    fontSize="15"
                >
                    {value}
                </text>
            </svg>
        </div>
    )
}

export const NumberChart = ({ value, label }) => {
    return (
        <div style={{ padding: "2%", marginLeft: "3%" }}>
            <span style={{ marginRight: "5%" }}>{label}</span>
            <svg width="200" height="40">
                <text
                    x="100"
                    y="26"
                    textAnchor="middle"
                    fill="white"
                    fontSize="15"
                >
                    {value}
                </text>
            </svg>
        </div>
    )
}
