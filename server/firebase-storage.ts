import { Tank } from "@shared/schema";
import { firebaseDb } from "./firebase";
import { ref, get, set, push, remove, update, onValue, off } from "firebase/database";
import session from "express-session";
import MemoryStore from "memorystore";
import { IStorage } from './storage';

const MemStore = MemoryStore(session);

// Firebase storage implementation
export class FirebaseStorage implements IStorage {
  private tanksRef;
  public sessionStore: session.Store;
  private listeners: Map<string, any>;

  constructor() {
    this.tanksRef = ref(firebaseDb, 'tanks');
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.listeners = new Map();
    
    // Initialize sample tanks if no tanks exist
    this.initializeIfEmpty();
  }
  
  private async initializeIfEmpty() {
    const snapshot = await get(this.tanksRef);
    if (!snapshot.exists()) {
      this.initializeSampleTanks();
    }
  }
  
  private async initializeSampleTanks() {
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
    
    for (const tank of sampleTanks) {
      await this.createTank(tank);
    }
  }
  
  async getAllTanks(): Promise<Tank[]> {
    try {
      const snapshot = await get(this.tanksRef);
      if (!snapshot.exists()) {
        return [];
      }
      
      const tanksData = snapshot.val();
      return Object.entries(tanksData).map(([id, data]: [string, any]) => ({
        id: parseInt(id),
        name: data.name,
        fillLevel: data.fillLevel,
        temperature: data.temperature,
        capacity: data.capacity,
        status: data.status,
        lastUpdated: data.lastUpdated
      }));
    } catch (error) {
      console.error('Error fetching tanks from Firebase:', error);
      return [];
    }
  }
  
  async getTank(id: number): Promise<Tank | undefined> {
    try {
      const tankRef = ref(firebaseDb, `tanks/${id}`);
      const snapshot = await get(tankRef);
      
      if (!snapshot.exists()) {
        return undefined;
      }
      
      const data = snapshot.val();
      return {
        id,
        name: data.name,
        fillLevel: data.fillLevel,
        temperature: data.temperature,
        capacity: data.capacity,
        status: data.status,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error(`Error fetching tank with id ${id} from Firebase:`, error);
      return undefined;
    }
  }
  
  async createTank(tank: Omit<Tank, "id">): Promise<Tank> {
    try {
      // Get the next available ID
      const tanks = await this.getAllTanks();
      let nextId = 1;
      
      if (tanks.length > 0) {
        nextId = Math.max(...tanks.map(t => t.id)) + 1;
      }
      
      const tankRef = ref(firebaseDb, `tanks/${nextId}`);
      await set(tankRef, {
        ...tank,
        lastUpdated: new Date().toISOString()
      });
      
      return {
        id: nextId,
        ...tank,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating tank in Firebase:', error);
      throw new Error('Failed to create tank in Firebase database');
    }
  }
  
  async updateTank(id: number, updates: Partial<Tank>): Promise<Tank> {
    try {
      const tankRef = ref(firebaseDb, `tanks/${id}`);
      const snapshot = await get(tankRef);
      
      if (!snapshot.exists()) {
        throw new Error(`Tank with id ${id} not found`);
      }
      
      const currentData = snapshot.val();
      const updatedTank = {
        ...currentData,
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      await update(tankRef, updatedTank);
      
      return {
        id,
        ...updatedTank
      };
    } catch (error) {
      console.error(`Error updating tank with id ${id} in Firebase:`, error);
      throw error;
    }
  }
  
  async deleteTank(id: number): Promise<boolean> {
    try {
      const tankRef = ref(firebaseDb, `tanks/${id}`);
      const snapshot = await get(tankRef);
      
      if (!snapshot.exists()) {
        return false;
      }
      
      await remove(tankRef);
      return true;
    } catch (error) {
      console.error(`Error deleting tank with id ${id} from Firebase:`, error);
      return false;
    }
  }
  
  // Methods for real-time updates
  setupTankListener(callback: (tanks: Tank[]) => void): string {
    const listenerId = Date.now().toString();
    
    const handleTanksUpdate = (snapshot: any) => {
      try {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
      
      const tanksData = snapshot.val();
      const tanks = Object.entries(tanksData).map(([id, data]: [string, any]) => ({
        id: parseInt(id),
        name: data.name,
        fillLevel: data.fillLevel,
        temperature: data.temperature,
        capacity: data.capacity,
        status: data.status,
        lastUpdated: data.lastUpdated
      }));
      
      callback(tanks);
    } catch (error) {
      callback(tanks.map(tank => ({
        ...tank,
        status: 'offline',
        fillLevel: 0,
        temperature: 20,
        capacity: 150000
      })));
    }
  };
    
    onValue(this.tanksRef, handleTanksUpdate);
    this.listeners.set(listenerId, { ref: this.tanksRef, handler: handleTanksUpdate });
    
    return listenerId;
  }
  
  removeTankListener(listenerId: string): boolean {
    const listener = this.listeners.get(listenerId);
    if (!listener) {
      return false;
    }
    
    off(listener.ref, 'value', listener.handler);
    this.listeners.delete(listenerId);
    return true;
  }
}