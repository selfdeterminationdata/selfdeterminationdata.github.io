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
    const [scrollLeft, setScrollLeft] = useState(0);
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

                setRowsGrid(generateRowProps(rowsData));
                setSpecificRowSelection("");
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, [groupsOfSelected, setSpecificRowSelection]);

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Year Selection",
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
                    <TimeLineSlider
                        width="1000px"
                        height="60px"
                        disable={true}
                        startYear={1945}
                        endYear={2020}
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
                        startYear={1945}
                        endYear={2020}
                        initialValue={2020}
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
