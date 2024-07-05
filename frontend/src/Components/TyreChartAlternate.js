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
import { Row } from "react-bootstrap"

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
const calculateGlowColor = (identifier, temperature, tyreCompound) => {
    const temperatureRanges = {
        C0: {
            surface: {
                blue: [0, 70],
                white: [70, 100],
                orange: [100, 120],
                red: [120, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 130],
                red: [130, Infinity],
            },
        },
        C1: {
            surface: {
                blue: [0, 70],
                white: [70, 100],
                orange: [100, 120],
                red: [120, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 130],
                red: [130, Infinity],
            },
        },
        C2: {
            surface: {
                blue: [0, 70],
                white: [70, 120],
                orange: [120, 140],
                red: [140, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 120],
                red: [120, Infinity],
            },
        },
        C3: {
            surface: {
                blue: [0, 70],
                white: [70, 100],
                orange: [100, 120],
                red: [120, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 130],
                red: [130, Infinity],
            },
        },
        C4: {
            surface: {
                blue: [0, 70],
                white: [70, 100],
                orange: [100, 120],
                red: [120, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 130],
                red: [130, Infinity],
            },
        },
        C5: {
            surface: {
                blue: [0, 70],
                white: [70, 100],
                orange: [100, 120],
                red: [120, Infinity],
            },
            inner: {
                blue: [0, 80],
                white: [80, 110],
                orange: [110, 130],
                red: [130, Infinity],
            },
        },
        inter: {
            surface: {
                blue: [0, 60],
                white: [60, 80],
                orange: [80, 100],
                red: [100, Infinity],
            },
            inner: {
                blue: [0, 70],
                white: [70, 90],
                orange: [90, 110],
                red: [110, Infinity],
            },
        },
        wet: {
            surface: {
                blue: [0, 50],
                white: [50, 70],
                orange: [70, 90],
                red: [90, Infinity],
            },
            inner: {
                blue: [0, 60],
                white: [60, 80],
                orange: [80, 100],
                red: [100, Infinity],
            },
        },
    }

    const { blue, white, orange, red } =
        temperatureRanges[tyreCompound][identifier]
    let glowStartColor, glowEndColor

    if (temperature >= blue[0] && temperature < blue[1]) {
        glowStartColor = "#4da6ff" // Blue
        glowEndColor = "#FFFFFF" // White
    } else if (temperature <= blue[0]) {
        glowStartColor = "#4da6ff" // Blue
        glowEndColor = "#4da6ff" // Blue
    } else if (temperature >= white[0] && temperature <= white[1]) {
        glowStartColor = "#FFFFFF" // White
        glowEndColor = "#FFA500" // Orange
    } else if (temperature > orange[0] && temperature <= orange[1]) {
        glowStartColor = "#FFFFFF" // White
        glowEndColor = "#FFA500" // Orange
    } else if (temperature > red[0] && temperature <= red[1]) {
        glowStartColor = "#FFA500" // Orange
        glowEndColor = "#FF0000" // Red
    } else {
        glowStartColor = "#FF0000" // Red
        glowEndColor = "#FF0000" // Red
    }

    const determineActiveBucket = (buckets) => {
        for (const key in buckets) {
            const [low, high] = buckets[key]
            if (temperature >= low && temperature <= high) {
                return key
            }
        }
    }

    const temperatureFunctionCalcuator = (temperature, activeBucketKey) => {
        if (activeBucketKey === "blue") {
            return 2 + (temperature ^ 5)
        } else if (activeBucketKey === "white") {
            return ((temperature - 1.5) ^ 5) + 4
        } else if (activeBucketKey === "orange") {
            return ((temperature - 3.5) ^ 5) + 8
        } else {
            return ((temperature - 5.5) ^ 5) + 12
        }
    }

    let interpolationParameter = 0
    // console.log(temperatureRanges)
    const buckets = temperatureRanges[tyreCompound][identifier]
    const activeBucketKey = determineActiveBucket(buckets)
    // const [low, high] = buckets[activeBucketKey]
    console.log(
        temperature,
        activeBucketKey,
        temperatureFunctionCalcuator(temperature, activeBucketKey)
    )

    return chroma
        .mix(glowStartColor, glowEndColor, interpolationParameter, "lab")
        .hex()
}

/**
 *
 * @param {{tireData: { telemetryData: Object, statusData: Object }}} param0
 * @returns
 */
