import type { ListType, Card } from "@/types";
import { getBoard, updateBoard, triggerChatbotCardMovement } from "@/utils/api";
import { NextRouter } from "next/router";

export async function updateBoardState(
  boardId: string | null,
  lists: ListType[]
) {
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
    column_movements: [
      {
        fromColumn: "initial",
        toColumn: listId,
        timestamp: now,
      },
    ],
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
  destinationDroppableId: string,
  onCardMove?: () => void
) {
  const sourceListIndex = lists.findIndex(
    (list) => list.id === sourceDroppableId
  );
  const destListIndex = lists.findIndex(
    (list) => list.id === destinationDroppableId
  );

  if (sourceListIndex < 0 || destListIndex < 0) return;

  const sourceList = {
    ...lists[sourceListIndex],
    cards: [...lists[sourceListIndex].cards],
  };
  const destList = {
    ...lists[destListIndex],
    cards: [...lists[destListIndex].cards],
  };

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

  // If moving between columns, record the movement and trigger chatbot response
  if (sourceList.id !== destList.id) {
    try {
      const now = new Date().toISOString();
      // Update local state first
      movedCard.column_movements = [
        ...(movedCard.column_movements || []),
        {
          fromColumn: sourceList.id,
          toColumn: destList.id,
          timestamp: now,
        },
      ];

      // Trigger chatbot response (this will also record the movement in the backend)
      if (boardId) {
        console.log("Calling triggerChatbotCardMovement with:", {
          boardId,
          cardId: movedCard.id,
          fromColumn: sourceList.id,
          toColumn: destList.id,
        });

        // Get column names for better user experience
        const sourceColumnName =
          lists.find((list) => list.id === sourceList.id)?.title ||
          sourceList.id;
        const destColumnName =
          lists.find((list) => list.id === destList.id)?.title || destList.id;

        // Call triggerChatbotCardMovement and handle the response
        triggerChatbotCardMovement(
          boardId,
          movedCard.id,
          sourceColumnName,
          destColumnName
        )
          .then(async (response) => {
            if (response.ok) {
              try {
                const data = await response.json();
                console.log("Chatbot response:", data);

                // Store the response in localStorage for the chatbot to pick up
                if (data.output || data.reply) {
                  const chatbotMessage = {
                    sender: "bot",
                    text: data.output || data.reply,
                    timestamp: new Date(),
                    type: "card_movement",
                  };

                  // Store in localStorage
                  const existingMessages = JSON.parse(
                    localStorage.getItem("chatbotMessages") || "[]"
                  );
                  existingMessages.push(chatbotMessage);
                  localStorage.setItem(
                    "chatbotMessages",
                    JSON.stringify(existingMessages)
                  );

                  // Dispatch a custom event to notify the chatbot component
                  window.dispatchEvent(
                    new CustomEvent("chatbot-message", {
                      detail: chatbotMessage,
                    })
                  );
                }
              } catch (parseError) {
                console.error("Error parsing chatbot response:", parseError);
              }
            }
          })
          .catch((error) => {
            console.error("Failed to trigger chatbot response:", error);
          });

        // Call onCardMove callback if provided
        if (onCardMove) {
          onCardMove();
        }
      }
    } catch (error) {
      console.error("Failed to update card movement state:", error);
    }
  }

  // Update board state in the background
  updateBoardState(boardId, updatedLists).catch((error) => {
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
    ),
  }));

  setLists(updatedLists);
  updateBoardState(boardId, updatedLists);
}
