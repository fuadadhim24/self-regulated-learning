interface BoardHeaderProps {
    boardName: string;
    onBack: () => void;
    onShowArchived: () => void; // New prop
}

export default function BoardHeader({ boardName, onBack, onShowArchived }: BoardHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{boardName || 'Loading Board...'}</h1>
            <div className="flex gap-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onBack}>
                    Go to Dashboard
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onShowArchived}>
                    See Archived Tasks
                </button>
            </div>
        </div>
    );
}
