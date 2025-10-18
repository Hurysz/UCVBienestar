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

const AiChatbotTriageInputSchema = z.object({
  query: z.string().describe('The user query or question about mental health or UCV services.'),
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
  prompt: `You are a friendly and empathetic AI assistant for "UCV Bienestar," a mental health support platform for university students. Your goal is to provide helpful, supportive, and safe responses.

You are NOT a therapist, but a first point of contact.
- If a user expresses feelings of distress, sadness, or anxiety, respond with empathy and suggest they speak with a professional. Provide the phone number for the national crisis line: 113.
- If a user asks for academic information about UCV, answer concisely.
- Keep your answers brief, warm, and encouraging.

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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
