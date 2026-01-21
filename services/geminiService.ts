
import { GoogleGenAI } from "@google/genai";
import { Player } from "../types.ts";

export const generatePlayerReport = async (player: Player): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    console.error("Gemini API_KEY no configurada.");
    return "Error: La API_KEY de Google Gemini no está configurada en las variables de entorno de Vercel.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Actúa como un director deportivo de élite. Analiza los siguientes datos del jugador y genera un informe técnico profesional en español:
  
  Jugador: ${player.name}
  Posición: ${player.position}
  Categoría: ${player.category}
  Disciplina: ${player.discipline}
  
  Estadísticas:
  - Ritmo: ${player.stats.pace}
  - Tiro: ${player.stats.shooting}
  - Pase: ${player.stats.passing}
  - Regate: ${player.stats.dribbling}
  - Defensa: ${player.stats.defending}
  - Físico: ${player.stats.physical}
  
  Estructura el informe con: Estilo de juego, 3 Fortalezas, Áreas de mejora y Consejo táctico.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No se pudo extraer el análisis.";
  } catch (error: any) {
    console.error("Error Gemini:", error);
    return `Error de IA: ${error.message || "Error desconocido al contactar con Gemini"}`;
  }
};
