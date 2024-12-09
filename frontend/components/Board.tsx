import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useRouter } from 'next/router'
import { getBoard, updateBoard } from '@/utils/api'
import List from './List'
import TaskDetails from './TaskDetails'

interface Card {
    id: string
    content: string
    description?: string
    difficulty: 'easy' | 'medium' | 'hard'
}

interface ListType {
    id: string
    title: string
    cards: Card[]
}

export default function Board() {
    const [lists, setLists] = useState<ListType[]>([])
    const [selectedCard, setSelectedCard] = useState<{ listId: string, card: Card } | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchBoard()
    }, [])

    const fetchBoard = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        const response = await getBoard(token)

        if (response.ok) {
            const data = await response.json()
            setLists(data.lists)
        } else {
            router.push('/login')
        }
    }

    const onDragEnd = async (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return

        const sourceList = lists.find((list) => list.id === source.droppableId)
        const destList = lists.find((list) => list.id === destination.droppableId)

        if (!sourceList || !destList) return

        const newLists = [...lists]
        const [movedCard] = sourceList.cards.splice(source.index, 1)
        destList.cards.splice(destination.index, 0, movedCard)

        setLists(newLists)

        const token = localStorage.getItem('token')
        if (token) {
            await updateBoard(token, newLists)
        }
    }

    const addCard = (listId: string) => {
        const content = prompt('Enter card content:')
        const difficulty = prompt('Enter difficulty (easy, medium, hard):') as 'easy' | 'medium' | 'hard'

        if (!content || !difficulty) return

        const newCard: Card = { id: Date.now().toString(), content, difficulty }
        const newLists = lists.map((list) =>
            list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        )

        setLists(newLists)
    }

    const updateCardDescription = (cardId: string, newDescription: string) => {
        const newLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, description: newDescription } : card
            ),
        }))
        setLists(newLists)
    }

    return (
        <div className="min-h-screen bg-blue-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Trello Clone Board</h1>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4">
                    {lists.map((list) => (
                        <List
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            cards={list.cards}
                            onAddCard={addCard}
                            onCardClick={(listId, card) => setSelectedCard({ listId, card })}
                        />
                    ))}
                </div>
            </DragDropContext>
            {selectedCard && (
                <TaskDetails
                    listName={lists.find((list) => list.id === selectedCard.listId)?.title || ''}
                    card={selectedCard.card}
                    onClose={() => setSelectedCard(null)}
                    onUpdateDescription={updateCardDescription}
                />
            )}
        </div>
    )
}
