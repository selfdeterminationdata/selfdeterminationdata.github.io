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
    disabled?: boolean; // when false → parent slider
    startYear: number;
    endYear: number;

    scrollLeft: number; // controlled by parent
    onScrollLeftChange?: (val: number) => void; // only used if disabled=false
    handleChangeHelper?: (year: number) => void;
};

const TimeLineSlider: React.FC<TimeLineSliderProps> = ({
    width = "100%",
    height = "120px",
    disabled = false,
    backgroundColor = "#663399",
    initialValue = 1945,
    startYear,
    endYear,
    highlightRanges,
    scrollLeft,
    onScrollLeftChange,
    handleChangeHelper
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

    const isSyncingFromParent = useRef(false);
    const scrollEaseFrame = useRef<number | null>(null);
    const currentTargetScroll = useRef<number | null>(null);
    const userInterrupted = useRef(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    /** Scroll handler */
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

        if (!disabled && !isSyncingFromParent.current && onScrollLeftChange) {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                onScrollLeftChange(el.scrollLeft);
            }, 120);
        }
    }, [disabled, onScrollLeftChange]);

    /** Smooth scroll animation */
    const animateScrollTo = (target: number) => {
        const el = scrollContainerRef.current;
        if (!el) return;

        if (scrollEaseFrame.current) {
            cancelAnimationFrame(scrollEaseFrame.current);
            scrollEaseFrame.current = null;
        }

        const start = el.scrollLeft;
        const distance = target - start;
        if (Math.abs(distance) < 1) return;

        const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 200), 800);
        const startTime = performance.now();
        currentTargetScroll.current = target;

        const easeInOutQuad = (t: number) =>
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const step = (time: number) => {
            if (userInterrupted.current || currentTargetScroll.current !== target) {
                scrollEaseFrame.current = null;
                return;
            }

            const progress = Math.min((time - startTime) / duration, 1);
            el.scrollLeft = start + distance * easeInOutQuad(progress);

            if (progress < 1) {
                scrollEaseFrame.current = requestAnimationFrame(step);
            } else {
                scrollEaseFrame.current = null;
                userInterrupted.current = false;
            }
        };

        scrollEaseFrame.current = requestAnimationFrame(step);
    };

    // User scroll interrupts animation
    useEffect(() => {
        if (disabled) return; // no user scroll when disabled
        const el = scrollContainerRef.current;
        if (!el) return;
        const interrupt = () => {
            userInterrupted.current = true;
        };
        el.addEventListener("wheel", interrupt, {passive: true});
        el.addEventListener("touchstart", interrupt, {passive: true});
        return () => {
            el.removeEventListener("wheel", interrupt);
            el.removeEventListener("touchstart", interrupt);
        };
    }, [disabled]);

    // Sync to scrollLeft if disabled (follower slider)
    useEffect(() => {
        if (!disabled) return;
        const el = scrollContainerRef.current;
        if (!el) return;

        if (Math.abs(el.scrollLeft - scrollLeft) > 1) {
            isSyncingFromParent.current = true;
            animateScrollTo(scrollLeft);
            setTimeout(() => {
                isSyncingFromParent.current = false;
            }, 300);
        }
    }, [scrollLeft, disabled]);

    // Initial scroll on mount
    useEffect(() => {
        if (disabled) return;
        const el = scrollContainerRef.current;
        if (!el) return;

        const totalYears = endYear - startYear;
        const scrollableWidth = el.scrollWidth;
        const containerWidth = el.clientWidth;

        const thumbLeft = ((initialValue - startYear) / totalYears) * scrollableWidth;
        let targetScroll = thumbLeft - containerWidth / 2;
        targetScroll = Math.max(0, Math.min(el.scrollWidth - containerWidth, targetScroll));

        el.scrollLeft = targetScroll;
        if (onScrollLeftChange) onScrollLeftChange(targetScroll);
    }, [disabled, initialValue, startYear, endYear, onScrollLeftChange]);

    // Slider marks
    const marks = [];
    for (let year = startYear; year <= endYear; year++) {
        marks.push({value: year, ...(year % 5 === 0 && {label: `${year}`})});
    }

    /** Scroll one year left or right */
    const scrollOneYear = (direction: "left" | "right") => {
        if (disabled) return; // prevent scrolling if disabled
        const el = scrollContainerRef.current;
        if (!el) return;

        // Get inner track element (slider + highlight overlay)
        const track = el.firstElementChild as HTMLElement | null;
        if (!track) return;

        const totalYears = endYear - startYear;
        const oneYearScroll = track.offsetWidth / totalYears;

        let target =
            (currentTargetScroll.current ?? el.scrollLeft) +
            (direction === "left" ? -oneYearScroll : oneYearScroll);

        target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target));

        // Smooth scroll
        const start = el.scrollLeft;
        const distance = target - start;
        const duration = 300;
        const startTime = performance.now();

        const easeInOutQuad = (t: number) =>
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const step = (time: number) => {
            const progress = Math.min((time - startTime) / duration, 1);
            el.scrollLeft = start + distance * easeInOutQuad(progress);
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    /** Show chevrons only when scrollable */
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const updateArrows = () => {
            setShowLeftArrow(el.scrollLeft > 0);
            setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        };

        updateArrows();
        el.addEventListener("scroll", updateArrows);
        return () => el.removeEventListener("scroll", updateArrows);
    }, []);

    return (
        <Box width={width} height={height} display="flex" alignItems="center" position="relative">
            {!disabled && showLeftArrow && (
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
                    overflowX: disabled ? "hidden" : "auto", // 🔑 disable manual scroll if disabled
                    overflowY: "hidden",
                    whiteSpace: "nowrap",
                    paddingX: 2,
                    mx: 6,
                    position: "relative",
                    ...(disabled && {
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {display: "none"}
                    })
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
                                range.to !== endYear
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
                        rgba(255, 255, 255, 0.7) 0,
                        rgba(255, 255, 255, 0.7) 5px,
                        transparent 10px,
                        transparent 20px
                      )`
                                            : "none",
                                        borderRadius: "3px"
                                    }}
                                />
                            );
                        })}
                    </Box>

                    <Slider
                        disabled={disabled}
                        value={value}
                        min={startYear}
                        max={endYear}
                        step={1}
                        marks={marks}
                        onChange={(_, newValue) => {
                            if (typeof newValue === "number") {
                                setValue(newValue);
                                handleChangeHelper?.(newValue);

                                if (!disabled) {
                                    const el = scrollContainerRef.current;
                                    if (el) {
                                        const containerWidth = el.clientWidth;
                                        const thumbLeft =
                                            ((newValue - startYear) / (endYear - startYear)) *
                                            el.scrollWidth;

                                        const targetScroll = Math.min(
                                            Math.max(0, thumbLeft - containerWidth / 2),
                                            el.scrollWidth - containerWidth
                                        );

                                        isSyncingFromParent.current = true;
                                        animateScrollTo(targetScroll);
                                        setTimeout(() => {
                                            isSyncingFromParent.current = false;
                                        }, 300);
                                    }
                                }
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
                            ...(disabled && {
                                "& .MuiSlider-thumb": {display: "none"}
                            })
                        }}
                    />
                </Box>
            </Box>

            {!disabled && showRightArrow && (
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
