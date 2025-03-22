import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { tankSchema, Tank } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send the initial tanks data to the client
    const sendInitialData = async () => {
      try {
        const tanks = await storage.getAllTanks();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'INITIAL_DATA', payload: tanks }));
        }
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };
    
    sendInitialData();
    
    // Handle client disconnections
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast updates to all connected clients
  const broadcastUpdate = (type: string, payload: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  };
  
  // Simulate periodic tank updates
  setInterval(async () => {
    try {
      const tanks = await storage.getAllTanks();
      if (tanks.length > 0) {
        // Update a random tank
        const randomIndex = Math.floor(Math.random() * tanks.length);
        const tankToUpdate = tanks[randomIndex];
        
        // Create random variations
        const fillLevelChange = Math.random() * 10 - 5; // -5 to +5
        const temperatureChange = (Math.random() * 2 - 1) / 10; // -0.1 to +0.1
        
        let newFillLevel = tankToUpdate.fillLevel + fillLevelChange;
        newFillLevel = Math.max(0, Math.min(100, newFillLevel)); // Keep between 0-100
        
        let newTemperature = tankToUpdate.temperature + temperatureChange;
        newTemperature = parseFloat(newTemperature.toFixed(1));
        
        // Status changes based on fill level
        let newStatus = tankToUpdate.status;
        if (newFillLevel < 20 && tankToUpdate.status !== 'warning') {
          newStatus = 'warning';
        } else if (newFillLevel >= 20 && newFillLevel < 30 && tankToUpdate.status === 'warning') {
          newStatus = 'online';
        }
        
        // Update the tank
        const updatedTank = await storage.updateTank(tankToUpdate.id, {
          fillLevel: newFillLevel,
          temperature: newTemperature,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        });
        
        // Broadcast the update
        broadcastUpdate('TANK_UPDATE', updatedTank);
      }
    } catch (error) {
      console.error('Error updating tanks:', error);
    }
  }, 5000); // Update every 5 seconds
  
  // API Routes
  // Get all tanks
  app.get('/api/tanks', async (_req, res) => {
    try {
      const tanks = await storage.getAllTanks();
      res.json(tanks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tanks' });
    }
  });
  
  // Get a single tank
  app.get('/api/tanks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tank = await storage.getTank(id);
      
      if (!tank) {
        return res.status(404).json({ message: 'Tank not found' });
      }
      
      res.json(tank);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tank' });
    }
  });
  
  // Create a new tank
  app.post('/api/tanks', async (req, res) => {
    try {
      const tankData = tankSchema.omit({ id: true, lastUpdated: true }).parse(req.body);
      
      // Add current timestamp
      const tank = {
        ...tankData,
        lastUpdated: new Date().toISOString()
      };
      
      const newTank = await storage.createTank(tank);
      
      // Broadcast the new tank to all clients
      broadcastUpdate('TANK_UPDATE', newTank);
      
      res.status(201).json(newTank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid tank data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create tank' });
    }
  });
  
  // Delete a tank
  app.delete('/api/tanks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTank(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Tank not found' });
      }
      
      // Broadcast the deletion to all clients
      broadcastUpdate('TANK_DELETE', { id });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete tank' });
    }
  });

  return httpServer;
}
