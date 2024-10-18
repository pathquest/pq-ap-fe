import React from 'react'
import Tooltip from '@mui/joy/Tooltip'

interface ToolTipProps {
    content: any;
    children: any;
    position?: string
}

const CustomTooltip: React.FC<ToolTipProps> = ({ content, position = "bottom", children }) => {
    return (
        <Tooltip variant="plain" placement="bottom" arrow title={content} size="lg" sx={{
            backgroundColor: "#92EADC",
            border: "1px solid #02B89D",
            color: "#333333",
            borderRadius: "6px",
            letterSpacing: "0.02em",
            fontFamily: '"Proxima Nova", sans-serif',
            fontSize: '16px',
            maxWidth: "500px",
            // cursor: "pointer",
            // "& .css-rmsoiq-JoyTooltip-arrow::before": {
            //   borderColor: "#92EADC",
            // },
            '& .MuiTooltip-arrow': {
                color: "#333333",
                '&::before': {
                    width: "100%",
                    height: "100%",
                    borderRadius: "0px",
                    border: "1px solid",
                    borderColor: "#02B89D #02B89D transparent transparent",
                    backgroundColor: "#92EADC",
                    color: "#92EADC"
                },
            },
        }}>
            <span>
                {children}
            </span>
        </Tooltip>
    )
}

export default CustomTooltip