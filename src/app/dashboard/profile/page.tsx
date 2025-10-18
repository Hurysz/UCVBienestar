"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

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
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload } from "lucide-react";
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase, useFirebaseApp } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile, sendPasswordResetEmail, getAuth } from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app";


const profileSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().max(160, { message: "La descripción no debe exceder los 160 caracteres." }).optional(),
});

type UserProfile = {
    id: string;
    name: string;
    email: string;
    description?: string;
    profilePicture?: string;
}

const profileBanner = PlaceHolderImages.find(p => p.id === 'profile-banner');

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isUserLoading, refreshUser } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `userProfiles/${user.uid}`);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        description: userProfile.description || "",
      });
    } else if(user) {
        form.reset({
            name: user.displayName || "",
            description: "",
        })
    }
  }, [userProfile, user, form]);

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userDocRef || !firebaseApp) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `profilePictures/${user.uid}`);

        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update both Auth and Firestore
        await updateProfile(user, { photoURL: downloadURL });
        
        // Non-blocking update to firestore
        setDocumentNonBlocking(userDocRef, { profilePicture: downloadURL }, { merge: true });
        
        // Force a refresh of the user object to get the new photoURL
        await refreshUser();
        
        toast({
          title: "Foto de perfil actualizada",
          description: "Tu nueva foto de perfil se ha guardado.",
        });
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        throw new Error("Error al leer el archivo.");
      }
    } catch (error: any) {
      console.error(error);
      const description = error.code === 'storage/unauthorized' 
        ? "Error de permisos. Revisa las reglas de seguridad de Storage."
        : "No se pudo guardar tu nueva foto de perfil.";
      toast({
        variant: "destructive",
        title: "Error al subir la imagen",
        description,
      });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !userDocRef) return;
    
    try {
        const updatedProfile = {
          name: values.name,
          description: values.description,
        };
    
        setDocumentNonBlocking(userDocRef, updatedProfile, { merge: true });
    
        if(user.displayName !== values.name) {
            await updateProfile(user, { displayName: values.name });
            await refreshUser();
        }
    
        toast({
          title: "Perfil Actualizado",
          description: "Tu información ha sido guardada con éxito.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo guardar la información del perfil.",
        });
    }
  }

  const handlePasswordReset = async () => {
      if(!user?.email) {
           toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo encontrar tu correo electrónico.",
            });
          return;
      }
      setIsSendingPasswordReset(true);
      try {
        await sendPasswordResetEmail(getAuth(), user.email);
        toast({
            title: "Correo de recuperación enviado",
            description: "Revisa tu bandeja de entrada para cambiar tu contraseña.",
        });
      } catch (error) {
           toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar el correo de recuperación.",
            });
      } finally {
        setIsSendingPasswordReset(false);
      }
  }
  
  const isLoading = isUserLoading || isProfileLoading;
  const displayPhoto = user?.photoURL || userProfile?.profilePicture;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                 <Skeleton className="h-32 md:h-48 w-full" />
                 <div className="pt-16 px-6 pb-6 md:pt-20">
                     <Skeleton className="h-8 w-48 mb-2" />
                     <Skeleton className="h-4 w-64" />
                </div>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePictureUpload} 
        className="hidden" 
        accept="image/png, image/jpeg"
      />
      <Card className="overflow-hidden">
        <div className="relative h-32 md:h-48">
          {profileBanner && <Image src={profileBanner.imageUrl} alt="Profile banner" layout="fill" objectFit="cover" data-ai-hint={profileBanner.imageHint} />}
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <div className="relative h-24 w-24 rounded-full border-4 border-background md:h-32 md:w-32">
                <Avatar className="h-full w-full">
                  <AvatarImage src={displayPhoto || undefined} alt={userProfile?.name || "User"} />
                  <AvatarFallback className="text-4xl">{user?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || user?.email?.charAt(0) ||'U'}</AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Cambiar foto"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Cambiar foto</span>
                </Button>
            </div>
          </div>
        </div>
        <div className="pt-16 px-6 pb-6 md:pt-20">
            <h1 className="text-2xl font-bold font-headline">{form.getValues("name")}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Información del Perfil</CardTitle>
          <CardDescription>Personaliza la información que se muestra en tu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cuéntanos un poco sobre ti..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" className="font-bold" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Seguridad</CardTitle>
          <CardDescription>Administra la seguridad de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-medium">Contraseña</h3>
                    <p className="text-sm text-muted-foreground">Recibirás un correo para cambiar tu contraseña.</p>
                </div>
                <Button onClick={handlePasswordReset} disabled={isSendingPasswordReset}>
                    {isSendingPasswordReset ? 'Enviando...' : 'Cambiar Contraseña'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
