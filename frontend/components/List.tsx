import { Droppable } from 'react-beautiful-dnd'
import Card from './Card'

interface Card {
    id: string
    content: string
    description?: string
    difficulty: 'easy' | 'medium' | 'hard'
}

interface ListProps {
    id: string
    title: string
    cards: Card[]
    onAddCard: (listId: string) => void
    onCardClick: (listId: string, card: Card) => void
}

export default function List({ id, title, cards, onAddCard, onCardClick }: ListProps) {
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
                            <Card
                                key={card.id}
                                id={card.id}
                                content={card.content}
                                index={index}
                                onClick={() => onCardClick(id, card)}
                            />
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
