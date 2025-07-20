import axios from 'axios';
import { Table, TableInfo } from '@shared/types/table.types';
import { TableConfig } from '@shared/types/game.types';

const API_BASE_URL = '/api/tables';

class TableService {
    private client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        // Add auth token to requests if available (for guest access, this is optional)
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async getAvailableTables(): Promise<TableInfo[]> {
        try {
            const response = await this.client.get('/');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching tables:', error);
            // Return mock data for guest access if API fails
            return this.getMockTables();
        }
    }

    private getMockTables(): TableInfo[] {
        return [
            {
                id: 'table-1',
                name: 'Texas Hold\'em Table 1',
                playerCount: 3,
                maxPlayers: 9,
                blinds: { small: 10, big: 20 },
                averagePot: 150,
                handsPerHour: 30,
                waitingList: 0,
                isPrivate: false
            },
            {
                id: 'table-2',
                name: 'High Stakes Table',
                playerCount: 6,
                maxPlayers: 9,
                blinds: { small: 50, big: 100 },
                averagePot: 500,
                handsPerHour: 25,
                waitingList: 2,
                isPrivate: false
            },
            {
                id: 'table-3',
                name: 'Beginner\'s Table',
                playerCount: 2,
                maxPlayers: 9,
                blinds: { small: 5, big: 10 },
                averagePot: 75,
                handsPerHour: 20,
                waitingList: 0,
                isPrivate: false
            }
        ];
    }

    async getTable(tableId: string): Promise<Table> {
        try {
            const response = await this.client.get(`/${tableId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching table:', error);
            throw error;
        }
    }

    async createTable(config: TableConfig): Promise<Table> {
        try {
            const response = await this.client.post('/', { config });
            return response.data.data;
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }

    async joinTable(tableId: string, seatNumber?: number): Promise<Table> {
        try {
            const response = await this.client.post(`/${tableId}/join`, { seatNumber });
            return response.data.data;
        } catch (error) {
            console.error('Error joining table:', error);
            throw error;
        }
    }

    async leaveTable(tableId: string): Promise<void> {
        try {
            await this.client.post(`/${tableId}/leave`);
        } catch (error) {
            console.error('Error leaving table:', error);
            throw error;
        }
    }

    async sitDown(tableId: string, seatNumber: number, buyIn: number): Promise<any> {
        try {
            const response = await this.client.post(`/${tableId}/sit`, { seatNumber, buyIn });
            return response.data;
        } catch (error) {
            console.error('Error sitting down:', error);
            throw error;
        }
    }

    async standUp(tableId: string): Promise<any> {
        try {
            const response = await this.client.post(`/${tableId}/stand`);
            return response.data;
        } catch (error) {
            console.error('Error standing up:', error);
            throw error;
        }
    }

    async getTableHistory(tableId: string, limit = 50): Promise<any> {
        try {
            const response = await this.client.get(`/${tableId}/history?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching table history:', error);
            throw error;
        }
    }

    async updateTableSettings(tableId: string, settings: Partial<TableConfig>): Promise<Table> {
        try {
            const response = await this.client.put(`/${tableId}/settings`, settings);
            return response.data.data;
        } catch (error) {
            console.error('Error updating table settings:', error);
            throw error;
        }
    }
}

export const tableService = new TableService(); 