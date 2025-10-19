"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { PhrasesCarousel } from "@/components/phrases-carousel";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo válido." }).refine(
    (email) => email.endsWith("@ucvvirtual.edu.pe"),
    { message: "Solo se permiten correos con el dominio @ucvvirtual.edu.pe." }
  ),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo a tu panel...",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      let description = "Ocurrió un error inesperado.";
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "El correo o la contraseña son incorrectos.";
        }
      }
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description,
      });
    }
  }

  return (
    <>
      <div className="text-center mb-6">
          <h1 className="font-headline text-3xl animated-rgb-text">Bienvenido de nuevo</h1>
            <div className="pt-4">
              <PhrasesCarousel />
          </div>
      </div>
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <Link href="/forgot-password">
                  <Button variant="link" className="p-0 h-auto font-normal text-sm">¿Olvidaste tu contraseña?</Button>
                </Link>
              </div>
              <Button type="submit" className={cn("w-full font-bold h-auto p-0", !form.formState.isSubmitting && "animated-rgb-button")} disabled={form.formState.isSubmitting}>
                  <span>
                      {form.formState.isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                  </span>
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
