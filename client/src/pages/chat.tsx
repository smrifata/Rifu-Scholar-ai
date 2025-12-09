import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Menu, Send, BookOpen, FlaskConical, Calculator, 
  Dna, Monitor, Languages, Atom, LogOut, User, Plus, Settings, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoMascot from "@assets/generated_images/rifu_ai_logo_mascot.png";
import { cn } from "@/lib/utils";
import { generateAIResponse, getStoredApiKey, setStoredApiKey } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

// Mock Data
const subjects = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, color: "text-red-500", bg: "bg-red-50" },
  { id: "english", name: "English", icon: Languages, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "ict", name: "ICT", icon: Monitor, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "physics", name: "পদার্থবিজ্ঞান", icon: Atom, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "chemistry", name: "রসায়ন", icon: FlaskConical, color: "text-green-500", bg: "bg-green-50" },
  { id: "math", name: "উচ্চতর গণিত", icon: Calculator, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "biology", name: "জীববিজ্ঞান", icon: Dna, color: "text-pink-500", bg: "bg-pink-50" },
];

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { user, logout } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `হ্যালো ${user?.name || "বন্ধু"}! আমি রিফু। আজকে আমরা ${subjects[0].name} নিয়ে কি পড়বো?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) setApiKey(storedKey);
    
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setIsSettingsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsThinking(true);

    try {
      let aiContent = "";
      
      if (!apiKey) {
        // Fallback or Prompt to enter key
        aiContent = "দয়া করে সেটিংস থেকে আপনার Google Gemini API Key সেট করুন। এটি সম্পূর্ণ ফ্রি। (Get it from: aistudio.google.com)";
      } else {
        aiContent = await generateAIResponse(apiKey, newMessage.content, selectedSubject.name);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "দুঃখিত, কোনো সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন বা API Key চেক করুন।",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubjectChange = (subject: typeof subjects[0]) => {
    setSelectedSubject(subject);
    setMessages([{
      id: Date.now().toString(),
      role: "ai",
      content: `চলো ${subject.name} নিয়ে আলোচনা করি। তোমার কোন টপিকটি কঠিন লাগছে?`,
      timestamp: new Date()
    }]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
          <Button variant="outline" className="w-full justify-start gap-2 mb-4 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50">
            <Plus size={16} />
            নতুন চ্যাট
          </Button>
          
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">বিষয়সমূহ</h3>
          <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
            <div className="space-y-1 pr-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
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
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary mb-2">
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
                    placeholder="AIzaSy..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveApiKey} className="w-full">Save Key</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3 mb-3 px-2 pt-2 border-t border-gray-50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">HSC Candidate</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut size={16} className="mr-2" />
            লগআউট
          </Button>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full w-full">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
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
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-muted-foreground"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} />
          </Button>
        </header>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
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

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`${selectedSubject.name} সম্পর্কে কিছু জিজ্ঞেস করুন...`}
                className="pr-12 py-6 rounded-full border-gray-200 focus-visible:ring-primary/20 bg-gray-50 focus:bg-white transition-all shadow-sm"
                disabled={isThinking}
              />
              <Button 
                size="icon" 
                className={cn(
                  "absolute right-1.5 top-1.5 h-9 w-9 rounded-full transition-all",
                  input.trim() ? "bg-primary hover:bg-primary/90" : "bg-gray-200 hover:bg-gray-300 text-gray-500"
                )}
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
              >
                <Send size={16} className={input.trim() ? "ml-0.5" : ""} />
              </Button>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Rifu Ai ভুল করতে পারে। গুরুত্বপূর্ণ তথ্যের জন্য পাঠ্যবই যাচাই করুন।
          </p>
        </div>
      </main>
    </div>
  );
}