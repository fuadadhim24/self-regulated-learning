import { useEffect, useState } from "react";
import LearningStrategyForm from "./LearningStrategiesForm";

interface LearningStrategy {
    id: string;
    name: string;
}

export default function LearningStrategiesList() {
    const [strategies, setStrategies] = useState<LearningStrategy[]>([]);
    const [editingStrategy, setEditingStrategy] = useState<LearningStrategy | null>(null);

    // Fetch strategies from the API
    useEffect(() => {
        fetch("/api/learning-strategies")
            .then((res) => res.json())
            .then((data) => setStrategies(data))
            .catch(console.error);
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/learning-strategies/${id}`, { method: "DELETE" });
            setStrategies((prev) => prev.filter((strategy) => strategy.id !== id));
        } catch (error) {
            console.error("Error deleting strategy:", error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Learning Strategies</h2>
            {/* Form for adding a new strategy */}
            {!editingStrategy && (
                <LearningStrategyForm
                    onStrategySaved={(newStrategy) => setStrategies((prev) => [...prev, newStrategy])}
                />
            )}
            <ul className="mt-4">
                {strategies.map((strategy) => (
                    <li
                        key={strategy.id}
                        className="border p-2 rounded mb-2 flex justify-between items-center"
                    >
                        <div>{strategy.name}</div>
                        <div>
                            <button
                                onClick={() => setEditingStrategy(strategy)}
                                className="text-blue-500 mr-2"
                            >
                                Edit
                            </button>
                            <button onClick={() => handleDelete(strategy.id)} className="text-red-500">
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {/* Editing form */}
            {editingStrategy && (
                <LearningStrategyForm
                    strategy={editingStrategy}
                    onStrategySaved={(updatedStrategy) =>
                        setStrategies((prev) =>
                            prev.map((s) => (s.id === updatedStrategy.id ? updatedStrategy : s))
                        )
                    }
                    onCancel={() => setEditingStrategy(null)}
                />
            )}
        </div>
    );
}