export const TyreChartAlternate = ({ tireData }) => {
    const actualTyreCompoundsMapping = {
        16: "C5",
        17: "C4",
        18: "C4",
        19: "C2",
        20: "C1",
        21: "C0",
        7: "inter",
        8: "wet",
    }
    const visualTyreCompoundsMapping = {
        16: "soft",
        17: "medium",
        18: "hard",
        7: "inter",
        8: "wet",
    }
    const currentActualCompound =
        actualTyreCompoundsMapping[tireData.statusData.ActualTyreCompound]
    const currentVisualCompound =
        visualTyreCompoundsMapping[tireData.statusData.VisualTyreCompound]
    const [innerFrontLeft, innerFrontRight, innerRearLeft, innerRearRight] =
        tireData.telemetryData.TyresInnerTemperature

    const [
        surfaceFrontLeft,
        surfaceFrontRight,
        surfaceRearLeft,
        surfaceRearRight,
    ] = tireData.telemetryData.TyresSurfaceTemperature

    const latestTire = {
        tyre: { wear: {}, innerTemperature: {}, surfaceTemperature: {} },
    }
    latestTire.tyre.innerTemperature = {
        innerRearLeft,
        innerRearRight,
        innerFrontLeft,
        innerFrontRight,
    }
    latestTire.tyre.surfaceTemperature = {
        surfaceRearLeft,
        surfaceRearRight,
        surfaceFrontLeft,
        surfaceFrontRight,
    }
    // Tyre Wear not yet coming from backend
    latestTire.tyre.wear = {
        surfaceRearLeft,
        surfaceRearRight,
        surfaceFrontLeft,
        surfaceFrontRight,
    }

    if (!latestTire) return null // Handle case when tireData is empty or undefined

    // Tire dimensions
    const tireWidth = 80
    const tireHeight = 35
    const tireMargin = 4

    // Render tire shapes for each tire
    return (
        <>
            <svg width="600" height="400">
                <g>
                    {/* Front Left tire */}
                    {renderTire(
                        100,
                        100,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.surfaceRearLeft,
                        latestTire.tyre.innerTemperature.innerRearLeft,
                        latestTire.tyre.surfaceTemperature.surfaceRearLeft,
                        currentActualCompound
                    )}

                    {/* rear Right tire */}
                    {renderTire(
                        250,
                        100,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.surfaceRearRight,
                        latestTire.tyre.innerTemperature.innerRearRight,
                        latestTire.tyre.surfaceTemperature.surfaceRearRight,
                        currentActualCompound
                    )}

                    {/* Rear Left tire */}
                    {renderTire(
                        100,
                        250,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.surfaceFrontLeft,
                        latestTire.tyre.innerTemperature.innerFrontLeft,
                        latestTire.tyre.surfaceTemperature.surfaceFrontLeft,
                        currentActualCompound
                    )}

                    {/* front Right tire */}
                    {renderTire(
                        250,
                        250,
                        tireWidth,
                        tireHeight,
                        tireMargin,
                        latestTire.tyre.wear.surfaceFrontRight,
                        latestTire.tyre.innerTemperature.innerFrontRight,
                        latestTire.tyre.surfaceTemperature.surfaceFrontRight,
                        currentActualCompound
                    )}
                    {/* {TyreDetails(
                        410,
                        25,
                        60,
                        60,
                        currentActualCompound,
                        currentVisualCompound
                    )}
                    {TyreAge(
                        410,
                        170,
                        90,
                        90,
                        tireData.statusData.TyresAgeLaps
                    )} */}
                </g>
            </svg>
        </>
    )
}

const TyreDetails = (x, y, width, height, tyreActualType, tyreVisualType) => {
    let tyreColor
    if (tyreVisualType === "soft") {
        tyreColor = "#d83131" // Red
    } else if (tyreVisualType === "medium") {
        tyreColor = "#FFFF00" // Yellow
    } else if (tyreVisualType === "hard") {
        tyreColor = "#FFFFFF" // White
    } else if (tyreVisualType === "inter") {
        tyreColor = "#00FF00" // Green
    } else if (tyreVisualType === "wet") {
        tyreColor = "#0000FF" // Blue
    } else {
        tyreColor = "#d83131" // Default to black if tyre type is unknown
    }
    return (
        <>
            <g>
                <text
                    x={x}
                    y={y + 68}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#ffff"
                >
                    <tspan
                        x={x - 20}
                        fontWeight="400"
                        fontSize="20"
                        fill={tyreColor}
                    >
                        {tyreActualType}
                    </tspan>
                </text>
                <rect
                    x={x - 50}
                    y={y + 30}
                    width={width}
                    height={height}
                    rx={width}
                    ry={height}
                    fill="none"
                    stroke={tyreColor}
                    strokeWidth={3}
                />
            </g>
        </>
    )
}
const TyreAge = (x, y, width, height, tyreAge) => {
    return (
        <>
            <g>
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#ffffff" // White color for text
                    fontSize="18"
                >
                    Tyre Age
                </text>
                <text
                    x={x}
                    y={y + 75}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#ffff"
                >
                    <tspan
                        x={x - 5}
                        // y={y + 80}
                        fontWeight="400"
                        fontSize="30"
                        fill="#F6C324"
                    >
                        {tyreAge}
                    </tspan>
                    <tspan x={x - 5} dy="2em" fontSize="12">
                        LAPS
                    </tspan>
                </text>
                <rect
                    x={x - 50}
                    y={y + 30}
                    width={width}
                    height={height}
                    rx={width}
                    ry={height}
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                />
            </g>
        </>
    )
}

