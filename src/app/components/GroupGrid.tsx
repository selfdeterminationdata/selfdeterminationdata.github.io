import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import {DataGrid, GridRowsProp, GridColDef} from "@mui/x-data-grid";
import TimeLineBar from "./TimeLineBar"; // adjust the import path as needed

const rows: GridRowsProp = [
    {
        id: 1,
        name: "Hazaraz",
        width: "1000px",
        height: "5px",
        backgroundColor: "olive",
        startYear: 1960,
        endYear: 1970,
        minValue: 3,
        maxValue: 7
    }
];

const columns: GridColDef[] = [
    {
        field: "name",
        headerName: "Ethnic Group",
        width: 200,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => <div style={{padding: "8px 12px"}}>{params.value}</div>
    },
    {
        field: "description",
        headerName: "Timeline",
        sortable: false,
        headerAlign: "center",
        align: "center",
        flex: 1,
        renderCell: (params) => (
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <TimeLineBar
                    width={params.row.width}
                    height={params.row.height}
                    backgroundColor={params.row.backgroundColor}
                    startYear={params.row.startYear}
                    endYear={params.row.endYear}
                    minValue={params.row.minValue}
                    maxValue={params.row.maxValue}
                />
            </div>
        ),
        renderHeader: () => (
            <Tooltip title="Click on the year you would like to see">
                <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <TimeLineBar
                        width="1000px"
                        height="15px"
                        backgroundColor="purple"
                        startYear={1960}
                        endYear={1970}
                        clickable={true}
                    />
                </div>
            </Tooltip>
        )
    }
];

export default function GroupGrid() {
    return (
        <div style={{width: "100%"}}>
            <DataGrid
                rows={rows}
                columns={columns}
                hideFooter
                getRowHeight={() => "auto"}
                autoHeight
            />
        </div>
    );
}
