'use server';
/**
 * @fileOverview A server-side flow to handle sending an appointment notification.
 * 
 * - notifyAppointment - A function that sends an email notification using Resend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotifyAppointmentInputSchema = z.object({
  userId: z.string(),
  userEmail: z.string(),
  userName: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string(),
  description: z.string(),
  isVirtual: z.boolean(),
});
export type NotifyAppointmentInput = z.infer<typeof NotifyAppointmentInputSchema>;

export async function notifyAppointment(input: NotifyAppointmentInput): Promise<{ success: boolean }> {
  return notifyAppointmentFlow(input);
}

// ============== CONFIGURACIÓN DE CORREO ==============
// Esta es la dirección de correo a la que se enviarán las notificaciones de nuevas citas.
// Puedes cambiarla por el correo del administrador o del profesional.
const NOTIFICATION_RECIPIENT = 'larssonfhm@gmail.com';
// =====================================================


const notifyAppointmentFlow = ai.defineFlow(
  {
    name: 'notifyAppointmentFlow',
    inputSchema: NotifyAppointmentInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    try {
      // 1. Enviar correo usando Resend.
      // El sistema busca una clave de API en las variables de entorno (archivo .env).
      const resendApiKey = process.env.RESEND_API_KEY;

      // Si la clave no existe o está vacía, el flujo muestra una advertencia y termina exitosamente
      // para no bloquear al usuario. Los correos no se enviarán en este caso.
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY is not configured. Skipping email notification.');
        return { success: true };
      }
      
      const resend = new Resend(resendApiKey);

      const subject = `Nueva Cita Agendada: ${input.userName}`;
      const body = `
        <p>Se ha agendado una nueva cita con los siguientes detalles:</p>
        <ul>
          <li><strong>Usuario:</strong> ${input.userName} (${input.userEmail})</li>
          <li><strong>Profesional:</strong> ${input.location}</li>
          <li><strong>Modalidad:</strong> ${input.isVirtual ? 'Virtual' : 'Presencial'}</li>
          <li><strong>Fecha y Hora de Inicio:</strong> ${format(new Date(input.startTime), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</li>
          <li><strong>Motivo:</strong> ${input.description}</li>
        </ul>
      `;

      // El remitente ('from') debe ser un dominio verificado en tu cuenta de Resend.
      // 'onboarding@resend.dev' es un remitente de prueba que viene por defecto.
      await resend.emails.send({
        from: 'UCVBienestar <onboarding@resend.dev>', 
        to: NOTIFICATION_RECIPIENT,
        subject: subject,
        html: body,
      });

      return { success: true };

    } catch (error) {
      console.error('Error in notifyAppointmentFlow:', error);
      // Lanza un error más claro para que el cliente lo pueda manejar.
      if (error instanceof Error) {
        // Evita exponer detalles internos como 'resend' o claves de API.
        throw new Error(`No se pudo enviar la notificación por correo: ${error.message}`);
      }
      throw new Error('Ocurrió un error desconocido al enviar la notificación.');
    }
  }
);
