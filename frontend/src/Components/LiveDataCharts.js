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
                    {value.toFixed()}
                </text>
            </svg>
        </div>
    )
}

export const NumberChart = ({ value, label }) => {
    return (
        <div
            style={{
                display: "inline-block",
                backgroundColor: "rgba(64, 64, 64, 0.4)",
                border: "2px solid grey",
                borderRadius: "10px",
                marginBottom: "3%",
                marginRight: "3%",
                marginLeft: "3%",
                padding: "1%",
            }}
        >
            <div
                style={{
                    padding: "2%",
                    marginLeft: "3%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <span style={{ marginRight: "5%", verticalAlign: "middle" }}>
                    {label}
                </span>
                <svg
                    width="200"
                    height="40"
                    style={{ verticalAlign: "middle" }}
                >
                    <text
                        x="70"
                        y="26"
                        textAnchor="middle"
                        fill="white"
                        fontSize="18"
                        alignmentBaseline="middle"
                    >
                        {value.toFixed()}
                    </text>
                </svg>
            </div>
        </div>
    )
}

export const PitChart = ({ x, y, pitRec1, pitRec2 }) => {
    return (
        <svg>
            <g>
                <rect
                    x={x - 80}
                    y={y + 23}
                    width={30}
                    height={30}
                    fill="#F6C324" //#F6C324 //FFFAA0
                    stroke="#F6C324"
                    rx="5"
                    ry="5"
                />
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#ffffff" // White color for text
                    fontSize="18"
                >
                    PIT INFO
                </text>
                <text
                    x={x}
                    y={y + 50}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#ffffff"
                >
                    <tspan fontWeight="400" fontSize="28">
                        {pitRec1} - {pitRec2}
                    </tspan>
                </text>
            </g>
        </svg>
    )
}
