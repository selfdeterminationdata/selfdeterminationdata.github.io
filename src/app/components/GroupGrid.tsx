import React from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import TimeLineSlider from "./TimeLineSlider";

const rows: GridRowsProp = [
  {
    id: 1,
    name: "Hazaraz",
    width: "900px",
    height: "5px",
    backgroundColor: "olive",
    startYear: 1960,
    endYear: 1970,
    minValue: 3,
    maxValue: 7
  }
];

interface GroupGridProps {
  groupsOfSelected: string[] | null;
  setYearSelected: (value: number) =>  void;
}

const GroupGrid: React.FC<GroupGridProps> = ({ groupsOfSelected, setYearSelected }) => {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Self-determination Movement",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ padding: "8px 12px" }}>{params.value}</div>
      )
    },
    {
      field: "description",
      headerName: "Timeline",
      sortable: false,
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: () => (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TimeLineSlider
            width="1000px"
            height="60px"
            disable={true}
            startYear={1945}
            endYear={2020}
            backgroundColor="orange"
            highlightRanges={[
              { from: 1950, to: 1955 },
              { from: 1970, to: 1980 },
              { from: 2000, to: 2010 }
            ]}
          />
        </div>
      ),
      renderHeader: () => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TimeLineSlider
            width="1000px"
            height="60px"
            backgroundColor="darkslategray"
            startYear={1945}
            endYear={2020}
            initialValue={2020}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        getRowHeight={() => "auto"}
        autoHeight
      />
    </div>
  );
};

export default GroupGrid;
