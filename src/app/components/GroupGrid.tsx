import React, {useState} from "react";import Tooltip from "@mui/material/Tooltip";
import {DataGrid, GridRowsProp, GridColDef} from "@mui/x-data-grid";
import TimeLineBar from "./TimeLineBar"; // adjust the import path as needed
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



export default function GroupGrid() {
   const [currentYear, setCurrentYear] = useState<number>(1945);
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
                       minValue={params.row.minValue}
                       maxValue={params.row.maxValue}
                       currentYear={currentYear}
                   />
               </div>
           ),
           renderHeader: () => (
                   <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                       <TimeLineSlider
                           width="1000px"
                           height="60px"
                           backgroundColor="darkslategray"
                           startYear={1945}
                           endYear={2020}
                           setCurrentYear={setCurrentYear}
                       />
                   </div>
           )
       }
   ];
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
