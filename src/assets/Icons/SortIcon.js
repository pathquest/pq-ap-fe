import React from 'react'

const SortIcon = ({ order, orderColumn, sortedColumn, isHovered }) => {
    const isActive = orderColumn == sortedColumn

    return (
        <>{isHovered && !isActive
            ? <div className={`flex flex-col gap-1 mb-0.5`}>
                <svg width="7" height="3" viewBox="0 0 7 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 0L6.53109 3H0.468911L3.5 0Z" fill="#CCD2D4" />
                </svg>
                <svg width="7" height="3" viewBox="0 0 7 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 3L0.468911 -9.41288e-08L6.53109 4.35844e-07L3.5 3Z" fill="#CCD2D4" />
                </svg>
            </div>
            : <div className={`${isActive ? "visible" : "invisible"} flex flex-col gap-1 mb-0.5`}>
                <svg width="7" height="3" viewBox="0 0 7 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 0L6.53109 3H0.468911L3.5 0Z" fill={order == "0" && isActive ? "#333333" : "#CCD2D4"} />
                </svg>
                <svg width="7" height="3" viewBox="0 0 7 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 3L0.468911 -9.41288e-08L6.53109 4.35844e-07L3.5 3Z" fill={order == "1" && isActive ? "#333333" : "#CCD2D4"} />
                </svg>
            </div>}
        </>)
}

export default SortIcon