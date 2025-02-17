import { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { updateBoard } from '@/utils/api';
import List from '../List';
import TaskDetails from '../TaskDetails/TaskDetails';

interface Card {
    id: string;
    title: string;
    sub_title: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ListType {
    id: string;
    title: string;
    cards: Card[];
    isAddingCard: boolean;
}

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

    const onAddCard = async (
        listId: string,
        courseCode: string,
        courseName: string,
        material: string,
        difficulty: "easy" | "medium" | "hard"
    ) => {
        const newCard: Card = {
            id: `${courseCode}-${courseName}-${material}`,
            title: courseName,
            sub_title: `${courseCode} - ${material}`,
            description: "",
            difficulty,
        };

        const updatedLists = lists.map((list) =>
            list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        );
        setLists(updatedLists);
        // If boardId is available, update the database
        if (boardId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await updateBoard(token, boardId, updatedLists);
                    if (!response.ok) {
                        console.error('Failed to update board:', await response.text());
                    }
                } catch (error) {
                    console.error('Error updating board:', error);
                }
            }
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceListIndex = lists.findIndex((list) => list.id === source.droppableId);
        const destListIndex = lists.findIndex((list) => list.id === destination.droppableId);

        if (sourceListIndex < 0 || destListIndex < 0) return;

        const sourceList = { ...lists[sourceListIndex] };
        const destList = { ...lists[destListIndex] };

        const [movedCard] = sourceList.cards.splice(source.index, 1);

        if (sourceList.id === destList.id) {
            sourceList.cards.splice(destination.index, 0, movedCard);
        } else {
            destList.cards.splice(destination.index, 0, movedCard);
        }

        const updatedLists = [...lists];
        updatedLists[sourceListIndex] = sourceList;
        updatedLists[destListIndex] = destList;
        setLists(updatedLists);

        if (boardId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await updateBoard(token, boardId, updatedLists);
                    if (!response.ok) {
                        console.error('Failed to update board:', await response.text());
                    }
                } catch (error) {
                    console.error('Error updating board:', error);
                }
            }
        }
    };

    const updateCardTitle = async (cardId: string, newTitle: string) => {
        const card = lists.flatMap(list => list.cards).find(card => card.id === cardId);
        if (card && card.title === newTitle) return; // Skip if no change
        const updatedLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, title: newTitle } : card
            ),
        }));
        setLists(updatedLists);

        if (boardId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await updateBoard(token, boardId, updatedLists);
                    console.log('Updated board:', updatedLists);
                } catch (error) {
                    console.error('Error updating board:', error);
                }
            }
        }
    };

    const updateCardSubTitle = async (cardId: string, newSubTitle: string) => {
        const card = lists.flatMap(list => list.cards).find(card => card.id === cardId);
        if (card && card.sub_title === newSubTitle) return; // Skip if no change
        const updatedLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, sub_title: newSubTitle } : card
            ),
        }));
        setLists(updatedLists);
    };

    const updateCardDescription = async (cardId: string, newDescription: string) => {
        const card = lists.flatMap(list => list.cards).find(card => card.id === cardId);
        if (card && card.description === newDescription) return; // Skip if no change
        const updatedLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, description: newDescription } : card
            ),
        }));
        setLists(updatedLists);

        if (boardId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await updateBoard(token, boardId, updatedLists);
                    console.log('Updated board:', updatedLists);
                } catch (error) {
                    console.error('Error updating board:', error);
                }
            }
        }
    };

    const updateCardDifficulty = async (cardId: string, newDifficulty: 'easy' | 'medium' | 'hard') => {
        const updatedLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, difficulty: newDifficulty } : card
            ),
        }));
        setLists(updatedLists);

        if (boardId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await updateBoard(token, boardId, updatedLists);
                    console.log('Updated board:', updatedLists);
                } catch (error) {
                    console.error('Error updating board:', error);
                }
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className='flex h-full'>
                <div className="flex space-x-4 flex-grow">
                    {lists.map((list) => (
                        <List
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            cards={list.cards}
                            isAddingCard={list.isAddingCard}
                            onAddCard={onAddCard}
                            onCardClick={(listId, card) => setSelectedCard({ listId, card })}
                            onCancelAddCard={() => {
                                const updatedLists = lists.map((l) =>
                                    l.id === list.id ? { ...l, isAddingCard: false } : l
                                );
                                setLists(updatedLists);
                            }}
                        />
                    ))}
                </div>
            </div>

            {selectedCard && (
                <TaskDetails
                    listName={lists.find((list) => list.id === selectedCard.listId)?.title || ''}
                    card={selectedCard.card}
                    onClose={() => setSelectedCard(null)}
                    onUpdateTitle={updateCardTitle}
                    onUpdateSubTitle={updateCardSubTitle}
                    onUpdateDescription={updateCardDescription}
                    onUpdateDifficulty={updateCardDifficulty}
                />
            )}
        </DragDropContext>
    );
}