const renderTire = (
    x,
    y,
    width,
    height,
    margin,
    wear,
    innerTemperature,
    surfaceTemperature,
    currentActualCompound
) => {
    const rimColor = calculateGlowColor(
        "surface",
        surfaceTemperature,
        currentActualCompound
    )
    const innerTyreColor = calculateGlowColor(
        "inner",
        innerTemperature,
        currentActualCompound
    )
    const barWidth = 20 // Width of the wear bar
    const barX = x + width / 2 + margin // X-coordinate of the wear bar
    const barY = y - height / 2 // Y-coordinate of the wear bar
    const maxWearHeight = height // Maximum wear height, same as tire height
    const wearHeight = (height * (100 - wear)) / 100 // Height of the worn part of the bar
    const innerMargin = margin - 6

    return (
        <g key={`${x}-${y}`}>
            {/* Tire */}
            <rect
                x={x - width / 2}
                y={y - height / 2}
                width={width}
                height={height}
                fill="none"
                stroke="none"
                transform={`rotate(90 ${x} ${y})`}
            />
            {/* Rim */}
            <rect
                x={x - width / 2 - margin}
                y={y - height / 2 - margin}
                width={width + 2 * margin}
                height={height + 2 * margin}
                fill="none"
                stroke={rimColor}
                strokeWidth={3}
                rx={(height + 2 * margin) / 4}
                ry={(height + 2 * margin) / 4}
                transform={`rotate(90 ${x} ${y})`}
            />
            {/* Inner Rim */}
            <rect
                x={x - width / 2 - innerMargin} // Adjust innerMargin as needed
                y={y - height / 2 - innerMargin} // Adjust innerMargin as needed
                width={width + 2 * innerMargin} // Adjust innerMargin as needed
                height={height + 2 * innerMargin} // Adjust innerMargin as needed
                fill={innerTyreColor} // Use the innerColor variable to set the fill color
                stroke="none" // No stroke for the inner rectangle
                rx={(height + 2 * innerMargin) / 4} // Same rounded corners as the outer rim
                ry={(height + 2 * innerMargin) / 4} // Same rounded corners as the outer rim
                transform={`rotate(90 ${x} ${y})`}
            />
            {/* Maximum wear bar outline */}
            <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={maxWearHeight}
                fill="none"
                stroke="#ffffff" // White outline color
                strokeWidth={1}
                rx={4} // Rounded corners
                ry={4} // Rounded corners
            />
            {/* Maximum wear bar */}
            <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={maxWearHeight}
                fill="none"
                stroke="#ffffff" // White outline color
                strokeWidth={1}
                strokeDasharray={`${maxWearHeight} ${maxWearHeight}`} // Create dashed outline effect
                rx={4} // Rounded corners
                ry={4} // Rounded corners
                transform={`rotate(180 ${barX + barWidth / 2} ${
                    barY + maxWearHeight / 2
                })`} // Rotate the outline
            />
            {/* Wear bar */}
            <rect
                x={barX}
                y={barY + maxWearHeight - wearHeight}
                width={barWidth}
                height={wearHeight}
                fill="#ffffff" // White color for worn part
                stroke="#ffffff" // White border
                strokeWidth={1}
                rx={5} // Rounded corners
                ry={5} // Rounded corners
            />
            {/* Wear percentage text */}
            <text
                x={barX + barWidth / 2}
                y={barY - 15} // Adjust this value for positioning
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="#ffffff" // White color for text
                fontSize="12"
            >
                {`${wear.toFixed(0)}%`}
            </text>
        </g>
    )
}
