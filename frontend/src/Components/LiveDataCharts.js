import React, { useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import {
    ResponsiveContainer,
    ComposedChart,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Legend,
    Bar,
} from "recharts"

export const SteeringIndicator = ({ value }) => {
    const fillPercentage = Math.min(Math.abs(value) / 100, 1)
    const isPositive = value >= 0
    const fillWidth = `${fillPercentage * 50}%`
    const fillX = isPositive ? "50%" : `${50 - fillPercentage * 50}%` // Flipped direction

    return (
        <div
        // style={{ border: "1px solid black" }}
        >
            {/* <span style={{ marginRight: "5%" }}>Steering</span> */}
            <svg width="200" height="60">
                <rect
                    x="0"
                    y="20"
                    width="200"
                    height="20"
                    fill="#333"
                    rx="5"
                    ry="5"
                />

                <rect
                    x={fillX}
                    y="20"
                    width={fillWidth}
                    height="20"
                    fill="#F6C324"
                    rx="5"
                    ry="5"
                />

                <line
                    x1="100"
                    y1="10"
                    x2="100"
                    y2="40"
                    stroke="white"
                    strokeWidth="1" // 1
                    opacity={0.3}
                />

                <text
                    x="100"
                    y="60"
                    textAnchor="middle"
                    fill="white"
                    fontSize="15"
                    fontWeight={400}
                >
                    {value ? Math.abs(value.toFixed()) : ""}
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

export const PitChart = ({ pitRec1, pitRec2, currLap }) => {
    let boxClass
    if (currLap < pitRec1) {
        boxClass = "background-neutral"
    } else if (currLap >= pitRec1 && currLap <= pitRec2) {
        boxClass = "background-green"
    } else {
        boxClass = "background-red"
    }

    return (
        <div className="element-info-container">
            <div className="element-info">Pit Info</div>
            <span className="pit-text">{currLap}</span>
            <div className={`pit-info ${boxClass}`}>
                <span className="text">
                    {pitRec1} - {pitRec2}
                </span>
            </div>
        </div>
    )
}
export const FuelChart = ({ value }) => {
    let backgroundClass
    if (value > 0) {
        backgroundClass = "background-positive"
    } else if (value < 0) {
        backgroundClass = "background-negative"
    } else {
        backgroundClass = "background-zero"
    }

    return (
        <div className="element-info-container">
            <div className="element-info">Fuel Info</div>
            <div className={`background ${backgroundClass}`}>
                <span className="text">
                    {value > 0 ? (
                        <span>&#9650; {value.toFixed(2)} Laps</span>
                    ) : value < 0 ? (
                        <span>&#9660; {value.toFixed(2)} Laps</span>
                    ) : (
                        <span>&#8211; {value.toFixed(2)} Laps</span>
                    )}
                </span>
            </div>
        </div>
    )
}

export const WeatherInfo = ({ value }) => {
    return (
        <div className="element-info-container">
            <div className="element-info">Weather Info</div>
            <div className={`background`}>
                <span className="pit-text">{value}</span>
            </div>
        </div>
    )
}

export const LiveBestLapTimes = ({ lastLap, sessionBest }) => {
    function parseTimeString(timeString) {
        const [minutes, seconds, milliseconds] = timeString
            .split(":")
            .map(Number)
        return minutes * 60 * 1000 + seconds * 1000 + milliseconds
    }

    function formatMilliseconds(milliseconds) {
        const minutes = Math.floor(milliseconds / (60 * 1000))
        milliseconds %= 60 * 1000
        const seconds = Math.floor(milliseconds / 1000)
        milliseconds %= 1000
        return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds
            .toString()
            .padStart(3, "0")}`
    }

    function calculateDifferenceClass(sessionBest, lastLap) {
        const sessionBestMs = parseTimeString(sessionBest)
        const lastLapMs = parseTimeString(lastLap)
        const differenceMs = sessionBestMs - lastLapMs

        const differenceFormatted = formatMilliseconds(Math.abs(differenceMs))
        if (differenceMs > 0) {
            return {
                class: "background-negative",
                difference: `- ${differenceFormatted}`,
            }
        } else if (differenceMs < 0) {
            return {
                class: "background-positive",
                difference: `+ ${differenceFormatted}`,
            }
        } else {
            return {
                class: "background-neutral",
                difference: `± ${differenceFormatted}`,
            }
        }
    }
    const { class: differenceClass, difference } = calculateDifferenceClass(
        sessionBest,
        lastLap
    )

    return (
        <div className="element-info-container">
            <div className="element-info">Lap Info</div>
            {/* <div className="live-data-container-subtitle">
                Last Lap against Session Best{" "}
            </div> */}
            <span className="lap-text">{lastLap}</span>
            &nbsp;&nbsp;&nbsp;
            <div className={`pit-info ${differenceClass}`}>
                <span className="text">{difference}</span>
            </div>
        </div>
    )
}

export const TyreInfo = ({ tyreData }) => {
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
        actualTyreCompoundsMapping[tyreData.statusData.ActualTyreCompound]
    const currentVisualCompound =
        visualTyreCompoundsMapping[tyreData.statusData.VisualTyreCompound]
    const tyreAge = tyreData.statusData.TyresAgeLaps

    let boxClass
    if (currentVisualCompound === "soft") {
        boxClass = "tyre-soft"
    } else if (currentVisualCompound === "medium") {
        boxClass = "tyre-medium"
    } else if (currentVisualCompound === "hard") {
        boxClass = "tyre-hard"
    } else if (currentVisualCompound === "inter") {
        boxClass = "tyre-inter"
    } else {
        boxClass = "tyre-wet"
    }

    return (
        <div className="element-info-container">
            <div className="element-info">Tyre Info</div>
            <div className={`tyre-compound-container ${boxClass}`}>
                <span className="tyre-compound-text">
                    {currentActualCompound}
                </span>
            </div>
            &nbsp;&nbsp;&nbsp;
            <span className="tyre-info-text">{tyreAge} Laps</span>
        </div>
    )
}

export const SpeedChart = ({ x, y, value }) => {
    return (
        <div className="element-info-container">
            <div className={`element-info`}>{value} kmph</div>
        </div>
    )
}

export const RPMIndicator = ({ x, y, rpm, gear }) => {
    const data = [
        { name: "RPM", value: rpm },
        { name: "RPMS", value: 15000 - rpm },
    ]
    const COLORS = ["#F6C324", "#2C3539"]
    //Gunmetal: 2C3539, 202020, 232c30, 262f33// DarkGrey: 1C1C1C
    // Vibrant Blue: 0088FE

    return (
        <PieChart width={400} height={200} style={{ width: "100%" }}>
            <Pie
                data={data}
                cx={x}
                cy={y}
                startAngle={180}
                endAngle={0}
                cornerRadius={5}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={0}
                strokeWidth={0.5}
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={
                            index === 0 || index === data.length - 1
                                ? COLORS[index % COLORS.length]
                                : "transparent"
                        }
                    />
                ))}
            </Pie>
            <svg>
                <g>
                    <text
                        x={x + 5}
                        y={y - 10}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="#F6C324"
                        fontSize="30"
                    >
                        {gear < 0 ? "R" : gear}
                    </text>
                </g>
            </svg>
        </PieChart>
    )
}

export const LapDetailsTracker = ({ incomingData }) => {
    const [data, setData] = useState([])
    // Testing Data
    // useEffect(() => {
    //     // Fetch data or set data here
    //     setData([
    //         {
    //             lapNum: 1,
    //             sector1Time: 43250,
    //             sector2Time: 41780,
    //             sector3Time: 42890,
    //             lapTime: 127920,
    //         },
    //         {
    //             lapNum: 2,
    //             sector1Time: 44010,
    //             sector2Time: 42500,
    //             sector3Time: 42250,
    //             lapTime: 128760,
    //         },
    //         {
    //             lapNum: 3,
    //             sector1Time: 43890,
    //             sector2Time: 42870,
    //             sector3Time: 43500,
    //             lapTime: 130260,
    //         },
    //         {
    //             lapNum: 4,
    //             sector1Time: 44500,
    //             sector2Time: 43120,
    //             sector3Time: 43380,
    //             lapTime: 131000,
    //         },
    //     ])
    // }, [])

    useEffect(() => {
        // if (incomingData && incomingData.Sector) {
        const store = [...data]
        console.log(store)
        console.log(incomingData)
        let currentLapData
        if (store.length === 0) {
            // no data yet
            console.log("store length 0 && store populated once")
            if (incomingData.Sector === 2 && incomingData.Sector1TimeInMS > 0) {
                // sector 3 begins
                currentLapData = {
                    lapNum: incomingData.CurrentLapNum,
                    sector1Time: incomingData.Sector1TimeInMS,
                    sector2Time: incomingData.Sector2TimeInMS,
                    // LastLapTime: incomingData.LastLapTimeInMS,
                    flag: false,
                }
                store.push(currentLapData)
            }
        } else if (
            // if data exists: check if last lap info is complete (flag True)
            //  if previous flag is true, then create a new entry with S1 and S2 info
            incomingData.Sector === 2 &&
            store[store.length - 1].flag === true
        ) {
            currentLapData = {
                lapNum: incomingData.CurrentLapNum,
                sector1Time: incomingData.Sector1TimeInMS,
                sector2Time: incomingData.Sector2TimeInMS,
                // LastLapTime: incomingData.LastLapTimeInMS,
                flag: false,
            }
            store.push(currentLapData)
        }
        // console.log(store)
        if (store.length > 0) {
            // if data exists
            const latestLapDetails = store[store.length - 1]
            if (
                // if flag is false, so sector3 is not yet populated
                // if currLap is a new lap
                incomingData.Sector === 0 &&
                latestLapDetails.lapNum === incomingData.CurrentLapNum - 1 &&
                latestLapDetails.flag === false &&
                latestLapDetails.sector1Time > 0
            ) {
                // add sector 3 info for last lap and change flag to true
                latestLapDetails.sector3Time =
                    incomingData.LastLapTimeInMS -
                    latestLapDetails.sector1Time -
                    latestLapDetails.sector2Time
                latestLapDetails.flag = true
                latestLapDetails.lapTime = incomingData.LastLapTimeInMS
            }
        }
        setData(store)
        // }
    }, [
        // incomingData && incomingData.Sector
        incomingData.Sector,
    ])

    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <XAxis dataKey="lapNum" />
                <YAxis
                    yAxisId="left"
                    tickFormatter={formatMilliseconds}
                    width={90}
                />
                {/* <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatMilliseconds}
                    opacity={0}
                /> */}
                <Tooltip content={<LapDetailsTooltip />} />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="lapTime"
                    stroke="rgb(246, 195, 36)" // Changed line color to purple
                    yAxisId="left"
                    dot={true} // Added dots to the line chart
                    strokeWidth={2}
                />
                <Bar
                    dataKey="sector1Time"
                    stackId="stack"
                    fill="#8884d8"
                    yAxisId="left"
                    shape={<LapDetailsStackedBar />} // Customizing shape of the bars
                />
                <Bar
                    dataKey="sector2Time"
                    stackId="stack"
                    fill="#82ca9d"
                    yAxisId="left"
                    shape={<LapDetailsStackedBar />} // Customizing shape of the bars
                />
                <Bar
                    dataKey="sector3Time"
                    stackId="stack"
                    fill="#ffc658"
                    yAxisId="left"
                    shape={<LapDetailsStackedBar />} // Customizing shape of the bars
                />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

const LapDetailsStackedBar = (props) => {
    const { fill, x, y, width, height } = props
    return (
        <rect
            x={x + 45} // Adjusted x position to center the bar
            y={y}
            width={10} // Changed bar width to 10px
            height={height}
            fill={fill}
            fillOpacity={0.3} // Set opacity to 0.1
        />
    )
}

const LapDetailsTooltip = ({ active, payload, label }) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Lap ${label}`}</p>
                {payload.map((item, index) => (
                    <p key={index} className="desc">
                        {`${item.name}: ${formatMilliseconds(item.value)}`}{" "}
                        {/* Format milliseconds */}
                    </p>
                ))}
            </div>
        )
    }

    return null
}

// Function to format milliseconds to minutes:seconds:milliseconds
const formatMilliseconds = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    const remainingMilliseconds = milliseconds % 1000

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}:${
        remainingMilliseconds < 10
            ? "00"
            : remainingMilliseconds < 100
            ? "0"
            : ""
    }${remainingMilliseconds}`
}
