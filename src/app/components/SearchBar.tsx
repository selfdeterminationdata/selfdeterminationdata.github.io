import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const countries = [
    {label: "Afghanistan", year: 1994},
    {label: "Albania", year: 1972},
    {label: "Algeria", year: 1974},
    {label: "Andorra", year: 2008},
    {label: "Angola", year: 1957},
    {label: "Antigua and Barbuda", year: 1993},
    {label: "Argentina", year: 1994}
];

export default function SearchBar() {
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Autocomplete
                disablePortal
                options={countries}
                sx={{
                    position: "absolute",
                    zIndex: "tooltip",
                    width: "80vw",
                    height: "5vh",
                    paddingTop: "70px",
                    "& .MuiOutlinedInput-root": {borderRadius: "25px", alignItems: "center"},
                    "& .MuiAutocomplete-inputRoot": {paddingLeft: "20px", paddingTop: "10px"}
                }}
                componentsProps={{
                    paper: {
                        sx: {
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            "& .MuiOutlinedInput-root": {borderRadius: "25px"}
                        }
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Enter a country" />}
            />
        </div>
    );
}
