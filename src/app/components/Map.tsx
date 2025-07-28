import * as React from "react";
import {Map} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {Map as MaplibreMap} from "maplibre-gl";
import {FaMapMarkedAlt} from "react-icons/fa";

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
}

const MapDisplay: React.FC<MapDisplayProps> = ({selection, setGroupOfSelection, yearSelected}) => {
    const [mapStyle, setMapStyle] = React.useState(MAP_STYLES.Streets);
    const [showStylePanel, setShowStylePanel] = React.useState(false);
    const mapRef = React.useRef<MaplibreMap | null>(null);
    const [polygonData, setPolygonData] = React.useState<GeoJSON.Geometry | null>(null);
    const [groupName, setGroupName] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (selection == null) {
            console.log("DOES NOT ENTER");
            return;
        }
        fetch("http://localhost:3000/group/geom/101010")
            .then((res) => res.json())
            .then((data) => {
                setPolygonData(data.geom);
                console.log(data.groupName);
                setGroupName(data.groupName);
            });
    }, [selection]);

    const handleMapLoadNoSelection = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;
    };
    const handleMapLoad = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;

        if (!polygonData || !groupName) return;

        const groupGeoJSON: GeoJSON.Feature = {
            type: "Feature",
            geometry: polygonData,
            properties: {
                name: groupName || "Group"
            }
        };

        if (map.getSource(groupName)) return; // Prevent duplicate sources

        map.addSource(groupName, {
            type: "geojson",
            data: groupGeoJSON
        });

        map.addLayer({
            id: "group-fill",
            type: "fill",
            source: groupName,
            paint: {
                "fill-color": "#088",
                "fill-opacity": 0.5
            }
        });

        map.addLayer({
            id: "group-outline",
            type: "line",
            source: groupName,
            paint: {
                "line-color": "#000",
                "line-width": 2
            }
        });

        map.addLayer({
            id: "group-label",
            type: "symbol",
            source: groupName,
            layout: {
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                "text-size": 14,
                "text-anchor": "center",
                "text-justify": "center"
            },
            paint: {
                "text-color": "#111",
                "text-halo-color": "#fff",
                "text-halo-width": 1.5
            }
        });

        // 👇 Center the map on the GeoJSON polygon
        const bbox = require("@turf/bbox").default;
        const bounds = bbox(groupGeoJSON); // [minX, minY, maxX, maxY]
        map.fitBounds(bounds, {padding: 40, duration: 1000});
    };

    return (
        <div
            key={selection}
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
                style={{width: "100vw", height: !selection ? "100vh" : "65vh", padding: "0px"}}
                mapStyle={mapStyle}
                onLoad={!selection ? handleMapLoadNoSelection : handleMapLoad}
            />
        </div>
    );
};

export default MapDisplay;
