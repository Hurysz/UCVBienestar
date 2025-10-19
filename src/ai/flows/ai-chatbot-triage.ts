'use server';

/**
 * @fileOverview A general-purpose AI chatbot for answering student questions about UCV.
 *
 * - aiChatbotTriage - A function that handles the chatbot interaction.
 * - AiChatbotTriageInput - The input type for the aiChatbotTriage function.
 * - AiChatbotTriageOutput - The return type for the aiChatbotTriage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { resources, workshopCategories, type Resource } from '@/lib/resources';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase on the server for tools
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}


// Tool to search the resource library
const searchResources = ai.defineTool(
  {
    name: 'searchResources',
    description: 'Search the library of well-being resources for relevant articles, workshops, or tools.',
    inputSchema: z.object({
      query: z.string().describe('The user\'s search query, like "anxiety" or "mindfulness".'),
    }),
    outputSchema: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
    })),
  },
  async ({ query }) => {
    console.log(`[Tool] Searching resources for: ${query}`);
    const lowerCaseQuery = query.toLowerCase();
    
    // Perform a simple text search on title and description
    const results = resources.filter(resource => 
      resource.title.toLowerCase().includes(lowerCaseQuery) ||
      resource.description.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 3); // Return max 3 results

    return results.map(({ id, title, description, category }) => ({ id, title, description, category }));
  }
);


// Tool to get user's appointments
const getUserAppointments = ai.defineTool(
    {
        name: 'getUserAppointments',
        description: 'Get a list of the user\'s upcoming or past appointments.',
        inputSchema: z.object({
            userId: z.string().optional().describe("The user's unique ID. This is handled automatically by the system."),
        }),
        outputSchema: z.array(z.object({
            id: z.string(),
            status: z.string(),
            professional: z.string(),
            startTime: z.string(),
        })),
    },
    async (toolInput) => {
        const userId = toolInput?.userId;

        if (!userId) {
            console.log('[Tool] No userId available to getUserAppointments.');
            return []; 
        }

        console.log(`[Tool] Fetching appointments for user: ${userId}`);
        const app = getFirebaseApp();
        const firestore = getFirestore(app);
        
        const appointmentsRef = collection(firestore, `users/${userId}/appointments`);
        const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);

        const appointments = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            let startTime = '';
            if (data.startTime instanceof Timestamp) {
                startTime = data.startTime.toDate().toISOString();
            } 
            else if (data.startTime && typeof data.startTime === 'object' && 'seconds' in data.startTime && 'nanoseconds' in data.startTime) {
                 startTime = new Timestamp(data.startTime.seconds, data.startTime.nanoseconds).toDate().toISOString();
            }
            else {
                console.warn(`[Tool] Invalid or missing startTime for appointment ${doc.id}`);
                return null;
            }

            return {
                id: doc.id,
                status: data.status,
                professional: data.location,
                startTime: startTime,
            };
        }).filter(Boolean);
        
        return appointments as any;
    }
);

// Tool to get announcements
const getAnnouncements = ai.defineTool({
    name: 'getAnnouncements',
    description: 'Get the latest announcements and news, including the winning workshop activity and new articles.',
    inputSchema: z.object({}),
    outputSchema: z.object({
        winningActivity: z.object({
            title: z.string(),
            categoryTitle: z.string(),
            date: z.string().optional(),
            time: z.string().optional(),
        }).optional(),
        newestArticle: z.object({
            title: z.string()
        }).optional(),
        suggestedWorkshop: z.object({
            title: z.string()
        }).optional(),
    }),
}, async () => {
    const winningActivityRaw = workshopCategories
        .flatMap(category => category.activities.map(activity => ({ ...activity, categoryTitle: category.title })))
        .filter(activity => activity.votes >= 5)
        .sort((a, b) => b.votes - a.votes)[0];
    
    const newestArticleRaw = resources.find(r => r.category === 'articulo');
    const suggestedWorkshopRaw = workshopCategories[0];

    return {
        winningActivity: winningActivityRaw ? {
            title: winningActivityRaw.title,
            categoryTitle: winningActivityRaw.categoryTitle,
            date: winningActivityRaw.date,
            time: winningActivityRaw.time,
        } : undefined,
        newestArticle: newestArticleRaw ? { title: newestArticleRaw.title } : undefined,
        suggestedWorkshop: suggestedWorkshopRaw ? { title: suggestedWorkshopRaw.title } : undefined,
    };
});

// Tool to get workshop information
const getWorkshopInfo = ai.defineTool({
    name: 'getWorkshopInfo',
    description: 'Get information about available workshop categories, their activities, and the current vote count for each.',
    inputSchema: z.object({
        categoryQuery: z.string().optional().describe('Optional: The name of a specific category to query, e.g., "Reuniones Virtuales".')
    }),
    outputSchema: z.array(z.object({
        categoryTitle: z.string(),
        activities: z.array(z.object({
            title: z.string(),
            votes: z.number(),
        }))
    })),
}, async ({ categoryQuery }) => {
    let categoriesToReturn = workshopCategories;
    if (categoryQuery) {
        categoriesToReturn = workshopCategories.filter(cat => cat.title.toLowerCase().includes(categoryQuery.toLowerCase()));
    }
    return categoriesToReturn.map(cat => ({
        categoryTitle: cat.title,
        activities: cat.activities.map(act => ({
            title: act.title,
            votes: act.votes
        }))
    }));
});

// Tool to create navigation links
const getNavigationLink = ai.defineTool(
    {
        name: 'getNavigationLink',
        description: 'Create a navigation link to a specific page in the application.',
        inputSchema: z.object({
            page: z.enum(['dashboard', 'chat', 'appointments', 'resources', 'profile']).describe('The page to navigate to.'),
        }),
        outputSchema: z.object({
            link: z.string().describe('The relative path to the page, e.g., /dashboard/chat')
        })
    },
    async({ page }) => {
        return {
            link: `/dashboard/${page === 'dashboard' ? '' : page}`
        }
    }
);


const AiChatbotTriageInputSchema = z.object({
  userId: z.string().optional().describe("The unique ID of the user. This should be handled automatically and not asked to the user."),
  userName: z.string().optional().describe("The name of the user interacting with the chatbot."),
  query: z.string().describe('The user query or question about mental health, UCV services, their appointments, or available resources.'),
  history: z.array(z.object({
    role: z.enum(['user', 'bot']),
    text: z.string(),
  })).describe('The conversation history.'),
});
export type AiChatbotTriageInput = z.infer<typeof AiChatbotTriageInputSchema>;

const AiChatbotTriageOutputSchema = z.object({
  answer: z.string().describe('The chatbot response to the user query.'),
});
export type AiChatbotTriageOutput = z.infer<typeof AiChatbotTriageOutputSchema>;

export async function aiChatbotTriage(input: AiChatbotTriageInput): Promise<AiChatbotTriageOutput> {
  return aiChatbotTriageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotTriagePrompt',
  input: {schema: AiChatbotTriageInputSchema},
  output: {schema: AiChatbotTriageOutputSchema},
  tools: [searchResources, getUserAppointments, getNavigationLink, getAnnouncements, getWorkshopInfo],
  prompt: `You are a friendly and empathetic AI assistant for "UCV Bienestar," a mental health support platform for university students. Your goal is to provide helpful, supportive, and safe responses.
{{#if userName}}
The user's name is {{userName}}. Use their name to make the conversation feel personal and supportive.
{{/if}}

You are NOT a therapist, but a first point of contact. Your primary capabilities are:
1.  **General Conversation:** Provide empathetic and encouraging words. If a user expresses severe distress, sadness, or anxiety, respond with empathy and suggest they speak with a professional. Provide the phone number for the national crisis line: 113.
2.  **Access User Appointments:** If the user is logged in (a userId is provided in the input), you can look up their scheduled or past appointments using the \`getUserAppointments\` tool. The system will automatically use the logged-in user's ID. You do not need to and MUST NOT ask for it. If the tool returns no appointments, inform the user they have no scheduled sessions.
3.  **Search Resources:** You can search the resource library for articles, tools, and workshops using the \`searchResources\` tool. Use this when a user asks for information on a topic like "stress", "anxiety", "mindfulness", etc.
4.  **Check Announcements:** You can get the latest platform news, like the winning workshop or new articles, using the \`getAnnouncements\` tool. Use this if the user asks "what's new?" or about winning activities.
5.  **Workshop & Voting Info:** You can get details about workshop categories and the current vote count for activities using the \`getWorkshopInfo\` tool. Use this if the user asks what workshops are available or about voting.
6.  **Provide Navigation:** If a user asks to go to a page like 'chat', 'resources', or 'appointments', use the \`getNavigationLink\` tool to create a direct link for them. Present the link using this specific Markdown format: "[button:Texto del Botón]({{link}})". For example: "Claro, puedes ir a la página de recursos a través de este botón: [button:Ir a Recursos](/dashboard/resources)".
7.  **Academic Information:** If a user asks for academic information about UCV, answer concisely.

- Keep your answers brief, warm, and encouraging.
- When you use a tool and find information, present it clearly to the user. For example, "Encontré este artículo que podría ayudarte:" o "Tu próxima cita es el...".
- Do not make up information. If you don't know or can't find something, say so.

Conversation History:
{{#each history}}
- {{role}}: {{text}}
{{/each}}

User Query: {{{query}}}
`,
});

const aiChatbotTriageFlow = ai.defineFlow(
  {
    name: 'aiChatbotTriageFlow',
    inputSchema: AiChatbotTriageInputSchema,
    outputSchema: AiChatbotTriageOutputSchema,
  },
  async (input) => {
    // Pass the userId to the tools by including it in the tool input context.
    const toolInput = {
      ...input,
    };

    const {output} = await prompt(toolInput);
    
    if (!output) {
      return { answer: "Lo siento, no pude procesar tu solicitud. ¿Podrías intentar reformular tu pregunta?" };
    }
    
    return output;
  }
);
