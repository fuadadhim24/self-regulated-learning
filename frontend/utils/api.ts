const API_URL = 'http://localhost:5000'

export async function register(firstName: string, lastName: string, email: string, username: string, password: string) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, username, password }),
    })
    return response
}

export async function login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    return response
}

export async function searchUserById(token: string, userId: string) {
    const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
    }

    return response.json(); // Assuming the backend returns JSON
}


export async function getBoard(token: string) {
    const response = await fetch(`${API_URL}/board`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response
}

export async function updateBoard(token: string, boardId: string, lists: any[]) {
    try {
        console.log("Sending update request:", { boardId, lists });

        const response = await fetch(`${API_URL}/update-board`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ boardId, lists }),
        });

        console.log("Response status:", response.status);
        const responseData = await response.json();
        console.log("Response data:", responseData);

        return response;
    } catch (error) {
        console.error("Error updating board:", error);
        throw error; // Re-throw error for further handling
    }
}

export async function createBoard(token: string, name: string) {
    const response = await fetch(`${API_URL}/create-board`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    })
    return response
}

export async function starBoard(token: string, boardId: string, starred: boolean) {
    const response = await fetch(`${API_URL}/star-board`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ boardId, starred }),
    })
    return response
}

export async function getStarredBoards(token: string) {
    const response = await fetch(`${API_URL}/starred-boards`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response
}

export async function searchBoards(token: string, query: string) {
    const response = await fetch(`${API_URL}/search-boards?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response
}
