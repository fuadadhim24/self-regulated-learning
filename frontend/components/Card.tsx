import { Draggable } from 'react-beautiful-dnd';

interface CardProps {
    id: string;
    title: string;
    subTitle: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    priority: 'low' | 'medium' | 'high' | 'critical';
    index: number;
    onClick: () => void;
}

export default function Card({ id, title, subTitle, difficulty, priority, index, onClick }: CardProps) {
    // Color coding based on difficulty
    const difficultyColor = {
        easy: "bg-[#DADDFC] text-black",
        medium: "bg-[#537EC5] text-white",
        hard: "bg-[#F39422] text-white",
        expert: "bg-[#8F4426] text-white",
    };

    const priorityColor = {
        low: "bg-[#31a38b] text-white",
        medium: "bg-green-300 text-white",
        high: "bg-yellow-300 text-white",
        critical: "bg-red-500 text-white",
    };

    return (
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white p-3 rounded shadow cursor-pointer border border-gray-200 hover:shadow-md transition 
                    ${snapshot.isDragging ? "shadow-lg scale-105" : ""} // Add visual feedback
                `}
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

