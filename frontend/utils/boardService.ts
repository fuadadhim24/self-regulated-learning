import type { ListType, Card } from "@/types";
import { getBoard, updateBoard } from "@/utils/api";
import { NextRouter } from "next/router";
import { createCardMovement } from "./api"

export async function updateBoardState(boardId: string | null, lists: ListType[]) {
    if (!boardId) return;

    try {
        const data = await updateBoard(boardId, lists);
        console.log("Board updated:", data);
    } catch (error) {
        console.error("Error updating board:", error);
    }
}

export function addCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    listId: string,
    courseCode: string,
    courseName: string,
    material: string,
    difficulty: "easy" | "medium" | "hard" | "expert",
    boardId: string | null
) {
    const now = new Date().toISOString();
    const newCard: Card = {
        id: `${courseCode}-${courseName}-${material}`,
        title: `${courseName} [${courseCode}]`,
        sub_title: material,
        description: "",
        difficulty,
        priority: "medium",
        learning_strategy: "Rehearsal Strategies - Pengulangan Materi",
        created_at: now,
        column_movements: [{
            fromColumn: "initial",
            toColumn: listId,
            timestamp: now
        }]
    };

    const updatedLists = lists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
    );

    setLists(updatedLists);
    updateBoardState(boardId, updatedLists);
}

export function updateCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    boardId: string | null,
    cardId: string,
    field: keyof Card,
    newValue: any
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, [field]: newValue } : card
        ),
    }));

    setLists(updatedLists);
    updateBoardState(boardId, updatedLists);
}

export async function moveCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    boardId: string | null,
    sourceIndex: number,
    destinationIndex: number,
    sourceDroppableId: string,
    destinationDroppableId: string
) {
    const sourceListIndex = lists.findIndex((list) => list.id === sourceDroppableId);
    const destListIndex = lists.findIndex((list) => list.id === destinationDroppableId);

    if (sourceListIndex < 0 || destListIndex < 0) return;

    const sourceList = { ...lists[sourceListIndex], cards: [...lists[sourceListIndex].cards] };
    const destList = { ...lists[destListIndex], cards: [...lists[destListIndex].cards] };

    const movedCard = sourceList.cards[sourceIndex];
    if (!movedCard) return;

    // Remove card from source list
    sourceList.cards.splice(sourceIndex, 1);

    // Add card to destination list
    if (sourceList.id === destList.id) {
        sourceList.cards.splice(destinationIndex, 0, movedCard);
    } else {
        destList.cards.splice(destinationIndex, 0, movedCard);
    }

    // Update lists state immediately for smooth UI
    const updatedLists = [...lists];
    updatedLists[sourceListIndex] = sourceList;
    updatedLists[destListIndex] = destList;
    setLists(updatedLists);

    // If moving between columns, record the movement
    if (sourceList.id !== destList.id) {
        try {
            const now = new Date().toISOString();
            // Update local state first
            movedCard.column_movements = [
                ...(movedCard.column_movements || []),
                {
                    fromColumn: sourceList.id,
                    toColumn: destList.id,
                    timestamp: now
                }
            ];

            // Then make API call in the background
            createCardMovement(movedCard.id, sourceList.id, destList.id).catch(error => {
                console.error("Failed to record card movement:", error);
                // Optionally show a notification to the user
            });
        } catch (error) {
            console.error("Failed to update card movement state:", error);
        }
    }

    // Update board state in the background
    updateBoardState(boardId, updatedLists).catch(error => {
        console.error("Failed to update board state:", error);
    });
}

export async function fetchBoardData(
    setLists: (lists: ListType[]) => void,
    setBoardId: (id: string | null) => void,
    setBoardName: (name: string) => void,
    router: NextRouter
) {
    try {
        const response = await getBoard();
        if (!response.ok) {
            router.push("/login");
            return;
        }

        const data = await response.json();
        setLists(data.lists);
        setBoardId(data.id);
        setBoardName(data.name);
    } catch (error) {
        console.error("Error fetching board data:", error);
        router.push("/login");
    }
}

export function archiveCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, archived: true } : card
        ),
    }));

    setLists(updatedLists);
    updateBoardState(boardId, updatedLists);
}

export function restoreCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, archived: false } : card
        ),
    }));

    setLists(updatedLists);
    updateBoardState(boardId, updatedLists);
}

export function deleteCard(
    lists: ListType[],
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, deleted: true } : card
        )
    }));

    setLists(updatedLists);
    updateBoardState(boardId, updatedLists);
}
