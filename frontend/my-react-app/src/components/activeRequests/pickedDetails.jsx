import React from "react";

export default function PickedDetails({ task, onBack }) {
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
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
          PICKED UP
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Parcel Picked Up
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Item: <span className="font-semibold text-gray-700">{details?.item_name || "Package"}</span>
        </p>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
          Next Step: Heading to Destination
        </h3>
        <p className="text-xs text-amber-800">
          Deliver to Block {details?.block || "N/A"}, Floor {details?.floor || "N/A"}, Room {details?.room || "N/A"}
        </p>
      </div>

      {requester_id?.phone && (
        <a
          href={`tel:${requester_id.phone}`}
          className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          Call Requester ({requester_id.name || "Requester"})
        </a>
      )}
    </div>
  );
}
