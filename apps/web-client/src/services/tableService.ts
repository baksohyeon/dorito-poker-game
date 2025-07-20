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
        // Add auth token to requests
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async getAvailableTables(): Promise<TableInfo[]> {
        const response = await this.client.get('/');
        return response.data.data || []; // Handle the actual API response structure
    }

    async getTable(tableId: string): Promise<Table> {
        const response = await this.client.get(`/${tableId}`);
        return response.data.data;
    }

    async createTable(config: TableConfig): Promise<Table> {
        const response = await this.client.post('/', { config });
        return response.data.data;
    }

    async joinTable(tableId: string, seatNumber?: number): Promise<Table> {
        const response = await this.client.post(`/${tableId}/join`, { seatNumber });
        return response.data.data;
    }

    async leaveTable(tableId: string): Promise<void> {
        await this.client.post(`/${tableId}/leave`);
    }

    async sitDown(tableId: string, seatNumber: number, buyIn: number): Promise<any> {
        const response = await this.client.post(`/${tableId}/sit`, { seatNumber, buyIn });
        return response.data;
    }

    async standUp(tableId: string): Promise<any> {
        const response = await this.client.post(`/${tableId}/stand`);
        return response.data;
    }

    async getTableHistory(tableId: string, limit = 50): Promise<any> {
        const response = await this.client.get(`/${tableId}/history?limit=${limit}`);
        return response.data;
    }

    async updateTableSettings(tableId: string, settings: Partial<TableConfig>): Promise<Table> {
        const response = await this.client.put(`/${tableId}/settings`, settings);
        return response.data.data;
    }
}

export const tableService = new TableService(); 