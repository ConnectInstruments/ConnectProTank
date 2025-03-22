import { Tank } from "@shared/schema";

export function calculateAverageFillLevel(tanks: Tank[]): number {
  if (tanks.length === 0) return 0;
  
  const sum = tanks.reduce((total, tank) => total + tank.fillLevel, 0);
  return Math.round(sum / tanks.length);
}

export function calculateAverageTemperature(tanks: Tank[]): number {
  if (tanks.length === 0) return 0;
  
  const sum = tanks.reduce((total, tank) => total + tank.temperature, 0);
  return parseFloat((sum / tanks.length).toFixed(1));
}

// Calculate the current volume in a tank based on its fill level and capacity
export function calculateTankVolume(tank: Tank): number {
  return (tank.fillLevel / 100) * tank.capacity;
}

// Calculate the total stock (sum of all tank volumes)
export function calculateTotalStock(tanks: Tank[]): number {
  if (tanks.length === 0) return 0;
  
  return tanks.reduce((total, tank) => total + calculateTankVolume(tank), 0);
}

// Calculate total capacity (sum of all tank capacities)
export function calculateTotalCapacity(tanks: Tank[]): number {
  if (tanks.length === 0) return 0;
  
  return tanks.reduce((total, tank) => total + tank.capacity, 0);
}

// Format a number as liters (L)
export function formatLiters(value: number): string {
  return `${Math.round(value).toLocaleString()} L`;
}
