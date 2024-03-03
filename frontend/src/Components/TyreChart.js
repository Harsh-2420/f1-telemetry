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

export const TyreChart = ({ tireData }) => {
    const normalizeValues = (temperature) => {
        if (temperature) {
            const values = Object.values(temperature)
            const minValue = Math.min(...values)
            const maxValue = Math.max(...values)

            const normalizedTemperature = {}

            for (const key in temperature) {
                if (temperature.hasOwnProperty(key)) {
                    normalizedTemperature[key] =
                        ((temperature[key] - minValue) /
                            (maxValue - minValue)) *
                        100
                }
            }
        } else {
            console.log("Temperature object is null or undefined.")
        }
        return temperature
    }
    const calculateColors = (
        value,
        minValue,
        maxValue,
        startColor,
        endColor
    ) => {
        const percentage = (value - minValue) / (maxValue - minValue)
        const interpolatedColor = chroma
            .scale([startColor, endColor])
            .mode("lab")(percentage)
            .hex()
        return interpolatedColor
    }

    // Get the latest tire data
    const latestTire = tireData[tireData.length - 1]
    if (!latestTire) return null // Handle case when tireData is empty or undefined

    const { temperature, wear } = latestTire.tyre
    const temperatureNorm = normalizeValues(temperature)

    // Calculate average temperature for the tire
    const avgTemperature =
        (temperatureNorm.frontLeft +
            temperatureNorm.frontRight +
            temperatureNorm.rearLeft +
            temperatureNorm.rearRight) /
        4

    // Define background and glow colors based on wear and temperature
    const backgroundStartColor = "#00FF00" // Green
    const backgroundEndColor = "#FF0000" // Red
    const glowStartColor = "#00FFFF" // Light blue
    const glowEndColor = "#FF0000" // Red

    const backgroundInterpolatedColors = {
        frontLeft: calculateColors(
            wear.frontLeft,
            0,
            100,
            backgroundStartColor,
            backgroundEndColor
        ),
        frontRight: calculateColors(
            wear.frontRight,
            0,
            100,
            backgroundStartColor,
            backgroundEndColor
        ),
        rearLeft: calculateColors(
            wear.rearLeft,
            0,
            100,
            backgroundStartColor,
            backgroundEndColor
        ),
        rearRight: calculateColors(
            wear.rearRight,
            0,
            100,
            backgroundStartColor,
            backgroundEndColor
        ),
    }

    const glowInterpolatedColor = {
        frontLeft: calculateColors(
            temperatureNorm.frontLeft,
            0,
            100,
            glowStartColor,
            glowEndColor
        ),
        frontRight: calculateColors(
            temperatureNorm.frontRight,
            0,
            100,
            glowStartColor,
            glowEndColor
        ),
        rearLeft: calculateColors(
            temperatureNorm.rearLeft,
            0,
            100,
            glowStartColor,
            glowEndColor
        ),
        rearRight: calculateColors(
            temperatureNorm.rearRight,
            0,
            100,
            glowStartColor,
            glowEndColor
        ),
    }

    // Render circles and wear texts for all four tires
    return (
        <svg width="400" height="400">
            <g>
                {/* Front Left tire */}
                <circle
                    cx={100}
                    cy={100}
                    r={50}
                    fill={backgroundInterpolatedColors.frontLeft}
                    stroke="white"
                    strokeWidth={3}
                    style={{
                        filter: `drop-shadow(0px 0px 10px ${glowInterpolatedColor.frontLeft})`,
                    }}
                />
                <text
                    x={100}
                    y={100}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize="24"
                >
                    {wear.frontLeft}
                </text>

                {/* Front Right tire */}
                <circle
                    cx={300}
                    cy={100}
                    r={50}
                    fill={backgroundInterpolatedColors.frontRight}
                    stroke="white"
                    strokeWidth={3}
                    style={{
                        filter: `drop-shadow(0px 0px 10px ${glowInterpolatedColor.frontRight})`,
                    }}
                />
                <text
                    x={300}
                    y={100}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize="24"
                >
                    {wear.frontRight}
                </text>

                {/* Rear Left tire */}
                <circle
                    cx={100}
                    cy={300}
                    r={50}
                    fill={backgroundInterpolatedColors.rearLeft}
                    stroke="white"
                    strokeWidth={3}
                    style={{
                        filter: `drop-shadow(0px 0px 10px ${glowInterpolatedColor.rearLeft})`,
                    }}
                />
                <text
                    x={100}
                    y={300}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize="24"
                >
                    {wear.rearLeft}
                </text>

                {/* Rear Right tire */}
                {console.log(glowInterpolatedColor.rearLeft)}
                <circle
                    cx={300}
                    cy={300}
                    r={50}
                    fill={backgroundInterpolatedColors.rearRight}
                    stroke="white"
                    strokeWidth={3}
                    style={{
                        filter: `drop-shadow(0px 0px 10px ${glowInterpolatedColor.rearRight})`,
                    }}
                />
                <text
                    x={300}
                    y={300}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize="24"
                >
                    {wear.rearRight}
                </text>
            </g>
        </svg>
    )
}
