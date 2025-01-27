interface BoardHeaderProps {
    boardName: string;
    onBack: () => void;
}

export default function BoardHeader({ boardName, onBack }: BoardHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{boardName || 'Loading Board...'}</h1>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={onBack}
            >
                Go to Dashboard
            </button>
        </div>
    );
}
