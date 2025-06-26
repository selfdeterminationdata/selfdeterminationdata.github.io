import React, {useState, useEffect} from "react";
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
    const [countriesList, setCountriesList] = useState(countries);
    useEffect(() => {
        // GET request using fetch inside useEffect React hook
        fetch("http://localhost:3000/countries")
            .then((response) => response.json())
            .then((data) => {
                const countryList = data.map((country) => ({
                    label: country.countryName
                }));
                setCountriesList(countryList);
            })
            .catch((error) => {
                console.error("Error fetching countries:", error);
            });
    }, []);
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Autocomplete
                disablePortal
                options={countriesList}
                sx={{
                    position: "absolute",
                    zIndex: "tooltip",
                    width: "80vw",
                    height: "5vh",
                    paddingTop: "70px",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "25px",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.5)"
                    },
                    "& .MuiAutocomplete-inputRoot": {paddingLeft: "20px", paddingTop: "10px"}
                }}
                componentsProps={{
                    paper: {
                        sx: {
                            borderRadius: "25px",
                            backgroundColor: "rgba(255, 255, 255, 0.5)"
                        }
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Enter a country" />}
            />
        </div>
    );
}
