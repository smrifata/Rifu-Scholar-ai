import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoMascot from "@assets/generated_images/rifu_ai_logo_mascot.png";
import bgImage from "@assets/generated_images/educational_abstract_background.png";

export default function Login() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="glass border-white/40 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-2">
            <div className="mx-auto mb-6 relative w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center p-1">
              <img 
                src={logoMascot} 
                alt="Rifu Ai Mascot" 
                className="w-full h-full object-contain rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
              Rifu Ai
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              তোমার পার্সোনাল HSC টিউটর
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10 px-8">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Physics, Chemistry, Math বা Biology - যেকোনো বিষয়ে হেল্প পেতে এখনই {isSignup ? "সাইন আপ" : "লগইন"} করো।
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name" data-testid="label-name">নাম</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    type="text"
                    placeholder="তোমার নাম লিখো"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" data-testid="label-email">ইমেইল</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center" data-testid="text-error">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                data-testid="button-submit"
                size="lg" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "অপেক্ষা করুন..." : isSignup ? "সাইন আপ করুন" : "লগইন করুন"}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                type="button"
                data-testid="button-toggle-mode"
                variant="link"
                className="text-sm text-primary"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
              >
                {isSignup ? "আগে থেকেই একাউন্ট আছে? লগইন করুন" : "নতুন একাউন্ট তৈরি করুন"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-4 text-center">
              HSC সিলেবাস অনুযায়ী সকল বিষয়ের সাপোর্ট
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
