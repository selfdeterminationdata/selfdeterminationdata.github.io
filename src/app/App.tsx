import * as React from "react";
import MapDisplay from "components/Map";
import SearchBar from "components/SearchBar";

const App: React.FC = () => (
    <>
        <div>
            <div style={{alignItems: "center"}}>
                <SearchBar />
            </div>
            <MapDisplay />
        </div>
    </>
);

export default App;
