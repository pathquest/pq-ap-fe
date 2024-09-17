import React from 'react'

const PlusCircleIcon = ({ bgColor, variant, size }) => {
    return (
        <>
            <div className={variant === "remove" ? 'rotate-45' : ""}>
                {size === "small"
                    ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke={bgColor} />
                            <path d="M15.1227 12.328H12.6167V15.17H11.3987V12.328H8.87866V11.222H11.3987V8.492H12.6167V11.222H15.1227V12.328Z" fill={bgColor} />
                        </g>
                    </svg>
                    : <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke={bgColor} />
                            <path d="M22.4609 18.04H18.8809V22.1H17.1409V18.04H13.5409V16.46H17.1409V12.56H18.8809V16.46H22.4609V18.04Z" fill={bgColor} />
                        </g>
                    </svg>
                }

            </div>
        </>
    )
}

export default PlusCircleIcon