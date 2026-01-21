
import { GoogleGenAI } from "@google/genai";
import { Player } from "../types.ts";

/**
 * Generates a technical performance report for a player using Gemini AI.
 * Follows the standard @google/genai guidelines for model selection and response handling.
 */
export const generatePlayerReport = async (player: Player): Promise<string> => {
  // Always initialize with a named parameter for apiKey.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Actúa como un director deportivo de élite. Analiza los siguientes datos y estadísticas del jugador para generar un informe técnico profesional en español:
  
  Ficha Técnica:
  - Nombre: ${player.name}
  - Posición: ${player.position}
  - Categoría: ${player.category}
  - Disciplina: ${player.discipline}
  
  Estadísticas (sobre 100):
  - Ritmo (PAC): ${player.stats.pace}
  - Tiro (SHO): ${player.stats.shooting}
  - Pase (PAS): ${player.stats.passing}
  - Regate (DRI): ${player.stats.dribbling}
  - Defensa (DEF): ${player.stats.defending}
  - Físico (PHY): ${player.stats.physical}
  
  El reporte debe incluir:
  1. Análisis de estilo de juego.
  2. Top 3 Fortalezas técnicas.
  3. Áreas críticas de mejora.
  4. Recomendación táctica para el cuerpo técnico.`;

  try {
    // Using gemini-3-pro-preview for advanced reasoning and high-quality analysis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Extracting the text directly from the response object as per instructions.
    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error al generar el reporte con Gemini:", error);
    return "Error al conectar con el servicio de IA. Por favor, intente de nuevo más tarde.";
  }
};
