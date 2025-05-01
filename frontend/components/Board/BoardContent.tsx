"use client"

import type React from "react"
import { useState } from "react"
import { DragDropContext, type DropResult } from "react-beautiful-dnd"
import type { ListType, Card } from "@/types"
import List from "../List"
import TaskDetails from "../TaskDetails/TaskDetails"
import { addCard, updateCard, moveCard, archiveCard, deleteCard } from "@/utils/boardService"

export default function BoardContent({
    lists,
    setLists,
    boardId,
}: {
    lists: ListType[]
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>
    boardId: string | null
}) {
    const [selectedCard, setSelectedCard] = useState<{ listId: string; card: Card } | null>(null)

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        moveCard(lists, setLists, boardId, source.index, destination.index, source.droppableId, destination.droppableId)
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full">
                <div className="flex flex-grow gap-4 overflow-x-auto pb-4 px-1 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QkE2Q0EiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnptLTYgNmg2djZoLTZ2LTZ6bS02IDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnptLTEyIDZoNnY2aC02di02em0wLTEyaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnptLTYgNmg2djZoLTZ2LTZ6bS02IDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnptLTEyIDZoNnY2aC02di02em0wLTEyaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')]">
                    {lists.map((list) => (
                        <List
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            cards={list.cards.filter((card) => !card.archived && !card.deleted)}
                            isAddingCard={list.isAddingCard}
                            onAddCard={(listId, courseCode, courseName, material, difficulty) =>
                                addCard(lists, setLists, listId, courseCode, courseName, material, difficulty, boardId)
                            }
                            onCardClick={(listId, card) => setSelectedCard({ listId, card })}
                            onCancelAddCard={() => {
                                const updatedLists = lists.map((l) => (l.id === list.id ? { ...l, isAddingCard: false } : l))
                                setLists(updatedLists)
                            }}
                        />
                    ))}
                </div>
            </div>

            {selectedCard && (
                <TaskDetails
                    listName={lists.find((list) => list.id === selectedCard.listId)?.title || ""}
                    boardId={boardId || ""}
                    card={selectedCard.card}
                    onClose={() => setSelectedCard(null)}
                    onUpdateTitle={(id, value) => updateCard(lists, setLists, boardId, id, "title", value)}
                    onUpdateSubTitle={(id, value) => updateCard(lists, setLists, boardId, id, "sub_title", value)}
                    onUpdateDescription={(id, value) => updateCard(lists, setLists, boardId, id, "description", value)}
                    onUpdateDifficulty={(id, value) => updateCard(lists, setLists, boardId, id, "difficulty", value)}
                    onUpdatePriority={(id, value) => updateCard(lists, setLists, boardId, id, "priority", value)}
                    onUpdateLearningStrategy={(id, value) => updateCard(lists, setLists, boardId, id, "learning_strategy", value)}
                    onUpdateChecklists={(id, value) => updateCard(lists, setLists, boardId, id, "checklists", value)}
                    onUpdateLinks={(id, value) => updateCard(lists, setLists, boardId, id, "links", value)}
                    onUpdateRating={(id, value) => updateCard(lists, setLists, boardId, id, "rating", value)}
                    onUpdateNotes={(id, value) => updateCard(lists, setLists, boardId, id, "notes", value)}
                    onUpdatePreTestGrade={(id, value) => updateCard(lists, setLists, boardId, id, "pre_test_grade", value)}
                    onUpdatePostTestGrade={(id, value) => updateCard(lists, setLists, boardId, id, "post_test_grade", value)}
                    onArchive={(cardId) => {
                        archiveCard(lists, setLists, boardId, cardId)
                        setSelectedCard(null)
                    }}
                    onDelete={(cardId) => deleteCard(lists, setLists, boardId, cardId)}
                />
            )}
        </DragDropContext>
    )
}
