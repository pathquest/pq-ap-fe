import React from 'react';
import AccDownArrow from '@/assets/Icons/practice_dashboard/AccDownArrow'
import AccUpArrow from '@/assets/Icons/practice_dashboard/AccUpArrow'

const DashboardAccordion = ({ title, children, onToggle, isOpen }:any) => {
  return (
    <div className="border border-[#D8D8D8] rounded-md w-full mb-4">
      <div
        className="sticky cursor-pointer bg-[#F6F6F6] py-3 px-4 flex justify-between items-center"
        onClick={onToggle}
      >
        <span className="text-[16px] font-semibold">{title}</span>
        <span>{isOpen ? <AccDownArrow /> : <AccUpArrow />}</span>
      </div>
      {isOpen && <div className="p-2 overflow-auto custom-scroll h-[calc(100vh-250px)] flex flex-col">{children}</div>}
    </div>
  );
};

export default DashboardAccordion;