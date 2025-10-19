import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chatbot-triage.ts';
import '@/ai/flows/summarize-resource.ts';
import '@/ai/flows/notify-appointment.ts';
import '@/ai/flows/notify-feedback.ts';
