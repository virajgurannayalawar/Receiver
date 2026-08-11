
import { useEffect, useState } from "react";
import axios from "axios";

export default function Active() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}pickup/activeTask`
        );
        if (response.data.activeTasks) {
          setActiveTasks(response.data.activeTasks);
        }
      } catch (err) {
        console.error("Failed to fetch active tasks:", err);
        setError("Failed to load active tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTasks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <main className="grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-4">
          <h2 className="text-xl font-bold text-center mb-4">Active Tasks</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading active tasks...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : activeTasks.length === 0 ? (
            <p className="text-center text-gray-500">No active tasks found.</p>
          ) : (
            activeTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white p-4 rounded-xl shadow border border-gray-100 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 text-base">
                    {task.details?.item_name || "Pickup Item"}
                  </span>
                  <span className="px-2.5 py-1 text-xs bg-emerald-100 text-emerald-700 font-bold rounded-full">
                    {task.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-semibold">Vendor:</span> {task.details?.vendor}</p>
                  <p><span className="font-semibold">Delivery Partner:</span> {task.details?.delivery_partner}</p>
                  <p><span className="font-semibold">Destination:</span> Block {task.details?.block}, Floor {task.details?.floor}, Room {task.details?.room}</p>
                  <p><span className="font-semibold">Weight:</span> {task.details?.item_weight} kg</p>
                  <p><span className="font-semibold">ETA:</span> {task.details?.arrival_time} min</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}