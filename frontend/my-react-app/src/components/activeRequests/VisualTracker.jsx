import React, { useState, useEffect, useRef } from "react";

export default function VisualTracker({
  currentStatus = "PENDING",
  timestamps = {},
  isEmbedded = false,
}) {
  const [isOpen, setIsOpen] = useState(false); // Initially hidden
  const [activeTooltipId, setActiveTooltipId] = useState(null); // Mobile touch support for tooltips

  // Position state for floating icon (freely draggable anywhere on screen)
  const [iconPos, setIconPos] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 90 : 300,
    y: typeof window !== "undefined" ? window.innerHeight - 90 : 500,
  });

  // Magnetic spring-back resistance offset for stepper
  const [rubberOffset, setRubberOffset] = useState({ x: 0, y: 0 });

  const isDraggingIconRef = useRef(false);
  const isDraggingStepperRef = useRef(false);

  const startMouseRef = useRef({ x: 0, y: 0 });
  const startIconPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedIconRef = useRef(false);

  const stepperRef = useRef(null);

  // Keep floating icon within screen bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setIconPos((prev) => ({
        x: Math.max(10, Math.min(prev.x, window.innerWidth - 70)),
        y: Math.max(10, Math.min(prev.y, window.innerHeight - 70)),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click / Touch Outside Listener: Restores floating icon when clicking outside stepper
  useEffect(() => {
    const handleOutsideInteraction = (event) => {
      if (
        isOpen &&
        stepperRef.current &&
        !stepperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveTooltipId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, [isOpen]);

  // Drag Handlers for Floating Icon (Mouse + Touch)
  const handleIconStart = (clientX, clientY) => {
    isDraggingIconRef.current = true;
    hasDraggedIconRef.current = false;
    startMouseRef.current = { x: clientX, y: clientY };
    startIconPosRef.current = { ...iconPos };
  };

  // Drag Handlers for Stepper Resistance (Mouse + Touch)
  const handleStepperStart = (clientX, clientY) => {
    isDraggingStepperRef.current = true;
    startMouseRef.current = { x: clientX, y: clientY };
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      const deltaX = clientX - startMouseRef.current.x;
      const deltaY = clientY - startMouseRef.current.y;

      // Handling Floating Icon Drag (Moves freely on touch/mouse)
      if (isDraggingIconRef.current) {
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
          hasDraggedIconRef.current = true;
        }
        const newX = Math.max(
          10,
          Math.min(window.innerWidth - 70, startIconPosRef.current.x + deltaX)
        );
        const newY = Math.max(
          10,
          Math.min(window.innerHeight - 70, startIconPosRef.current.y + deltaY)
        );
        setIconPos({ x: newX, y: newY });
      }

      // Handling Stepper Drag (Magnetic resistance on touch/mouse)
      if (isDraggingStepperRef.current) {
        const resistedX = Math.sign(deltaX) * Math.min(15, Math.abs(deltaX) * 0.15);
        const resistedY = Math.sign(deltaY) * Math.min(15, Math.abs(deltaY) * 0.15);
        setRubberOffset({ x: resistedX, y: resistedY });
      }
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      isDraggingIconRef.current = false;
      if (isDraggingStepperRef.current) {
        isDraggingStepperRef.current = false;
        setRubberOffset({ x: 0, y: 0 }); // Spring back immediately
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [iconPos]);

  const handleIconClick = (e) => {
    e.stopPropagation();
    if (!hasDraggedIconRef.current) {
      setIsOpen(true);
    }
  };

  const handleMilestoneTap = (stepId, e) => {
    e.stopPropagation();
    setActiveTooltipId((prev) => (prev === stepId ? null : stepId));
  };

  // 5 Vertical Milestones using icons from /assets/
  const steps = [
    {
      id: "PENDING",
      label: "Requested",
      icon: "/assets/requested.png",
      defaultTime: "10:15 AM",
    },
    {
      id: "ACCEPTED",
      label: "Accepted",
      icon: "/assets/accepted.png",
      defaultTime: "10:18 AM",
    },
    {
      id: "PICKED_UP",
      label: "Picked",
      icon: "/assets/picked.png",
      defaultTime: "10:25 AM",
    },
    {
      id: "ARRIVED",
      label: "Arrived",
      icon: "/assets/arrived.png",
      defaultTime: "10:35 AM",
    },
    {
      id: "DELIVERED",
      label: "Delivered",
      icon: "/assets/delivered.png",
      defaultTime: "10:42 AM",
    },
  ];

  const formatStatus = (s) => {
    if (!s) return "";
    const u = s.toUpperCase();
    if (u === "COMPLETED") return "DELIVERED";
    if (u === "PICKED") return "PICKED_UP";
    return u;
  };
  const statusOrder = ["PENDING", "ACCEPTED", "PICKED_UP", "ARRIVED", "DELIVERED"];
  const currentStepIndex = statusOrder.indexOf(formatStatus(currentStatus));
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  // Fully Transparent Vertical Visual Stepper Content Container
  const stepperCard = (
    <div
      onMouseDown={(e) => handleStepperStart(e.clientX, e.clientY)}
      onTouchStart={(e) =>
        e.touches?.length && handleStepperStart(e.touches[0].clientX, e.touches[0].clientY)
      }
      style={{
        transform: `translate3d(${rubberOffset.x}px, ${rubberOffset.y}px, 0)`,
        transition: isDraggingStepperRef.current
          ? "none"
          : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.35)",
      }}
      className="w-fit bg-transparent p-2 relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
      title="Tap milestone for status or drag to feel resistance"
    >
      {/* Vertical Stepper Icons Container */}
      <div className="relative py-1 px-2 space-y-6 flex flex-col items-center">
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const stepTime = timestamps[step.id] || step.defaultTime;
          const isTooltipActive = activeTooltipId === step.id;

          return (
            <div key={step.id} className="relative flex items-center justify-center group">
              {/* Connecting Vertical Line */}
              {index !== steps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-[44px] w-1 h-[calc(100%-16px)] -translate-x-1/2 transition-colors duration-300 z-0 ${
                    index < activeIndex ? "bg-emerald-500" : "bg-gray-300/50"
                  }`}
                />
              )}

              {/* Milestone Icon Container (Click / Touch to toggle tooltip on mobile) */}
              <div
                onClick={(e) => handleMilestoneTap(step.id, e)}
                className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300 shrink-0 cursor-pointer ${
                  isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 shadow-lg ring-4 ring-emerald-500/20 backdrop-blur-xs"
                    : "bg-black/10 border-gray-400/30 opacity-40 backdrop-blur-xs"
                } ${isCurrent ? "scale-110" : ""}`}
              >
                <img
                  src={step.icon}
                  alt={step.label}
                  className={`w-6 h-6 object-contain transition-all duration-300 pointer-events-none ${
                    isCompleted ? "brightness-100 filter drop-shadow-md" : "grayscale opacity-40"
                  }`}
                />
              </div>

              {/* Tooltip Popup Label (Desktop hover + Mobile touch tap support) */}
              <div
                className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none z-30 ${
                  isTooltipActive
                    ? "opacity-100 scale-100"
                    : "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
                }`}
              >
                <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900/90 text-white shadow-xl whitespace-nowrap backdrop-blur-xs border border-gray-700/80 flex items-center gap-1.5">
                  <span className="font-bold text-gray-100">{step.label}</span>
                  <span className="text-gray-400">•</span>
                  {isCompleted ? (
                    <span className="text-emerald-400 font-medium">{stepTime}</span>
                  ) : (
                    <span className="text-amber-400/90 font-medium italic">Not completed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isEmbedded) {
    return stepperCard;
  }

  return (
    <div className="select-none">
       
      {!isOpen ? (
        /* Transparent Draggable Floating Icon Button (Mouse & Touch supported) */
        <div
          onMouseDown={(e) => handleIconStart(e.clientX, e.clientY)}
          onTouchStart={(e) =>
            e.touches?.length && handleIconStart(e.touches[0].clientX, e.touches[0].clientY)
          }
          onClick={handleIconClick}
          style={{
            left: `${iconPos.x}px`,
            top: `${iconPos.y}px`,
 
          }}
          className="fixed z-50 p-2 bg-white/20 backdrop-blur-xs rounded-full border border-emerald-500/50 hover:scale-110 active:scale-95 transition-transform duration-150 focus:outline-none cursor-grab active:cursor-grabbing touch-none flex items-center justify-center opacity-85 hover:opacity-100 shadow-md"
          title="Drag me anywhere or tap to reveal status"
        >
          <img
            src="/assets/visual_steeper.png"
            alt="Visual Stepper Icon"
            className="w-10 h-10 object-contain rounded-full pointer-events-none select-none drop-shadow-sm opacity-90"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white pointer-events-none animate-pulse"></span>
        </div>
      ) : (
        /* Transparent Vertical Stepper (Fixed on right side of viewport with drag resistance) */
        <div
          ref={stepperRef}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-right duration-300  "
        >
          {stepperCard}
        </div>
      )}
    </div>
  );
}
