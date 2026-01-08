// API response interface
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// User interface (shared)
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    currentStreak?: number;
    longestStreak?: number;
    totalActiveDays?: number;
    lastActivityDate?: string;
}

// API base URL
const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // Use relative path on client
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
    return 'http://localhost:3000';
};

// API client helper
class ApiClient {
    private baseUrl: string;
    private token: string | null;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl !== undefined ? baseUrl : getBaseUrl();
        this.token = null;
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    }

    // Auth endpoints
    async trackActivity() {
        return this.request('/api/auth/activity', {
            method: 'POST',
        });
    }

    async register(email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.request<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.request<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>('/api/auth/me');
    }

    logout() {
        this.setToken(null);
    }

    // Path endpoints
    async getPaths(params?: {
        query?: string;
        category?: string;
        difficulty?: string;
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, String(value));
                }
            });
        }
        const queryString = searchParams.toString();
        return this.request(`/api/paths${queryString ? `?${queryString}` : ''}`);
    }

    async getPath(id: string) {
        return this.request(`/api/paths/${id}`);
    }

    async createPath(pathData: any) {
        return this.request('/api/paths', {
            method: 'POST',
            body: JSON.stringify(pathData),
        });
    }

    async updatePath(id: string, pathData: any) {
        return this.request(`/api/paths/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pathData),
        });
    }

    async deletePath(id: string) {
        return this.request(`/api/paths/${id}`, {
            method: 'DELETE',
        });
    }

    async clonePath(id: string) {
        return this.request(`/api/paths/${id}/clone`, {
            method: 'POST',
        });
    }

    // User endpoints
    async getUserPaths() {
        return this.request('/api/user/paths');
    }

    async getUserProgress(status?: string) {
        const queryString = status ? `?status=${status}` : '';
        return this.request(`/api/user/progress${queryString}`);
    }

    // Progress endpoints
    async startTracking(pathId: string) {
        return this.request(`/api/progress/${pathId}`, {
            method: 'POST',
        });
    }

    async getProgress(pathId: string) {
        return this.request(`/api/progress/${pathId}`);
    }

    async updateStepCompletion(pathId: string, stepId: string, completed: boolean) {
        return this.request(`/api/progress/${pathId}/steps/${stepId}`, {
            method: 'PUT',
            body: JSON.stringify({ completed }),
        });
    }

    // AI generation
    async generateRoadmap(params: {
        topic: string;
        goal?: string;
        difficulty?: string;
        currentLevel?: string;
    }) {
        return this.request('/api/generate', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    // Saved Paths
    async savePath(pathId: string) {
        return this.request(`/api/user/saved-paths/${pathId}`, {
            method: 'POST',
        });
    }

    async unsavePath(pathId: string) {
        return this.request(`/api/user/saved-paths/${pathId}`, {
            method: 'DELETE',
        });
    }

    // Categories

    // Notifications
    async getNotifications() {
        return this.request('/api/notifications');
    }

    async markNotificationRead(id: string) {
        return this.request(`/api/notifications/${id}/read`, {
            method: 'POST',
        });
    }

    async markAllNotificationsRead() {
        return this.request('/api/notifications/mark-all-read', {
            method: 'POST',
        });
    }

    async deleteNotification(id: string) {
        return this.request(`/api/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    async clearAllNotifications() {
        return this.request('/api/notifications/clear-all', {
            method: 'DELETE',
        });
    }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
