import React from "react";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import TimeLineSlider from "./TimeLineSlider";

interface HighlightRange {
    from: number;
    to: number;
}

interface RowData {
    id: number;
    name: string;
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
function getYearBounds(ranges: HighlightRange[]): {startYear: number; endYear: number} | null {
    if (!ranges || ranges.length === 0) return null;

    const startYear = Math.min(...ranges.map((r) => r.from));
    const endYear = Math.max(...ranges.map((r) => r.to));

    return {startYear, endYear};
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
}

const GroupGrid: React.FC<GroupGridProps> = ({
    groupsOfSelected,
    setYearSelected,
    setSpecificRowSelection,
    searchSelection
}) => {
    const [rowsGrid, setRowsGrid] = React.useState<RowData[]>([]);
    const [startYear, setStartYear] = React.useState(1945);
    const [endYear, setEndYear] = React.useState(2020);
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
                            from: groupData?.minyear,
                            to: groupData?.maxyear,
                            claim: groupData?.claim,
                            violence: groupData?.violent
                        }
                    ]
                }));
                const allHighlightRanges = rowsData.flatMap((row) => row.highlightRanges);
                const bounds = getYearBounds(allHighlightRanges);
                setStartYear(bounds?.startYear ?? 1945);
                setEndYear(bounds?.endYear ?? 2020);
                setRowsGrid(generateRowProps(rowsData));
                setSpecificRowSelection("");
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, [groupsOfSelected, setSpecificRowSelection]);

    const totalYears = endYear - startYear; // e.g., 2020 - 1945 = 75
    const pixelsPerYear = 30; // as in your Box width calculation
    const containerVisibleWidth = 600; // your minWidth or actual container width
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
                        alignItems: "center", // vertical center
                        width: "100%",
                        height: "100%",
                        padding: "0px 12px",
                        boxSizing: "border-box"
                    }}
                >
                    {params.value}
                </div>
            ),
            renderHeader: () => (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center", // vertical center
                        width: "100%",
                        height: "100%",
                        padding: "0px 12px",
                        boxSizing: "border-box"
                    }}
                >
                    Year selection
                </div>
            )
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
        <div key={searchSelection} style={{height: "27vh", width: "100%"}}>
            <DataGrid
                rows={rowsGrid}
                columns={columns}
                hideFooter
                getRowHeight={() => "auto"}
                disableColumnMenu
                onRowSelectionModelChange={(params) => {
                    setSpecificRowSelection(
                        Array.from(params?.ids).length == 1
                            ? String(Array.from(params?.ids)[0])?.split("_")[1]
                            : ""
                    );
                }}
            />
        </div>
    );
};

export default GroupGrid;
