import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setReceiverAccepted } from "../../redux/receiverAccepted";
import { setReceiverTab } from "../../redux/receiverTab";

export default function LiveReq({pickup}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startDragXRef = useRef(0);
  const dispatch = useDispatch();
 

  const TRACK_WIDTH = 320; // width of yellow bar in px
  const HANDLE_SIZE = 56;  // size of red circular slider knob in px
  const PADDING = 4;       // padding inside the yellow bar
  const MAX_DRAG = TRACK_WIDTH - HANDLE_SIZE - PADDING * 2;

  const handleStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    startDragXRef.current = dragX;
  };

  const handleMouseDown = (e) => {
    handleStart(e.clientX);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      handleStart(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging) return;
      const deltaX = clientX - startXRef.current;
      const newX = Math.max(0, Math.min(MAX_DRAG,  deltaX));
      setDragX(newX);
    };

    const handleMouseMove = (e) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = async() => {
     try{ if (!isDragging) return;
      setIsDragging(false);

      if (dragX >= MAX_DRAG * 0.85) {
        setDragX(MAX_DRAG);
          
          const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}pickup/accepted`,
  { pickupId: pickup._id } 
      );  
      if(response)
         {
           alert("accepted");
           dispatch(setReceiverAccepted(true))
           dispatch(setReceiverTab("active")); 
           setDragX(0);}
        } 
       else {
        setDragX(0);
      }}catch (err) {
            const serverMessage = err.response?.data?.message;
      
            if (
              serverMessage === "User is banned" ||
              serverMessage === "Device is banned"
            ) {
              dispatch(ban());
              return;
            }
            if (
              serverMessage ===
              "Device is suspected need further verification.please verify face"
            ) {
              dispatch(suspect());
              return;
            }
            if (serverMessage === "session expired") {
              dispatch(setIsAuthenticated(false));
              return;
            }
      
            console.error("Error while  accepting:", err);
          }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging,dragX, MAX_DRAG]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-4 space-y-4 my-3">
      {/* Pickup Request Details Card */}
      <div
        key={pickup._id}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100"
      >
        {/* Vendor */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
            Vendor
          </span>
          <span className="font-semibold text-gray-800 text-sm mt-0.5">
            {pickup.details.vendor}
          </span>
        </div>

        {/* Destination */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
            Deliver To
          </span>
          <span className="inline-block w-fit px-2.5 py-0.5 mt-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            {pickup.details.block}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            Floor {pickup.details.floor}, Room {pickup.details.room}
          </span>
        </div>

        {/* Weight */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
            Weight
          </span>
          <span className="inline-block w-fit px-2.5 py-0.5 mt-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
            {pickup.details.item_weight} kg
          </span>
        </div>

        {/* ETA */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
            ETA
          </span>
          <span className="inline-block w-fit mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            {pickup.details.arrival_time} min
          </span>
        </div>
      </div>

      {/* Slide to Accept Slider Track */}
      <div className="flex justify-center">
        <div
          className="relative bg-amber-400 rounded-full flex items-center justify-center shadow-inner select-none overflow-hidden"
          style={{ width: `${TRACK_WIDTH}px`, height: `${HANDLE_SIZE + PADDING * 2}px` }}
        >
          {/* Text inside the yellow bar */}
          <span
            className="text-gray-900 font-bold text-xs sm:text-sm tracking-wider uppercase transition-opacity duration-200 pointer-events-none"
            style={{ opacity: 1 - dragX / MAX_DRAG }}
          >
            Slide right to accept &gt;&gt;
          </span>

          {/* Red circular slider handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="absolute top-1/2 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing touch-none z-10"
            style={{
              left: `${PADDING}px`,
              width: `${HANDLE_SIZE}px`,
              height: `${HANDLE_SIZE}px`,
              transform: `translate3d(${dragX}px, -50%, 0)`,
              transition: isDragging ? "none" : "transform 0.25s ease-out",
            }}
          >
            <svg className="w-6 h-6 fill-current text-white pointer-events-none" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}


 
