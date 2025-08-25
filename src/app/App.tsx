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
    const [startYear, setStartYear] = useState(1945);
    const [endYear, setEndYear] = useState(2020);
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
                    <div className="header">
                        <img src="/uniofbath.png" alt="University of Bath" className="logo" />
                        <img src="/councillogo.png" alt="Council Logo" className="logo" />
                    </div>

                    <style>
                        {`
                      .header {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 10px 20px;
                        z-index: 1000;
                      }

                      .logo {
                        background-color: #fff;
                        padding: 8px;
                        border-radius: 4px;
                        max-width: 200px; /* works on desktop */
                        width: 100%;
                        height: auto;
                      }

                      /* Mobile: stack logos vertically */
                      @media (max-width: 768px) {
                        .header {
                          flex-direction: column;
                          align-items: center;
                        }

                        .logo {
                          max-width: 150px; /* shrink a bit for mobile */
                          margin-bottom: 10px;
                        }
                      }
                    `}
                    </style>
                    <div
                        style={{
                            position: "fixed",
                            top: "80px", // push down so it clears logos (adjust based on logo height)
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                            boxSizing: "border-box"
                        }}
                    >
                        <h1 style={{marginBottom: "1rem", textAlign: "center"}}>
                            {overlayMode === "intro" ? "SDM 2.0" : "About"}
                        </h1>

                        {/* Scrollable text box */}
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
                        {/* Sticky button bar */}
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                                flexWrap: "wrap", // wraps buttons on small screens
                                padding: "0.5rem"
                            }}
                        >
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
                    setStartYear={setStartYear}
                    setEndYear={setEndYear}
                />
                <MapDisplay
                    selection={searchSelection}
                    setGroupOfSelection={setGroupOfSelection}
                    yearSelected={yearSelected}
                    specificRow={specificRowSelection}
                    endYear={endYear}
                />
            </div>

            {searchSelection && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row", // always row
                        justifyContent: "flex-start", // align items at start
                        alignItems: "center",
                        height: "50px",
                        gap: "0.5rem",
                        overflowX: "auto", // horizontal scroll
                        whiteSpace: "nowrap", // prevent wrapping
                        padding: "0.5rem 0" // optional padding
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
                        startYearProp={startYear}
                        endYearProp={endYear}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
