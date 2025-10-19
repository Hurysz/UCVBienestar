import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Calendar, Library, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppointmentsList } from "@/components/appointments-list";

const quickLinks = [
  {
    title: "Grupos de Apoyo",
    description: "Conecta con otros en un espacio seguro.",
    icon: HeartHandshake,
    href: "/dashboard/chat",
  },
  {
    title: "Agendar Sesión",
    description: "Habla con un profesional de bienestar.",
    icon: Calendar,
    href: "/dashboard/appointments",
  },
  {
    title: "Recursos de Bienestar",
    description: "Artículos, guías y herramientas para ti.",
    icon: Library,
    href: "/dashboard/resources",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bienvenido a UCV Bienestar</h1>
        <p className="text-muted-foreground">Tu espacio seguro para el cuidado de la salud mental.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.href} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-accent p-3 rounded-full">
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-headline text-lg">{link.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
              <Link href={link.href} passHref>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto text-primary hover:text-primary">
                  Ir ahora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <AppointmentsList />

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Anuncios y Novedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card-foreground/5">
              <h3 className="font-semibold">Taller de Mindfulness y Reducción de Estrés</h3>
              <p className="text-sm text-muted-foreground">Inscríbete en nuestro próximo taller gratuito para aprender técnicas de relajación. Próximo Lunes, 4 PM.</p>
            </div>
             <div className="p-4 rounded-lg border bg-card-foreground/5">
              <h3 className="font-semibold">Nuevos Artículos en la Biblioteca</h3>
              <p className="text-sm text-muted-foreground">Hemos añadido guías sobre manejo de la ansiedad y hábitos de sueño saludables. ¡Revísalos en la sección de Recursos!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
