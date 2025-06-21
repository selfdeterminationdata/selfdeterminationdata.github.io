import * as React from "react";
import {Map} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"; // See notes below

const MapDisplay: React.FC = () => {
    return (
        <Map
            initialViewState={{
                longitude: 0,
                latitude: 0,
                zoom: 0
            }}
            style={{width: "100vw", height: "100vh"}}
            mapStyle="https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL"
        />
    );
};

export default MapDisplay;
