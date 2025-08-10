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
    const [showStylePanel, setShowStylePanel] = React.useState(false);
    const mapRef = React.useRef<MaplibreMap | null>(null);
    const [polygonData, setPolygonData] = React.useState<GeoJSON.Geometry | null>(null);
    const backendURL = "https://selfdeterminationdata-codebackend-19450166485.europe-west1.run.app";
    const colorArray = [
        "#1E3A8A",
        "#3B82F6",
        "#06B6D4",
        "#10B981",
        "#84CC16",
        "#F59E0B",
        "#EF4444",
        "#EC4899",
        "#8B5CF6",
        "#14B8A6",
        "#FB7185",
        "#6366F1",
        "#0D9488",
        "#D946EF",
        "#FACC15"
    ];

    React.useEffect(() => {
        if (selection == null || selection == "") {
            return;
        }
        fetch(`${backendURL}/geometries/ccode/${selection}/${yearSelected}`)
            .then((res) => res.json())
            .then(async (data) => {
                await setPolygonData(JSON.parse(data[0]?.multipoly));
            });
        fetch(`${backendURL}/groups/country/${selection}`)
            .then((res) => res.json())
            .then(async (data) => {
                const groupIDSList = await data.map((groupData) => groupData?.groupid);
                setGroupOfSelection(groupIDSList);
                fetch(`${backendURL}/geometries/groupIDS/${yearSelected}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({groupIDS: groupIDSList})
                })
                    .then((res) => res.json())
                    .then(async (groupGeomsData) => {
                        const groupGeomList: GeometryObj[] = await groupGeomsData.map(
                            (groupData) => ({
                                groupName: groupData?.groupname,
                                geom: JSON.parse(groupData?.multipoly)
                            })
                        );
                        await setGroupGeom(groupGeomList);
                        await setGroupGeomToDisplay(groupGeomList);
                    });
            });
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

        groupGeomToDisplay?.forEach((geomObj, index) => {
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
                    "fill-color": colorArray[index % 15],
                    "fill-opacity": 0.8
                }
            });
            map.addLayer({
                id: geomObj.groupName + "outline",
                type: "line",
                source: geomObj.groupName,
                paint: {
                    "line-color": "#000",
                    "line-width": 2
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

        const [minX, minY, maxX, maxY] = bbox(groupGeoJSON);
        map.fitBounds([minX, minY, maxX, maxY], {padding: 40, duration: 1000});
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
