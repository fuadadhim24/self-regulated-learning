import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBoard } from '@/utils/api';
import BoardHeader from './BoardHeader';
import BoardContent from './BoardContent';

export interface Card {
    id: string;
    title: string;
    sub_title: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: 'low' | 'medium' | 'high';
}

interface ListType {
    id: string;
    title: string;
    cards: Card[];
    isAddingCard: boolean;
}

export default function Board() {
    const [lists, setLists] = useState<ListType[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [boardName, setBoardName] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        fetchBoard();
    }, []);

    const fetchBoard = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const response = await getBoard(token);

        if (response.ok) {
            const data = await response.json();
            setLists(data.lists);
            setBoardId(data.id);
            setBoardName(data.name);
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 p-8">
            <BoardHeader boardName={boardName} onBack={() => router.push('/dashboard')} />
            <BoardContent lists={lists} setLists={setLists} boardId={boardId} />
        </div>
    );
}
