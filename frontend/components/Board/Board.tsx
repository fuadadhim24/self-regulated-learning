import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BoardHeader from "./BoardHeader";
import BoardContent from "./BoardContent";
import { fetchBoardData } from "@/utils/boardService";
import type { ListType, Card } from "@/types";

export default function Board() {
    const [lists, setLists] = useState<ListType[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [boardName, setBoardName] = useState<string>("");
    const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false); // Modal state

    const router = useRouter();

    useEffect(() => {
        fetchBoardData(setLists, setBoardId, setBoardName, router);
    }, []);

    // Get archived tasks
    const archivedCards: Card[] = lists.flatMap(list => list.cards.filter(card => card.archived));

    return (
        <div className="min-h-screen bg-blue-100 p-8">
            <BoardHeader
                boardName={boardName}
                onBack={() => router.push("/dashboard")}
                onShowArchived={() => setIsArchivedModalOpen(true)} // Open modal
            />
            <BoardContent lists={lists} setLists={setLists} boardId={boardId} />

            {/* Archived Tasks Modal */}
            {isArchivedModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Archived Tasks</h2>
                        <ul className="max-h-60 overflow-auto">
                            {archivedCards.length > 0 ? (
                                archivedCards.map(card => (
                                    <li key={card.id} className="p-2 border-b">
                                        {card.title}
                                    </li>
                                ))
                            ) : (
                                <p>No archived tasks</p>
                            )}
                        </ul>
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => setIsArchivedModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
