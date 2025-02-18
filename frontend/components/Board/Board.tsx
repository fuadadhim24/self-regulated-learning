import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BoardHeader from "./BoardHeader";
import BoardContent from "./BoardContent";
import { fetchBoardData } from "@/utils/boardService";
import type { ListType } from "@/types";

export default function Board() {
    const [lists, setLists] = useState<ListType[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [boardName, setBoardName] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        fetchBoardData(setLists, setBoardId, setBoardName, router);
    }, []);

    return (
        <div className="min-h-screen bg-blue-100 p-8">
            <BoardHeader boardName={boardName} onBack={() => router.push("/dashboard")} />
            <BoardContent lists={lists} setLists={setLists} boardId={boardId} />
        </div>
    );
}
