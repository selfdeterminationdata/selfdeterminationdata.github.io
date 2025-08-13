import React, { useRef, useState, useEffect, useId } from "react";
import { Slider, Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useScrollStore } from "./scrollStore";

type HighlightRange = {
  from: number;
  to: number;
  claim?: string | null;
  violence?: boolean | null;
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
  backgroundColor = "#663399",
  initialValue = 1945,
  highlightRanges,
  handleChangeHelper,
}) => {
  const [value, setValue] = useState<number>(initialValue);

  // Unique ID for scroll sync
  const id = useId();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollLeft, setScrollLeft, lastSource } = useScrollStore();

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleChange = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      if (handleChangeHelper != null) {
        handleChangeHelper(newValue);
      }
      setValue(newValue);
    }
  };

  const legendItems = [
    { label: "Autonomy", color: "#90ee90" },
    { label: "Sub-state secession", color: "#006400" },
    { label: "Independence", color: "#add8e6" },
    { label: "Irredentism", color: "#00008b" },
  ];

  const generateBackgroundColor = (highlightRangesProp: HighlightRange) => {
    const findIndex = legendItems.findIndex(
      (el) => el.label === highlightRangesProp?.claim
    );
    return findIndex !== -1 ? legendItems[findIndex]?.color : "#A9A9A9";
  };

  const marks = [];
  for (let year = startYear; year <= endYear; year++) {
    const showLabel = year % 5 === 0;
    marks.push({
      value: year,
      ...(showLabel && { label: `${year}` }),
    });
  }

  const scrollBy = (offset: number) => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: offset, behavior: "smooth" });
      setScrollLeft(el.scrollLeft + offset, id);
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft, id);
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  // Listen for scroll updates from other sliders
  useEffect(() => {
    if (lastSource === id) return; // ignore if we triggered the update
    const el = scrollContainerRef.current;
    if (el && el.scrollLeft !== scrollLeft) {
      el.scrollLeft = scrollLeft;
    }
  }, [scrollLeft, lastSource, id]);

  useEffect(() => {
    handleScroll();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <Box width={width} height={height} display="flex" alignItems="center" position="relative">
      {showLeftArrow && (
        <IconButton
          onClick={() => scrollBy(-200)}
          sx={{ position: "absolute", left: 0, zIndex: 10 }}
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
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: `${(endYear - startYear) * 30}px`,
            minWidth: "600px",
            position: "relative",
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
              zIndex: 1,
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
                            rgba(255, 255, 255, 0.7) 0,
                            rgba(255, 255, 255, 0.7) 5px,
                            transparent 10px,
                            transparent 20px
                          )`
                      : "none",
                    borderRadius: "3px",
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
            onChange={handleChange}
            valueLabelDisplay="auto"
            sx={{
              position: "relative",
              zIndex: 2,
              color: backgroundColor,
              "& .MuiSlider-markLabel": {
                fontSize: "0.75rem",
              },
              "& .MuiSlider-valueLabel": {
                fontSize: "0.7rem",
                backgroundColor: backgroundColor,
                padding: "2px 6px",
                borderRadius: "4px",
                top: 40,
                "&:before": {
                  transform: "scale(0.6)",
                },
              },
              ...(disable && {
                "& .MuiSlider-thumb": {
                  display: "none",
                },
              }),
            }}
          />
        </Box>
      </Box>

      {showRightArrow && (
        <IconButton
          onClick={() => scrollBy(200)}
          sx={{ position: "absolute", right: 0, zIndex: 10 }}
          aria-label="Scroll right"
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default TimeLineSlider;
