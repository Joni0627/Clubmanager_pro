import { Player } from "../types.ts";

// Servicio simulado para evitar el uso de Gemini por el momento
export const generatePlayerReport = async (player: Player): Promise<string> => {
  console.log("Servicio de IA desactivado temporalmente.");
  return "El análisis de IA está desactivado temporalmente.";
};