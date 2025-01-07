import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useRouter } from 'next/router'
import { getBoard, updateBoard } from '@/utils/api'
import List from './List'
import TaskDetails from './TaskDetails'

export interface Card {
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
    const [boardId, setBoardId] = useState<string | null>(null)
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
            setBoardId(data.id)
        } else {
            router.push('/login')
        }
    }

    const onDragEnd = async (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return

        const sourceListIndex = lists.findIndex((list) => list.id === source.droppableId)
        const destListIndex = lists.findIndex((list) => list.id === destination.droppableId)

        if (sourceListIndex < 0 || destListIndex < 0) return

        const sourceList = { ...lists[sourceListIndex] }
        const destList = { ...lists[destListIndex] }

        const [movedCard] = sourceList.cards.splice(source.index, 1)

        if (sourceList.id === destList.id) {
            // Moving within the same list
            sourceList.cards.splice(destination.index, 0, movedCard)
            const updatedLists = [...lists]
            updatedLists[sourceListIndex] = sourceList
            setLists(updatedLists)
        } else {
            // Moving to a different list
            destList.cards.splice(destination.index, 0, movedCard)
            const updatedLists = [...lists]
            updatedLists[sourceListIndex] = sourceList
            updatedLists[destListIndex] = destList
            setLists(updatedLists)
        }

        // Save the updated board to the backend
        const token = localStorage.getItem('token')
        if (token && boardId) {
            try {
                const response = await updateBoard(token, boardId, lists)
                if (!response.ok) {
                    console.error('Failed to update board:', await response.text())
                }
            } catch (error) {
                console.error('Error updating board:', error)
            }
        }
    }


    const addCard = async (listId: string) => {
        const content = prompt('Enter card content:')
        const difficulty = prompt('Enter difficulty (easy, medium, hard):') as 'easy' | 'medium' | 'hard'

        if (!content || !difficulty) return

        const newCard: Card = { id: Date.now().toString(), content, difficulty }
        const newLists = lists.map((list) =>
            list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        )

        setLists(newLists)

        const token = localStorage.getItem('token')
        if (token && boardId) {
            try {
                const response = await updateBoard(token, boardId, newLists)
                if (!response.ok) {
                    console.error('Failed to update board:', await response.text())
                }
            } catch (error) {
                console.error('Error updating board:', error)
            }
        }
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

