import React, { useState, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { ban } from "../../redux/banCheck.js";
import { suspect } from "../../redux/checkSuspect.js";
import { setIsAuthenticated } from "../../redux/authentication.js";
import ConfirmSlider from "./ConfirmSlider.jsx";

function UploadWidget({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const authentication = useSelector((state) => state.authentication.value);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const uploadToCloudinary = async (file) => {
    setLoading(true);
    try {
      const sigRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}upload-signature`,
        {
          headers: {
            Authorization: `Bearer ${authentication?.token}`,
          },
        }
      );
      const { signature, timestamp, apiKey } = sigRes.data;

      const data = new FormData();
      data.append("file", file);
      data.append("signature", signature);
      data.append("timestamp", timestamp);
      data.append("api_key", apiKey);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        data,
        { withCredentials: false }
      );

      const url = res.data.secure_url;
      setUploadedUrl(url);
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message;

      if (serverMessage === "User is banned" || serverMessage === "Device is banned") {
        dispatch(ban());
        return;
      }
      if (serverMessage === "Device is suspected need further verification.please verify face  ") {
        dispatch(suspect());
        return;
      }
      if (serverMessage === "session expired") {
        dispatch(setIsAuthenticated(false));
        return;
      }
      console.error("Cloudinary upload failed:", error);
      setFileName("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      uploadToCloudinary(selectedFile);
    }
  };

  return (
    <div className="flex flex-col gap-2 my-2">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
        Upload Pickup Proof / Receipt
      </label>
      <div
        onClick={() => !loading && fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          loading
            ? "bg-gray-100 border-gray-300 cursor-not-allowed"
            : uploadedUrl
            ? "bg-emerald-50/50 border-emerald-400"
            : "border-gray-300 hover:border-amber-500 hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-medium">Uploading {fileName}...</span>
          </div>
        ) : uploadedUrl ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={uploadedUrl}
              alt="Pickup proof"
              className="w-full max-h-32 object-cover rounded-lg border border-emerald-200 shadow-xs"
            />
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Image Uploaded Successfully!</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 flex flex-col items-center gap-1.5 py-2">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold text-gray-600">Click to upload pickup receipt/proof image</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PickedDetails({ task, onBack, onConfirmPicked }) {
  const [proofUrl, setProofUrl] = useState("");

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 mb-4">No task details available.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const { details, requester_id } = task;

  const handleConfirmPicked = async () => {
    if (onConfirmPicked) {
      await onConfirmPicked({ ...task, pickupProofUrl: proofUrl });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Pickup Stage
        </span>
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

      {/* Cloudinary Upload Widget */}
      <UploadWidget onUploadSuccess={(url) => setProofUrl(url)} />

      {/* Slide to Confirm Picked Up Slider (Locked until image is uploaded) */}
      <ConfirmSlider
        text="Slide right to confirm Picked Up >>"
        disabled={!proofUrl}
        disabledText="Upload image to unlock >>"
        onConfirm={handleConfirmPicked}
        trackBgClass="bg-amber-400"
        knobBgClass="bg-red-600 hover:bg-red-700"
      />

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
