import { Tank } from "@shared/schema";

// Storage interface with tank CRUD operations
export interface IStorage {
  getAllTanks(): Promise<Tank[]>;
  getTank(id: number): Promise<Tank | undefined>;
  createTank(tank: Omit<Tank, "id">): Promise<Tank>;
  updateTank(id: number, updates: Partial<Tank>): Promise<Tank>;
  deleteTank(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private tanks: Map<number, Tank>;
  private currentId: number;

  constructor() {
    this.tanks = new Map();
    this.currentId = 1;
    
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

export const storage = new MemStorage();
