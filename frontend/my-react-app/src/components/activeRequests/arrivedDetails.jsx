import React from "react";

export default function ArrivedDetails({ task, onBack }) {
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

  const { details, requester_id } = task;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between border-b pb-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            &larr; Back
          </button>
        )}
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
          ARRIVED AT LOCATION
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Arrived at Destination
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          You are at Block {details?.block || "N/A"}, Floor {details?.floor || "N/A"}, Room {details?.room || "N/A"}
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
          Notify Requester
        </h3>
        <p className="text-xs text-blue-800">
          Contact {requester_id?.name || "Requester"} to hand over the parcel.
        </p>
      </div>

      {requester_id?.phone && (
        <a
          href={`tel:${requester_id.phone}`}
          className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          Call {requester_id.name || "Requester"}
        </a>
      )}
    </div>
  );
}
