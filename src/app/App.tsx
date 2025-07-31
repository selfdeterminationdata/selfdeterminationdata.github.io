import React, {useState} from "react";
import Button from "@mui/material/Button";
import MapDisplay from "components/Map";
import SearchBar from "components/SearchBar";
import GroupGrid from "components/GroupGrid";
import Legend from "components/Legend";
import MapIcon from "@mui/icons-material/Map";
import FileDownloadIcon from "components/DownloadIcon";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import InfoIcon from "@mui/icons-material/Info"; // 👈 Optional icon for "About"
import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-fix.css";

const App: React.FC = () => {
    const [searchSelection, setSearchSelection] = useState<string | null>(null);
    const [groups, setGroupOfSelection] = useState<string[] | null>(null);
    const [yearSelected, setYearSelected] = useState<number>(2020);
    const [showOverlay, setShowOverlay] = useState(true);
    const [overlayMode, setOverlayMode] = useState<"intro" | "about">("intro"); // 👈 New state

    const handleMapClick = () => {
        setShowOverlay(false);
    };

    const handleDownloadClick = () => {
        alert("Download button clicked");
    };

    const handleAboutClick = () => {
        setOverlayMode("about");
        setShowOverlay(true);
    };

    return (
        <div
            style={{
                position: "relative",
                backgroundColor: "#f5f5f5",
                maxHeight: "100vh",
                maxWidth: "100vw"
            }}
        >
            {/* Overlay */}
            {showOverlay && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        zIndex: 1500,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center"
                    }}
                >
                    <h1 style={{marginBottom: "1rem"}}>
                        {overlayMode === "intro" ? "Lorem Ipsum" : "About This App"}
                    </h1>
                    <p style={{maxWidth: "600px", marginBottom: "2rem"}}>
                        {overlayMode === "intro"
                            ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                            : "This application helps you visualize data using an interactive map, search by location, and explore grouped information across years."}
                    </p>
                    <div style={{display: "flex", gap: "1rem"}}>
                        <Button onClick={handleMapClick} startIcon={<MapIcon />} variant="outlined">
                            Map
                        </Button>
                        <Button
                            onClick={handleDownloadClick}
                            startIcon={<CloudDownloadIcon />}
                            variant="contained"
                        >
                            Download
                        </Button>
                        <Button
                            onClick={handleAboutClick}
                            startIcon={<InfoIcon />}
                            variant="outlined"
                        >
                            About
                        </Button>{" "}
                        {/* 👈 New About Button */}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                style={{
                    height: "65vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <SearchBar onSelect={setSearchSelection} />
                <MapDisplay
                    selection={searchSelection}
                    setGroupOfSelection={setGroupOfSelection}
                    yearSelected={yearSelected}
                />
            </div>

            {searchSelection && (
                <div
                    style={{
                        height: "50px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Legend />
                    <FileDownloadIcon />
                </div>
            )}
            <div style={{height: "30vh"}}>
                {searchSelection && (
                    <GroupGrid groupsOfSelected={groups} setYearSelected={setYearSelected} />
                )}
            </div>
        </div>
    );
};

export default App;
