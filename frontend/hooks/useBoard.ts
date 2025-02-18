import { useState } from "react";
import type { Card, ListType } from "@/types";
import { updateBoardState } from "@/utils/boardService";
import { type DropResult } from "react-beautiful-dnd"

export function useBoard(boardId: string | null, initialLists: ListType[]) {
    const [lists, setLists] = useState<ListType[]>(initialLists);
    const [selectedCard, setSelectedCard] = useState<{ listId: string; card: Card } | null>(null);

    const updateCardProperty = async (cardId: string, key: keyof Card, value: any) => {
        const updatedLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => (card.id === cardId ? { ...card, [key]: value } : card)),
        }));

        setLists(updatedLists);
        await updateBoardState(boardId, updatedLists);
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
        destList.cards.splice(destination.index, 0, movedCard);

        const updatedLists = [...lists];
        updatedLists[sourceListIndex] = sourceList;
        updatedLists[destListIndex] = destList;

        setLists(updatedLists);
        await updateBoardState(boardId, updatedLists);
    };

    return { lists, setLists, selectedCard, setSelectedCard, updateCardProperty, onDragEnd };
}
