import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DescriptionIcon from "@mui/icons-material/Description";

interface FileDownloadIconProps {
    searchSelection: string | null;
}

const FileDownloadIcon: React.FC<FileDownloadIconProps> = ({searchSelection}) => {
    const handleClick = async () => {
        if (!searchSelection) return;

        // Convert blob URL to raw URL
        const rawUrl = `https://raw.githubusercontent.com/selfdeterminationdata/selfdeterminationmovement/main/coding%20notes/${searchSelection}.pdf`;

        try {
            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error("File not found");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${searchSelection}.pdf`; // Force download
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
        }
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
