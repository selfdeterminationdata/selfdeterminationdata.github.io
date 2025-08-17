import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface CountryOption {
    label: string;
    key: string;
}

interface SearchBarProps {
    onSelect: (value: string) => void;
    onCountrySelect: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({onSelect, onCountrySelect}) => {
    const [countriesList, setCountriesList] = useState<CountryOption[]>([]);

    useEffect(() => {
        if (countriesList.length > 0) return; // ✅ skip if we already have data

        interface CountryApiResponse {
            ccode: string;
            countryname: string;
        }

        const fetchCountries = async () => {
            try {
                const res = await fetch(
                    "https://selfdeterminationdata-codebackend-19450166485.europe-west1.run.app/countries"
                );
                if (!res.ok) {
                    throw new Error(`Failed to fetch countries: ${res.status}`);
                }
                const data: CountryApiResponse[] = await res.json();

                const countryList: CountryOption[] = data.map((c) => ({
                    key: c.ccode,
                    label: c.countryname
                }));

                setCountriesList(countryList);
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };

        fetchCountries();
    }, [countriesList]);

    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Autocomplete
                disablePortal
                options={countriesList}
                onChange={(_, value) => {
                    onSelect(value ? value.key : "");
                    onCountrySelect(value ? value.label : "");
                }}
                sx={{
                    position: "absolute",
                    zIndex: 1200,
                    width: "80vw",
                    height: "5vh",
                    paddingTop: "70px",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "25px",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.5)"
                    },
                    "& .MuiAutocomplete-inputRoot": {
                        paddingLeft: "20px",
                        paddingTop: "10px"
                    }
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
};

export default SearchBar;
