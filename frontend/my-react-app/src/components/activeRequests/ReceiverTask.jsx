import React from "react";
import DummyStepper from "../dummy.jsx";

export default function ReceiverTask({ task, onBack }) {
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

    const { details, requester_id, status, createdAt, _id } = task;

    return (
        <div className="w-full max-w-md mx-auto space-y-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between border-b pb-3">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </button>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    {status || "ACTIVE"}
                </span>
            </div>

            {/* Title */}
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                    {details?.item_name || "Pickup Package"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Task ID: {_id || "N/A"}</p>
            </div>

            {/* Item & Partner Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                        Vendor
                    </span>
                    <span className="text-sm font-semibold text-gray-800 mt-1 block">
                        {details?.vendor || "N/A"}
                    </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                        Delivery Partner
                    </span>
                    <span className="text-sm font-semibold text-gray-800 mt-1 block">
                        {details?.delivery_partner || "N/A"}
                    </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                        Package Weight
                    </span>
                    <span className="text-sm font-semibold text-amber-700 mt-1 block">
                        {details?.item_weight ? `${details.item_weight} kg` : "N/A"}
                    </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                        Est. Arrival Time
                    </span>
                    <span className="text-sm font-semibold text-emerald-700 mt-1 block">
                        {details?.arrival_time ? `${details.arrival_time} mins` : "N/A"}
                    </span>
                </div>
            </div>

            {/* Destination Details */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    Delivery Destination
                </h3>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                        <span className="text-[10px] text-gray-400 block font-medium">Block</span>
                        <span className="text-sm font-bold text-blue-800">
                            {details?.block || "N/A"}
                        </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                        <span className="text-[10px] text-gray-400 block font-medium">Floor</span>
                        <span className="text-sm font-bold text-blue-800">
                            {details?.floor || "N/A"}
                        </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                        <span className="text-[10px] text-gray-400 block font-medium">Room</span>
                        <span className="text-sm font-bold text-blue-800">
                            {details?.room || "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Requester Contact Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Requester Info
                </h3>
                <div className="text-xs space-y-1.5 text-gray-700">
                    <p className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="font-semibold text-gray-800">
                            {requester_id?.name || "N/A"}
                        </span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="font-semibold text-gray-800">
                            {requester_id?.phone || "N/A"}
                        </span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                            {requester_id?.email || "N/A"}
                        </span>
                    </p>
                </div>
            </div>

            {/* Optional Screenshot */}
            {details?.screenshot_url && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                        Pickup Screenshot / Receipt
                    </span>
                    <img
                        src={details.screenshot_url}
                        alt="Pickup screenshot"
                        className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                    />
                </div>
            )}

            {/* Timestamps */}
            {createdAt && (
                <div className="text-center text-[11px] text-gray-400 pt-1">
                    Accepted / Created: {new Date(createdAt).toLocaleString()}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                {requester_id?.phone && (
                    <a
                        href={`tel:${requester_id.phone}`}
                        className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
                    >
                        Call Requester
                    </a>
                )}
                <button
                    onClick={onBack}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition"
                >
                    Close Details
                </button>
            </div>
        </div>
    );
}
