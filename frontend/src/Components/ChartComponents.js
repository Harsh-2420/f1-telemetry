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

export const Chart = ({
    data,
    syncId,
    onMouseMove,
    dataKey,
    dataKeyTemp,
    titleLabel,
}) => {
    const [tempLineOpacity, setTempLineOpacity] = useState(1)

    const handleTempLineClick = () => {
        setTempLineOpacity(tempLineOpacity === 1 ? 0.1 : 1)
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "#1e222a",
                        border: "1px solid #cccccc",
                        borderRadius: "10px",
                        padding: "10px",
                        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <p style={{ margin: 0 }}>{`Distance: ${label}`}</p>
                    <p style={{ margin: 0 }}>{`Value: ${payload[0].value}`}</p>
                </div>
            )
        }
        return null
    }

    return (
        <div
            style={{
                width: "100%",
                padding: "1%",
                background: "#282c34",
                borderRadius: "15px",
                marginBottom: "10px",
            }}
        >
            <h6 style={{ marginLeft: "2%", fontSize: "14px" }}>{titleLabel}</h6>
            <ResponsiveContainer width="100%" height={150}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    syncId={syncId}
                    onMouseMove={onMouseMove}
                >
                    <XAxis dataKey="distance" tick={false} />
                    <YAxis
                        yAxisId="left"
                        // ticks={[0, 1, 2]}
                        tick={{ fontSize: 10, fill: "#d3d3d3" }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        // ticks={[0, 1, 2]}
                        tick={{ fontSize: 10, fill: "#d3d3d3" }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        yAxisId="left"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export const TotalTelemetryChart = ({
    data,
    syncId,
    onMouseMove,
    throttleKey,
    brakeKey,
    titleLabel,
}) => {
    return (
        <>
            <h4 style={{ padding: "1%", marginLeft: "4%" }}>{titleLabel}</h4>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    syncId={syncId}
                    onMouseMove={onMouseMove}
                >
                    <XAxis dataKey="distance" />
                    <YAxis yAxisId="left" domain={[0, 100]} />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                    />
                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey={throttleKey}
                        stroke="green"
                        yAxisId="right"
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey={brakeKey}
                        stroke="red"
                        yAxisId="left"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}

export const SplitColorChart = ({
    data,
    syncId,
    onMouseMove,
    dataKey,
    titleLabel,
}) => {
    const gradientStops = () => {
        const brakeTemperatures = data.map((item) => item.brakeTemperature)
        const minTemp = Math.min(...brakeTemperatures)
        const maxTemp = Math.max(...brakeTemperatures)
        const midTemp = (maxTemp + minTemp) / 2

        // Calculate the offsets for red and blue stops
        const redOffset =
            minTemp >= 0 ? 0 : (midTemp - minTemp) / (maxTemp - minTemp)
        const blueOffset =
            maxTemp <= 0 ? 1 : (maxTemp - midTemp) / (maxTemp - minTemp)

        return [
            { offset: redOffset, color: "blue" },
            { offset: blueOffset, color: "red" },
        ]
    }

    const stops = gradientStops()

    return (
        <>
            <h4
                style={{
                    padding: "1%",
                    marginLeft: "4%",
                }}
            >
                {titleLabel}
            </h4>
            <ResponsiveContainer width="60%" height={400}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    syncId={syncId}
                    onMouseMove={onMouseMove}
                >
                    <XAxis dataKey="distance" />
                    <YAxis />
                    <Tooltip />
                    <defs>
                        <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            {stops.map((stop, index) => (
                                <stop
                                    key={index}
                                    offset={`${stop.offset * 100}%`}
                                    stopColor={stop.color}
                                    stopOpacity={1}
                                />
                            ))}
                        </linearGradient>
                    </defs>
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke="url(#colorGradient)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}
