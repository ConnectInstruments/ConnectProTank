import { Tank } from "@shared/schema";
import pg from 'pg';
import session from "express-session";
import connectPg from "connect-pg-simple";

const { Pool } = pg;
const PostgresSessionStore = connectPg(session);
import MemoryStore from "memorystore";

const MemStore = MemoryStore(session);

// Storage interface with tank CRUD operations
export interface IStorage {
  getAllTanks(): Promise<Tank[]>;
  getTank(id: number): Promise<Tank | undefined>;
  createTank(tank: Omit<Tank, "id">): Promise<Tank>;
  updateTank(id: number, updates: Partial<Tank>): Promise<Tank>;
  deleteTank(id: number): Promise<boolean>;
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private tanks: Map<number, Tank>;
  private currentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.tanks = new Map();
    this.currentId = 1;
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some sample tanks
    this.initializeSampleTanks();
  }
  
  private initializeSampleTanks() {
    const now = new Date().toISOString();
    
    const sampleTanks = [
      {
        name: "Tank A",
        fillLevel: 65,
        temperature: 23.8,
        capacity: 2000, // 2000 liters
        status: "online" as const,
        lastUpdated: now
      },
      {
        name: "Tank B",
        fillLevel: 78,
        temperature: 24.2,
        capacity: 1500, // 1500 liters
        status: "online" as const,
        lastUpdated: now
      },
      {
        name: "Tank C",
        fillLevel: 22,
        temperature: 25.7,
        capacity: 3000, // 3000 liters
        status: "warning" as const,
        lastUpdated: now
      },
      {
        name: "Tank D",
        fillLevel: 43,
        temperature: 24.3,
        capacity: 1000, // 1000 liters
        status: "online" as const,
        lastUpdated: now
      }
    ];
    
    sampleTanks.forEach(tank => {
      this.createTank(tank);
    });
  }

  async getAllTanks(): Promise<Tank[]> {
    return Array.from(this.tanks.values());
  }

  async getTank(id: number): Promise<Tank | undefined> {
    return this.tanks.get(id);
  }

  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    const id = this.currentId++;
    const newTank: Tank = { id, ...tank };
    this.tanks.set(id, newTank);
    return newTank;
  }

  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    const tank = this.tanks.get(id);
    
    if (!tank) {
      throw new Error(`Tank with id ${id} not found`);
    }
    
    const updatedTank = { ...tank, ...updates };
    this.tanks.set(id, updatedTank);
    
    return updatedTank;
  }

  async deleteTank(id: number): Promise<boolean> {
    return this.tanks.delete(id);
  }
}

