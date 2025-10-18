'use server';

/**
 * @fileOverview A flow for handling new appointment notifications.
 *
 * - notifyAppointment - Saves appointment to Firestore and simulates sending an email.
 * - AppointmentData - The Zod schema for the appointment data.
 */

import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Define the input schema using Zod
const AppointmentDataSchema = z.object({
  userProfileId: z.string(),
  userEmail: z.string(),
  userName: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string(),
  description: z.string(),
  isVirtual: z.boolean(),
});
export type AppointmentData = z.infer<typeof AppointmentDataSchema>;


// This is the main function that will be called from the client
export async function notifyAppointment(input: AppointmentData): Promise<{ success: boolean; appointmentId?: string }> {
  try {
    // Step 1: Initialize Firebase Admin
    // Note: In a real server environment, you'd initialize this once.
    const { firestore } = initializeFirebase();
    
    // Step 2: Save the appointment to the database
    const docRef = await addDoc(collection(firestore, 'appointments'), input);
    console.log('Appointment saved with ID:', docRef.id);
    
    // Step 3: "Send" the notification email (simulation)
    const recipient = 'lfernandezhuaringa@gmail.com';
    const subject = `Nueva Cita Agendada: ${input.userName}`;
    const body = `
      Se ha agendado una nueva cita con los siguientes detalles:

      - Usuario: ${input.userName} (${input.userEmail})
      - Profesional: ${input.location}
      - Fecha y Hora de Inicio: ${new Date(input.startTime).toLocaleString('es-PE')}
      - Motivo: ${input.description}

      Este es un correo autogenerado.
    `;
    
    // In a real application, you would integrate with an email service like SendGrid, Resend, etc.
    // For this prototype, we'll just log it to the server console.
    console.log('--- SIMULATING EMAIL NOTIFICATION ---');
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(body);
    console.log('------------------------------------');

    console.log('Appointment notification flow completed successfully.');
    return { success: true, appointmentId: docRef.id };

  } catch (error) {
    console.error('Error in notifyAppointment server action:', error);
    // It's better to throw the error so the client can handle it.
    // Avoid throwing generic new Error() to preserve the original error information.
    throw error;
  }
}
