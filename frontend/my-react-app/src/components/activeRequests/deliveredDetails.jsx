import React from "react";

export default function DeliveredDetails({ task, onBack }) {
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 mb-4">No task details available.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const { details } = task;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Delivery Stage
        </span>
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
          DELIVERED & COMPLETED
        </span>
      </div>

      <div className="text-center py-4 space-y-2">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Delivery Completed!
        </h2>
        <p className="text-xs text-gray-500">
          Package successfully handed over for item: <span className="font-semibold text-gray-700">{details?.item_name || "Package"}</span>
        </p>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer"
        >
          Return to Task List
        </button>
      )}
    </div>
  );
}
