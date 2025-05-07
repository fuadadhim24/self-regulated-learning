const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // adjust as needed

let accessToken: string | null = null;

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    if (!accessToken) {
        accessToken = localStorage.getItem("token");
    }
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
}

export function loadAccessTokenFromStorage() {
    const token = localStorage.getItem("token");
    if (token) {
        accessToken = token;
    }
}

async function refreshAccessToken(): Promise<string | null> {
    const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

    if (response.ok) {
        const data = await response.json();
        accessToken = data.token;
        return accessToken;
    } else {
        console.warn("Refresh failed, user may need to log in again.");
        return null;
    }
}

export async function authorizedFetch(input: RequestInfo, init: RequestInit = {}, retry = true): Promise<Response> {
    const token = getAccessToken();
    if (!token) {
        throw new Error("No access token available");
    }

    init.headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(input, { ...init, credentials: 'include' });

    if (response.status === 401 && retry) {
        try {
            setAccessToken(null);
            throw new Error("Session expired");
        } catch (error) {
            throw error;
        }
    }

    return response;
}