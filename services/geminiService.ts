import { GoogleGenAI, Type } from "@google/genai";
import { Worker, Room, RoomType, WorkerRole } from "../types";
import { getAppRules } from "../utils/storage";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
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
  const availableWorkers = workers.filter(w => w.present !== false);

  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing. Please set GEMINI_API_KEY (preferred) or API_KEY in your environment.");
  }

  const model = "gemini-2.5-flash";

  // Prepare data for the prompt
  const workersData = availableWorkers.map(w => ({
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

  const appRules = getAppRules().filter(r => r.type === 'ROOM_ASSEMBLY' && r.isActive);
  const restrictions = appRules.filter(r => r.isRestriction);
  const priorities = appRules.filter(r => !r.isRestriction).sort((a, b) => a.order - b.order);

  const restrictionsText = restrictions.length > 0 ?
    `\n    Mandatory Constraints (These MUST NOT be violated):\n` +
    restrictions.map(r => `    - ${r.description}`).join('\n') : '';

  const prioritiesText = priorities.length > 0 ?
    `\n    Priorities (Follow in this exact order to build the assignments):\n` +
    priorities.map((r, i) => `    ${i + 1}. ${r.description}`).join('\n') : '';

  const prompt = `
    You are an intelligent system for a spiritual center. 
    Your task is to assign workers to rooms optimally.
    ${restrictionsText}
    ${prioritiesText}

    Additional Rules:
    - 'Entrevista' type rooms (like Reception) must be staffed only by workers who have the 'Recepção' skill.
    - Return a complete list of assignments. If a worker cannot be assigned, do not include them in the list (they will remain unassigned).

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
