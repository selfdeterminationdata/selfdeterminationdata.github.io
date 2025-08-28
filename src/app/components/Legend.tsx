import * as React from "react";

type LegendItem = {
    label: string;
    color: string;
    violence?: boolean;
};

export const legendItems: LegendItem[] = [
    {label: "Autonomy", color: "#90ee90"}, // Light green
    {label: "Sub-state secession", color: "#006400"}, // Dark green
    {label: "Independence", color: "#6CA0DC"}, // Light blue
    {label: "Irredentism", color: "#00008b"} // Dark blue
];

const Legend: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
                gap: "20px",
                paddingLeft: "10px",
                fontFamily: "Arial, Helvetica, sans-serif",
                height: "50px"
            }}
        >
            {/* Type of claim legend */}
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <span style={{fontWeight: "bold"}}>Type of claim:</span>
                {legendItems.map((item) => (
                    <div
                        key={item.label}
                        style={{display: "flex", alignItems: "center", gap: "4px"}}
                    >
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

            {/* Campaign type legend */}
            <div style={{display: "flex", alignItems: "center", gap: "10px", paddingLeft: "10vw"}}>
                <span style={{fontWeight: "bold"}}>Campaign type:</span>
                <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
                    <div
                        style={{
                            width: "24px",
                            height: "12px",
                            backgroundColor: "#888888",
                            borderRadius: "2px"
                        }}
                    />
                    <span>Non-violent campaign</span>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
                    <div
                        style={{
                            width: "24px",
                            height: "12px",
                            backgroundColor: "#888888",
                            backgroundImage: `repeating-linear-gradient(
                                                45deg,
                                                rgba(255, 255, 255, 0.7),
                                                rgba(255, 255, 255, 0.7) 5px,
                                                transparent 5px,
                                                transparent 10px
                                            )`,
                            borderRadius: "2px"
                        }}
                    />
                    <span>Violent campaign</span>
                </div>
            </div>
        </div>
    );
};

export default Legend;
