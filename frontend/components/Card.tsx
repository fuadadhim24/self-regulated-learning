import { Draggable } from 'react-beautiful-dnd'

interface CardProps {
    id: string
    content: string
    index: number
}

export default function Card({ id, content, index }: CardProps) {
    return (
        <Draggable draggableId={id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-2 rounded shadow"
                >
                    {content}
                </div>
            )}
        </Draggable>
    )
}
