"use client";

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { notifyFeedback } from '@/ai/flows/notify-feedback';
import { differenceInHours, differenceInDays, format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Loader2, MessageSquare, RotateCcw, XCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

type Appointment = {
    id: string;
    userId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    location: string;
    description: string;
    isVirtual: boolean;
    status: 'scheduled' | 'cancelled' | 'completed';
    createdAt: Timestamp;
    cancelledAt?: Timestamp | null;
    feedback?: string;
}

export function AppointmentsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const appointmentsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/appointments`);
    }, [firestore, user]);

    const appointmentsQuery = useMemoFirebase(() => {
        if (!appointmentsCollectionRef) return null;
        return query(appointmentsCollectionRef, orderBy('startTime', 'desc'));
    }, [appointmentsCollectionRef]);

    const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

    const handleCancel = async (appointmentId: string) => {
        if (!firestore || !user) return;
        try {
            const appointmentRef = doc(firestore, `users/${user.uid}/appointments`, appointmentId);
            await updateDoc(appointmentRef, {
                status: 'cancelled',
                cancelledAt: serverTimestamp()
            });
            toast({ title: 'Cita cancelada', description: 'Tu cita ha sido cancelada con éxito.' });
        } catch (error) {
            console.error("Error cancelling appointment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cancelar la cita.' });
        }
    };

    const handleResume = async (appointmentId: string) => {
        if (!firestore || !user) return;
        try {
            const appointmentRef = doc(firestore, `users/${user.uid}/appointments`, appointmentId);
            await updateDoc(appointmentRef, {
                status: 'scheduled',
                cancelledAt: null
            });
            toast({ title: 'Cita retomada', description: 'Tu cita ha sido agendada nuevamente.' });
        } catch (error) {
            console.error("Error resuming appointment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo retomar la cita.' });
        }
    };
    
    if (isLoading) {
        return <AppointmentsSkeleton />;
    }

    if (!appointments || appointments.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Mis Citas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Aún no has agendado ninguna cita.</p>
                        <Button variant="link" className="mt-2">Agendar mi primera cita</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Mis Citas</CardTitle>
                <CardDescription>Aquí puedes ver y gestionar tus próximas y pasadas sesiones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {appointments.map(app => (
                    <AppointmentItem
                        key={app.id}
                        appointment={app}
                        onCancel={handleCancel}
                        onResume={handleResume}
                    />
                ))}
            </CardContent>
        </Card>
    );
}


function AppointmentItem({ appointment, onCancel, onResume }: { appointment: Appointment, onCancel: (id: string) => void, onResume: (id: string) => void }) {
    const [feedback, setFeedback] = useState(appointment.feedback || '');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // Robust check for timestamps before converting
    if (!appointment.startTime || typeof appointment.startTime.toDate !== 'function' || !appointment.endTime || typeof appointment.endTime.toDate !== 'function') {
      return null; // Don't render if dates are invalid to prevent crash
    }

    const now = new Date();
    const startTime = appointment.startTime.toDate();
    const endTime = appointment.endTime.toDate();

    const isCompleted = appointment.status !== 'cancelled' && isAfter(now, endTime);
    const effectiveStatus = isCompleted ? 'completed' : appointment.status;

    const canCancel = effectiveStatus === 'scheduled' && differenceInDays(startTime, now) >= 2;
    
    const cancelledAtDate = appointment.cancelledAt && typeof appointment.cancelledAt.toDate === 'function' ? appointment.cancelledAt.toDate() : null;
    const canResume = effectiveStatus === 'cancelled' && cancelledAtDate && differenceInHours(now, cancelledAtDate) < 3;
    
    const handleSubmitFeedback = async () => {
        if (!feedback.trim() || !user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'El feedback no puede estar vacío.' });
            return;
        }
        setIsSubmittingFeedback(true);
        try {
            const appointmentRef = doc(firestore, `users/${user.uid}/appointments`, appointment.id);
            await updateDoc(appointmentRef, { feedback });

            await notifyFeedback({
                userName: user.displayName || 'Usuario Anónimo',
                userEmail: user.email || 'No especificado',
                appointmentTime: startTime.toISOString(),
                professional: appointment.location,
                feedback: feedback,
            });

            toast({ title: 'Feedback enviado', description: '¡Gracias por tus comentarios!' });
        } catch (error) {
            console.error("Error submitting feedback: ", error);
            const errorMessage = error instanceof Error ? error.message : "No se pudo enviar tu feedback.";
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsSubmittingFeedback(false);
        }
    };


    const statusConfig = {
        scheduled: { label: 'Agendada', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20' },
        cancelled: { label: 'Cancelada', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/20' },
        completed: { label: 'Completada', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/20' },
    };

    const currentStatus = statusConfig[effectiveStatus as keyof typeof statusConfig];
    
    if (!currentStatus) {
        return null;
    }

    return (
        <div className={`p-4 rounded-lg border bg-card-foreground/5 ${currentStatus.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`border-none text-white font-bold ${currentStatus.color}`}>{currentStatus.label}</Badge>
                        <p className={`font-semibold ${currentStatus.text}`}>{appointment.location}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(startTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}</span>
                    </div>
                </div>
                <CardFooter className="p-0 pt-4 sm:pt-0 flex-shrink-0 flex gap-2">
                    {effectiveStatus === 'scheduled' && (
                        <Button size="sm" variant="outline" onClick={() => onCancel(appointment.id)} disabled={!canCancel}>
                           <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                    )}
                     {effectiveStatus === 'cancelled' && (
                        <Button size="sm" onClick={() => onResume(appointment.id)} disabled={!canResume}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Retomar
                        </Button>
                    )}
                </CardFooter>
            </div>
             {effectiveStatus === 'scheduled' && !canCancel && isAfter(startTime, now) && (
                <Alert variant="default" className="mt-4 text-xs p-3">
                    <AlertDescription>
                        Solo puedes cancelar una cita con al menos 2 días de anticipación.
                    </AlertDescription>
                </Alert>
            )}
             {effectiveStatus === 'cancelled' && !canResume && cancelledAtDate && (
                <Alert variant="default" className="mt-4 text-xs p-3">
                    <AlertDescription>
                        El periodo para retomar esta cita ha expirado (3 horas después de la cancelación).
                    </AlertDescription>
                </Alert>
            )}
            {effectiveStatus === 'completed' && (
                 <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">¿Cómo te fue en tu sesión?</h4>
                    <Textarea
                        placeholder="Escribe tus comentarios aquí. Tu opinión nos ayuda a mejorar."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={isSubmittingFeedback || !!appointment.feedback}
                    />
                    <Button onClick={handleSubmitFeedback} size="sm" className="mt-2" disabled={isSubmittingFeedback || !!appointment.feedback}>
                         {isSubmittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         {appointment.feedback ? "Feedback Enviado" : "Enviar Feedback"}
                    </Button>
                 </div>
            )}
        </div>
    )
}

function AppointmentsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Mis Citas</CardTitle>
                 <CardDescription>Aquí puedes ver y gestionar tus próximas y pasadas sesiones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-56" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
