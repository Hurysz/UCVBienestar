import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Calendar, Library, ArrowRight, Award, Newspaper, Star } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppointmentsList } from "@/components/appointments-list";
import { resources, workshopCategories } from "@/lib/resources";

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
  
  const winningActivity = workshopCategories
    .flatMap(category => category.activities.map(activity => ({ ...activity, categoryTitle: category.title })))
    .filter(activity => activity.votes >= 5)
    .sort((a, b) => b.votes - a.votes)[0];

  const newestArticle = resources.find(r => r.category === 'articulo');

  const suggestedWorkshop = workshopCategories[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline animated-rgb-text">Bienvenido a UCV Bienestar</h1>
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
            
            {winningActivity && (
              <div className="p-4 rounded-lg border bg-primary/10 border-primary/20">
                <div className="flex items-center gap-3 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">¡Actividad Ganadora de la Semana!</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gracias a sus votos, la próxima actividad será: <span className="font-bold text-foreground">"{winningActivity.title}"</span> de la categoría "{winningActivity.categoryTitle}". 
                  {winningActivity.date && winningActivity.time && (
                    <>
                      {' '}¡Te esperamos el <span className="font-bold text-foreground">{winningActivity.date} a las {winningActivity.time}</span>!
                    </>
                  )}
                </p>
              </div>
            )}

            {newestArticle && (
              <div className="p-4 rounded-lg border bg-card-foreground/5">
                 <div className="flex items-center gap-3 mb-1">
                  <Newspaper className="h-5 w-5 text-foreground/80" />
                  <h3 className="font-semibold">Nuevo en la Biblioteca</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Hemos añadido un nuevo artículo: <span className="font-bold text-foreground">"{newestArticle.title}"</span>. ¡Revísalo en la sección de Recursos!
                </p>
                 <Link href="/dashboard/resources" passHref>
                  <Button variant="link" className="p-0 h-auto text-primary text-sm mt-2">
                    Leer artículos <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {suggestedWorkshop && !winningActivity && (
               <div className="p-4 rounded-lg border bg-card-foreground/5">
                 <div className="flex items-center gap-3 mb-1">
                  <Star className="h-5 w-5 text-foreground/80" />
                  <h3 className="font-semibold">¡Tú Decides!</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  ¿Te interesa un taller sobre "{suggestedWorkshop.title}"? ¡Ve a la sección de Recursos y vota por tus actividades favoritas!
                </p>
                 <Link href="/dashboard/resources" passHref>
                  <Button variant="link" className="p-0 h-auto text-primary text-sm mt-2">
                    Votar ahora <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
