"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BoardHeader from "./BoardHeader";
import BoardContent from "./BoardContent";
import ArchivedTasksModal from "@/components/ArchivedTasksModal";
import { fetchBoardData, restoreCard, deleteCard } from "@/utils/boardService";
import type { ListType, Card } from "@/types";

interface BoardProps {
  onCardMove?: () => void;
}

export default function Board({ onCardMove }: BoardProps) {
  const [lists, setLists] = useState<ListType[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState<string>("");
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchBoardData(setLists, setBoardId, setBoardName, router);
  }, []);

  // Get archived tasks and include their column (list) title
  const archivedCards: Card[] = lists.flatMap(
    (list) =>
      list.cards
        .filter((card) => card.archived && !card.deleted)
        .map((card) => ({ ...card, listTitle: list.title })) // Add listTitle dynamically
  );

  return (
    <div className="rounded-xl shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
      <BoardHeader
        boardName={boardName}
        onShowArchived={() => setIsArchivedModalOpen(true)}
      />
      <div className="p-4 md:p-6">
        <BoardContent
          lists={lists}
          setLists={setLists}
          boardId={boardId}
          onCardMove={onCardMove}
        />
      </div>

      {/* Archived Tasks Modal */}
      {isArchivedModalOpen && (
        <ArchivedTasksModal
          archivedTasks={archivedCards}
          onClose={() => setIsArchivedModalOpen(false)}
          onRestore={(cardId) => restoreCard(lists, setLists, boardId, cardId)}
          onDelete={(cardId) => deleteCard(lists, setLists, boardId, cardId)}
        />
      )}
    </div>
  );
}
