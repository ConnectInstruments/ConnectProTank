import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { insertTankSchema, updateTankSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Map to store all connected clients
const clients = new Set<WebSocket>();

// Broadcast to all connected clients
function broadcastMessage(message: unknown) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Simulate random tank level and temperature updates
function simulateTankUpdates() {
  setInterval(async () => {
    const tanks = await storage.getTanks();
    
    // Select a random tank to update
    const randomIndex = Math.floor(Math.random() * tanks.length);
    const tankToUpdate = tanks[randomIndex];
    
    if (tankToUpdate) {
      const maxCapacity = tankToUpdate.maxCapacity;
      
      // Random change (-5% to +5%)
      const change = (Math.random() * 10 - 5) * (maxCapacity * 0.01);
      
      // Calculate new level (ensure it's between 0 and maxCapacity)
      const newLevel = Math.max(0, Math.min(maxCapacity, tankToUpdate.currentLevel + change));
      
      // Small random temperature fluctuation (-0.5°C to +0.5°C)
      const tempChange = (Math.random() - 0.5);
      const newTemp = +(tankToUpdate.temperature + tempChange).toFixed(1);
      
      // Update the tank
      const updatedTank = await storage.updateTankLevel(tankToUpdate.id, Math.round(newLevel), newTemp);
      
      if (updatedTank) {
        // Broadcast the update to all clients
        broadcastMessage({
          type: "tank_update",
          data: updatedTank
        });
      }
    }
  }, 5000); // Update every 5 seconds
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get all tanks
  app.get("/api/tanks", async (req, res) => {
    const tanks = await storage.getTanks();
    res.json(tanks);
  });
  
  // Get a specific tank
  app.get("/api/tanks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const tank = await storage.getTank(id);
    if (!tank) {
      return res.status(404).json({ message: "Tank not found" });
    }
    
    res.json(tank);
  });
  
  // Create a new tank
  app.post("/api/tanks", async (req, res) => {
    try {
      const validatedData = insertTankSchema.parse(req.body);
      const newTank = await storage.createTank(validatedData);
      
      // Broadcast new tank to all clients
      broadcastMessage({
        type: "tank_created",
        data: newTank
      });
      
      res.status(201).json(newTank);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  });
  
  // Update a tank
  app.patch("/api/tanks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const validatedData = updateTankSchema.parse(req.body);
      const updatedTank = await storage.updateTank(id, validatedData);
      
      if (!updatedTank) {
        return res.status(404).json({ message: "Tank not found" });
      }
      
      // Broadcast tank update to all clients
      broadcastMessage({
        type: "tank_updated",
        data: updatedTank
      });
      
      res.json(updatedTank);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  });
  
  // Delete a tank
  app.delete("/api/tanks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await storage.deleteTank(id);
    if (!success) {
      return res.status(404).json({ message: "Tank not found" });
    }
    
    // Broadcast tank deletion to all clients
    broadcastMessage({
      type: "tank_deleted",
      data: { id }
    });
    
    res.status(204).send();
  });
  
  // Get statistics
  app.get("/api/stats", async (req, res) => {
    const tanks = await storage.getTanks();
    
    const totalCapacity = tanks.reduce((sum, tank) => sum + tank.maxCapacity, 0);
    const currentVolume = tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
    const avgTemperature = tanks.length > 0 
      ? +(tanks.reduce((sum, tank) => sum + tank.temperature, 0) / tanks.length).toFixed(1)
      : 0;
    
    res.json({
      totalCapacity,
      currentVolume,
      avgTemperature,
      tankCount: tanks.length
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    // Add new client to the set
    clients.add(ws);
    
    // Send initial tanks data
    storage.getTanks().then(tanks => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "initial_data",
          data: tanks
        }));
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Start simulating tank updates
  simulateTankUpdates();

  return httpServer;
}
