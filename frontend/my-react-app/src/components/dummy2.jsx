import React, { useState, useRef, useEffect } from "react";

function Dummy() {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const startDragXRef = useRef(0);

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

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      if (dragX >= MAX_DRAG * 0.85) {
        setDragX(MAX_DRAG);
        setTimeout(() => {
          alert("accepted");
          setDragX(0);
        }, 50);
      } else {
        setDragX(0);
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center select-none p-4">
      <div
        ref={trackRef}
        className="relative bg-yellow-400 rounded-full flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
        style={{ width: `${TRACK_WIDTH}px`, height: `${HANDLE_SIZE + PADDING * 2}px` }}
      >
        {/* Text inside the yellow bar */}
        <span
          className="text-gray-800 font-bold text-sm tracking-wider uppercase transition-opacity duration-200"
          style={{ opacity: 1 - dragX / MAX_DRAG }}
        >
          Slide right to accept &gt;&gt;
        </span>

        {/* Red circular slider handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute top-1/2 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing touch-none"
          style={{
            left: `${PADDING}px`,
            width: `${HANDLE_SIZE}px`,
            height: `${HANDLE_SIZE}px`,
            transform: `translate3d(${dragX}px, -50%, 0)`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
          }}
        >
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Dummy;
