"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, Timestamp, doc, addDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Timestamp;
};

type UserProfile = {
    id: string;
    name: string;
    email: string;
    description?: string;
    profilePicture?: string;
}


export default function ChatPage() {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const messagesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'chat_messages');
  }, [firestore]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollection) return null;
    return query(messagesCollection, orderBy("timestamp", "asc"));
  }, [messagesCollection]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !firestore || !messagesCollection || !userProfile) return;

    const userName = userProfile?.name || user?.displayName || "Usuario Anónimo";
    const userAvatarUrl = userProfile?.profilePicture || user?.photoURL || "";

    const messageData = {
      userId: user.uid,
      userName: userName,
      userAvatar: userAvatarUrl,
      content: newMessage,
      timestamp: serverTimestamp(),
    };
    
    addDoc(messagesCollection, messageData).catch(error => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: messagesCollection.path,
                operation: 'create',
                requestResourceData: messageData
            })
        )
    });
    setNewMessage("");
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Disable send if message is empty, user is not logged in, or the profile is still loading.
  const isSendDisabled = !newMessage.trim() || !user || isProfileLoading;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.28))] flex-col">
       <div>
        <h1 className="text-3xl font-bold font-headline">Grupos de Apoyo</h1>
        <p className="text-muted-foreground">Conéctate e interactúa con otros estudiantes en un espacio seguro.</p>
      </div>
      <div className="flex-1 mt-6 flex flex-col rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">#General-Ansiedad-Estudios</h2>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {areMessagesLoading && (
              <div className="space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-3/4 ml-auto" />
                <Skeleton className="h-16 w-3/4" />
              </div>
            )}
            {messages?.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.userId === user?.uid ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>{message.userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${message.userId === user?.uid ? "items-end" : "items-start"}`}>
                  <div className={`rounded-lg p-3 max-w-sm ${message.userId === user?.uid ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {message.userId === user?.uid ? "Tú" : message.userName}, {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={!user ? "Inicia sesión para chatear" : (isProfileLoading ? "Cargando perfil..." : "Escribe un mensaje de apoyo...")}
              autoComplete="off"
              disabled={!user || isProfileLoading}
            />
            <Button type="submit" size="icon" disabled={isSendDisabled}>
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
