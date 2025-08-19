import React, {useRef, useState, useEffect, useCallback} from "react";
import {Slider, Box, IconButton} from "@mui/material";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";

type HighlightRange = {
    from: number;
    to: number;
    claim?: string | null;
    violence?: boolean | null;
};

type TimeLineSliderProps = {
    width?: string;
    height?: string;
    backgroundColor?: string;
    initialValue?: number;
    highlightRanges?: HighlightRange[];
    disable?: boolean;
    startYear: number;
    endYear: number;

    scrollLeft: number;
    onScrollLeftChange: (val: number) => void;

    handleChangeHelper?: (year: number) => void;
};

const TimeLineSlider: React.FC<TimeLineSliderProps> = ({
    width = "100%",
    height = "120px",
    disable = false,
    backgroundColor = "#663399",
    initialValue = 1945,
    startYear,
    endYear,
    highlightRanges,
    handleChangeHelper,
    scrollLeft,
    onScrollLeftChange
}) => {
    const [value, setValue] = useState<number>(initialValue);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const legendItems = [
        {label: "Autonomy", color: "#90ee90"},
        {label: "Sub-state secession", color: "#006400"},
        {label: "Independence", color: "#add8e6"},
        {label: "Irredentism", color: "#00008b"}
    ];

    const generateBackgroundColor = (range: HighlightRange) => {
        const idx = legendItems.findIndex((el) => el.label === range?.claim);
        return idx !== -1 ? legendItems[idx].color : "#A9A9A9";
    };

    // Scroll sync and animation refs
    const isSyncingFromParent = useRef(false);
    const scrollAnimationFrame = useRef<number | null>(null);
    const scrollEaseFrame = useRef<number | null>(null);
    const currentTargetScroll = useRef<number | null>(null);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

        if (!isSyncingFromParent.current) {
            if (scrollAnimationFrame.current) {
                cancelAnimationFrame(scrollAnimationFrame.current);
            }
            scrollAnimationFrame.current = requestAnimationFrame(() => {
                onScrollLeftChange(el.scrollLeft);
            });
        }
    }, [onScrollLeftChange]);

    // Smoothly animate scroll with easing
    const animateScrollTo = (target: number) => {
        const el = scrollContainerRef.current;
        if (!el) return;

        if (scrollEaseFrame.current) {
            cancelAnimationFrame(scrollEaseFrame.current);
        }

        const start = el.scrollLeft;
        const distance = target - start;
        if (Math.abs(distance) < 1) return;

        const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 200), 800);
        const startTime = performance.now();
        currentTargetScroll.current = target;

        const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = (time: number) => {
            const progress = Math.min((time - startTime) / duration, 1);
            el.scrollLeft = start + distance * easeInOutQuad(progress);
            if (progress < 1) {
                scrollEaseFrame.current = requestAnimationFrame(step);
            }
        };

        scrollEaseFrame.current = requestAnimationFrame(step);
    };

    // When parent changes scrollLeft
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        if (Math.abs(el.scrollLeft - scrollLeft) > 1) {
            isSyncingFromParent.current = true;
            animateScrollTo(scrollLeft);
            setTimeout(() => {
                isSyncingFromParent.current = false;
            }, 800);
        }
    }, [scrollLeft]);

    useEffect(() => {
        handleScroll();
        return () => {
            if (scrollAnimationFrame.current) cancelAnimationFrame(scrollAnimationFrame.current);
            if (scrollEaseFrame.current) cancelAnimationFrame(scrollEaseFrame.current);
        };
    }, [handleScroll]);

    const marks = [];
    for (let year = startYear; year <= endYear; year++) {
        marks.push({value: year, ...(year % 5 === 0 && {label: `${year}`})});
    }

    const scrollOneYear = (direction: "left" | "right") => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const totalYears = endYear - startYear;
        const scrollableWidth = el.scrollWidth;
        const oneYearScroll = scrollableWidth / totalYears;

        let target =
            (currentTargetScroll.current ?? el.scrollLeft) +
            (direction === "left" ? -oneYearScroll : oneYearScroll);

        target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target));
        animateScrollTo(target);
    };

    return (
        <Box width={width} height={height} display="flex" alignItems="center" position="relative">
            {showLeftArrow && !disable && (
                <IconButton
                    onClick={() => scrollOneYear("left")}
                    sx={{position: "absolute", left: 0, zIndex: 10}}
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
                        position: "relative"
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
                            pointerEvents: "none",
                            zIndex: 1
                        }}
                    >
                        {highlightRanges?.map((range, index) => {
                            const left = ((range.from - startYear) / (endYear - startYear)) * 100;
                            const widthBar =
                                range.to !== 2020
                                    ? ((range.to - range.from + 1) / (endYear - startYear)) * 100
                                    : ((range.to - range.from) / (endYear - startYear)) * 100;

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        position: "absolute",
                                        left: `${left}%`,
                                        width: `${widthBar}%`,
                                        height: "100%",
                                        backgroundColor: generateBackgroundColor(range),
                                        backgroundImage: range?.violence
                                            ? `repeating-linear-gradient(
                          45deg,
                          rgba(255, 255, 255, 0.3) 0,
                          rgba(255, 255, 255, 0.3) 5px,
                          red 10px,
                          red 20px
                        )`
                                            : `repeating-linear-gradient(
                                                                        45deg,
                                                                        rgba(255, 255, 255, 0.7) 0,
                                                                        rgba(255, 255, 255, 0.7) 5px,
                                                                        transparent 10px,
                                                                        transparent 20px
                                                                      )`,
                                        borderRadius: "3px"
                                    }}
                                />
                            );
                        })}
                    </Box>

                    <Slider
                        disabled={disable}
                        value={value}
                        min={startYear}
                        max={endYear}
                        step={1}
                        marks={marks}
                        onChange={(_, newValue) => {
                            if (typeof newValue !== "number") return;

                            setValue(newValue);
                            handleChangeHelper?.(newValue);

                            const el = scrollContainerRef.current;
                            if (!el) return;

                            const totalYears = endYear - startYear;
                            const scrollableWidth = el.scrollWidth;
                            const containerWidth = el.clientWidth;
                            const thumbLeft =
                                ((newValue - startYear) / totalYears) * scrollableWidth;
                            const padding = 40;

                            if (thumbLeft < el.scrollLeft + padding) {
                                animateScrollTo(Math.max(0, thumbLeft - padding));
                            } else if (thumbLeft > el.scrollLeft + containerWidth - padding) {
                                animateScrollTo(
                                    Math.min(
                                        el.scrollWidth - containerWidth,
                                        thumbLeft - containerWidth + padding
                                    )
                                );
                            }
                        }}
                        valueLabelDisplay="auto"
                        sx={{
                            position: "relative",
                            zIndex: 2,
                            color: backgroundColor,
                            "& .MuiSlider-markLabel": {fontSize: "0.75rem"},
                            "& .MuiSlider-valueLabel": {
                                fontSize: "0.7rem",
                                backgroundColor: backgroundColor,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                top: 40,
                                "&:before": {transform: "scale(0.6)"}
                            },
                            ...(disable && {
                                "& .MuiSlider-thumb": {display: "none"}
                            })
                        }}
                    />
                </Box>
            </Box>

            {showRightArrow && !disable && (
                <IconButton
                    onClick={() => scrollOneYear("right")}
                    sx={{position: "absolute", right: 0, zIndex: 10}}
                >
                    <ChevronRight fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default TimeLineSlider;
