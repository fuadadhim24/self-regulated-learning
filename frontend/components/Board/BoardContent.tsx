import type React from "react";
import { useState } from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import { ListType, Card } from "@/types";
import List from "../List";
import TaskDetails from "../TaskDetails/TaskDetails";
import { addCard, updateCard, moveCard, archiveCard } from "@/utils/boardService";

export default function BoardContent({
    lists,
    setLists,
    boardId,
}: {
    lists: ListType[];
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>;
    boardId: string | null;
}) {
    const [selectedCard, setSelectedCard] = useState<{ listId: string; card: Card } | null>(null);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        moveCard(lists, setLists, boardId, source.index, destination.index, source.droppableId, destination.droppableId);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full">
                <div className="flex flex-grow gap-4 overflow-x-auto px-4">
                    {lists.map((list) => (
                        <List
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            cards={list.cards.filter(card => !card.archived)} // Hide archived tasks
                            isAddingCard={list.isAddingCard}
                            onAddCard={(listId, courseCode, courseName, material, difficulty) =>
                                addCard(lists, setLists, listId, courseCode, courseName, material, difficulty, boardId)
                            }
                            onCardClick={(listId, card) => setSelectedCard({ listId, card })}
                            onCancelAddCard={() => {
                                const updatedLists = lists.map((l) => (l.id === list.id ? { ...l, isAddingCard: false } : l));
                                setLists(updatedLists);
                            }}
                        />
                    ))}
                </div>
            </div>

            {selectedCard && (
                <TaskDetails
                    listName={lists.find((list) => list.id === selectedCard.listId)?.title || ""}
                    card={selectedCard.card}
                    onClose={() => setSelectedCard(null)}
                    onUpdateTitle={(id, value) => updateCard(lists, setLists, boardId, id, "title", value)}
                    onUpdateSubTitle={(id, value) => updateCard(lists, setLists, boardId, id, "sub_title", value)}
                    onUpdateDescription={(id, value) => updateCard(lists, setLists, boardId, id, "description", value)}
                    onUpdateDifficulty={(id, value) => updateCard(lists, setLists, boardId, id, "difficulty", value)}
                    onUpdatePriority={(id, value) => updateCard(lists, setLists, boardId, id, "priority", value)}
                    onUpdateLearningStrategy={(id, value) => updateCard(lists, setLists, boardId, id, "learning_strategy", value)}
                    onArchive={(cardId) => archiveCard(lists, setLists, boardId, cardId)}
                />
            )}
        </DragDropContext>
    );
}