// PostgreSQL storage implementation
export class PostgresStorage implements IStorage {
  private pool: any; // Using any to avoid type issues
  public sessionStore: session.Store;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true
    });

    // Initialize the database with tables if needed
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      // Create tanks table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS tanks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          fill_level DECIMAL NOT NULL,
          temperature DECIMAL NOT NULL,
          capacity INTEGER NOT NULL,
          status VARCHAR(50) NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async getAllTanks(): Promise<Tank[]> {
    try {
      const result = await this.pool.query('SELECT * FROM tanks ORDER BY id');
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        fillLevel: parseFloat(row.fill_level),
        temperature: parseFloat(row.temperature),
        capacity: parseInt(row.capacity),
        status: row.status,
        lastUpdated: row.last_updated.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching tanks:', error);
      return [];
    }
  }

  async getTank(id: number): Promise<Tank | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM tanks WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        fillLevel: parseFloat(row.fill_level),
        temperature: parseFloat(row.temperature),
        capacity: parseInt(row.capacity),
        status: row.status,
        lastUpdated: row.last_updated.toISOString()
      };
    } catch (error) {
      console.error(`Error fetching tank with id ${id}:`, error);
      return undefined;
    }
  }

  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    try {
      const result = await this.pool.query(
        `INSERT INTO tanks (name, fill_level, temperature, capacity, status, last_updated) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          tank.name, 
          tank.fillLevel, 
          tank.temperature, 
          tank.capacity, 
          tank.status, 
          new Date()
        ]
      );
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        fillLevel: parseFloat(row.fill_level),
        temperature: parseFloat(row.temperature),
        capacity: parseInt(row.capacity),
        status: row.status,
        lastUpdated: row.last_updated.toISOString()
      };
    } catch (error) {
      console.error('Error creating tank:', error);
      throw new Error('Failed to create tank in database');
    }
  }

  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    try {
      // Build dynamic update query based on provided fields
      let queryParts = [];
      let queryParams = [];
      let paramCounter = 1;
      
      if (updates.name !== undefined) {
        queryParts.push(`name = $${paramCounter++}`);
        queryParams.push(updates.name);
      }
      
      if (updates.fillLevel !== undefined) {
        queryParts.push(`fill_level = $${paramCounter++}`);
        queryParams.push(updates.fillLevel);
      }
      
      if (updates.temperature !== undefined) {
        queryParts.push(`temperature = $${paramCounter++}`);
        queryParams.push(updates.temperature);
      }
      
      if (updates.capacity !== undefined) {
        queryParts.push(`capacity = $${paramCounter++}`);
        queryParams.push(updates.capacity);
      }
      
      if (updates.status !== undefined) {
        queryParts.push(`status = $${paramCounter++}`);
        queryParams.push(updates.status);
      }
      
      // Always update last_updated timestamp
      queryParts.push(`last_updated = $${paramCounter++}`);
      queryParams.push(new Date());
      
      // Add the id as the last parameter
      queryParams.push(id);
      
      const query = `
        UPDATE tanks 
        SET ${queryParts.join(', ')} 
        WHERE id = $${paramCounter} 
        RETURNING *
      `;
      
      const result = await this.pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        throw new Error(`Tank with id ${id} not found`);
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        fillLevel: parseFloat(row.fill_level),
        temperature: parseFloat(row.temperature),
        capacity: parseInt(row.capacity),
        status: row.status,
        lastUpdated: row.last_updated.toISOString()
      };
    } catch (error) {
      console.error(`Error updating tank with id ${id}:`, error);
      throw error;
    }
  }

  async deleteTank(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query('DELETE FROM tanks WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting tank with id ${id}:`, error);
      return false;
    }
  }
}

// MySQL storage implementation (placeholder)
export class MySQLStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000,
    });
    console.log("MySQL connection would be initialized here");
  }

  async getAllTanks(): Promise<Tank[]> {
    throw new Error("MySQL storage not implemented yet");
  }

  async getTank(id: number): Promise<Tank | undefined> {
    throw new Error("MySQL storage not implemented yet");
  }

  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    throw new Error("MySQL storage not implemented yet");
  }

  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    throw new Error("MySQL storage not implemented yet");
  }

  async deleteTank(id: number): Promise<boolean> {
    throw new Error("MySQL storage not implemented yet");
  }
}

// MongoDB storage implementation (placeholder)
export class MongoDBStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000,
    });
    console.log("MongoDB connection would be initialized here");
  }

  async getAllTanks(): Promise<Tank[]> {
    throw new Error("MongoDB storage not implemented yet");
  }

  async getTank(id: number): Promise<Tank | undefined> {
    throw new Error("MongoDB storage not implemented yet");
  }

  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    throw new Error("MongoDB storage not implemented yet");
  }

  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    throw new Error("MongoDB storage not implemented yet");
  }

  async deleteTank(id: number): Promise<boolean> {
    throw new Error("MongoDB storage not implemented yet");
  }
}

// Factory function to get the appropriate storage implementation
export function getStorage(type: string): IStorage {
  switch (type) {
    case 'postgres':
      return new PostgresStorage();
    case 'mysql':
      return new MySQLStorage();
    case 'mongodb':
      return new MongoDBStorage();
    case 'memory':
    default:
      return new MemStorage();
  }
}

// Default storage is in-memory
export const storage = new MemStorage();
