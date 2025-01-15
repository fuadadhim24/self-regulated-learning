import { useState } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Card } from './Board'

interface ListProps {
    id: string
    title: string
    cards: Card[]
    isAddingCard: boolean
    onAddCard: (listId: string, content: string, difficulty: 'easy' | 'medium' | 'hard') => void
    onCancelAddCard: (listId: string) => void
    onCardClick: (listId: string, card: Card) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick }: ListProps) => {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [newCardContent, setNewCardContent] = useState('')
    const [newCardDifficulty, setNewCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

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

    const handleAddCard = () => {
        if (newCardContent.trim()) {
            onAddCard(id, newCardContent, newCardDifficulty) // Add card
            setNewCardContent('') // Clear input field
            setNewCardDifficulty('easy') // Reset difficulty dropdown
            setIsAddingCard(false) // Hide the form and show the "Add Card" button again
        }
    }

    const handleCancelAddCard = () => {
        setNewCardContent('') // Clear input field
        setNewCardDifficulty('easy') // Reset difficulty dropdown
        setIsAddingCard(false) // Hide the form and show the "Add Card" button again
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

                        {isAddingCard && (
                            <div className="p-2">
                                <input
                                    type="text"
                                    placeholder="Enter task name"
                                    value={newCardContent}
                                    onChange={(e) => setNewCardContent(e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300"
                                />
                                <select
                                    value={newCardDifficulty}
                                    onChange={(e) => setNewCardDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                                    className="w-full p-2 rounded border border-gray-300 mt-2"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <div className="mt-2 flex space-x-2">
                                    <button
                                        onClick={handleAddCard} // Call the add card function
                                        className="bg-blue-500 text-white p-2 rounded"
                                    >
                                        Add Card
                                    </button>
                                    <button
                                        onClick={handleCancelAddCard} // Cancel and return to "Add Card" button
                                        className="bg-gray-500 text-white p-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </Droppable>
            {!isAddingCard && (
                <button
                    onClick={() => setIsAddingCard(true)}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Add Card
                </button>
            )}
        </div>
    )
}

export default List
