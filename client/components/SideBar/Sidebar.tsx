"use client";

import { useState } from "react";
import PlanInfo from "./planInfo";
import ViewRouter from "./viewRouter";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className={`
        relative h-full bg-white shadow-xl z-[1000]
        transition-[width] duration-300 ease-in-out
        ${isOpen ? "w-[30%] min-w-[0px]" : "w-0"}
      `}
      aria-label="Sidebar"
    >
      <button
        onClick={() => {setIsOpen(prev => !prev)}}
        className={`
          absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2
          flex items-center justify-center
          w-10 h-10
          bg-white border border-gray-200 rounded-full shadow-md
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-transform duration-300
          z-[1001]
        `}
        aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? (
          // Chevron Left (Collapse)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        ) : (
          // Chevron Right (Expand)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </button>

      <div className="h-full w-full overflow-hidden">
        <div className="w-[30vw] min-w-[0px] h-full p-6 flex flex-col">
          <PlanInfo/>
          <ViewRouter/>
        </div>
      </div>
    </aside>
  );
}