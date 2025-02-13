import { Draggable } from 'react-beautiful-dnd';

interface CardProps {
    id: string;
    title: string;
    subTitle: string;
    difficulty: 'easy' | 'medium' | 'hard';
    index: number;
    onClick: () => void;
}

export default function Card({ id, title, subTitle, difficulty, index, onClick }: CardProps) {
    // Color coding based on difficulty
    const difficultyColor = {
        easy: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800',
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
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600">{subTitle}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${difficultyColor[difficulty]}`}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                </div>
            )}
        </Draggable>
    );
}
