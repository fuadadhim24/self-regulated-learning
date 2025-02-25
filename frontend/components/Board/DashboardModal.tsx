import { useEffect, useState } from "react";
import { getProgressReport } from "@/utils/api";
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ProgressReport {
    total_cards: number;
    done_cards: number;
    progress_percentage: number;
    list_report: Record<string, number>;
}

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchProgressReport = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated");
                    return;
                }

                const response = await getProgressReport(token);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch progress report");
                }

                const data: ProgressReport = await response.json();
                setProgress(data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchProgressReport();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={onClose} // Close modal when clicking outside
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-3xl relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-black"
                    onClick={onClose}
                >
                    ×
                </button>

                <h1 className="text-xl font-bold mb-4">Dashboard</h1>

                {error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : !progress ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {/* Pie Chart */}
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Progress Report</h2>
                            <div className="flex justify-center">
                                <div className="w-60">
                                    <Pie
                                        data={{
                                            labels: ["Done", "Remaining"],
                                            datasets: [
                                                {
                                                    data: [progress.done_cards, progress.total_cards - progress.done_cards],
                                                    backgroundColor: ["#4CAF50", "#FFC107"],
                                                },
                                            ],
                                        }}
                                    />
                                    <p className="text-center font-bold">
                                        {progress.progress_percentage.toFixed(2)}% of tasks are done!
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Bar Chart */}
                        <section>
                            <h3 className="text-lg font-semibold">Cards Per Column</h3>
                            <div className="flex justify-center">
                                <div className="w-96">
                                    <Bar
                                        data={{
                                            labels: Object.keys(progress.list_report),
                                            datasets: [
                                                {
                                                    label: "Cards Per Column",
                                                    data: Object.values(progress.list_report),
                                                    backgroundColor: "#2196F3",
                                                },
                                            ],
                                        }}
                                        options={{ plugins: { legend: { display: false } } }}
                                    />
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
