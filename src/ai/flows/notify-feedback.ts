'use server';
/**
 * @fileOverview A server-side flow to handle sending user feedback via email.
 * 
 * - notifyFeedback - A function that sends an email with user feedback using Resend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotifyFeedbackInputSchema = z.object({
  userName: z.string(),
  userEmail: z.string(),
  appointmentTime: z.string().datetime(),
  professional: z.string(),
  feedback: z.string(),
});
export type NotifyFeedbackInput = z.infer<typeof NotifyFeedbackInputSchema>;

export async function notifyFeedback(input: NotifyFeedbackInput): Promise<{ success: boolean }> {
  return notifyFeedbackFlow(input);
}

// ============== CONFIGURACIÓN DE CORREO ==============
const NOTIFICATION_RECIPIENT = 'larssonfhm@gmail.com';
// =====================================================


const notifyFeedbackFlow = ai.defineFlow(
  {
    name: 'notifyFeedbackFlow',
    inputSchema: NotifyFeedbackInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn('RESEND_API_KEY is not configured. Skipping email notification.');
        return { success: true };
      }
      
      const resend = new Resend(resendApiKey);

      const subject = `Nuevo Feedback Recibido de: ${input.userName}`;
      const body = `
        <p>Se ha recibido un nuevo feedback de una cita completada:</p>
        <ul>
          <li><strong>Usuario:</strong> ${input.userName} (${input.userEmail})</li>
          <li><strong>Profesional:</strong> ${input.professional}</li>
          <li><strong>Fecha de la Cita:</strong> ${format(new Date(input.appointmentTime), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</li>
        </ul>
        <p><strong>Feedback del usuario:</strong></p>
        <p style="border-left: 2px solid #cccccc; padding-left: 10px; font-style: italic;">
            ${input.feedback}
        </p>
      `;

      await resend.emails.send({
        from: 'UCVBienestar Feedback <onboarding@resend.dev>', 
        to: NOTIFICATION_RECIPIENT,
        subject: subject,
        html: body,
      });

      return { success: true };

    } catch (error) {
      console.error('Error in notifyFeedbackFlow:', error);
      if (error instanceof Error) {
        throw new Error(`No se pudo enviar la notificación de feedback: ${error.message}`);
      }
      throw new Error('Ocurrió un error desconocido al enviar el feedback.');
    }
  }
);
