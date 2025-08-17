import React, {useState, useEffect} from "react";
import Button from "@mui/material/Button";
import MapDisplay from "components/Map";
import SearchBar from "components/SearchBar";
import GroupGrid from "components/GroupGrid";
import Legend from "components/Legend";
import MapIcon from "@mui/icons-material/Map";
import FileDownloadIcon from "components/DownloadIcon";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import InfoIcon from "@mui/icons-material/Info";
import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-fix.css";

const loadTextFile = (filePath: string): Promise<string | undefined> => {
    return fetch(filePath)
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP errors! status: ${response.status}`);
            return response.text();
        })
        .then((data) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            const htmlContent = doc.body.innerHTML;
            return htmlContent;
        })
        .catch((error) => {
            console.error("Error loading text file:", error);
            return undefined;
        });
};

const App: React.FC = () => {
    const [searchSelection, setSearchSelection] = useState<string | null>(null);
    const [searchCountrySelection, setSearchCountrySelection] = useState<string | null>(null);
    const [groups, setGroupOfSelection] = useState<string[] | null>(null);
    const [yearSelected, setYearSelected] = useState<number>(2020);
    const [showOverlay, setShowOverlay] = useState(true);
    const [overlayMode, setOverlayMode] = useState<"intro" | "about">("intro");
    const [specificRowSelection, setSpecificRow] = useState("");
    const [overlayText, setOverlayText] = useState<string>("");
    const dataVerseLink = "https://doi.org/10.7910/DVN/VDSIH9";

    const handleMapClick = () => {
        setShowOverlay(false);
    };

    const handleDownloadClick = () => {
        window.open(dataVerseLink, "_blank", "noopener,noreferrer");
    };

    const handleAboutClick = () => {
        setOverlayMode("about");
        setShowOverlay(true);
    };

    useEffect(() => {
        setYearSelected(2020);
    }, [searchSelection]);

    useEffect(() => {
        if (overlayMode === "intro") {
            loadTextFile("/LandingPage.html").then((data) => {
                setOverlayText(data ?? "");
            });
        } else {
            loadTextFile("/About.html").then((data) => {
                setOverlayText(data ?? "");
            });
        }
    }, [overlayMode]);

    useEffect(() => {
        if (overlayMode !== "intro") return; // ✅ only active in intro mode

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "STRONG") {
                const text = target.textContent?.toLowerCase();
                if (text === "map") handleMapClick();
                if (text === "about") handleAboutClick();
                if (text === "download") handleDownloadClick();
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [overlayMode]);

    return (
        <div
            style={{
                position: "relative",
                backgroundColor: "#f5f5f5",
                maxHeight: "100vh",
                maxWidth: "100vw",
                fontFamily: "Helvetica, Arial"
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
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            padding: "10px 20px",
                            zIndex: 1000
                        }}
                    >
                        <img
                            src={"/uniofbath.png"}
                            alt="University of Bath"
                            style={{
                                backgroundColor: "#fff",
                                padding: "8px",
                                borderRadius: "4px",
                                width: "200px"
                            }}
                        />
                        <img
                            src={"/councillogo.png"}
                            alt="University of Bath"
                            style={{
                                backgroundColor: "#fff",
                                padding: "8px",
                                width: "200px"
                            }}
                        />
                    </div>
                    <h1 style={{marginBottom: "1rem", textAlign: "center"}}>
                        {overlayMode === "intro" ? "SDM 2.0" : "About"}
                    </h1>
                    <div
                        style={{
                            maxWidth: "80vw",
                            maxHeight: "65vh",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            marginBottom: "2rem",
                            padding: "1rem",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "4px",
                            textAlign: overlayMode === "intro" ? "center" : "left"
                        }}
                        dangerouslySetInnerHTML={{__html: overlayText}}
                    ></div>
                    <div style={{display: "flex", gap: "1rem"}}>
                        <Button
                            onClick={handleMapClick}
                            startIcon={<MapIcon />}
                            variant="contained"
                        >
                            Map
                        </Button>
                        <Button
                            onClick={handleAboutClick}
                            startIcon={<InfoIcon />}
                            variant="outlined"
                        >
                            About
                        </Button>
                        <Button
                            onClick={handleDownloadClick}
                            startIcon={<CloudDownloadIcon />}
                            variant="outlined"
                        >
                            Download
                        </Button>
                    </div>
                </div>
            )}

            <div
                style={{
                    height: "65vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <SearchBar
                    onSelect={setSearchSelection}
                    onCountrySelect={setSearchCountrySelection}
                />
                <MapDisplay
                    selection={searchSelection}
                    setGroupOfSelection={setGroupOfSelection}
                    yearSelected={yearSelected}
                    specificRow={specificRowSelection}
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
                    <FileDownloadIcon searchSelection={searchCountrySelection} />
                </div>
            )}

            <div style={{height: "30vh"}}>
                {searchSelection && (
                    <GroupGrid
                        groupsOfSelected={groups}
                        setYearSelected={setYearSelected}
                        setSpecificRowSelection={setSpecificRow}
                        searchSelection={searchSelection}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
