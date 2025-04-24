const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // adjust as needed

let accessToken: string | null = null;

export function setAccessToken(token: string) {
    accessToken = token;
    localStorage.setItem("token", token);
}

export function getAccessToken(): string | null {
    return accessToken;
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
    if (!accessToken) {
        throw new Error("No access token available");
    }

    init.headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(input, { ...init, credentials: 'include' });

    if (response.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            return authorizedFetch(input, init, false); // Retry once
        }
    }

    return response;
}