import React, {useRef, useState, useEffect} from "react";
import {Slider, Box, IconButton} from "@mui/material";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";

type HighlightRange = {
    from: number;
    to: number;
};

type TimeLineSliderProps = {
    width?: string;
    height?: string;
    startYear: number;
    endYear: number;
    backgroundColor?: string;
    initialValue?: number;
    highlightRanges?: HighlightRange[];
    disable?: boolean;
    handleChangeHelper?: (year: number) => void;
};

const TimeLineSlider: React.FC<TimeLineSliderProps> = ({
    width = "100%",
    height = "120px",
    disable = false,
    startYear,
    endYear,
    backgroundColor = "#1976d2",
    initialValue = 1945,
    highlightRanges,
    handleChangeHelper
}) => {
    const [value, setValue] = useState<number>(initialValue);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleChange = (_: Event, newValue: number | number[]) => {
        if (typeof newValue === "number") {
            handleChangeHelper != null ? handleChangeHelper(newValue) : null;
            setValue(newValue);
        }
    };

    const marks = [];
    for (let year = startYear; year <= endYear; year++) {
        const showLabel = year % 5 === 0;
        marks.push({
            value: year,
            ...(showLabel && {label: `${year}`})
        });
    }

    const scrollBy = (offset: number) => {
        const el = scrollContainerRef.current;
        if (el) {
            el.scrollBy({left: offset, behavior: "smooth"});
        }
    };

    const handleScroll = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    useEffect(() => {
        handleScroll(); // initial visibility
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollTo({
                left: container.scrollWidth,
                behavior: "auto" // or 'smooth' if you want animation
            });
        }
    }, []);

    return (
        <Box width={width} height={height} display="flex" alignItems="center" position="relative">
            {showLeftArrow && (
                <IconButton
                    onClick={() => scrollBy(-200)}
                    sx={{position: "absolute", left: 0, zIndex: 10}}
                    aria-label="Scroll left"
                >
                    <ChevronLeft fontSize="small" />
                </IconButton>
            )}

            <Box
                ref={scrollContainerRef}
                onScroll={handleScroll}
                sx={{
                    flex: 1,
                    overflowX: "auto",
                    overflowY: "hidden",
                    whiteSpace: "nowrap",
                    paddingX: 2,
                    mx: 6,
                    position: "relative"
                }}
            >
                <Box
                    sx={{
                        width: `${(endYear - startYear) * 30}px`,
                        minWidth: "600px",
                        position: "relative" // for overlay positioning
                    }}
                >
                    {/* Highlight overlay */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: "28%",
                            left: 0,
                            transform: "translateY(-50%)",
                            height: "6px",
                            width: "100%",
                            pointerEvents: "none", // allow slider interaction through overlay
                            zIndex: 1
                        }}
                    >
                        {highlightRanges?.map((range, index) => {
                            const left = ((range.from - startYear) / (endYear - startYear)) * 100;
                            const width = ((range.to - range.from) / (endYear - startYear)) * 100;

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        position: "absolute",
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        height: "100%",
                                        backgroundColor: "red", // yellow highlight
                                        borderRadius: "3px"
                                    }}
                                >
                                {' 🔥'}
                                </Box>
                            );
                        })}
                    </Box>

                    <Slider
                        value={value}
                        min={startYear}
                        max={endYear}
                        step={1}
                        marks={marks}
                        onChange={handleChange}
                        valueLabelDisplay="auto"
                        sx={{
                            position: "relative",
                            zIndex: 2,
                            color: backgroundColor,
                            "& .MuiSlider-markLabel": {
                                fontSize: "0.75rem"
                            },
                            "& .MuiSlider-valueLabel": {
                                fontSize: "0.7rem",
                                backgroundColor: backgroundColor,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                top: 40,
                                "&:before": {
                                    transform: "scale(0.6)"
                                }
                            },
                            ...(disable && {
                                "& .MuiSlider-thumb": {
                                    display: "none"
                                }
                            })
                        }}
                    />
                </Box>
            </Box>

            {showRightArrow && (
                <IconButton
                    onClick={() => scrollBy(200)}
                    sx={{position: "absolute", right: 0, zIndex: 10}}
                    aria-label="Scroll right"
                >
                    <ChevronRight fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default TimeLineSlider;
