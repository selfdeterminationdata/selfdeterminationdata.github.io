import * as React from "react";
import {Map} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"; // See notes below

const App: React.FC = () => {
   return <Map
              initialViewState={{
                longitude: 0,
                latitude: 0,
                zoom: 0
              }}
              style={{width: 600, height: 400}}
              mapStyle="https://demotiles.maplibre.org/style.json"
            />;

};

export default App;