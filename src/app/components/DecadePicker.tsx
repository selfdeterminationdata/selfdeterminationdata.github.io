import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

const decades = [
    "1940-1950",
    "1950-1960",
    "1960-1970",
    "1970-1980",
    "1980-1990",
    "1990-2000",
    "2000-2010",
    "2010-2020"
];

export default function DecadePicker() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedDecade, setSelectedDecade] = React.useState("1960-1970");
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (decade?: string) => {
        if (decade) {
            setSelectedDecade(decade);
        }
        setAnchorEl(null);
    };

    return (
        <div style={{paddingTop: "10px", paddingLeft: "8px"}}>
            <Button
                id="fade-button"
                aria-controls={open ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    borderRadius: "30px",
                    textTransform: "none",
                    color: "black",
                    borderColor: "#ccc"
                }}
            >
                {selectedDecade}
            </Button>

            <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                TransitionComponent={Fade}
                MenuListProps={{
                    "aria-labelledby": "fade-button"
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        mt: 1,
                        maxHeight: "30vh", // 50% of viewport height
                        overflowY: "auto"
                    }
                }}
            >
                {decades.map((decade) => (
                    <MenuItem
                        key={decade}
                        onClick={() => handleClose(decade)}
                        sx={{color: "black"}}
                    >
                        {decade}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
