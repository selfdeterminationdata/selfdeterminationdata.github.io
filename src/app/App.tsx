import * as React from "react";
import MapDisplay from "components/Map";
import SearchBar from "components/SearchBar";
import GroupGrid from "components/GroupGrid";
import DecadePicker from "components/DecadePicker";

const App: React.FC = () => (
    <>
        <div
            style={{height: "65vh", display: "flex", flexDirection: "column", alignItems: "center"}}
        >
            <SearchBar />
            <MapDisplay />
        </div>
        <div style={{height: "60px", display: "flex", flexDirection: "column"}}>
            <DecadePicker />
        </div>
        <GroupGrid />
    </>
);

export default App;
