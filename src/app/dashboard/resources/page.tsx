"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { resources as allResources, type Resource, workshopCategories, type WorkshopCategory, type WorkshopActivity } from "@/lib/resources";
import { BrainCircuit, Wind, Dumbbell, Vote, BookOpen, Gamepad2, Users, Tent } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// --- Herramientas Interactivas ---

const BreathingTool = ({ tool }: { tool: Resource }) => {
  const DURATION = 120; // 2 minutos
  const STAGES = ["Inhala (4s)", "Sostén (4s)", "Exhala (4s)", "Sostén (4s)"];
  const STAGE_DURATION = 4;

  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      setTime(DURATION);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

   useEffect(() => {
    let stageInterval: NodeJS.Timeout | undefined;
    if (isActive) {
        stageInterval = setInterval(() => {
            setStage(prevStage => (prevStage + 1) % STAGES.length);
        }, STAGE_DURATION * 1000);
    }
    return () => clearInterval(stageInterval);
  }, [isActive, STAGES.length]);


  const handleStart = () => {
    setIsActive(true);
    setTime(DURATION);
    setStage(0);
  };

  const progress = ((DURATION - time) / DURATION) * 100;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Wind size={24}/> {tool.title}</CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="relative h-40 w-40">
          <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 transition-transform duration-1000 ease-in-out ${isActive && (stage === 0 || stage === 1) ? 'scale-100' : 'scale-75'}`}>
             <span className="text-3xl font-bold font-headline tabular-nums text-primary">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
          </div>
        </div>
        <p className="text-lg font-semibold h-6">{isActive ? STAGES[stage] : "Presiona Iniciar para comenzar"}</p>
        <Progress value={isActive ? progress : 0} className="w-full h-2" />
      </CardContent>
      <CardFooter>
        <Button className="w-full font-bold" onClick={handleStart} disabled={isActive}>
          {isActive ? "En progreso..." : "Iniciar Reto"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const StretchingTool = ({ tool }: { tool: Resource }) => {
    const DURATION = 180; // 3 minutos
    const STAGES = [
        { name: "Estiramiento de Cuello (Derecha)", duration: 15 },
        { name: "Estiramiento de Cuello (Izquierda)", duration: 15 },
        { name: "Círculos con los Hombros (Atrás)", duration: 22 },
        { name: "Círculos con los Hombros (Adelante)", duration: 23 },
        { name: "Estiramiento de Espalda Alta", duration: 45 },
        { name: "Estiramiento de Muñecas", duration: 45 },
        { name: "Respiración Profunda", duration: 15 },
    ];

    const [isActive, setIsActive] = useState(false);
    const [time, setTime] = useState(DURATION);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isActive) {
            timer = setInterval(() => {
                setTime(prev => {
                    if (prev <= 1) {
                        setIsActive(false);
                        return DURATION;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isActive]);

    useEffect(() => {
        if (isActive) {
            let elapsed = 0;
            const stageUpdater = () => {
                const totalElapsed = DURATION - time;
                let accumulatedDuration = 0;
                for (let i = 0; i < STAGES.length; i++) {
                    accumulatedDuration += STAGES[i].duration;
                    if (totalElapsed < accumulatedDuration) {
                        setCurrentStageIndex(i);
                        return;
                    }
                }
            };
            stageUpdater();
        }
    }, [time, isActive, STAGES, DURATION]);


    const handleStart = () => {
        setIsActive(true);
        setTime(DURATION);
        setCurrentStageIndex(0);
    };
    
    const progress = ((DURATION - time) / DURATION) * 100;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Dumbbell size={24}/> {tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
                <div className="h-40 w-40 flex items-center justify-center rounded-lg bg-accent">
                    <span className="text-2xl font-bold font-headline text-center text-primary">{isActive ? STAGES[currentStageIndex].name : "Lista para moverte?"}</span>
                </div>
                <p className="text-3xl font-bold font-headline tabular-nums">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</p>
                <Progress value={isActive ? progress : 0} className="w-full h-2" />
            </CardContent>
            <CardFooter>
                 <Button className="w-full font-bold" onClick={handleStart} disabled={isActive}>
                    {isActive ? "En progreso..." : "Iniciar Pausa Activa"}
                </Button>
            </CardFooter>
        </Card>
    );
};

const EncouragementPhrases = ({ tool }: { tool: Resource }) => {
  const phrases = tool.content.split('\n').filter(p => p.trim() !== '');
  return (
    <Card className="w-full lg:col-span-2">
       <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit size={24}/> {tool.title}</CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phrases.map((phrase, index) => (
          <div key={index} className="p-4 border rounded-lg bg-background/50 text-center flex items-center justify-center">
            <p className="text-sm font-medium text-foreground/80">{phrase}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};


const toolComponents: { [key: string]: React.FC<{ tool: Resource }> } = {
  "herr-1": BreathingTool,
  "herr-2": StretchingTool,
  "herr-3": EncouragementPhrases,
};


// --- Talleres con Votación ---
const WorkshopActivityItem = ({ activity, onVote, categoryId }: { activity: WorkshopActivity, onVote: (categoryId: string, activityId: string) => void, categoryId: string }) => {
    const VOTE_GOAL = 5;
    const progress = (activity.votes / VOTE_GOAL) * 100;

    return (
        <div className="p-3 rounded-md bg-background/50 hover:bg-background/70 transition-colors">
            <p className="font-medium text-sm">{activity.title}</p>
            <div className="flex items-center gap-4 mt-3">
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-primary">{activity.votes}/{VOTE_GOAL} votos</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
                <Button size="sm" variant="outline" onClick={() => onVote(categoryId, activity.id)} disabled={activity.voted}>
                    <Vote className="mr-2 h-4 w-4" />
                    {activity.voted ? "Votado" : "Votar"}
                </Button>
            </div>
        </div>
    );
};

const categoryIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  "cat-1": Users,
  "cat-2": Tent,
  "cat-3": BookOpen,
  "cat-4": Gamepad2,
};

export default function ResourcesPage() {
  const articles = allResources.filter(r => r.category === 'articulo');
  const tools = allResources.filter(r => r.category === 'herramienta');
  const [currentWorkshops, setCurrentWorkshops] = useState<WorkshopCategory[]>(workshopCategories);

  const handleVote = (categoryId: string, activityId: string) => {
    setCurrentWorkshops(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === categoryId) {
          const updatedActivities = category.activities.map(activity => {
            if (activity.id === activityId && !activity.voted) {
              return { ...activity, votes: activity.votes + 1, voted: true };
            }
            return activity;
          });
          return { ...category, activities: updatedActivities };
        }
        return category;
      });
    });
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Recursos de Bienestar</h1>
        <p className="text-muted-foreground">Encuentra artículos, talleres interactivos y herramientas para tu día a día.</p>
      </div>
      
      <Tabs defaultValue="taller" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="herramienta">Herramientas</TabsTrigger>
            <TabsTrigger value="taller">Talleres</TabsTrigger>
            <TabsTrigger value="articulo">Artículos</TabsTrigger>
        </TabsList>

        <TabsContent value="herramienta" className="mt-6">
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {tools.map(tool => {
                    const ToolComponent = toolComponents[tool.id];
                    return ToolComponent ? <ToolComponent key={tool.id} tool={tool} /> : null;
                })}
            </div>
        </TabsContent>

        <TabsContent value="taller" className="mt-6">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline">¡Tú decides qué hacemos!</CardTitle>
                    <CardDescription>
                        Vota por las actividades que más te interesen de cada categoría. Las propuestas con más apoyo (mínimo 5 votos) se organizarán y se anunciarán en el panel principal. ¡Tu participación es clave!
                    </CardDescription>
                </CardHeader>
            </Card>
            <Accordion type="single" collapsible className="w-full space-y-4 mt-6">
                {currentWorkshops.map(category => {
                    const Icon = categoryIcons[category.id] || Users;
                    return (
                        <AccordionItem value={category.id} key={category.id} className="border rounded-lg bg-card overflow-hidden">
                            <AccordionTrigger className="p-4 hover:no-underline hover:bg-accent/50">
                                <div className="flex items-center gap-4">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <h3 className="text-lg font-headline text-foreground">{category.title}</h3>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                               <div className="space-y-3">
                                  {category.activities.map(activity => (
                                       <WorkshopActivityItem 
                                          key={activity.id}
                                          activity={activity}
                                          onVote={handleVote}
                                          categoryId={category.id}
                                       />
                                  ))}
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </TabsContent>
        
        <TabsContent value="articulo" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map(resource => (
                    <Card key={resource.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="font-headline text-lg mb-2 leading-tight">{resource.title}</CardTitle>
                             <CardDescription>{resource.publicationInfo}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-4">{resource.description}</p>
                        </CardContent>
                        <CardFooter>
                           <Button variant="outline" className="w-full" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">Leer Artículo Completo</a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
