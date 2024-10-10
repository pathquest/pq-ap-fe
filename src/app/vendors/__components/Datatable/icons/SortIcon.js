import React from "react";

function SortIcon({ order }) {
  return (
    <div>
      <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="sorting">
          <path id="Polygon 3" d="M3.50007 0L6.53116 3H0.46898L3.50007 0Z"
            fill={order === "asc" ? "#333" : "#6E6D7A"}
          />
          <path id="Polygon 3_2" d="M3.5 10L0.468911 7L6.53109 7L3.5 10Z"
            fill={order === "desc" ? "#333" : "#6E6D7A"}
          />
        </g>
      </svg>
    </div>
  );
}

export default SortIcon;