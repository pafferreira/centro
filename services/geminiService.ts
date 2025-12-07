import { GoogleGenAI, Type } from "@google/genai";
import { Worker, Room, RoomType, WorkerRole } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Define the response schema for the assignments
const assignmentSchema = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          workerId: { type: Type.STRING },
          roomId: { type: Type.STRING },
        },
        required: ["workerId", "roomId"],
      },
    },
  },
  required: ["assignments"],
};

export const autoAssignWorkers = async (workers: Worker[], rooms: Room[]) => {
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const model = "gemini-2.5-flash";

  // Prepare data for the prompt
  const workersData = workers.map(w => ({
    id: w.id,
    name: w.name,
    roles: w.roles,
    isCoordinator: w.isCoordinator
  }));

  const roomsData = rooms.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    capacity: r.capacity
  }));

  const prompt = `
    You are an intelligent system for a spiritual center. 
    Your task is to assign workers to rooms optimally based on the following rules:
    
    1. 'Sala de Passe' type rooms MUST have exactly one worker who is a 'Coordenador' (isCoordinator: true).
    2. Distribute workers with the 'Médium' role evenly across 'Sala de Passe' rooms.
    3. Fill the remaining spots with 'Sustentação' or other roles.
    4. Ensure no room exceeds its capacity.
    5. 'Outros' type rooms (like Reception) need at least 1 person, preferably with 'Sustentação'.
    6. Return a complete list of assignments. If a worker cannot be assigned, do not include them in the list (they will remain unassigned).

    Input Data:
    Workers: ${JSON.stringify(workersData)}
    Rooms: ${JSON.stringify(roomsData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: assignmentSchema,
        systemInstruction: "You are a helpful logic engine for resource allocation JSON APIs.",
      },
    });

    const text = response.text;
    if (!text) return [];

    const json = JSON.parse(text);
    return json.assignments as { workerId: string; roomId: string }[];

  } catch (error) {
    console.error("Gemini assignment failed:", error);
    throw error;
  }
};
