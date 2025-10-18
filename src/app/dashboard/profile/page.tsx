"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { FirebaseError } from "firebase/app";

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
import { useDoc, useFirestore, useUser, useMemoFirebase, useFirebaseApp, useAuth } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";


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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [displayPhoto, setDisplayPhoto] = useState<string | undefined>(undefined);


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
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
      setDisplayPhoto(userProfile.profilePicture);
    } else if(user) {
        form.reset({
            name: user.displayName || "",
            description: "",
        })
        setDisplayPhoto(user.photoURL || undefined);
    }
  }, [userProfile, user, form]);

  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userDocRef || !firebaseApp) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setUploadProgress(0);
        console.error("Upload error:", error);

        let description = `Ocurrió un error inesperado. Código: ${error.code}`;
        toast({
          variant: "destructive",
          title: "Error al subir la imagen",
          description: description,
        });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          if(auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
          }
          await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });
          
          setDisplayPhoto(downloadURL);
          
          toast({
            title: "Foto de perfil actualizada",
            description: "Tu nueva foto de perfil se ha guardado.",
          });
        } catch (error) {
            console.error("Error updating profile:", error);
            const err = error as FirebaseError;
            toast({
                variant: "destructive",
                title: "Error al guardar",
                description: `No se pudo guardar la URL de la imagen en el perfil. Código: ${err.code}`,
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
      }
    );
  };


  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !userDocRef || !firestore) return;
    
    try {
        const updatedProfile = {
          name: values.name,
          description: values.description,
        };
    
        await setDoc(userDocRef, updatedProfile, { merge: true });
    
        if(auth.currentUser && auth.currentUser.displayName !== values.name) {
            await updateProfile(auth.currentUser, { displayName: values.name });
        }
    
        toast({
          title: "Perfil Actualizado",
          description: "Tu información ha sido guardada con éxito.",
        });
    } catch (error) {
        console.error("Profile update error: ", error);
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
        await sendPasswordResetEmail(auth, user.email);
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
          {profileBanner && <Image src={profileBanner.imageUrl} alt="Profile banner" fill objectFit="cover" data-ai-hint={profileBanner.imageHint} />}
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <div className="relative h-24 w-24 rounded-full border-4 border-background md:h-32 md:w-32 group">
                <Avatar className="h-full w-full">
                  <AvatarImage src={displayPhoto || undefined} alt={userProfile?.name || "User"} />
                  <AvatarFallback className="text-4xl">{user?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || user?.email?.charAt(0) ||'U'}</AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-white" />
                </div>
                 {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center p-2">
                    <Progress value={uploadProgress} className="h-2 w-3/4" />
                  </div>
                 )}
            </div>
          </div>
        </div>
        <div className="pt-20 px-6 pb-6 md:pt-24">
            <h1 className="text-2xl font-bold font-headline">{form.getValues("name")}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground">Sube tu foto de perfil. Acepta JPG o PNG, máx 5MB.</p>
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
