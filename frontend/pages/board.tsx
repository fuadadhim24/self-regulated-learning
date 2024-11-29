import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useRouter } from 'next/router'
import { getBoard, updateBoard } from '@/utils/api'

interface Card {
    id: string
    content: string
}

interface List {
    id: string
    title: string
    cards: Card[]
}

export default function Board() {
    const [lists, setLists] = useState<List[]>([])
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
        const { source, destination, draggableId } = result

        if (!destination) return

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return
        }

        const sourceList = lists.find((list) => list.id === source.droppableId)
        const destList = lists.find((list) => list.id === destination.droppableId)

        if (!sourceList || !destList) return

        const newLists = [...lists]
        const [movedCard] = sourceList.cards.splice(source.index, 1)
        destList.cards.splice(destination.index, 0, movedCard)

        setLists(newLists)

        // Update the backend
        const token = localStorage.getItem('token')
        if (token) {
            await updateBoard(token, newLists)
        }
    }

    const addCard = async (listId: string) => {
        const content = prompt('Enter card content:')
        if (!content) return

        const newCard: Card = { id: Date.now().toString(), content }
        const newLists = lists.map((list) =>
            list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        )

        setLists(newLists)

        // Update the backend
        const token = localStorage.getItem('token')
        if (token) {
            await updateBoard(token, newLists)
        }
    }

    return (
        <div className="min-h-screen bg-blue-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Trello Clone Board</h1>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4">
                    {lists.map((list) => (
                        <div key={list.id} className="bg-gray-200 p-4 rounded-lg w-72">
                            <h2 className="text-lg font-semibold mb-4">{list.title}</h2>
                            <Droppable droppableId={list.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {list.cards.map((card, index) => (
                                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-2 rounded shadow"
                                                    >
                                                        {card.content}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            <button
                                onClick={() => addCard(list.id)}
                                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                            >
                                Add Card
                            </button>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    )
}

