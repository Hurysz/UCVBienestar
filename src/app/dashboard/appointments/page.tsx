"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase";
import { notifyAppointment, type AppointmentData } from "@/ai/flows/notify-appointment";

const appointmentSchema = z.object({
  date: z.date({
    required_error: "Por favor, selecciona una fecha.",
  }),
  time: z.string({
    required_error: "Por favor, selecciona una hora.",
  }),
  professional: z.string({
    required_error: "Por favor, selecciona un profesional.",
  }),
  reason: z.string().min(10, { message: "El motivo debe tener al menos 10 caracteres."}),
});

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
const professionals = ["Dra. Sofía Reyes (Psicología Clínica)", "Lic. Carlos Solano (Consejería Académica)", "Dr. Mateo Vega (Psiquiatría)"];

export default function AppointmentsPage() {
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: new Date(),
    }
  });

  async function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!user || !user.email || !user.displayName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión y tener un perfil completo para agendar una cita.",
      });
      return;
    }

    const startTime = new Date(`${format(values.date, "yyyy-MM-dd")}T${values.time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const appointmentData: AppointmentData = {
      userProfileId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: values.professional,
      description: values.reason,
      isVirtual: true,
    };
    
    try {
      await notifyAppointment(appointmentData);

      toast({
        title: "Sesión Agendada",
        description: `Tu sesión virtual ha sido confirmada para el ${format(values.date, "PPP", { locale: es })} a las ${values.time}.`,
      });
      form.reset();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error al agendar",
        description: "No se pudo agendar la sesión ni notificar. Inténtalo de nuevo.",
      });
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Agendar Sesión de Bienestar</h1>
        <p className="text-muted-foreground">Reserva una sesión virtual con nuestros profesionales.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 md:grid-cols-2">
              <div className="flex justify-center">
                 <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                     <FormItem className="flex flex-col items-center">
                      <FormLabel className="text-center mb-2">1. Selecciona una fecha</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                          initialFocus
                          locale={es}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                 <FormField
                  control={form.control}
                  name="professional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Selecciona un profesional</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Elige un profesional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professionals.map(prof => (
                            <SelectItem key={prof} value={prof}>{prof}</SelectItem>
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
                      <FormLabel>3. Selecciona una hora</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Elige un horario disponible" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                 <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Motivo de la sesión</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe brevemente el motivo de tu consulta (es confidencial)..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Confirmando..." : "Confirmar Sesión"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
