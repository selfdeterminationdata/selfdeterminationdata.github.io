import React, { useRef, useState, useEffect } from "react";
import { Slider, Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

type TimeLineSliderProps = {
  width?: string;
  height?: string;
  startYear: number;
  endYear: number;
  backgroundColor?: string;
  initialValue?: number;
  setCurrentYear: (value: number) => void;
};

const TimeLineSlider: React.FC<TimeLineSliderProps> = ({
  width = "100%",
  height = "120px",
  startYear,
  endYear,
  backgroundColor = "#1976d2",
  initialValue = 1945,
  setCurrentYear
}) => {
  const [value, setValue] = useState<number>(initialValue);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleChange = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setValue(newValue);
      setCurrentYear(newValue);
    }
  };

  const marks = [];
  for (let year = startYear; year <= endYear; year += 5) {
    marks.push({ value: year, label: `${year}` });
  }

  const scrollBy = (offset: number) => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: offset, behavior: "smooth" });
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

  return (
    <Box
      width={width}
      height={height}
      display="flex"
      alignItems="center"
      position="relative"
    >
      {showLeftArrow && (
        <IconButton onClick={() => scrollBy(-200)} sx={{ position: "absolute", left: 0 }}>
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
            minWidth: "600px"
          }}
        >
          <Slider
            value={value}
            min={startYear}
            max={endYear}
            step={1}
            marks={marks}
            onChange={handleChange}
            valueLabelDisplay="auto"
            sx={{
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
              }
            }}
          />
        </Box>
      </Box>

      {showRightArrow && (
        <IconButton onClick={() => scrollBy(200)} sx={{ position: "absolute", right: 0 }}>
          <ChevronRight fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default TimeLineSlider;


