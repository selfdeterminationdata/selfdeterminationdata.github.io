import * as React from "react";
import {Map} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {Map as MaplibreMap} from "maplibre-gl";
import {FaMapMarkedAlt} from "react-icons/fa";
import {bbox} from "@turf/bbox";
import {centroid} from "@turf/centroid";

const MAP_STYLES = {
    Streets: "https://api.maptiler.com/maps/streets/style.json?key=p51HaAszwX0vYbRQVlar",
    Satellite: "https://api.maptiler.com/maps/hybrid/style.json?key=p51HaAszwX0vYbRQVlar",
    Topographic: "https://api.maptiler.com/maps/outdoor/style.json?key=p51HaAszwX0vYbRQVlar",
    Dark: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=p51HaAszwX0vYbRQVlar",
    Bright: "https://api.maptiler.com/maps/bright/style.json?key=p51HaAszwX0vYbRQVlar",
    Basic: "https://api.maptiler.com/maps/basic/style.json?key=p51HaAszwX0vYbRQVlar"
};

interface MapDisplayProps {
    selection: string | null;
    setGroupOfSelection: (value: string[]) => void;
    yearSelected: number;
    specificRow: string;
}

interface GeometryObj {
    groupName: string | null;
    geom: GeoJSON.Geometry | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
    selection,
    setGroupOfSelection,
    yearSelected,
    specificRow
}) => {
    const [mapStyle, setMapStyle] = React.useState(MAP_STYLES.Streets);
    const [flag, setFlag] = React.useState(0);
    const [groupGeom, setGroupGeom] = React.useState<GeometryObj[] | null>(null);
    const [groupGeomToDisplay, setGroupGeomToDisplay] = React.useState<GeometryObj[] | null>(null);
    const [groundNameList, setGroupNameList] = React.useState<string[] | null>([]);
    const [showStylePanel, setShowStylePanel] = React.useState(false);
    const mapRef = React.useRef<MaplibreMap | null>(null);
    const [polygonData, setPolygonData] = React.useState<GeoJSON.Geometry | null>(null);
    const hasZoomedRef = React.useRef(false);
    const backendURL = "https://selfdeterminationdata-codebackend-19450166485.europe-west1.run.app";
    const colorArray = [
        "#1E3A8A", // dark blue
        "#F59E0B", // orange
        "#06B6D4", // cyan
        "#EF4444", // red
        "#84CC16", // lime green
        "#EC4899", // pink
        "#3B82F6", // bright blue
        "#FACC15", // yellow
        "#0D9488", // dark teal
        "#D946EF", // purple
        "#14B8A6", // teal
        "#FB7185", // rose
        "#6366F1", // indigo
        "#10B981", // emerald green
        "#8B5CF6" // violet
    ];

    React.useEffect(() => {
        if (!selection) return; // covers null, undefined, and empty string

        const fetchData = async () => {
            try {
                // --- Fetch polygon data ---
                const polygonRes = await fetch(
                    `${backendURL}/geometries/ccode/${selection}/${yearSelected}`
                );
                const polygonDataRes = await polygonRes.json();
                const multipoly = polygonDataRes[0]?.multipoly;
                setPolygonData(multipoly ? JSON.parse(multipoly) : null);

                // --- Fetch group IDs ---
                const groupsRes = await fetch(`${backendURL}/groups/country/${selection}`);
                const groupsData = await groupsRes.json();
                const groupIDSList = groupsData.map((group) => group?.groupid).filter(Boolean);
                setGroupNameList(groupsData.map((group) => group?.groupname).filter(Boolean));
                setGroupOfSelection(groupIDSList);

                if (groupIDSList.length === 0) {
                    setGroupGeom([]);
                    setGroupGeomToDisplay([]);
                    return;
                }

                const groupGeomsRes = await fetch(
                    `${backendURL}/geometries/groupIDS/${yearSelected}`,
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({groupIDS: groupIDSList})
                    }
                );
                const groupGeomsData = await groupGeomsRes.json();

                const groupGeomList: GeometryObj[] = groupGeomsData.map((groupData) => ({
                    groupName: groupData?.groupname || "",
                    geom: groupData?.multipoly ? JSON.parse(groupData.multipoly) : null
                }));

                setGroupGeom(groupGeomList);
                setGroupGeomToDisplay(groupGeomList);
            } catch (error) {
                console.error("Error fetching data:", error);
                setPolygonData(null);
                setGroupGeom([]);
                setGroupGeomToDisplay([]);
            }
        };

        fetchData();
    }, [selection, yearSelected, setGroupOfSelection]);

    React.useEffect(() => {
        if (specificRow !== "") {
            if (groupGeom.findIndex((el) => el?.groupName === specificRow) === -1) {
                setGroupGeomToDisplay([]);
            } else {
                setGroupGeomToDisplay([
                    groupGeom[groupGeom.findIndex((el) => el?.groupName === specificRow)]
                ]);
            }
        } else {
            setGroupGeomToDisplay(groupGeom);
        }
    }, [specificRow, groupGeom]);

    React.useEffect(() => {
        hasZoomedRef.current = false;
    }, [selection]);

    React.useEffect(() => {
        setFlag((f) => f + 1);
    }, [groupGeomToDisplay, specificRow]);

    const handleMapLoadNoSelection = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;
    };
    const handleMapLoad = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;

        if (!polygonData) return;

        const geoJSONFeatureFunc = (groupObj: GeometryObj) => {
            const groupGeoJSON: GeoJSON.Feature = {
                type: "Feature",
                geometry: groupObj.geom,
                properties: {
                    name: groupObj.groupName
                }
            };
            return groupGeoJSON;
        };

        const groupGeoJSON: GeoJSON.Feature = {
            type: "Feature",
            geometry: polygonData,
            properties: {
                name: "country"
            }
        };
        map.addSource("country", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [groupGeoJSON]
            }
        });

        groupGeomToDisplay?.forEach((geomObj) => {
            map.addSource(geomObj.groupName, {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [geoJSONFeatureFunc(geomObj)]
                }
            });
            map.addLayer({
                id: geomObj.groupName,
                type: "fill",
                source: geomObj.groupName,
                paint: {
                    "fill-color":
                        colorArray[
                            groundNameList.findIndex((name) => name === geomObj.groupName) % 15
                        ],
                    "fill-opacity": 0.6
                }
            });
            map.addLayer({
                id: geomObj.groupName + "outline",
                type: "line",
                source: geomObj.groupName,
                paint: {
                    "line-color":
                        colorArray[
                            groundNameList.findIndex((name) => name === geomObj.groupName) % 15
                        ],
                    "line-width": 3.5
                }
            });
            const labelFeature = centroid(geoJSONFeatureFunc(geomObj));
            labelFeature.properties = {name: geomObj.groupName};

            map.addSource(geomObj.groupName + "-label", {
                type: "geojson",
                data: {type: "FeatureCollection", features: [labelFeature]}
            });

            map.addLayer({
                id: geomObj.groupName + "-label",
                type: "symbol",
                source: geomObj.groupName + "-label",
                layout: {
                    "text-field": ["get", "name"],
                    "text-size": 14,
                    "text-offset": [0, 0],
                    "text-anchor": "top"
                },
                paint: {
                    "text-color": "#000",
                    "text-halo-color": "#fff",
                    "text-halo-width": 1.5
                }
            });
        });
        map.addLayer({
            id: "group-outline",
            type: "line",
            source: "country",
            paint: {
                "line-color": "#000",
                "line-width": 2
            }
        });

        // Bounds logic
        const [minX, minY, maxX, maxY] =
            groupGeomToDisplay.length == 1
                ? bbox(geoJSONFeatureFunc(groupGeomToDisplay[0]))
                : bbox(groupGeoJSON);

        map.fitBounds([minX, minY, maxX, maxY], {
            padding: 40,
            duration: hasZoomedRef.current ? 0 : 1000 // <- No animation after first time
        });

        hasZoomedRef.current = true;
    };

    return (
        <div
            key={flag}
            style={{position: "relative", width: "100vw", height: !selection ? "100vh" : "65vh"}}
        >
            {/* Style Switcher Icon */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 10
                }}
            >
                <button
                    onClick={() => setShowStylePanel(!showStylePanel)}
                    style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        borderRadius: "50%",
                        padding: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        cursor: "pointer"
                    }}
                >
                    <FaMapMarkedAlt size={20} />
                </button>

                {showStylePanel && (
                    <div
                        style={{
                            marginTop: "10px",
                            background: "rgba(255,255,255,0.95)",
                            borderRadius: "8px",
                            padding: "10px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px"
                        }}
                    >
                        {Object.entries(MAP_STYLES).map(([name, url]) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setMapStyle(url);
                                    setShowStylePanel(false);
                                }}
                                style={{
                                    background: mapStyle === url ? "#00bcd4" : "#eee",
                                    color: mapStyle === url ? "white" : "#333",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "6px 10px",
                                    textAlign: "left",
                                    cursor: "pointer"
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <Map
                initialViewState={{longitude: 0, latitude: 0, zoom: 0}}
                style={{
                    width: "100vw",
                    height: !selection ? "100vh" : "65vh",
                    position: "absolute",
                    top: 0,
                    left: 0
                }}
                mapStyle={mapStyle}
                onLoad={!selection ? handleMapLoadNoSelection : handleMapLoad}
            />
        </div>
    );
};

export default MapDisplay;
