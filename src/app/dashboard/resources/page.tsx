"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { resources as allResources, type Resource } from "@/lib/resources";

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

const resourceCategories: Resource['category'][] = ['articulo', 'taller', 'herramienta'];

function ResourceList({ resources, onResourceSelect }: { resources: Resource[], onResourceSelect: (resource: Resource) => void }) {
    
    if (!resources || resources.length === 0) {
        return <p className="text-muted-foreground text-center mt-8">No hay recursos en esta categoría por el momento.</p>
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {resources.map(resource => {
                const image = getImage(resource.imageId);
                return (
                    <Card key={resource.id} className="overflow-hidden flex flex-col">
                         {image && (
                            <div className="relative h-48 w-full">
                                <Image src={image.imageUrl} alt={resource.title} fill objectFit="cover" data-ai-hint={image.imageHint} />
                            </div>
                        )}
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="font-headline text-lg mb-2 leading-tight">{resource.title}</CardTitle>
                            {resource.authors && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{resource.authors.slice(0, 2).join(', ')}{resource.authors.length > 2 ? ' et al.' : ''}</span>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full font-bold" onClick={() => onResourceSelect(resource)}>
                                Ver Más <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    );
}


export default function ResourcesPage() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = (category: Resource['category']) => {
    return allResources.filter(r => r.category === category);
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Recursos de Bienestar</h1>
        <p className="text-muted-foreground">Encuentra artículos, talleres y herramientas para tu salud mental.</p>
      </div>
      
      <Tabs defaultValue="articulo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articulo">Artículos</TabsTrigger>
            <TabsTrigger value="taller">Talleres</TabsTrigger>
            <TabsTrigger value="herramienta">Herramientas</TabsTrigger>
        </TabsList>
        {resourceCategories.map(category => (
            <TabsContent key={category} value={category}>
                <ResourceList 
                  resources={filteredResources(category)} 
                  onResourceSelect={setSelectedResource} 
                />
            </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        {selectedResource && (
           <DialogContent className="sm:max-w-2xl">
             <DialogHeader>
               <DialogTitle className="font-headline text-2xl">{selectedResource.title}</DialogTitle>
                <div className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        {selectedResource.authors && (
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3 w-3" />
                                <span>{selectedResource.authors.join(', ')}</span>
                            </div>
                        )}
                        {selectedResource.publicationInfo && (
                             <div className="flex items-center gap-1.5">
                                <BookOpen className="h-3 w-3" />
                                <span>{selectedResource.publicationInfo}</span>
                            </div>
                        )}
                    </div>
               </div>
             </DialogHeader>
             <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <p className="text-sm text-muted-foreground">
                    {selectedResource.content}
                </p>
                
             </div>
             <CardFooter>
                 <Button asChild className="w-full font-bold">
                    <Link href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                        Ir a la fuente original <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
           </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
