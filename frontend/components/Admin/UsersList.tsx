// components/Admin/UsersList.tsx
import { useEffect, useState } from "react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    boards: any[]; // You can type this further based on your board structure
}

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Replace with your actual API call
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch(console.error);
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Users & Boards</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id} className="border p-4 rounded mb-2">
                        <div className="flex justify-between">
                            <div>
                                <p className="font-semibold">{user.first_name} {user.last_name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <button className="bg-blue-500 text-white px-2 py-1 rounded">
                                View Boards
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
