import React, {useState} from "react";

type TimeLineBarProps = {
    width?: string;
    height?: string;
    backgroundColor: string;
    startYear: number;
    endYear: number;
    minValue?: number;
    maxValue?: number;
    clickable?: boolean;
};

const TimeLineBar: React.FC<TimeLineBarProps> = ({
    width = "100%",
    height = "15px",
    backgroundColor,
    startYear,
    endYear,
    minValue,
    maxValue,
    clickable
}) => {
    const [activeIndex, setActiveIndex] = useState<number>(clickable ? 0 : null);
    const divisions = 10;

    const hexToRgba = (hex: string, opacity: number) => {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const minIndex = minValue && minValue >= 1 && minValue <= divisions ? minValue - 1 : null;
    const maxIndex = maxValue && maxValue >= 1 && maxValue <= divisions ? maxValue - 1 : null;

    return (
        <div style={{width, paddingTop: "5px"}}>
            {/* Timeline Bar */}
            <div
                style={{
                    width: "100%",
                    height,
                    backgroundColor,
                    borderRadius: "10px",
                    display: "flex",
                    overflow: "hidden"
                }}
            >
                {Array.from({length: divisions}).map((_, i) => {
                    const isSelected = i === activeIndex;
                    const isRangeSelected =
                        minIndex !== null && maxIndex !== null && i >= minIndex && i <= maxIndex;

                    const bg = isSelected
                        ? "indigo"
                        : isRangeSelected
                          ? hexToRgba(backgroundColor, 0.6)
                          : "transparent";

                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                backgroundColor: bg,
                                borderRight: i < divisions - 1 ? "1px solid white" : "none",
                                cursor: clickable ? "pointer" : "default",
                                boxShadow: clickable ? "0 4px 8px rgba(0,0,0,1.0)" : "none",
                                transition: "all 0.2s ease"
                            }}
                            onClick={() => {
                                if (clickable) {
                                    setActiveIndex(i); // ✅ only one can be selected
                                    console.log("Clicked", i);
                                }
                            }}
                        />
                    );
                })}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "4px",
                    fontSize: "0.8rem",
                    color: "#333",
                    fontWeight: "bold"
                }}
            >
                <span>{startYear}</span>
                <span>{endYear}</span>
            </div>
        </div>
    );
};

export default TimeLineBar;
