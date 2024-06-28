import { Row, Col, Dropdown } from "react-bootstrap"
import React, { useState } from "react"
// import  from "react"
import PropTypes from "prop-types"
import { Select as BaseSelect, selectClasses } from "@mui/base/Select"
import { Option as BaseOption, optionClasses } from "@mui/base/Option"
import { styled } from "@mui/system"
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded"

export function UnstyledSelectIntroduction({
    label,
    options,
    selected,
    onSelect,
}) {
    return (
        <Row style={{ alignItems: "center" }}>
            <Col>
                <label
                    style={{
                        marginBottom: 0,
                        fontWeight: "600",
                        letterSpacing: "2px",
                        fontSize: "12px",
                    }}
                >
                    {label}
                </label>
            </Col>
            <Col>
                <Select
                    defaultValue={options[0]}
                    // placeholder="Select"
                    style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "200px", // Set a fixed width as per your requirement
                    }}
                    // onChange={handleChange}
                >
                    {options.map((option, index) => (
                        <Option
                            key={index}
                            value={option}
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {option}
                        </Option>
                    ))}
                </Select>
            </Col>
        </Row>
    )
}

const Select = React.forwardRef(function CustomSelect(props, ref) {
    const slots = {
        root: Button,
        listbox: Listbox,
        popup: Popup,
        ...props.slots,
    }

    return <BaseSelect {...props} ref={ref} slots={slots} />
})

Select.propTypes = {
    /**
     * The components used for each slot inside the Select.
     * Either a string to use a HTML element or a component.
     * @default {}
     */
    slots: PropTypes.shape({
        listbox: PropTypes.elementType,
        popup: PropTypes.elementType,
        root: PropTypes.elementType,
    }),
}

export function MultiSelectDropdownComponent({
    label,
    options,
    selected,
    onSelect,
}) {
    // selectedOptions is here just to be used later
    const [selectedOptions, setSelectedOptions] = useState([String(options[0])])

    const handleChange = (e) => {
        const currSelection = e.target.innerText
        if (selectedOptions.includes(currSelection)) {
            const updatedOptions = selectedOptions.filter(
                (option) => option !== currSelection
            )
            setSelectedOptions(updatedOptions)
        } else {
            setSelectedOptions([...selectedOptions, currSelection])
        }
        console.log(selectedOptions)
    }
    return (
        <>
            <Row style={{ alignItems: "center" }}>
                <Col>
                    <label
                        style={{
                            marginBottom: 0,
                            fontWeight: "600",
                            letterSpacing: "2px",
                            fontSize: "12px",
                        }}
                    >
                        {label}
                    </label>
                </Col>
                <Col>
                    <MultiSelect
                        defaultValue={[options[0]]}
                        // placeholder="Select"
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "200px", // Set a fixed width as per your requirement
                        }}
                        onChange={handleChange}
                    >
                        {options.map((option, index) => (
                            <Option
                                key={index}
                                value={option}
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {option}
                            </Option>
                        ))}
                    </MultiSelect>
                </Col>
            </Row>
        </>
    )
}

const MultiSelect = React.forwardRef(function CustomMultiSelect(props, ref) {
    const slots = {
        root: Button,
        listbox: Listbox,
        popup: Popup,
        ...props.slots,
    }

    return <BaseSelect {...props} multiple ref={ref} slots={slots} />
})

MultiSelect.propTypes = {
    /**
     * The components used for each slot inside the Select.
     * Either a string to use a HTML element or a component.
     * @default {}
     */
    slots: PropTypes.shape({
        listbox: PropTypes.elementType,
        popup: PropTypes.elementType,
        root: PropTypes.elementType,
    }),
}

const blue = {
    100: "#DAECFF",
    200: "#99CCF3",
    400: "#3399FF",
    500: "#007FFF",
    600: "#0072E5",
    900: "#003A75",
}

const grey = {
    50: "#F3F6F9",
    100: "#E5EAF2",
    200: "#DAE2ED",
    300: "#C7D0DD",
    400: "#B0B8C4",
    500: "#9DA8B7",
    600: "#6B7A90",
    700: "#434D5B",
    800: "#303740",
    900: "#1C2025",
}
const teal = {
    50: "#e1f4f2",
    100: "#c3e9e5",
    200: "#a5ded7",
    300: "#87d3ca",
    400: "#69c8bc",
    500: "#4bbdac", // lighter than base
    600: "#2db29e", // lighter than base
    700: "#1a5d57", // base color
    800: "#174f4b", // darker than base
    900: "#133f3d", // darker than base
}

const Button = React.forwardRef(function Button(props, ref) {
    const { ownerState, ...other } = props
    return (
        <StyledButton type="button" {...other} ref={ref}>
            {other.children}
            <UnfoldMoreRoundedIcon />
        </StyledButton>
    )
})

Button.propTypes = {
    children: PropTypes.node,
    ownerState: PropTypes.object.isRequired,
}

const StyledButton = styled("button", { shouldForwardProp: () => true })(
    ({ theme }) => `
  font-size: 0.875rem;
  box-sizing: border-box;
  min-width: 170px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  line-height: 1.5;
  background: ${theme.palette.mode === "dark" ? grey[900] : teal[700]};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : teal[700]};
  color: ${theme.palette.mode === "dark" ? grey[300] : "#fff"};
  position: relative;
  
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === "dark" ? grey[800] : teal[900]};
    border-color: ${theme.palette.mode === "dark" ? grey[600] : teal[900]};
  }

  &.${selectClasses.focusVisible} {
    outline: 0;
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
        theme.palette.mode === "dark" ? blue[600] : blue[200]
    };
  }

  & > svg {
    font-size: 1rem;
    position: absolute;
    height: 100%;
    top: 0;
    right: 10px;
  }
  `
)

const Listbox = styled("ul")(
    ({ theme }) => `
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 170px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  box-shadow: 0px 2px 6px ${
      theme.palette.mode === "dark" ? "rgba(0,0,0, 0.50)" : "rgba(0,0,0, 0.05)"
  };
  `
)

const Option = styled(BaseOption)(
    ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  transition: border-radius 300ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:last-of-type {
    border-bottom: none;
  }

  &.${optionClasses.selected} {
    background-color: ${theme.palette.mode === "dark" ? blue[900] : blue[100]};
    color: ${theme.palette.mode === "dark" ? blue[100] : blue[900]};
  }

  &.${optionClasses.highlighted} {
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }

  @supports selector(:has(*)) {
    &.${optionClasses.selected} {
      & + .${optionClasses.selected} {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      &:has(+ .${optionClasses.selected}) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }

  &.${optionClasses.highlighted}.${optionClasses.selected} {
    background-color: ${theme.palette.mode === "dark" ? blue[900] : blue[100]};
    color: ${theme.palette.mode === "dark" ? blue[100] : blue[900]};
  }

  &:focus-visible {
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[600] : blue[200]};
  }

  &.${optionClasses.disabled} {
    color: ${theme.palette.mode === "dark" ? grey[700] : grey[400]};
  }

  &:hover:not(.${optionClasses.disabled}) {
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }
  `
)

const Popup = styled("div")`
    z-index: 1;
`
