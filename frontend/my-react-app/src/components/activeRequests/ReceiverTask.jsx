import React, { useState } from "react";
import MapComponent from "./map.jsx";
import ParcelDetails from "./parcelDetails.jsx";
import PickedDetails from "./pickedDetails.jsx";
import ArrivedDetails from "./arrivedDetails.jsx";
import DeliveredDetails from "./deliveredDetails.jsx";

export default function ReceiverTask({ task, onBack }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(1);

  const handleNonPopupAreaClick = () => {
    setIsExpanded(false);
  };

  const handlePopupContentClick = (e) => {
    e.stopPropagation();
  };

  const handleTabClick = (tabNum, e) => {
    e.stopPropagation();
    setActiveTab(tabNum);
  };

  const tabs = [
    {
      id: 1,
      icon: <img src="/assets/parcel.png" alt="Parcel" className="w-7 h-7 object-contain" />
    },
    {
      id: 2,
      icon: <img src="/assets/picked.png" alt="Picked" className="w-7 h-7 object-contain" />
    },
    {
      id: 3,
      icon: <img src="/assets/arrived.png" alt="Arrived" className="w-7 h-7 object-contain" />
    },
    {
      id: 4,
      icon: <img src="/assets/delivered.png" alt="Delivered" className="w-7 h-7 object-contain" />
    }
  ];

  return (
    <div className="fixed top-16 inset-x-0 bottom-0 z-30 flex flex-col justify-end overflow-hidden">
      {/* Top-left Back Button (positioned below Nav Bar) */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-40 bg-white/90 hover:bg-white text-gray-800 px-3.5 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer pointer-events-auto backdrop-blur-md"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Map rendered in background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <MapComponent />
      </div>

      {/* Backdrop overlay */}
      <div
        onClick={handleNonPopupAreaClick}
        className={`fixed top-16 inset-x-0 bottom-0 pointer-events-auto transition-opacity duration-300 cursor-pointer ${isExpanded ? 'bg-black/30 backdrop-blur-[1px]' : 'bg-transparent pointer-events-none'
          }`}
      />

      {/* Bottom Sheet Drawer */}
      <div
        onClick={handlePopupContentClick}
        style={{ height: isExpanded ? '70vh' : '20vh' }}
        className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 pointer-events-auto transition-all duration-300 ease-in-out flex flex-col overflow-hidden select-none"
      >
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full py-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100 shrink-0"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="w-full bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-around shrink-0 z-20 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => handleTabClick(tab.id, e)}
              className={`flex-1 flex items-center justify-center py-2 px-2 mx-1 rounded-xl transition-all cursor-pointer ${activeTab === tab.id
                  ? 'bg-blue-50 border border-blue-200 scale-105 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent'
                }`}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 1 && <ParcelDetails task={task} onBack={onBack} />}
          {activeTab === 2 && <PickedDetails task={task} onBack={onBack} />}
          {activeTab === 3 && <ArrivedDetails task={task} onBack={onBack} />}
          {activeTab === 4 && <DeliveredDetails task={task} onBack={onBack} />}
        </div>
      </div>
    </div>
  );
}
