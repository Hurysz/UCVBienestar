"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const emailSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo válido." }).refine(
    (email) => email.endsWith("@ucvvirtual.edu.pe"),
    { message: "Solo se permiten correos con el dominio @ucvvirtual.edu.pe." }
  ),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Correo enviado",
        description: `Se ha enviado un enlace para restablecer tu contraseña a ${values.email}.`,
      });
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el correo. Verifica que la dirección sea correcta.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Recuperar Contraseña</CardTitle>
        <CardDescription>Introduce tu correo para recibir un enlace de recuperación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre.apellido@ucvvirtual.edu.pe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enviando..." : "Enviar Correo de Recuperación"}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
