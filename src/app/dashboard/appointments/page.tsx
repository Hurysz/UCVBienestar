"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, addDays, isSunday } from "date-fns";
import { es } from "date-fns/locale";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { notifyAppointment } from "@/ai/flows/notify-appointment";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const professionals = [
  { value: "Dra. Ana García (Psicología Clínica)", label: "Dra. Ana García (Psicología Clínica)" },
  { value: "Dr. Carlos Torres (Terapia Cognitivo-Conductual)", label: "Dr. Carlos Torres (Terapia Cognitivo-Conductual)" },
  { value: "Lic. Sofia Reyes (Orientación Vocacional)", label: "Lic. Sofia Reyes (Orientación Vocacional)" },
  { value: "Mg. Roberto Diaz (Terapia de Pareja)", label: "Mg. Roberto Diaz (Terapia de Pareja)" },
  { value: "Psic. Laura Mendoza (Ansiedad y Estrés)", label: "Psic. Laura Mendoza (Ansiedad y Estrés)" },
];

const timeSlots = ["16:00", "17:00", "18:00", "19:00", "20:00"];

const appointmentSchema = z.object({
  professional: z.string({
    required_error: "Por favor, selecciona un profesional.",
  }),
  modality: z.enum(["virtual", "presencial"], {
    required_error: "Por favor, selecciona una modalidad.",
  }),
  date: z.date({
    required_error: "Por favor, selecciona una fecha.",
  }),
  time: z.string({
    required_error: "Por favor, selecciona una hora.",
  }),
  reason: z.string().min(10, {
    message: "El motivo debe tener al menos 10 caracteres.",
  }).max(500, {
    message: "El motivo no puede exceder los 500 caracteres.",
  }),
});

export default function AppointmentsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      reason: "",
    }
  });

  async function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "No autenticado",
        description: "Debes iniciar sesión para agendar una cita.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const [hours, minutes] = values.time.split(':').map(Number);
      const startTime = new Date(values.date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours for the session
      
      const appointmentId = `${user.uid}_${startTime.getTime()}`;
      const appointmentRef = doc(firestore, `users/${user.uid}/appointments`, appointmentId);

      await setDoc(appointmentRef, {
        id: appointmentId,
        userId: user.uid,
        startTime: startTime,
        endTime: endTime,
        location: values.professional,
        description: values.reason,
        isVirtual: values.modality === 'virtual',
        status: 'scheduled',
        createdAt: serverTimestamp(),
        cancelledAt: null,
        feedback: ''
      });
      
      toast({
        title: "¡Cita Agendada!",
        description: "Tu cita ha sido guardada correctamente.",
      });

      const notificationInput = {
        userId: user.uid,
        userEmail: user.email || 'No especificado',
        userName: user.displayName || 'Usuario Anónimo',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: values.professional,
        description: values.reason,
        isVirtual: values.modality === 'virtual',
      };

      await notifyAppointment(notificationInput);
      
      toast({
        title: "¡Notificación Enviada!",
        description: "Se ha enviado un correo con los detalles de tu cita.",
      });

      form.reset();

    } catch (error) {
      console.error("Error agendando la cita:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo agendar tu cita. Por favor, intenta de nuevo.";
      toast({
        variant: "destructive",
        title: "Error al agendar",
        description: errorMessage,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Agendar Sesión de Bienestar</h1>
        <p className="text-muted-foreground">Reserva una sesión con nuestros profesionales.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col lg:col-span-1">
                <Card>
                  <CardContent className="p-2 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                          date < tomorrow || date > maxDate || isSunday(date)
                      }
                      locale={es}
                      className="p-0"
                    />
                  </CardContent>
                </Card>
                <FormMessage className="mt-2" />
              </FormItem>
            )}
          />

          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Completa los detalles de tu cita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="professional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profesional</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un profesional..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professionals.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una hora..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="modality"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Modalidad</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary flex-1">
                            <FormControl>
                              <RadioGroupItem value="virtual" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Virtual
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary flex-1">
                            <FormControl>
                              <RadioGroupItem value="presencial" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Presencial
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de la Consulta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente por qué deseas la sesión. Esto ayudará al profesional a prepararse."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting} className="font-bold w-full md:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
