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
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />

                    {dataKey === "brake" ? (
                        <>
                            <Rectangle
                                width={10}
                                height={300}
                                fill="transparent"
                                onMouseUp={handleTempLineClick}
                                onMouseDown={handleTempLineClick}
                            />

                            <Line
                                type="monotone"
                                dataKey={dataKeyTemp}
                                stroke="#ff7300"
                                opacity={tempLineOpacity}
                                onClick={handleTempLineClick}
                                yAxisId="right"
                            />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke="#8884d8"
                                yAxisId="left"
                            />
                        </>
                    ) : (
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            yAxisId="left"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </>
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
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey={throttleKey}
                        stroke="green"
                        yAxisId="right"
                    />
                    <Line
                        type="monotone"
                        dataKey={brakeKey}
                        stroke="red"
                        yAxisId="left"
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
            <h4 style={{ padding: "1%", marginLeft: "4%" }}>{titleLabel}</h4>
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
