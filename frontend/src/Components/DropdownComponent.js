import React, { useState, useEffect } from "react"
import { Row, Col, Dropdown } from "react-bootstrap"
// import { useTheme } from "@mui/material/styles"
// import Box from "@mui/material/Box"
// import OutlinedInput from "@mui/material/OutlinedInput"
// import InputLabel from "@mui/material/InputLabel"
// import MenuItem from "@mui/material/MenuItem"
// import FormControl from "@mui/material/FormControl"
// import Select from "@mui/material/Select"
// import Chip from "@mui/material/Chip"

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

// const ITEM_HEIGHT = 48
// const ITEM_PADDING_TOP = 8
// const MenuProps = {
//     PaperProps: {
//         style: {
//             maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//             width: 200, // Make the component smaller
//             backgroundColor: "white", // Set dropdown background color to white
//             color: "black", // Set dropdown text color to black
//         },
//     },
// }

// const names = [
//     "Oliver Hansen",
//     "Van Henry",
//     "April Tucker",
//     "Ralph Hubbard",
//     "Omar Alexander",
//     "Carlos Abbott",
//     "Miriam Wagner",
//     "Bradley Wilkerson",
//     "Virginia Andrews",
//     "Kelly Snyder",
// ]
// function getStyles(name, personName, theme) {
//     return {
//         fontWeight:
//             personName.indexOf(name) === -1
//                 ? theme.typography.fontWeightRegular
//                 : theme.typography.fontWeightMedium,
//     }
// }

// export default function MultipleSelectChip() {
//     const theme = useTheme()
//     const [personName, setPersonName] = React.useState([])

//     const handleChange = (event) => {
//         const {
//             target: { value },
//         } = event
//         setPersonName(
//             // On autofill we get a stringified value.
//             typeof value === "string" ? value.split(",") : value
//         )
//     }

//     return (
//         <div>
//             <FormControl sx={{ m: 1, width: 200, borderRadius: 8 }}>
//                 {" "}
//                 {/* Add border rounding and make the component smaller */}
//                 <InputLabel
//                     id="demo-multiple-chip-label"
//                     sx={{ color: "white" }}
//                 >
//                     {/* Chip */}
//                 </InputLabel>
//                 <Select
//                     labelId="demo-multiple-chip-label"
//                     id="demo-multiple-chip"
//                     multiple
//                     value={personName}
//                     onChange={handleChange}
//                     input={
//                         <OutlinedInput
//                             id="select-multiple-chip"
//                             label="Chip"
//                             sx={{ color: "white" }}
//                         />
//                     }
//                     renderValue={(selected) => (
//                         <Box
//                             sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
//                         >
//                             {selected.map((value) => (
//                                 <Chip
//                                     key={value}
//                                     label={value}
//                                     sx={{
//                                         color: "white",
//                                         border: "1px solid white",
//                                         bgcolor: "#1a5d57",
//                                     }}
//                                 />
//                             ))}
//                         </Box>
//                     )}
//                     MenuProps={MenuProps}
//                     sx={{
//                         border: "1px solid white",
//                         backgroundColor: "transparent", // Set dropdown background color to teal
//                         color: "white", // Set dropdown text color to white
//                         "&:focus": {
//                             backgroundColor: "teal", // Set background color on focus to teal
//                         },
//                     }}
//                 >
//                     {names.map((name) => (
//                         <MenuItem
//                             key={name}
//                             value={name}
//                             style={getStyles(name, personName, theme)}
//                         >
//                             {name}
//                         </MenuItem>
//                     ))}
//                 </Select>
//             </FormControl>
//         </div>
//     )
// }
