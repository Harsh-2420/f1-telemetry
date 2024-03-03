import React, { useState, useEffect } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Rectangle,
} from "recharts"
import chroma from "chroma-js"

// Function to calculate background color based on wear percentage
const calculateBackgroundColor = (wear) => {
    const backgroundStartColor = "#8BC34A" // 8BC34A // AED581
    const backgroundEndColor = "#EF5350" // EF5350 // FF8A80
    return chroma
        .scale([backgroundStartColor, backgroundEndColor])
        .mode("lab")(wear / 100)
        .hex()
}

// Function to calculate glow color based on temperature
const calculateGlowColor = (temperature) => {
    const glowStartColor = "#FFFF00" // Yellow
    const glowEndColor = "#FF0000" // Red

    let interpolationParameter = Math.max(
        0,
        Math.min(1, (temperature - 110) / 50)
    ) // Normalize temperature between 110 and 160

    return chroma
        .mix(glowStartColor, glowEndColor, interpolationParameter, "lab")
        .hex()
}

export const TyreChart = ({ tireData }) => {
    // Get the latest tire data
    const latestTire = tireData[tireData.length - 1]
    if (!latestTire) return null // Handle case when tireData is empty or undefined

    // Tire dimensions
    const tireWidth = 130
    const tireHeight = 65
    const tireMargin = 5

    // Render tire shapes for each tire
    return (
        <>
            <div class="h3-container-tyre">
                <h3>Tyre Information</h3>
                <div class="tyre-compound-icon" style={{}}>
                    C4
                </div>
            </div>
            <svg width="600" height="400">
                <g>
                    {/* Front Left tire */}
                    {renderTire(
                        100,
                        100,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.frontLeft,
                        latestTire.tyre.temperature.frontLeft
                    )}

                    {/* Front Right tire */}
                    {renderTire(
                        300,
                        100,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.frontRight,
                        latestTire.tyre.temperature.frontRight
                    )}

                    {/* Rear Left tire */}
                    {renderTire(
                        100,
                        300,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.rearLeft,
                        latestTire.tyre.temperature.rearLeft
                    )}

                    {/* Rear Right tire */}
                    {renderTire(
                        300,
                        300,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.rearRight,
                        latestTire.tyre.temperature.rearRight
                    )}
                </g>
            </svg>
        </>
    )
}

// Function to render a single tire shape
const renderTire = (x, y, width, height, margin, wear, temperature) => {
    const wearColor = calculateBackgroundColor(wear)
    const rimColor = calculateGlowColor(temperature)

    return (
        <g key={`${x}-${y}`}>
            {/* Inner rectangle (tire) */}
            <rect
                x={x - width / 2}
                y={y - height / 2}
                width={width}
                height={height}
                fill={wearColor}
                rx={height / 2}
                ry={height / 2}
                stroke="none"
                transform={`rotate(90 ${x} ${y})`} // Rotate the tire by 90 degrees around its center
            />
            <text
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
                fontSize="16"
            >
                {`${wear}%`}
            </text>

            {/* Outer rectangle (rim) */}
            <rect
                x={x - width / 2 - margin}
                y={y - height / 2 - margin}
                width={width + 2 * margin}
                height={height + 2 * margin}
                fill="none"
                stroke={rimColor}
                strokeWidth={3}
                rx={(height + 2 * margin) / 2}
                ry={(height + 2 * margin) / 2}
                transform={`rotate(90 ${x} ${y})`} // Rotate the rim by 90 degrees around its center
            />
        </g>
    )
}
