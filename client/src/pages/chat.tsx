import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Menu, X, Send, BookOpen, FlaskConical, Calculator,
  Dna, Monitor, Languages, Atom, LogOut, User, Plus, Settings,
  Info, Mail, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import logoMascot from "@assets/generated_images/rifu_ai_logo_mascot.png";
import { cn } from "@/lib/utils";
import { generateAIResponse, getStoredApiKey, setStoredApiKey } from "@/lib/gemini";
import { getConversations, createConversation, getMessages, saveMessage } from "@/lib/api";
import type { Conversation, Message } from "@/../../shared/schema";
import ReactMarkdown from "react-markdown";

const subjects = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, color: "text-red-500", bg: "bg-red-50" },
  { id: "english", name: "English", icon: Languages, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "ict", name: "ICT", icon: Monitor, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "physics", name: "পদার্থবিজ্ঞান", icon: Atom, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "chemistry", name: "রসায়ন", icon: FlaskConical, color: "text-green-500", bg: "bg-green-50" },
  { id: "math", name: "উচ্চতর গণিত", icon: Calculator, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "biology", name: "জীববিজ্ঞান", icon: Dna, color: "text-pink-500", bg: "bg-pink-50" },
];

export default function Chat() {
  const { user, logout } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [apiKey, setApiKey] = useState("AIzaSyDeinDqF_xQ7Vj9s6YoXmtvZJOqlbTVM3o");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
    if (window.innerWidth >= 1024) {
      setIsRightSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedImage]);

  const loadConversations = async () => {
    try {
      const convos = await getConversations();
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadOrCreateConversation = async (subject: typeof subjects[0]) => {
    try {
      let conversation = conversations.find(c => c.subject === subject.id);

      if (!conversation) {
        conversation = await createConversation(subject.id, `${subject.name} চ্যাট`);
        setConversations(prev => [...prev, conversation!]);
      }

      setCurrentConversation(conversation);

      const msgs = await getMessages(conversation.id);

      if (msgs.length === 0) {
        const welcomeMsg = await saveMessage(
          conversation.id,
          "ai",
          `হ্যালো ${user?.name || "বন্ধু"}! আমি রিফু। আজকে আমরা ${subject.name} নিয়ে কি পড়বো?`
        );
        setMessages([welcomeMsg]);
      } else {
        setMessages(msgs);
      }
    } catch (error) {
      console.error("Failed to load/create conversation:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrCreateConversation(selectedSubject);
    }
  }, [selectedSubject, user]);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setIsSettingsOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !currentConversation) return;

    const userContent = input;
    const workingImage = selectedImage; // local capture
    setInput("");
    setSelectedImage(null);
    setIsThinking(true);

    try {
      // Save user message (append [Image] text if image exists for now, ideally DB supports images)
      let msgContent = userContent;
      if (workingImage) msgContent += " [Image Attached]";

      const userMsg = await saveMessage(currentConversation.id, "user", msgContent);
      setMessages(prev => [...prev, userMsg]);

      let aiContent = "";

      if (!apiKey) {
        aiContent = "দয়া করে সেটিংস থেকে আপনার Google Gemini API Key সেট করুন।";
      } else {
        // Pass image if available
        aiContent = await generateAIResponse(apiKey, userContent, selectedSubject.name, workingImage || undefined);
      }

      const aiMsg = await saveMessage(currentConversation.id, "ai", aiContent);
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Send message error:", error);
      const errorContent = `দুঃখিত, কোনো সমস্যা হয়েছে। এরর: ${error.message || "Unknown Error"}`;

      if (currentConversation) {
        try {
          const errorMsg = await saveMessage(currentConversation.id, "ai", errorContent);
          setMessages(prev => [...prev, errorMsg]);
        } catch (saveError) {
          console.error("Failed to save error message:", saveError);
        }
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubjectChange = async (subject: typeof subjects[0]) => {
    setSelectedSubject(subject);
    setMessages([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const conversation = await createConversation(selectedSubject.id, `${selectedSubject.name} চ্যাট`);
      setConversations(prev => [...prev, conversation]);
      setCurrentConversation(conversation);

      const welcomeMsg = await saveMessage(
        conversation.id,
        "ai",
        `চলো ${selectedSubject.name} নিয়ে আলোচনা করি। তোমার কোন টপিকটি কঠিন লাগছে?`
      );
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className="fixed md:relative z-30 h-full bg-white border-r border-gray-100 shadow-sm flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <img src={logoMascot} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-bold text-xl text-primary">Rifu Ai</span>
        </div>

        <div className="p-3">
          <Button
            data-testid="button-new-chat"
            variant="outline"
            className="w-full justify-start gap-2 mb-4 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50"
            onClick={handleNewChat}
          >
            <Plus size={16} />
            নতুন চ্যাট
          </Button>

          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">বিষয়সমূহ</h3>
          <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
            <div className="space-y-1 pr-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  data-testid={`button-subject-${subject.id}`}
                  onClick={() => handleSubjectChange(subject)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    selectedSubject.id === subject.id
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", subject.bg, subject.color)}>
                    <subject.icon size={16} />
                  </div>
                  {subject.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto p-4 border-t border-gray-50">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-settings"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-primary mb-2"
              >
                <Settings size={16} className="mr-2" />
                সেটিংস (API Key)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Google Gemini API Key</DialogTitle>
                <DialogDescription>
                  Rifu Ai কে সচল করতে আপনার ফ্রি Gemini API Key টি এখানে দিন।
                  <br />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    এখান থেকে ফ্রী Key সংগ্রহ করুন
                  </a>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    data-testid="input-api-key"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <Button
                  data-testid="button-save-key"
                  onClick={handleSaveApiKey}
                  className="w-full"
                >
                  Save Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3 mb-3 px-2 pt-2 border-t border-gray-50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">HSC Candidate</p>
            </div>
          </div>
          <Button
            data-testid="button-logout"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            লগআউট
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col relative h-full w-full">
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-toggle-sidebar"
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", selectedSubject.bg, selectedSubject.color)}>
                <selectedSubject.icon size={20} />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-gray-800 leading-tight">{selectedSubject.name}</h2>
                <p className="text-xs text-muted-foreground">Rifu Ai এর সাথে কথা বলুন</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            >
              <Info size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings size={20} />
            </Button>
          </div>
        </header>

        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              data-testid={`message-${msg.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-3xl mx-auto",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1",
                msg.role === "ai" ? "bg-white p-1" : "bg-primary text-white"
              )}>
                {msg.role === "ai" ? (
                  <img src={logoMascot} alt="AI" className="w-full h-full object-contain" />
                ) : (
                  <User size={16} />
                )}
              </div>

              <div className={cn(
                "rounded-2xl px-5 py-3 shadow-sm text-sm md:text-base leading-relaxed max-w-[85%]",
                msg.role === "ai"
                  ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none prose prose-sm max-w-none"
                  : "bg-primary text-primary-foreground rounded-tr-none"
              )}>
                {msg.role === "ai" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div
              data-testid="indicator-thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-3xl mx-auto flex-row"
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1 bg-white p-1">
                <img src={logoMascot} alt="AI" className="w-full h-full object-contain" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto relative flex flex-col gap-2">
            {selectedImage && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-0 right-0 bg-black/50 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="relative flex-1 flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-full flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-5 w-5 flex items-center justify-center">📷</div>
              </Button>
              <Input
                data-testid="input-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`${selectedSubject.name} সম্পর্কে কিছু জিজ্ঞেস করুন...`}
                className="pr-12 py-6 rounded-full border-gray-200 focus-visible:ring-primary/20 bg-gray-50 focus:bg-white transition-all shadow-sm"
                disabled={isThinking}
              />
              <Button
                data-testid="button-send"
                size="icon"
                className={cn(
                  "absolute right-1.5 top-1.5 h-9 w-9 rounded-full transition-all",
                  (input.trim() || selectedImage) ? "bg-primary hover:bg-primary/90" : "bg-gray-200 hover:bg-gray-300 text-gray-500"
                )}
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isThinking}
              >
                <Send size={16} className={(input.trim() || selectedImage) ? "ml-0.5" : ""} />
              </Button>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Rifu Ai ভুল করতে পারে। গুরুত্বপূর্ণ তথ্যের জন্য পাঠ্যবই যাচাই করুন।
          </p>
        </div >
      </main>

      {/* Right Sidebar for Developer Info */}
      {isRightSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isRightSidebarOpen ? 280 : 0,
          opacity: isRightSidebarOpen ? 1 : 0
        }}
        className="fixed lg:relative right-0 z-30 h-full bg-white border-l border-gray-100 shadow-sm flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <span className="font-heading font-bold text-lg text-gray-800">Developer Info</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <div className="p-5 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary">
              <User size={32} />
            </div>
            <h3 className="font-bold text-gray-900">SM Rifat Ahmed</h3>
            <p className="text-sm text-muted-foreground">Lead Developer</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h4>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Discord</p>
                <p className="text-sm font-medium truncate">sm.exe.rifu</p>
              </div>
            </div>

            <a href="mailto:smrifatahmed@gmail.com" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Mail size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Help & Support</p>
                <p className="text-sm font-medium truncate">smrifatahmed@gmail.com</p>
              </div>
            </a>
          </div>

          <div className="mt-auto pt-6 text-center">
            <p className="text-xs text-gray-400">
              © 2025 Rifu Scholar AI<br />
              All rights reserved.
            </p>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
