"use client";

import { aiChatbotTriage } from "@/ai/flows/ai-chatbot-triage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, ChevronDown, SendHorizonal, User, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Message = {
  role: "user" | "bot";
  text: string;
};

export function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiChatbotTriage({ query: input, history: newMessages.slice(-5) });
      const botMessage: Message = {
        role: "bot",
        text: response.answer,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling AI chatbot:", error);
      const errorMessage: Message = {
        role: "bot",
        text: "Lo siento, algo salió mal. Por favor, inténtalo de nuevo más tarde.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={cn("w-80 md:w-96 rounded-lg shadow-lg bg-card border flex flex-col transition-all duration-300", isOpen ? 'h-[60vh] opacity-100' : 'h-14 opacity-0 pointer-events-none')}>
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-lg">Asistente Virtual</CardTitle>
              </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <ChevronDown className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <Bot className="mx-auto h-10 w-10 mb-4"/>
                        <p className="text-sm">Soy tu asistente de bienestar. <br/>¿Cómo te sientes hoy?</p>
                    </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                     {message.role === "bot" && (
                        <Avatar className="bg-accent text-accent-foreground h-8 w-8">
                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                     )}
                    <div className={`rounded-lg p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                     {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                     )}
                  </div>
                ))}
                 {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="bg-accent text-accent-foreground h-8 w-8">
                      <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-accent">
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t p-2 md:p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  autoComplete="off"
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                  <SendHorizonal className="h-5 w-5" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </div>
          </CardContent>
      </div>
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        className={cn("rounded-full w-14 h-14 shadow-lg transition-all duration-300", isOpen && 'opacity-0 scale-0')}
        aria-label="Abrir chat"
       >
        <Bot className="h-7 w-7" />
      </Button>
    </div>
  );
}
