
import { useEffect, useState } from "react";
import axios from "axios";

export default function Active() {
  const [activeReqs, setActiveReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}pickup/activeReq`
        );
        if (response.data.activeReqs) {
          setActiveReqs(response.data.activeReqs);
        }
      } catch (err) {
        console.error("Failed to fetch active requests:", err);
        setError("Failed to load active requests");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRequests();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <main className="grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-4">
          <h2 className="text-xl font-bold text-center mb-4">Your Active Pickup Requests</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading active requests...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : activeReqs.length === 0 ? (
            <p className="text-center text-gray-500">No active pickup requests found.</p>
          ) : (
            activeReqs.map((req) => (
              <div
                key={req._id}
                className="bg-white p-4 rounded-xl shadow border border-gray-100 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 text-base">
                    {req.details?.item_name || "Pickup Item"}
                  </span>
                  <span className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 font-bold rounded-full">
                    {req.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-semibold">Vendor:</span> {req.details?.vendor}</p>
                  <p><span className="font-semibold">Delivery Partner:</span> {req.details?.delivery_partner}</p>
                  <p><span className="font-semibold">Destination:</span> Block {req.details?.block}, Floor {req.details?.floor}, Room {req.details?.room}</p>
                  <p><span className="font-semibold">Weight:</span> {req.details?.item_weight} kg</p>
                  <p><span className="font-semibold">ETA:</span> {req.details?.arrival_time} min</p>
                  {req.receiver_id && (
                    <p><span className="font-semibold text-emerald-600">Assigned Receiver:</span> {req.receiver_id.name || req.receiver_id.email}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}