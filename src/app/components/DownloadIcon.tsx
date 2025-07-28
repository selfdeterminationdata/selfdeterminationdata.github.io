import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DescriptionIcon from '@mui/icons-material/Description';

const FileDownloadIcon: React.FC = () => {
    const handleClick = () => {
        console.log("clicked");
    };

    return (
        <Tooltip title="Coding Notes" arrow>
            <IconButton onClick={handleClick} aria-label="download coding file">
                <DescriptionIcon />
            </IconButton>
        </Tooltip>
    );
};

export default FileDownloadIcon;
