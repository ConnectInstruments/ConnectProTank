import { Tank, TankHistory, TankMaintenance } from "@shared/schema";
import pg from 'pg';
import session from "express-session";
import connectPg from "connect-pg-simple";

const { Pool } = pg;
const PostgresSessionStore = connectPg(session);
import MemoryStore from "memorystore";

const MemStore = MemoryStore(session);

// Storage interface with tank CRUD operations
export interface IStorage {
  // Tank CRUD operations
  getAllTanks(): Promise<Tank[]>;
  getTank(id: number): Promise<Tank | undefined>;
  createTank(tank: Omit<Tank, "id">): Promise<Tank>;
  updateTank(id: number, updates: Partial<Tank>): Promise<Tank>;
  deleteTank(id: number): Promise<boolean>;
  
  // Tank grouping and filtering
  getTanksByGroup(group: string): Promise<Tank[]>;
  getTanksByStatus(status: string): Promise<Tank[]>;
  
  // Tank history operations
  getTankHistory(tankId: number): Promise<TankHistory[]>;
  addTankHistoryEntry(entry: Omit<TankHistory, "id">): Promise<TankHistory>;
  deleteTankHistory(tankId: number): Promise<boolean>;
  
  // Tank maintenance operations
  getTankMaintenance(tankId: number): Promise<TankMaintenance[]>;
  getMaintenanceById(id: number): Promise<TankMaintenance | undefined>;
  scheduleMaintenance(maintenance: Omit<TankMaintenance, "id">): Promise<TankMaintenance>;
  updateMaintenance(id: number, updates: Partial<TankMaintenance>): Promise<TankMaintenance>;
  cancelMaintenance(id: number): Promise<boolean>;
  deleteMaintenance(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private tanks: Map<number, Tank>;
  private tankHistory: Map<number, TankHistory[]>;
  private tankMaintenance: Map<number, TankMaintenance>;
  private historyId: number;
  private maintenanceId: number;
  private currentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.tanks = new Map();
    this.tankHistory = new Map();
    this.tankMaintenance = new Map();
    this.currentId = 1;
    this.historyId = 1;
    this.maintenanceId = 1;
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
        lastUpdated: now,
        group: "Production",
        location: "Building A, Floor 1",
        description: "Main production tank for raw materials",
        alertLowThreshold: 15,
        alertHighThreshold: 85,
        tempLowThreshold: 20,
        tempHighThreshold: 30,
        maintenanceInterval: 90,
        lastMaintenance: now,
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        installDate: new Date(2023, 0, 15).toISOString(),
        model: "Industrial-2000",
        manufacturer: "TankCorp",
        serialNumber: "TC2023-45678",
        isActive: true
      },
      {
        name: "Tank B",
        fillLevel: 78,
        temperature: 24.2,
        capacity: 1500, // 1500 liters
        status: "online" as const,
        lastUpdated: now,
        group: "Production",
        location: "Building A, Floor 1",
        description: "Secondary production tank for processing",
        alertLowThreshold: 10,
        alertHighThreshold: 90,
        tempLowThreshold: 22,
        tempHighThreshold: 28,
        maintenanceInterval: 60,
        lastMaintenance: now,
        nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        installDate: new Date(2023, 2, 10).toISOString(),
        model: "Industrial-1500",
        manufacturer: "TankCorp",
        serialNumber: "TC2023-45679",
        isActive: true
      },
      {
        name: "Tank C",
        fillLevel: 22,
        temperature: 25.7,
        capacity: 3000, // 3000 liters
        status: "warning" as const,
        lastUpdated: now,
        group: "Storage",
        location: "Building B, Floor 2",
        description: "Primary storage tank for finished product",
        alertLowThreshold: 20,
        alertHighThreshold: 95,
        tempLowThreshold: 18,
        tempHighThreshold: 32,
        maintenanceInterval: 120,
        lastMaintenance: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        installDate: new Date(2022, 11, 5).toISOString(),
        model: "Storage-3000",
        manufacturer: "StorageSolutions",
        serialNumber: "SS2022-12345",
        isActive: true
      },
      {
        name: "Tank D",
        fillLevel: 43,
        temperature: 24.3,
        capacity: 1000, // 1000 liters
        status: "online" as const,
        lastUpdated: now,
        group: "Testing",
        location: "Lab Building, Floor 1",
        description: "Testing and quality control tank",
        alertLowThreshold: 25,
        alertHighThreshold: 75,
        tempLowThreshold: 20,
        tempHighThreshold: 25,
        maintenanceInterval: 30,
        lastMaintenance: now,
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        installDate: new Date(2023, 5, 20).toISOString(),
        model: "Lab-1000",
        manufacturer: "LabEquipment",
        serialNumber: "LE2023-98765",
        isActive: true
      }
    ];
    
    sampleTanks.forEach(tank => {
      this.createTank(tank);
    });

    // Add some sample history entries
    const sampleHistoryEntries = [
      {
        tankId: 1,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: "fill",
        value: 55,
        description: "Automatic fill to 55%"
      },
      {
        tankId: 1, 
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: "temperature",
        value: 24.5,
        description: "Temperature adjustment"
      },
      {
        tankId: 1,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: "maintenance",
        value: null,
        description: "Routine inspection"
      },
      {
        tankId: 2,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: "alert",
        value: 92,
        description: "High level alert"
      }
    ];

    sampleHistoryEntries.forEach(entry => {
      this.addTankHistoryEntry(entry as any);
    });

    // Add sample maintenance entries
    const sampleMaintenanceEntries = [
      {
        tankId: 1,
        scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        maintenanceType: "inspection",
        description: "Quarterly inspection",
        technician: "John Doe",
        status: "scheduled" as const
      },
      {
        tankId: 2,
        scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        maintenanceType: "cleaning",
        description: "Interior cleaning",
        technician: "Jane Smith",
        status: "scheduled" as const
      },
      {
        tankId: 3,
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        maintenanceType: "repair",
        description: "Valve replacement",
        technician: "Mike Johnson",
        status: "scheduled" as const
      }
    ];

    sampleMaintenanceEntries.forEach(entry => {
      this.scheduleMaintenance(entry as any);
    });
  }

  // Basic tank operations
  async getAllTanks(): Promise<Tank[]> {
    return Array.from(this.tanks.values());
  }

  async getTank(id: number): Promise<Tank | undefined> {
    return this.tanks.get(id);
  }

  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    const id = this.currentId++;
    // Ensure default values for required fields
    const newTank: Tank = { 
      id, 
      ...tank,
      group: tank.group || "default",
      status: tank.status || "online",
      lastUpdated: tank.lastUpdated || new Date().toISOString()
    };
    this.tanks.set(id, newTank);
    
    // Add a history entry for tank creation
    this.addTankHistoryEntry({
      tankId: id,
      timestamp: new Date().toISOString(),
      eventType: "creation",
      description: `Tank ${newTank.name} created`
    } as any);
    
    return newTank;
  }

  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    const tank = this.tanks.get(id);
    
    if (!tank) {
      throw new Error(`Tank with id ${id} not found`);
    }
    
    const updatedTank = { 
      ...tank, 
      ...updates,
      lastUpdated: new Date().toISOString() 
    };
    this.tanks.set(id, updatedTank);
    
    // Add a history entry for the update
    this.addTankHistoryEntry({
      tankId: id,
      timestamp: new Date().toISOString(),
      eventType: "update",
      description: "Tank updated",
      details: { updates }
    } as any);
    
    return updatedTank;
  }

  async deleteTank(id: number): Promise<boolean> {
    const deleted = this.tanks.delete(id);
    
    if (deleted) {
      // Clean up related history and maintenance entries
      this.deleteTankHistory(id);
      
      // Delete all maintenance entries for this tank
      const maintenanceEntries = Array.from(this.tankMaintenance.values())
        .filter(entry => entry.tankId === id);
      
      maintenanceEntries.forEach(entry => {
        this.tankMaintenance.delete(entry.id);
      });
    }
    
    return deleted;
  }
  
  // Group and filtering operations
  async getTanksByGroup(group: string): Promise<Tank[]> {
    return Array.from(this.tanks.values())
      .filter(tank => tank.group === group);
  }
  
  async getTanksByStatus(status: string): Promise<Tank[]> {
    return Array.from(this.tanks.values())
      .filter(tank => tank.status === status);
  }
  
  // Tank history operations
  async getTankHistory(tankId: number): Promise<TankHistory[]> {
    const historyEntries = Array.from(this.tankHistory.values())
      .flat()
      .filter(entry => entry.tankId === tankId);
    
    // Sort by timestamp, newest first
    return historyEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async addTankHistoryEntry(entry: Omit<TankHistory, "id">): Promise<TankHistory> {
    const id = this.historyId++;
    const newEntry: TankHistory = { id, ...entry };
    
    // Initialize the array for this tank if it doesn't exist
    if (!this.tankHistory.has(entry.tankId)) {
      this.tankHistory.set(entry.tankId, []);
    }
    
    // Add the entry to the array
    const tankEntries = this.tankHistory.get(entry.tankId)!;
    tankEntries.push(newEntry);
    
    return newEntry;
  }
  
  async deleteTankHistory(tankId: number): Promise<boolean> {
    return this.tankHistory.delete(tankId);
  }
  
  // Tank maintenance operations
  async getTankMaintenance(tankId: number): Promise<TankMaintenance[]> {
    const maintenanceEntries = Array.from(this.tankMaintenance.values())
      .filter(entry => entry.tankId === tankId);
    
    // Sort by scheduled date
    return maintenanceEntries.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }
  
  async getMaintenanceById(id: number): Promise<TankMaintenance | undefined> {
    return this.tankMaintenance.get(id);
  }
  
  async scheduleMaintenance(maintenance: Omit<TankMaintenance, "id">): Promise<TankMaintenance> {
    const id = this.maintenanceId++;
    const newMaintenance: TankMaintenance = { id, ...maintenance };
    
    this.tankMaintenance.set(id, newMaintenance);
    
    // Add a history entry for the scheduled maintenance
    this.addTankHistoryEntry({
      tankId: maintenance.tankId,
      timestamp: new Date().toISOString(),
      eventType: "maintenance_scheduled",
      description: `Maintenance scheduled for ${maintenance.scheduledDate}: ${maintenance.maintenanceType}`
    } as any);
    
    return newMaintenance;
  }
  
  async updateMaintenance(id: number, updates: Partial<TankMaintenance>): Promise<TankMaintenance> {
    const maintenance = this.tankMaintenance.get(id);
    
    if (!maintenance) {
      throw new Error(`Maintenance with id ${id} not found`);
    }
    
    const updatedMaintenance = { ...maintenance, ...updates };
    this.tankMaintenance.set(id, updatedMaintenance);
    
    // Add a history entry for the update
    if (updates.status === 'completed') {
      this.addTankHistoryEntry({
        tankId: maintenance.tankId,
        timestamp: new Date().toISOString(),
        eventType: "maintenance_completed",
        description: `Maintenance completed: ${maintenance.maintenanceType}`
      } as any);
      
      // Update the tank's last maintenance date and calculate next maintenance
      const tank = this.tanks.get(maintenance.tankId);
      if (tank) {
        const now = new Date().toISOString();
        const nextMaintenance = new Date();
        nextMaintenance.setDate(nextMaintenance.getDate() + (tank.maintenanceInterval || 90));
        
        this.updateTank(maintenance.tankId, {
          lastMaintenance: now,
          nextMaintenance: nextMaintenance.toISOString()
        });
      }
    }
    
    return updatedMaintenance;
  }
  
  async cancelMaintenance(id: number): Promise<boolean> {
    const maintenance = this.tankMaintenance.get(id);
    
    if (!maintenance) {
      return false;
    }
    
    // Update the status to cancelled
    maintenance.status = 'cancelled';
    this.tankMaintenance.set(id, maintenance);
    
    // Add a history entry
    this.addTankHistoryEntry({
      tankId: maintenance.tankId,
      timestamp: new Date().toISOString(),
      eventType: "maintenance_cancelled",
      description: `Maintenance cancelled: ${maintenance.maintenanceType}`
    } as any);
    
    return true;
  }
  
  async deleteMaintenance(id: number): Promise<boolean> {
    const maintenance = this.tankMaintenance.get(id);
    
    if (!maintenance) {
      return false;
    }
    
    // Add a history entry before deletion
    this.addTankHistoryEntry({
      tankId: maintenance.tankId,
      timestamp: new Date().toISOString(),
      eventType: "maintenance_deleted",
      description: `Maintenance removed from schedule: ${maintenance.maintenanceType}`
    } as any);
    
    return this.tankMaintenance.delete(id);
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

// Import Firebase storage (using dynamic import to avoid circular dependencies)
import { FirebaseStorage } from './firebase-storage';

// Factory function to get the appropriate storage implementation
export function getStorage(type: string): IStorage {
  switch (type) {
    case 'firebase':
      return new FirebaseStorage();
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
