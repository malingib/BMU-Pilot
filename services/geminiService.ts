import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Incident } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_CHAT = `You are a helpful and knowledgeable assistant for the Beach Management Unit (BMU). 
Your goal is to assist BMU officers, committee members, and fisheries staff in managing coastal resources.
You can answer questions about fishery regulations, sustainable fishing practices, data analysis interpretation, and BMU governance.
When provided with system context (stats, active members, etc.), use it to answer specific questions about the current status of the BMU.
Keep answers concise and professional.
`;

const SYSTEM_INSTRUCTION_ANALYST = `You are a data analyst for a Beach Management Unit. 
Analyze the provided fisheries data and provide executive summaries, trend detection (e.g., overfishing warning), and governance recommendations.
Format output in Markdown.
`;

export const streamChatResponse = async (
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    context: string,
    onChunk: (text: string) => void
) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: context 
                    ? `${SYSTEM_INSTRUCTION_CHAT}\n\nCURRENT APP CONTEXT:\n${context}` 
                    : SYSTEM_INSTRUCTION_CHAT,
                temperature: 0.7,
            },
            history: history,
        });

        const result = await chat.sendMessageStream({ message });
        
        for await (const chunk of result) {
            const responseChunk = chunk as GenerateContentResponse;
            if (responseChunk.text) {
                onChunk(responseChunk.text);
            }
        }
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        onChunk("\n[System Error: Unable to connect to AI service. Please check your connection or API key.]");
    }
};

export const analyzeCatchData = async (data: any[]): Promise<string> => {
    try {
        const prompt = `Analyze the following catch records and provide a brief status report highlighting key trends, total revenue, and any potential issues (e.g. low catch weights): \n${JSON.stringify(data, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for complex reasoning on data
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_ANALYST,
            }
        });
        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Error analyzing data.";
    }
};

export const analyzeIncidents = async (incidents: Incident[]): Promise<string> => {
    try {
        const prompt = `Review the following security and safety incidents reported in the BMU. Identify patterns, assess overall safety risks, and recommend preventive actions. \n${JSON.stringify(incidents, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro for reasoning and pattern recognition
            contents: prompt,
            config: {
                systemInstruction: "You are a Safety & Compliance Officer for a coastal fishery. Provide actionable safety recommendations based on incident logs.",
            }
        });
        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Gemini Incident Analysis Error:", error);
        return "Error analyzing incidents.";
    }
};

export const draftMeetingMinutes = async (notes: string): Promise<string> => {
    try {
        const prompt = `Draft formal meeting minutes based on these rough notes: "${notes}". Structure with Attendees, Agenda, Key Decisions, and Action Items. Format in clean Markdown.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Flash is sufficient and fast for formatting/drafting
            contents: prompt,
        });
        return response.text || "Could not generate minutes.";
    } catch (error) {
        console.error("Gemini Minutes Error:", error);
        return "Error generating minutes.";
    }
};

export const draftBroadcastMessage = async (topic: string, audience: string): Promise<string> => {
    try {
        const prompt = `Draft a short, urgent SMS (max 160 chars) for BMU members. 
        Topic: ${topic}
        Audience: ${audience}
        Tone: Professional, Clear, Urgent.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Flash for speed
            contents: prompt,
        });
        return response.text || "Could not generate message.";
    } catch (error) {
        console.error("Gemini SMS Error:", error);
        return "Error generating SMS.";
    }
};