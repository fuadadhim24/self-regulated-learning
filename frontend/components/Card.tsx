import { Draggable } from 'react-beautiful-dnd';

interface CardProps {
    id: string;
    title: string;
    subTitle: string;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: 'low' | 'medium' | 'high';
    index: number;
    onClick: () => void;
}

export default function Card({ id, title, subTitle, difficulty, priority, index, onClick }: CardProps) {
    // Color coding based on difficulty
    const difficultyColor = {
        easy: "bg-green-500 text-white",
        medium: "bg-yellow-500 text-white",
        hard: "bg-red-500 text-white",
    };

    const priorityColor = {
        low: "bg-green-300 text-white",
        medium: "bg-yellow-300 text-white",
        high: "bg-red-300 text-white",
    };

    return (
        <Draggable draggableId={id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-3 rounded shadow cursor-pointer border border-gray-200 hover:shadow-md transition"
                    onClick={onClick}
                >
                    <div className="flex mb-2 space-x-2">
                        <div
                            className={`w-1/2 h-2 rounded ${priorityColor[priority]}`}
                            title={`Priority: ${priority}`}
                        ></div>
                        <div
                            className={`w-1/2 h-2 rounded ${difficultyColor[difficulty]}`}
                            title={`Difficulty: ${difficulty}`}
                        ></div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600">{subTitle}</p>
                </div>
            )}
        </Draggable>
    )
}

