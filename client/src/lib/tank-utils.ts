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
