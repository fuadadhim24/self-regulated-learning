"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

export default function Dashboard() {
    const [progress, setProgress] = useState<ProgressReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProgressReport = async () => {
            try {
                const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
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
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!progress) {
        return <div>Loading...</div>;
    }

    // Prepare data for charts
    const pieData = {
        labels: ["Done", "Remaining"],
        datasets: [
            {
                data: [progress.done_cards, progress.total_cards - progress.done_cards],
                backgroundColor: ["#4CAF50", "#FFC107"],
                hoverBackgroundColor: ["#45A049", "#FFB300"],
            },
        ],
    };

    const barData = {
        labels: Object.keys(progress.list_report),
        datasets: [
            {
                label: "Cards Per Column",
                data: Object.values(progress.list_report),
                backgroundColor: "#2196F3",
                hoverBackgroundColor: "#1E88E5",
            },
        ],
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Dashboard</h1>

            <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => router.push('/board')}
            >
                Go Back to Board
            </button>

            {/* Progress Report Section */}
            <section style={{ marginBottom: "40px" }}>
                <h2>Progress Report</h2>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "300px", margin: "20px" }}>
                        <Pie data={pieData} />
                        <p style={{ textAlign: "center" }}>
                            <strong>{progress.progress_percentage.toFixed(2)}%</strong> of tasks are done!
                        </p>
                    </div>
                </div>
            </section>

            {/* Cards Per Column Section */}
            <section style={{ marginBottom: "40px" }}>
                <h3>Cards Per Column</h3>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "500px", margin: "20px" }}>
                        <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </section>

            {/* Additional Sections Placeholder */}
            <section style={{ marginTop: "40px" }}>
                <h3>Additional Features</h3>
                <p>Placeholder for future dashboard components.</p>
            </section>
        </div>
    );
}
