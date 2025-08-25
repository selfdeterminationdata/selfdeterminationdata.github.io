import React from "react";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import TimeLineSlider from "./TimeLineSlider";

interface HighlightRange {
    from: number;
    to: number;
    claim?: string | null;
    violence?: boolean | null;
}

interface RowData {
    id: string; // changed from number because we concatenate groupid + groupname
    name: string | null;
    highlightRanges: HighlightRange[];
}

interface GroupDataType {
    periodid?: number;
    minyear?: number;
    maxyear?: number;
    claim?: string | null;
    violent?: boolean | null;
    groupid?: number;
    ccode?: number;
    geoid?: number;
    groupname?: string | null;
}

const generateRowProps = (rowsArray: RowData[]): RowData[] => {
    const rowProps: RowData[] = [];

    for (const row of rowsArray) {
        const existingIndex = rowProps.findIndex((el) => el.id === row.id);

        if (existingIndex !== -1) {
            rowProps[existingIndex].highlightRanges = [
                ...rowProps[existingIndex].highlightRanges,
                ...row.highlightRanges
            ];
        } else {
            rowProps.push(row);
        }
    }

    return rowProps;
};

interface GroupGridProps {
    groupsOfSelected: string[] | null;
    setYearSelected: (value: number) => void;
    setSpecificRowSelection: (value: string) => void;
    searchSelection: string | null;
    startYearProp: number;
    endYearProp: number;
}

const GroupGrid: React.FC<GroupGridProps> = ({
    groupsOfSelected,
    setYearSelected,
    setSpecificRowSelection,
    searchSelection,
    startYearProp,
    endYearProp
}) => {
    const [rowsGrid, setRowsGrid] = React.useState<RowData[]>([]);
    const startYear = startYearProp > 1945 ? startYearProp : 1945;
    const endYear = endYearProp < 2020 ? endYearProp : 2020;

    const colorArray = [
        "#1E3A8A", // dark blue
        "#F59E0B", // orange
        "#06B6D4", // cyan
        "#EF4444", // red
        "#84CC16", // lime green
        "#EC4899", // pink
        "#3B82F6", // bright blue
        "#FACC15", // yellow
        "#0D9488", // dark teal
        "#D946EF", // purple
        "#14B8A6", // teal
        "#FB7185", // rose
        "#6366F1", // indigo
        "#10B981", // emerald green
        "#8B5CF6" // violet
    ];

    React.useEffect(() => {
        if (!groupsOfSelected || groupsOfSelected.length === 0) {
            return;
        }

        fetch(
            `https://selfdeterminationdata-codebackend-19450166485.europe-west1.run.app/periods/groupIDS`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({groupIDS: groupsOfSelected})
            }
        )
            .then((res) => res.json())
            .then((data) => {
                const rowsData: RowData[] = data.map((groupData: GroupDataType) => ({
                    id: groupData?.groupid + "_" + groupData?.groupname,
                    name: groupData?.groupname,
                    highlightRanges: [
                        {
                            from: groupData?.minyear ?? startYear,
                            to: groupData?.maxyear ?? endYear,
                            claim: groupData?.claim,
                            violence: groupData?.violent
                        }
                    ]
                }));
                setRowsGrid(generateRowProps(rowsData));
                setSpecificRowSelection("");
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, [groupsOfSelected, setSpecificRowSelection, startYear, endYear]);

    const totalYears = endYear - startYear;
    const pixelsPerYear = 30;
    const containerVisibleWidth = 600;
    const initialScrollLeft = totalYears * pixelsPerYear - containerVisibleWidth;
    const [scrollLeft, setScrollLeft] = React.useState(initialScrollLeft);

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Year selection",
            width: 200,
            headerAlign: "left",
            align: "left",
            renderCell: (params) => (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        padding: "0px 12px",
                        boxSizing: "border-box"
                    }}
                >
                    {params.value}
                </div>
            )
        },
        {
            field: "color",
            headerName: "Color scheme",
            width: 120,
            headerAlign: "center",
            align: "center",
            sortable: false,
            renderCell: (params) => {
                const groupId = Number(String(params.id).split("_")[0]);
                const color = colorArray[groupsOfSelected!.map(Number).indexOf(groupId) % 15];

                return (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center", // centers horizontally
                            alignItems: "center", // centers vertically
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        <div
                            style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "2px",
                                backgroundColor: color,
                                flexShrink: 0
                            }}
                        />
                    </div>
                );
            }
        },
        {
            field: "description",
            headerName: "Timeline",
            sortable: false,
            headerAlign: "center",
            align: "left",
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
                    <TimeLineSlider
                        width="1000px"
                        height="60px"
                        startYear={startYear}
                        endYear={endYear}
                        disable={true}
                        backgroundColor="grey"
                        highlightRanges={params.row.highlightRanges}
                        scrollLeft={scrollLeft}
                        onScrollLeftChange={setScrollLeft}
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
                        startYear={startYear}
                        endYear={endYear}
                        initialValue={endYear}
                        handleChangeHelper={setYearSelected}
                        scrollLeft={scrollLeft}
                        onScrollLeftChange={setScrollLeft}
                    />
                </div>
            )
        }
    ];

    return (
        <div key={searchSelection} style={{height: "27vh", width: "100%", overflowX: "auto"}}>
            <DataGrid
                key={searchSelection}
                rows={rowsGrid}
                columns={columns}
                hideFooter
                getRowHeight={() => "auto"} // rows grow to fit content
                disableColumnMenu
                autoHeight // grid adjusts height to content
                sx={{
                    minWidth: 600, // optional: prevent shrinking too much
                    "& .MuiDataGrid-cell": {
                        whiteSpace: "normal", // allow text wrap in cells
                        wordBreak: "break-word",
                        py: 0.5 // reduce padding for small screens
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        whiteSpace: "normal",
                        wordBreak: "break-word"
                    }
                }}
                onRowSelectionModelChange={(params) => {
                    setSpecificRowSelection(
                        Array.from(params?.ids).length === 1
                            ? String(Array.from(params?.ids)[0])?.split("_")[1]
                            : ""
                    );
                }}
            />
        </div>
    );
};

export default GroupGrid;
