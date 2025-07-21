import { NextRouter } from "next/router"
import { boardAPI } from "./apiClient"
import { toast } from "@/hooks/use-toast"

// Centralized board state management
export async function updateBoardState(boardId: string | null, lists: any[]) {
    if (!boardId) {
        console.warn("No board ID provided for updateBoardState")
        return
    }

    try {
        console.log("Updating board state:", { boardId, listsCount: lists.length })
        const result = await boardAPI.updateBoard(boardId, lists)
        console.log("Board update result:", result)
        return result
    } catch (error: any) {
        console.error("Failed to update board state:", error)
        toast({
            title: "Error",
            description: `Failed to update board state: ${error.message}`,
            variant: "destructive"
        })
        throw error
    }
}

// Card management functions
export function addCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    listId: string,
    courseCode: string,
    courseName: string,
    material: string,
    difficulty: "easy" | "medium" | "hard" | "expert",
    boardId: string | null
) {
    const newCard = {
        id: Date.now().toString(),
        title: courseName, // Set title to course name
        sub_title: material, // Set sub_title to material
        course_code: courseCode,
        course_name: courseName,
        material: material,
        difficulty: difficulty,
        priority: "medium",
        status: "not_started",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        column_movements: [],
        archived: false,
        deleted: false,
    }

    const updatedLists = lists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
    )

    setLists(updatedLists)
    updateBoardState(boardId, updatedLists)
}

export function updateCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    boardId: string | null,
    cardId: string,
    field: keyof any,
    newValue: any
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card: any) =>
            card.id === cardId ? { ...card, [field]: newValue } : card
        ),
    }))

    setLists(updatedLists)
    updateBoardState(boardId, updatedLists)
}

export async function moveCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    boardId: string | null,
    sourceIndex: number,
    destinationIndex: number,
    sourceDroppableId: string,
    destinationDroppableId: string
) {
    const sourceListIndex = lists.findIndex((list) => list.id === sourceDroppableId)
    const destListIndex = lists.findIndex((list) => list.id === destinationDroppableId)

    if (sourceListIndex < 0 || destListIndex < 0) return

    const sourceList = { ...lists[sourceListIndex], cards: [...lists[sourceListIndex].cards] }
    const destList = { ...lists[destListIndex], cards: [...lists[destListIndex].cards] }

    const movedCard = sourceList.cards[sourceIndex]
    if (!movedCard) return

    // Remove card from source list
    sourceList.cards.splice(sourceIndex, 1)

    // Add card to destination list
    if (sourceList.id === destList.id) {
        sourceList.cards.splice(destinationIndex, 0, movedCard)
    } else {
        destList.cards.splice(destinationIndex, 0, movedCard)
    }

    // Update lists state immediately for smooth UI
    const updatedLists = [...lists]
    updatedLists[sourceListIndex] = sourceList
    updatedLists[destListIndex] = destList
    setLists(updatedLists)

    // If moving between columns, record the movement
    if (sourceList.id !== destList.id) {
        try {
            const now = new Date().toISOString()
            // Update local state first
            movedCard.column_movements = [
                ...(movedCard.column_movements || []),
                {
                    fromColumn: sourceList.id,
                    toColumn: destList.id,
                    timestamp: now
                }
            ]
        } catch (error: any) {
            console.error("Error updating card movements:", error)
        }
    }

    // Update board state in the background - make sure to await this
    try {
        await updateBoardState(boardId, updatedLists)
        console.log("Board state updated successfully")
    } catch (error: any) {
        console.error("Failed to update board state:", error)
        toast({
            title: "Warning",
            description: "Card moved but failed to save. Please try again.",
            variant: "destructive"
        })
    }
}

export async function fetchBoardData(
    setLists: (lists: any[]) => void,
    setBoardId: (id: string | null) => void,
    setBoardName: (name: string) => void,
    router: NextRouter
) {
    try {
        const data = await boardAPI.getBoard()
        console.log("Board data received:", data) // Debug log
        setLists(data.lists)
        setBoardId(data.id) // Changed from data._id to data.id
        setBoardName(data.name)
    } catch (error: any) {
        console.error("Error fetching board data:", error)
        toast({ title: "Error", description: error.message || "Error fetching board data.", variant: "destructive" })
        router.push("/login")
    }
}

export function archiveCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card: any) =>
            card.id === cardId ? { ...card, archived: true } : card
        ),
    }))

    setLists(updatedLists)
    updateBoardState(boardId, updatedLists)
}

export function restoreCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card: any) =>
            card.id === cardId ? { ...card, archived: false } : card
        ),
    }))

    setLists(updatedLists)
    updateBoardState(boardId, updatedLists)
}

export function deleteCard(
    lists: any[],
    setLists: React.Dispatch<React.SetStateAction<any[]>>,
    boardId: string | null,
    cardId: string
) {
    const updatedLists = lists.map((list) => ({
        ...list,
        cards: list.cards.map((card: any) =>
            card.id === cardId ? { ...card, deleted: true } : card
        )
    }))

    setLists(updatedLists)
    updateBoardState(boardId, updatedLists)
}

// Card movement tracking
export async function recordCardMovement(
    cardId: string,
    fromListId: string,
    toListId: string,
    boardId: string | null
) {
    try {
        // await cardMovementAPI.createMovement({
        //     card_id: cardId,
        //     from_list_id: fromListId,
        //     to_list_id: toListId,
        //     board_id: boardId,
        // })
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to record card movement: ${error.message}`, variant: "destructive" })
    }
}

export async function updateCardMovementState(
    cardId: string,
    fromListId: string,
    toListId: string,
    boardId: string | null
) {
    try {
        // await recordCardMovement(cardId, fromListId, toListId, boardId)
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to update card movement state: ${error.message}`, variant: "destructive" })
    }
}
