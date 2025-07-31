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

interface GeometryObj {
  groupName : string| null;
  geom: GeoJSON.Geometry | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({selection, setGroupOfSelection, yearSelected}) => {
    const [mapStyle, setMapStyle] = React.useState(MAP_STYLES.Streets);
    const [flag, setFlag] = React.useState(0);
    const [groupGeom, setGroupGeom] =  React.useState<GeometryObj[] | null>(null);
    const [showStylePanel, setShowStylePanel] = React.useState(false);
    const mapRef = React.useRef<MaplibreMap | null>(null);
    const [polygonData, setPolygonData] = React.useState<GeoJSON.Geometry | null>(null);
    const [groupName, setGroupName] = React.useState<string | null>("hello");

    React.useEffect(() => {
        if (selection == null || selection == "") {
            console.log("DOES NOT ENTER");
            return;
        }
        fetch(`http://localhost:3000/geometries/ccode/${selection}/${yearSelected}`)
            .then((res) => res.json())
            .then(async (data) => {
                console.log(data);
                await setPolygonData(JSON.parse(data[0]?.multipoly));
                console.log(JSON.parse(data[0]?.multipoly));
            });
        fetch(`http://localhost:3000/groups/country/${selection}`)
                    .then((res) => res.json())
                    .then(async (data) => {
                         const groupIDSList = await data.map((groupData) => (
                          groupData?.groupid
                        );
                        console.log(groupIDSList);
                        fetch(`http://localhost:3000/geometries/groupIDS/${yearSelected}`, {
                           method: 'POST',
                           headers: {
                               'Content-Type': 'application/json',
                             },
                           body: JSON.stringify({ groupIDS: groupIDSList })
                        })
                                    .then((res) => res.json())
                                    .then((data) => {
                                       console.log(data);
                                       const groupGeomList: GeometryObj[] = data.map((groupData) => (
                                          {
                                              groupName: groupData?.groupname,
                                              geom: JSON.parse(groupData?.multipoly)
                                          }
                                                               );
                                       setGroupGeom(groupGeomList);
                                    });
                    });
    }, [selection, yearSelected]);

    React.useEffect(() => {
     setFlag(flag+1);
    },[polygonData]);

    const handleMapLoadNoSelection = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;
    };
    const handleMapLoad = (e: {target: MaplibreMap}) => {
        const map = e.target;
        mapRef.current = map;

        if (!polygonData || !groupName) return;

        const geoJSONFeatureFunc = (groupObj: GeometryObj) => {
               const groupGeoJSON: GeoJSON.Feature = {
                   type: "Feature",
                   geometry: groupObj.geom,
                   properties: {
                      name: groupObj.groupName,
                   }
               };
               return groupGeoJSON;
        }

        if (map.getSource(groupName)) return; // Prevent duplicate sources

        const groupGeoJSON: GeoJSON.Feature = {
                    type: "Feature",
                    geometry: polygonData,
                    properties: {
                        name: "country",
                    }
                };
        map.addSource("country", {
                       type: "geojson",
                       data: {
                           'type': 'FeatureCollection',
                           'features': [groupGeoJSON]
                                }
                    });


        groupGeom.forEach(geomObj => {
            console.log(geoJSONFeatureFunc(geomObj));
            map.addSource(geomObj.groupName, {
               type: "geojson",
               data: {
                   'type': 'FeatureCollection',
                   'features': [geoJSONFeatureFunc(geomObj)]
                        }
            });
            map.addLayer({
                id: geomObj.groupName,
                type: "fill",
                source: geomObj.groupName,
                paint: {
                   "fill-color": "#"+ Math.floor(Math.random()*16777215).toString(16);,
                   "fill-opacity": 0.5
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
        })

        map.addLayer({
                        id: "country",
                        type: "fill",
                        source: "country",
                        paint: {
                           "fill-color": "#088";,
                           "fill-opacity": 0.5
                        }
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


//         map.addLayer({
//             id: "poi-labels",
//             type: "symbol",
//             source: groupName,
//             layout: {
//                 "text-field": ["get", "name"],
//                 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
//                 "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
//                 "text-size": 14
//             },
//             paint: {
//                 "text-color": "#111",
//                 "text-halo-color": "#fff",
//                 "text-halo-width": 1.5
//             }
//         });

        // 👇 Center the map on the GeoJSON polygon
        const bbox = require("@turf/bbox").default;
        const bounds = bbox(groupGeoJSON); // [minX, minY, maxX, maxY]
        map.fitBounds(bounds, {padding: 40, duration: 1000});
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
                style={{width: "100vw", height: !selection ? "100vh" : "65vh"}}
                mapStyle={mapStyle}
                onLoad={!selection ? handleMapLoadNoSelection : handleMapLoad}
            />
        </div>
    );
};

export default MapDisplay;
