import React, { useState, useEffect, useContext } from "react"
import { Row, Col } from "react-bootstrap"
import { TotalTelemetryChart } from "../Components/ChartComponents"
import { TyreChart } from "../Components/TyreChart"
import { TyreChartAlternate } from "../Components/TyreChartAlternate"
import RecordingIcon from "../Components/RecordingIcon"
import {
    SteeringIndicator,
    NumberChart,
    PitChart,
    RPMIndicator,
    SpeedChart,
    FuelChart,
    LiveBestLapTimes,
    LapDetailsTracker,
} from "../Components/LiveDataCharts"
import "bootstrap/dist/css/bootstrap.min.css"
import { dummyTelemetryData } from "../Data/telemetryData"
import { generateRandomTelemetryData } from "../Functions/telemetryUtils"
import {
    fetchTelemetryData,
    Queue,
    SubscribeToBackend,
} from "../Functions/processLiveData"

const PacketBackupCount = 500

const F1PacketID = {
    Motion: 0,
    Session: 1,
    LapData: 2,
    Event: 3,
    Participants: 4,
    CarSetups: 5,
    CarTelemetry: 6,
    CarStatus: 7,
    FinalClassification: 8,
    LobbyInfo: 9,
    CarDamage: 10,
    SessionHistory: 11,
    TyreSets: 12,
    MotionEx: 13,
}

const dataQueues = {
    carTelemetryDataQueue: new Queue({
        packetID: F1PacketID.CarTelemetry,
        packetName: "CarTelemetryData",
    }),
    carStatusDataQueue: new Queue({
        packetID: F1PacketID.CarStatus,
        packetName: "CarStatusData",
    }),
    lapDataQueue: new Queue({
        packetID: F1PacketID.LapData,
        packetName: "LapData",
    }),
}

/**
 * @param {Queue} queue
 * @param {function} setFrameFunc
 */
function NewPacket(queue, setFrameFunc) {
    const frame = queue.dequeue()
    const packetName = queue.dataSource.packetName

    function AddNewFrame(frameList, newFrame, packetName) {
        const newDataList = [
            ...frameList,
            newFrame.Body[packetName][newFrame.Header.PlayerCarIndex],
        ]
        if (newDataList.length > PacketBackupCount) {
            newDataList.splice(0, newDataList.length - PacketBackupCount) // keep only the last 80 elements
        }

        return newDataList
    }

    if (frame != null) {
        setFrameFunc((prevList) => {
            return AddNewFrame(prevList, frame, packetName)
        })
    }
}

export const LiveData = () => {
    const [selectedSession, setSelectedSession] = useState("Race")
    const [selectedTrack, setSelectedTrack] = useState("Track 1")
    const [selectedLap, setSelectedLap] = useState(1)
    const [carTelemetryData, setCarTelemetryData] = useState([])
    const [carStatusData, setCarStatusData] = useState([])
    const [lapData, setLapData] = useState([])
    const [cursorX, setCursorX] = useState(null)

    const handleCursorMove = (e) => {
        if (e && e.activePayload && e.activePayload[0]) {
            setCursorX(e.activePayload[0].payload.distance)
        }
    }

    useEffect(() => {
        dataQueues.carTelemetryDataQueue.setNewDataCallback(() =>
            NewPacket(dataQueues.carTelemetryDataQueue, setCarTelemetryData)
        )
        dataQueues.carStatusDataQueue.setNewDataCallback(() =>
            NewPacket(dataQueues.carStatusDataQueue, setCarStatusData)
        )
        dataQueues.lapDataQueue.setNewDataCallback(() =>
            NewPacket(dataQueues.lapDataQueue, setLapData)
        )

        SubscribeToBackend(dataQueues)

        return () => {} // Cleanup function
    }, [])

    return (
        <>
            <RecordingIcon />
            <div
                style={{
                    background: "#202020", //Gunmetal: 2C3539, 202020, 232c30, 262f33// DarkGrey: 1C1C1C
                    fontFamily: "Futura",
                    color: "white",
                    position: "relative",
                }}
            >
                <Row>
                    <Col>
                        <div>
                            {carTelemetryData.length >= 1 ? (
                                <>
                                    <TotalTelemetryChart
                                        data={carTelemetryData}
                                        syncId="telemetryCharts"
                                        onMouseMove={handleCursorMove}
                                        throttleKey="Throttle"
                                        brakeKey="Brake"
                                        titleLabel="Telemetry v Distance"
                                    />

                                    <Row
                                    //  style={{ border: "1px solid magenta" }}
                                    >
                                        <Col xs={6} style={{}}>
                                            <RPMIndicator
                                                x={200}
                                                y={120}
                                                rpm={
                                                    carTelemetryData[
                                                        carTelemetryData.length -
                                                            1
                                                    ].EngineRPM
                                                }
                                                gear={
                                                    carTelemetryData[
                                                        carTelemetryData.length -
                                                            1
                                                    ].Gear
                                                }
                                            />
                                        </Col>
                                        <Col
                                            xs={6}
                                            // style={{ border: "1px solid blue" }}
                                        >
                                            <SpeedChart
                                                x={80}
                                                y={60}
                                                value={
                                                    carTelemetryData[
                                                        carTelemetryData.length -
                                                            1
                                                    ].Speed
                                                }
                                            />
                                            <SteeringIndicator
                                                value={
                                                    carTelemetryData[
                                                        carTelemetryData.length -
                                                            1
                                                    ].Steer
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    {/* <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .speed
                                    }
                                    label="Speed"
                                />

                                <NumberChart
                                    value={
                                        telemetryData[telemetryData.length - 1]
                                            .drs
                                    }
                                    label="DRS"
                                /> */}
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </Col>
                    <Col>
                        {carTelemetryData.length >= 1 ? (
                            <>
                                {/* {typeof telemetryData[telemetryData.length - 1]
                                .TyresSurfaceTemperature !== "undefined"
                                ? console.log(
                                      telemetryData[telemetryData.length - 1]
                                          .TyresSurfaceTemperature
                                  )
                                : console.log("Not Init")} */}
                                <TyreChartAlternate
                                    tireData={{
                                        telemetryData:
                                            carTelemetryData[
                                                carTelemetryData.length - 1
                                            ],
                                        statusData:
                                            carStatusData.length > 0
                                                ? carStatusData[
                                                      carStatusData.length - 1
                                                  ]
                                                : 0,
                                    }}
                                />
                                <Row>
                                    <Col xs={4}>
                                        <PitChart
                                            x={100}
                                            y={10}
                                            pitRec1={9}
                                            pitRec2={12}
                                        />
                                    </Col>
                                    <Col xs={4}>
                                        <FuelChart
                                            x={100}
                                            y={10}
                                            value={
                                                carStatusData.length > 0
                                                    ? carStatusData[
                                                          carStatusData.length -
                                                              1
                                                      ].FuelRemainingLaps
                                                    : 0
                                            }
                                        />
                                    </Col>
                                    <Col xs={4}>
                                        <LiveBestLapTimes
                                            x={100}
                                            y={10}
                                            personalBest={"1:09:23"}
                                            sessionBest={"1:09:23"}
                                        />
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            <></>
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col style={{ marginLeft: "20px" }}>
                        {lapData.length >= 1 && (
                            <LapDetailsTracker
                                incomingData={lapData[lapData.length - 1]}
                            />
                        )}
                    </Col>
                    <Col></Col>
                </Row>
            </div>
        </>
    )
}
