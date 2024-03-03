import React from "react"
import { Row, Col, Dropdown } from "react-bootstrap"

export const DropdownComponent = ({ label, options, selected, onSelect }) => {
    return (
        <div
            style={{
                padding: "15px",
            }}
        >
            <Row className="align-items-center">
                <Col xs="auto">
                    <label style={{ marginRight: "10px", marginBottom: 0 }}>
                        {label}
                    </label>
                </Col>
                <Col xs="auto">
                    <Dropdown>
                        <Dropdown.Toggle
                            id="dropdown-basic"
                            style={{
                                backgroundColor: "#1a5d57",
                                color: "white",
                                borderColor: "#1a5d57",
                            }}
                        >
                            {selected}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {options.map((option, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={() => onSelect(option)}
                                >
                                    {option}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
        </div>
    )
}
