import { tanks, type Tank, type InsertTank, type UpdateTank, users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tank methods
  getTanks(): Promise<Tank[]>;
  getTank(id: number): Promise<Tank | undefined>;
  createTank(tank: InsertTank): Promise<Tank>;
  updateTank(id: number, tank: UpdateTank): Promise<Tank | undefined>;
  deleteTank(id: number): Promise<boolean>;
  updateTankLevel(id: number, level: number, temperature: number): Promise<Tank | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tanksData: Map<number, Tank>;
  currentId: number;
  tankId: number;

  constructor() {
    this.users = new Map();
    this.tanksData = new Map();
    this.currentId = 1;
    this.tankId = 1;
    
    // Initialize with some sample tanks
    this.initializeTanks();
  }

  private initializeTanks() {
    const now = new Date();
    const sampleTanks: InsertTank[] = [
      {
        name: "Tank A-101",
        location: "North Facility",
        maxCapacity: 1000,
        currentLevel: 500,
        currentPercentage: 50,
        temperature: 24.5,
        connectionString: "mongodb://tankdb:27017/tanks/a101",
        refreshRate: 30,
        alertThreshold: 15,
        isConnected: true
      },
      {
        name: "Tank B-205",
        location: "South Facility",
        maxCapacity: 1500,
        currentLevel: 1200,
        currentPercentage: 80,
        temperature: 22.8,
        connectionString: "mongodb://tankdb:27017/tanks/b205",
        refreshRate: 15,
        alertThreshold: 20,
        isConnected: true
      },
      {
        name: "Tank C-310",
        location: "East Facility",
        maxCapacity: 1000,
        currentLevel: 100,
        currentPercentage: 10,
        temperature: 26.2,
        connectionString: "mongodb://tankdb:27017/tanks/c310",
        refreshRate: 30,
        alertThreshold: 15,
        isConnected: true
      }
    ];
    
    sampleTanks.forEach(tank => this.createTank(tank));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tank methods
  async getTanks(): Promise<Tank[]> {
    return Array.from(this.tanksData.values());
  }

  async getTank(id: number): Promise<Tank | undefined> {
    return this.tanksData.get(id);
  }

  async createTank(insertTank: InsertTank): Promise<Tank> {
    const id = this.tankId++;
    const lastUpdated = new Date();
    const tank: Tank = { ...insertTank, id, lastUpdated };
    this.tanksData.set(id, tank);
    return tank;
  }

  async updateTank(id: number, updateData: UpdateTank): Promise<Tank | undefined> {
    const tank = this.tanksData.get(id);
    if (!tank) return undefined;
    
    const updatedTank: Tank = { 
      ...tank, 
      ...updateData,
      lastUpdated: new Date()
    };
    this.tanksData.set(id, updatedTank);
    return updatedTank;
  }

  async deleteTank(id: number): Promise<boolean> {
    return this.tanksData.delete(id);
  }

  async updateTankLevel(id: number, level: number, temperature: number): Promise<Tank | undefined> {
    const tank = await this.getTank(id);
    if (!tank) return undefined;
    
    const percentage = Math.round((level / tank.maxCapacity) * 100);
    
    return this.updateTank(id, {
      currentLevel: level,
      currentPercentage: percentage,
      temperature,
      lastUpdated: new Date()
    });
  }
}

export const storage = new MemStorage();
