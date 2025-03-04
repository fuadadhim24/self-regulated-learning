import { useEffect, useState } from "react";
import type { User, Board } from "@/types";

interface UserDetailsProps {
    userId: string;
    onClose: () => void;
}

export default function UserDetails({ userId, onClose }: UserDetailsProps) {
    const [user, setUser] = useState<User | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not authenticated");

                // Fetch user details
                const userRes = await fetch(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userRes.ok) throw new Error("Failed to fetch user details");
                const userData = await userRes.json();
                setUser(userData);

                // Fetch user's boards
                const boardsRes = await fetch(`/api/users/${userId}/boards`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!boardsRes.ok) throw new Error("Failed to fetch user's boards");
                const boardsData = await boardsRes.json();
                setBoards(boardsData);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchUserDetails();
    }, [userId]);

    if (error) {
        return (
            <div className="p-4">
                <p className="text-red-500">Error: {error}</p>
                <button onClick={onClose} className="mt-4 bg-gray-300 px-4 py-2 rounded">
                    Close
                </button>
            </div>
        );
    }

    if (!user) {
        return <div className="p-4">Loading user details...</div>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-[90%] max-w-3xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
                >
                    &times;
                </button>
                <h1 className="text-3xl font-bold mb-4">User Details</h1>
                <div className="border p-4 rounded mb-6">
                    <p>
                        <strong>Name:</strong> {user.first_name} {user.last_name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Role:</strong> {user.role}
                    </p>
                </div>

                <h2 className="text-2xl font-bold mb-4">Boards</h2>
                {boards.length === 0 ? (
                    <p>No boards available for this user.</p>
                ) : (
                    <ul className="space-y-4">
                        {boards.map((board) => (
                            <li key={board.id} className="border p-4 rounded shadow">
                                <h3 className="font-bold text-xl">{board.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {board.lists.length} columns
                                </p>
                                {/* You can extend this to display more details about the board and its cards */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
