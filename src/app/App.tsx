import React, { useState } from "react";
import MapDisplay from "components/Map";
import SearchBar from "components/SearchBar";
import GroupGrid from "components/GroupGrid";

const App: React.FC = () => {
  const [searchSelection, setSearchSelection] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div
        style={{
          height: "65vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <SearchBar onSelect={setSearchSelection} />
        <MapDisplay selection={searchSelection} />
      </div>

      {searchSelection && (
        <div style={{ height: "60px", display: "flex", flexDirection: "column" }}>
        </div>
      )}

      {searchSelection && <GroupGrid />}
    </div>
  );
};

export default App;
