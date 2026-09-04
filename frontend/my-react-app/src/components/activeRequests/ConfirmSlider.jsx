import React, { useState, useRef, useEffect } from "react";

export default function ConfirmSlider({
  text = "Slide right to confirm >>",
  onConfirm,
  disabled = false,
  disabledText = "Upload image to unlock >>",
  trackBgClass = "bg-amber-400",
  knobBgClass = "bg-red-600 hover:bg-red-700",
  trackWidth = 320,
  handleSize = 56,
  padding = 4
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const startXRef = useRef(0);
  const startDragXRef = useRef(0);

  const maxDrag = trackWidth - handleSize - padding * 2;

  const handleStart = (clientX) => {
    if (disabled || isConfirmed) return;
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
      if (!isDragging || isConfirmed || disabled) return;
      const deltaX = clientX - startXRef.current;
      const newX = Math.max(0, Math.min(maxDrag, deltaX));
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

    const handleEnd = async () => {
      if (!isDragging || isConfirmed || disabled) return;
      setIsDragging(false);

      if (dragX >= maxDrag * 0.85) {
        setDragX(maxDrag);
        setIsConfirmed(true);
        try {
          if (onConfirm) {
            await onConfirm();
          }
        } catch (err) {
          console.error("Slider confirm error:", err);
          setIsConfirmed(false);
          setDragX(0);
        }
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
  }, [isDragging, dragX, maxDrag, isConfirmed, disabled, onConfirm]);

  const currentTrackBg = disabled ? "bg-gray-200 border border-gray-300" : trackBgClass;
  const currentKnobBg = disabled ? "bg-gray-400 cursor-not-allowed opacity-80" : knobBgClass;
  const displayText = isConfirmed ? "Confirmed ✓" : disabled ? disabledText : text;

  return (
    <div className="flex flex-col items-center my-3 select-none">
      <div
        className={`relative ${currentTrackBg} rounded-full flex items-center justify-center shadow-inner overflow-hidden transition-colors duration-200`}
        style={{ width: `${trackWidth}px`, height: `${handleSize + padding * 2}px` }}
      >
        {/* Text inside the bar */}
        <span
          className={`font-bold text-xs sm:text-sm tracking-wider uppercase transition-opacity duration-200 pointer-events-none px-4 text-center truncate ${
            disabled ? "text-gray-400 font-medium" : "text-gray-900"
          }`}
          style={{ opacity: 1 - dragX / maxDrag }}
        >
          {displayText}
        </span>

        {/* Circular slider handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`absolute top-1/2 ${currentKnobBg} rounded-full flex items-center justify-center text-white shadow-md touch-none z-10 ${
            disabled ? "" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{
            left: `${padding}px`,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            transform: `translate3d(${dragX}px, -50%, 0)`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
          }}
        >
          {isConfirmed ? (
            <svg className="w-6 h-6 fill-current text-white pointer-events-none" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : disabled ? (
            <svg className="w-5 h-5 fill-current text-white pointer-events-none" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 fill-current text-white pointer-events-none" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          )}
        </div>
      </div>
      {disabled && (
        <span className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
          🔒 Upload pickup proof image to unlock slider
        </span>
      )}
    </div>
  );
}
