import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logoMascot from "@assets/generated_images/rifu_ai_logo_mascot.png";
import bgImage from "@assets/generated_images/educational_abstract_background.png";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background with Overlay */}
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
          <CardContent className="space-y-6 pb-10 px-8 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Physics, Chemistry, Math বা Biology - যেকোনো বিষয়ে হেল্প পেতে এখনই লগইন করো।
            </p>

            <Button 
              size="lg" 
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm hover:shadow-md transition-all text-base font-medium flex items-center justify-center gap-3"
              onClick={login}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google দিয়ে লগইন করুন
            </Button>
            
            <div className="text-xs text-muted-foreground mt-4">
              HSC সিলেবাস অনুযায়ী সকল বিষয়ের সাপোর্ট
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}