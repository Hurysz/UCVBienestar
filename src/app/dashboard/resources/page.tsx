"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, BookOpen, Lightbulb, Video } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const resources = {
  "articulos": [
    {
      id: "gs1",
      title: "Manejando la Ansiedad Universitaria",
      description: "Estrategias y técnicas prácticas para controlar la ansiedad antes y durante los exámenes.",
      content: "La ansiedad es una reacción común al estrés de la vida universitaria. Este artículo explora técnicas de respiración, mindfulness y organización que pueden ayudarte a sentirte más en control. Aprende a identificar los desencadenantes y a desarrollar un plan de acción personalizado.",
      imageId: "resource-1",
      icon: BookOpen,
    },
    {
      id: "gs2",
      title: "La Importancia del Sueño en el Rendimiento",
      description: "Descubre cómo un buen descanso puede mejorar tu memoria, concentración y bienestar general.",
      content: "El sueño no es un lujo, es una necesidad, especialmente para los estudiantes. Aquí desglosamos la ciencia detrás del sueño y el aprendizaje, y te damos consejos prácticos para mejorar tu higiene del sueño y maximizar tu rendimiento académico y emocional.",
      imageId: "resource-2",
      icon: BookOpen,
    },
  ],
  "talleres": [
    {
      id: "ev1",
      title: "Taller Grabado: Mindfulness para Principiantes",
      description: "Grabación de nuestro popular taller. Aprende a anclarte en el presente y a reducir el estrés del día a día.",
      content: "Si te perdiste nuestro taller en vivo, ¡no te preocupes! Aquí tienes la grabación completa. Sigue a la instructora en una sesión guiada de mindfulness, perfecta para calmar la mente en cualquier momento. Incluye ejercicios que puedes practicar en casa.",
      imageId: "resource-3",
      icon: Video,
    },
  ],
  "herramientas": [
    {
      id: "ma1",
      title: "Guía de Respiración Diafragmática",
      description: "Un ejercicio de respiración simple y poderoso para calmar tu sistema nervioso en minutos.",
      content: "La respiración diafragmática, o abdominal, es una de las herramientas más efectivas contra el estrés agudo. Esta guía descargable en PDF te muestra paso a paso cómo practicarla. Perfecta para usar antes de una presentación o un examen importante.",
      imageId: "resource-1",
      icon: Lightbulb,
    },
     {
      id: "ma2",
      title: "Diario de Gratitud Semanal",
      description: "Plantilla para cultivar una mentalidad positiva, enfocándote en lo bueno de cada semana.",
      content: "La gratitud es una práctica poderosa para mejorar el estado de ánimo. Usa esta plantilla para anotar tres cosas por las que estás agradecido cada día. Es un ejercicio simple que puede tener un gran impacto en tu perspectiva y bienestar emocional.",
      imageId: "resource-2",
      icon: Lightbulb,
    },
  ],
};

type Resource = (typeof resources.articulos)[0];

type ResourceCategory = keyof typeof resources;

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

export default function ResourcesPage() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Recursos de Bienestar</h1>
        <p className="text-muted-foreground">Encuentra artículos, talleres y herramientas para tu salud mental.</p>
      </div>
      
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <Tabs defaultValue="articulos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articulos">Artículos</TabsTrigger>
            <TabsTrigger value="talleres">Talleres</TabsTrigger>
            <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
          </TabsList>
          {(Object.keys(resources) as ResourceCategory[]).map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {resources[category].map(resource => {
                  const image = getImage(resource.imageId);
                  return (
                    <Card key={resource.id} className="overflow-hidden flex flex-col">
                      <CardHeader className="p-0">
                        {image && (
                           <div className="relative h-48 w-full">
                              <Image src={image.imageUrl} alt={resource.title} layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
                           </div>
                        )}
                      </CardHeader>
                      <div className="flex flex-col flex-1 p-6">
                        <CardTitle className="font-headline text-xl mb-2">{resource.title}</CardTitle>
                        <CardDescription className="flex-1">{resource.description}</CardDescription>
                        <CardFooter className="p-0 pt-4">
                           <Button className="w-full font-bold" onClick={() => setSelectedResource(resource)}>
                             Ver Recurso <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedResource && (
           <DialogContent className="sm:max-w-2xl">
             <DialogHeader>
               <DialogTitle className="font-headline text-2xl">{selectedResource.title}</DialogTitle>
               <DialogDescription>{selectedResource.description}</DialogDescription>
             </DialogHeader>
             <div className="py-4 space-y-4">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <Image src={getImage(selectedResource.imageId)?.imageUrl || ""} alt={selectedResource.title} layout="fill" objectFit="cover" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedResource.content}
                </p>
             </div>
           </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
