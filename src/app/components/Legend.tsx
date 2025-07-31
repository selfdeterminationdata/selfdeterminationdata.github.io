import * as React from "react";

type LegendItem = {
    label: string;
    color: string;
};

export const legendItems: LegendItem[] = [
    {label: "Autonomy", color: "#90ee90"}, // Light green
    {label: "Sub-state secession", color: "#006400"}, // Dark green
    {label: "Independence", color: "#add8e6"}, // Light blue
    {label: "Irredentism", color: "#00008b"} // Dark blue
];

const Legend: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                height: "50px",
                fontSize: "14px",
                gap: "10px",
                paddingLeft: "10px",
                fontFamily: "Arial, Helvetica, sans-serif"
            }}
        >
            <span>Type of claim:</span>
            {legendItems.map((item) => (
                <div key={item.label} style={{display: "flex", alignItems: "center", gap: "4px"}}>
                    <div
                        style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: item.color,
                            borderRadius: "2px"
                        }}
                    />
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default Legend;
