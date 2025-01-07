import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Card } from './Board'

interface ListProps {
    id: string
    title: string
    cards: Card[]
    onAddCard: (listId: string) => void
    onCardClick: (listId: string, card: Card) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick }: ListProps) => {
    const getCardColor = (difficulty: 'easy' | 'medium' | 'hard') => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-300' // Green for easy
            case 'medium':
                return 'bg-yellow-300' // Yellow for medium
            case 'hard':
                return 'bg-red-300' // Red for hard
            default:
                return 'bg-gray-300' // Default fallback
        }
    }

    return (
        <div className="bg-gray-200 p-4 rounded-lg w-72">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <Droppable droppableId={id}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                    >
                        {cards.map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-white p-2 rounded shadow cursor-pointer"
                                        onClick={() => onCardClick(id, card)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{card.content}</span>
                                            <div className={`w-3 h-3 rounded-full ${getCardColor(card.difficulty)}`} />
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <button
                onClick={() => onAddCard(id)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Add Card
            </button>
        </div>
    )
}

export default List
