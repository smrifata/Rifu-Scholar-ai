import type { Conversation, Message } from "@/../../shared/schema";

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations", {
    credentials: "include"
  });
  if (!response.ok) throw new Error("Failed to fetch conversations");
  return response.json();
}

export async function createConversation(subject: string, title: string): Promise<Conversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ subject, title })
  });
  if (!response.ok) throw new Error("Failed to create conversation");
  return response.json();
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

export async function saveMessage(conversationId: number, role: string, content: string): Promise<Message> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role, content })
  });
  if (!response.ok) throw new Error("Failed to save message");
  return response.json();
}
