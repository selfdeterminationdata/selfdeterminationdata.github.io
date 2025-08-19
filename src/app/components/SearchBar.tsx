import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface CountryOption {
    label: string;
    key: string;
}

interface CountryOptionWithYears {
    label: string;
    key: string;
    startYear: number;
    endYear: number;
}

interface SearchBarProps {
    onSelect: (value: string) => void;
    onCountrySelect: (value: string) => void;
    setStartYear: (value: number) => void;
    setEndYear: (value: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSelect,
    onCountrySelect,
    setStartYear,
    setEndYear
}) => {
    const [countriesList, setCountriesList] = useState<CountryOption[]>([]);
    const [countriesListWithYears, setCountriesListWithYears] = useState<CountryOptionWithYears[]>(
        []
    );

    useEffect(() => {
        if (countriesList.length > 0) return; // ✅ skip if we already have data

        interface CountryApiResponse {
            ccode: string;
            countryname: string;
            startYear: number;
            endYear: number;
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

                const countryListWithYears: CountryOptionWithYears[] = data.map((c) => ({
                    key: c.ccode,
                    label: c.countryname,
                    startYear: c.startYear,
                    endYear: c.endYear
                }));

                setCountriesList(countryList);
                setCountriesListWithYears(countryListWithYears);
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
                onChange={(index, value) => {
                    const selectedCountry = countriesListWithYears.find(
                        (c) => c.key === value?.key
                    );
                    setStartYear(selectedCountry?.startYear);
                    setEndYear(selectedCountry?.endYear);
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
