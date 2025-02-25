import { useState } from "react";
import DashboardModal from "@/components/Board/DashboardModal";

interface BoardHeaderProps {
    boardName: string;
    onShowArchived: () => void;
}

export default function BoardHeader({ boardName, onShowArchived }: BoardHeaderProps) {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{boardName || "Loading Board..."}</h1>
            <div className="flex gap-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setIsDashboardOpen(true)}>
                    Show Analytics
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onShowArchived}>
                    See Archived Tasks
                </button>
            </div>

            <DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        </div>
    );
}
