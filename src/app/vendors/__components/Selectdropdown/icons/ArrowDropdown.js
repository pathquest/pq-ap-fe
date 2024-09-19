import React from "react";

function ArrowDropdown() {
  return (
    <div>
      <svg
        className="w-3 h-3 text-gray-800"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 8"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"
        />
      </svg>
    </div>
  );
}

export { ArrowDropdown };
