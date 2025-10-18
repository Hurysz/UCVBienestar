"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type ChatMessage = {
  id: string;
  userProfileId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Timestamp;
};

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const messagesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'community_chat_messages');
  }, [firestore]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollection) return null;
    return query(messagesCollection, orderBy("timestamp", "asc"));
  }, [messagesCollection]);

  const { data: messages, isLoading } = useCollection<ChatMessage>(messagesQuery);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !firestore) return;

    const messageData = {
      userProfileId: user.uid,
      userName: user.displayName || "Usuario Anónimo",
      userAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      message: newMessage,
      timestamp: serverTimestamp(),
    };
    
    if (messagesCollection) {
        await addDocumentNonBlocking(messagesCollection, messageData);
        setNewMessage("");
    }
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
            {isLoading && (
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
                  message.userProfileId === user?.uid ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>{message.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${message.userProfileId === user?.uid ? "items-end" : "items-start"}`}>
                  <div className={`rounded-lg p-3 max-w-sm ${message.userProfileId === user?.uid ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {message.userProfileId === user?.uid ? "Tú" : message.userName}, {formatTime(message.timestamp)}
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
              placeholder="Escribe un mensaje de apoyo..."
              autoComplete="off"
              disabled={!user}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !user}>
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
