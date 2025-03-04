import { useState, useEffect } from "react";
import { LearningStrategy } from "../../types";

interface LearningStrategyFormProps {
    strategy?: LearningStrategy; // If provided, we're editing
    onStrategySaved: (strategy: LearningStrategy) => void;
    onCancel?: () => void;
}

export default function LearningStrategyForm({
    strategy,
    onStrategySaved,
    onCancel,
}: LearningStrategyFormProps) {
    const [name, setName] = useState(strategy ? strategy.name : "");

    useEffect(() => {
        if (strategy) {
            setName(strategy.name);
        }
    }, [strategy]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newStrategy: LearningStrategy = {
            id: strategy ? strategy.id : `${Date.now()}`, // Generate new ID if not editing
            name,
        };

        try {
            if (strategy) {
                // Update existing strategy via PUT
                const res = await fetch(`/api/learning-strategies/${newStrategy.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStrategy),
                });
                if (res.ok) {
                    onStrategySaved(newStrategy);
                }
            } else {
                // Create new strategy via POST
                const res = await fetch("/api/learning-strategies", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStrategy),
                });
                if (res.ok) {
                    onStrategySaved(newStrategy);
                    setName("");
                }
            }
        } catch (error) {
            console.error("Error saving learning strategy:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
            <h3 className="font-bold mb-2">
                {strategy ? "Edit Learning Strategy" : "Add Learning Strategy"}
            </h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Learning Strategy Name"
                className="border p-2 rounded w-full mb-2"
            />
            <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                    Save
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
