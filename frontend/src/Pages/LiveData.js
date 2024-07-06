import React, { useState, useEffect, useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { TotalTelemetryChart } from "../Components/ChartComponents";
import { TyreChart } from "../Components/TyreChart";
import { TyreChartAlternate } from "../Components/TyreChartAlternate";
import RecordingIcon from "../Components/RecordingIcon";
import {
	WeatherInfo,
	SteeringIndicator,
	NumberChart,
	PitChart,
	RPMIndicator,
	SpeedChart,
	FuelChart,
	LiveBestLapTimes,
	LapDetailsTracker,
	TyreInfo,
} from "../Components/LiveDataCharts";
import "bootstrap/dist/css/bootstrap.min.css";
import { dummyTelemetryData } from "../Data/telemetryData";
import { generateRandomTelemetryData } from "../Functions/telemetryUtils";
import {
	SubscribeToBackend,
	GetDataQueues
} from "../Functions/processLiveData";
import { PacketBackupCount } from "../common";

/**
 * @param {Queue} queue
 * @param {function} setFrameFunc
 */
function NewPacket(queue, setFrameFunc) {
	const frame = queue.dequeue();
	const packetName = queue.dataSource.packetName;

	function AddNewFrame(frameList, newFrame, packetName) {
		const newDataList = [
			...frameList,
			newFrame.Body[packetName][newFrame.Header.PlayerCarIndex],
		];
		if (newDataList.length > PacketBackupCount) {
			newDataList.splice(0, newDataList.length - PacketBackupCount); // keep only the last 80 elements
		}

		return newDataList;
	}

	if (frame != null) {
		setFrameFunc((prevList) => {
			return AddNewFrame(prevList, frame, packetName);
		});
	}
}

export const LiveData = () => {
	const [selectedSession, setSelectedSession] = useState("Race");
	const [selectedTrack, setSelectedTrack] = useState("Track 1");
	const [selectedLap, setSelectedLap] = useState(1);
	const [carTelemetryData, setCarTelemetryData] = useState([]);
	const [carStatusData, setCarStatusData] = useState([]);
	const [lapData, setLapData] = useState([]);
	const [cursorX, setCursorX] = useState(null);

	const handleCursorMove = (e) => {
		if (e && e.activePayload && e.activePayload[0]) {
			setCursorX(e.activePayload[0].payload.distance);
		}
	};

	useEffect(() => {

    const dataQueues = GetDataQueues();

		dataQueues.carTelemetryDataQueue.setNewDataCallback(() =>
			NewPacket(dataQueues.carTelemetryDataQueue, setCarTelemetryData),
		);
		dataQueues.carStatusDataQueue.setNewDataCallback(() =>
			NewPacket(dataQueues.carStatusDataQueue, setCarStatusData),
		);
		dataQueues.lapDataQueue.setNewDataCallback(() =>
			NewPacket(dataQueues.lapDataQueue, setLapData),
		);

		SubscribeToBackend(dataQueues);

		return () => {}; // Cleanup function
	}, []);

	return (
		<>
			{carTelemetryData.length >= 1 ? (
				<>
					<div
						style={{
							background: "#202020", //Gunmetal: 2C3539, 202020, 232c30, 262f33// DarkGrey: 1C1C1C
							fontFamily: "Futura",
							color: "white",
							position: "relative",
						}}
					>
						<Row>
							<Col xs={8}>
								<TotalTelemetryChart
									data={carTelemetryData}
									syncId="telemetryCharts"
									onMouseMove={handleCursorMove}
									throttleKey="Throttle"
									brakeKey="Brake"
									titleLabel="Throttle / Brake"
								/>
							</Col>
							<Col xs={4}>
								<TyreChartAlternate
									tireData={{
										telemetryData:
											carTelemetryData[carTelemetryData.length - 1],
										statusData:
											carStatusData.length > 0
												? carStatusData[carStatusData.length - 1]
												: 0,
									}}
								/>
							</Col>
						</Row>
						<Row>
							<Col xs={5}>
								<Row style={{ marginLeft: "3%" }}>
									<Col xs={6}>
										<div className="speed-live-data-container">
											<SpeedChart
												x={80}
												y={60}
												value={
													carTelemetryData[carTelemetryData.length - 1].Speed
												}
											/>
										</div>
										<div className="steering-live-data-container">
											<SteeringIndicator
												value={
													carTelemetryData[carTelemetryData.length - 1].Steer
												}
											/>{" "}
										</div>
									</Col>
									<Col xs={6} style={{}}>
										<RPMIndicator
											x={200}
											y={120}
											rpm={
												carTelemetryData[carTelemetryData.length - 1].EngineRPM
											}
											gear={carTelemetryData[carTelemetryData.length - 1].Gear}
										/>
									</Col>
								</Row>
							</Col>
							<Col xs={7}>
								<Row
									style={{
										// border: "1px solid red",
										marginRight: "3%",
										marginBottom: "3%",
									}}
								>
									<Col xs={4}>
										<div className="live-data-container">
											<PitChart pitRec1={9} pitRec2={12} currLap={7} />
										</div>
									</Col>
									<Col xs={4}>
										<div className="live-data-container">
											<FuelChart
												value={
													carStatusData.length > 0
														? carStatusData[carStatusData.length - 1]
																.FuelRemainingLaps
														: 0
												}
											/>
										</div>
									</Col>
									<Col xs={4}>
										<div className="live-data-container">
											<TyreInfo
												tyreData={{
													telemetryData:
														carTelemetryData[carTelemetryData.length - 1],
													statusData:
														carStatusData.length > 0
															? carStatusData[carStatusData.length - 1]
															: 0,
												}}
											/>
										</div>
									</Col>
								</Row>
								<Row
									style={{
										marginRight: "3%",
										marginBottom: "3%",
									}}
								>
									<Col xs={6}>
										<div className="lap-info-data-container">
											{/* {console.log(lapData)} */}
											{/* {lapData.length >= 1 && (
                                            <LapDetailsTracker
                                                incomingData={
                                                    lapData[lapData.length - 1]
                                                }
                                            />
                                        )} */}
											<LiveBestLapTimes
												lastLap={"1:09:83"}
												sessionBest={"1:10:23"}
												lapData={lapData[lapData.length - 1]}
											/>
										</div>
									</Col>
									<Col xs={6}>
										<div className="lap-info-data-container">
											<WeatherInfo
												weatherCondition={"rain"}
												value={"10 mins"}
											/>
										</div>
									</Col>
								</Row>
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
						<Row>
							<Col>
								<RecordingIcon />
							</Col>
							<Col></Col>
						</Row>
					</div>
				</>
			) : (
				<></>
			)}
		</>
	);
};
