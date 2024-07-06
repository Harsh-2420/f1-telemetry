import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Telemetry } from "./Pages/Telemetry"

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<Telemetry />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
