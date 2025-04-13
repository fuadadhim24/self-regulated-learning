import { use } from "react"

const API_URL = 'http://localhost:5000'

export async function register(firstName: string, lastName: string, email: string, username: string, password: string) {
    const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, username, password }),
    })
    return response
}

export async function login(username: string, password: string) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    return response
}

export async function searchUserByUsername(token: string, username: string) {
    const response = await fetch(`${API_URL}/username/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

export async function searchUserById(token: string, userId: string) {
    const response = await fetch(`${API_URL}/users/id/${userId}`, {
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

        return responseData;
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

export async function searchBoards(token: string, query: string) {
    const response = await fetch(`${API_URL}/search-boards?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response
}

export async function getProgressReport(token: string) {
    const response = await fetch(`${API_URL}/progress-report`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function getCourses(token: string) {
    const response = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function deleteCourse(token: string, courseId: string) {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function addCourse(token: string, course: any) {
    const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(course),
    });
    return response;
}

export async function getBoardByUser(token: string, userId: string) {
    const response = await fetch(`${API_URL}/board/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function getAllUsers(token: string) {
    const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function getUserByUsername(token: string, username: string) {
    const response = await fetch(`${API_URL}/users/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function getAllLearningStrategies(token: string) {
    console.log('Fetching all learning strategies...');
    const response = await fetch(`${API_URL}/learningstrats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Get all learning strategies response:', response.status);
    return response;
}

export async function getLearningStrategy(token: string, id: string) {
    const response = await fetch(`${API_URL}/learningstrats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function addLearningStrategy(token: string, strategy: { name: string; description?: string }) {
    console.log('Adding learning strategy:', strategy);
    const response = await fetch(`${API_URL}/learningstrats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            learning_strat_name: strategy.name,
            description: strategy.description
        }),
    });
    console.log('Add learning strategy response:', response.status);
    return response;
}

export async function updateLearningStrategy(token: string, id: string, strategy: { name: string; description?: string }) {
    const response = await fetch(`${API_URL}/learningstrats/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            learning_strat_name: strategy.name,
            description: strategy.description
        }),
    });
    return response;
}

export async function deleteLearningStrategy(token: string, id: string) {
    const response = await fetch(`${API_URL}/learningstrats/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
}

export async function getCurrentUser(token: string) {
    try {
        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await fetch(`${API_URL}/users/id/${userId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
}