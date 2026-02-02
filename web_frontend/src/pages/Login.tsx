import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboard } from '@/context/DashboardContext';
import { useTheme } from 'next-themes';
interface LoginProps {
  onLogin: () => void;
}
export const Login = ({
  onLogin
}: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const {
    setUser
  } = useDashboard();
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

  // Force light theme on login page - dark mode only available on dashboard
  useEffect(() => {
    // Store the current theme preference before switching
    previousThemeRef.current = theme;
    setTheme('light');

    // Cleanup: restore previous theme when component unmounts (navigating to dashboard)
    return () => {
      // Don't restore - let dashboard handle its own theme
    };
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: 'user-1',
      email: formData.email,
      name: formData.name || formData.email.split('@')[0]
    });
    setIsLoading(false);
    onLogin();
  };
  return <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
    {/* Animated gradient background */}
    <div className="absolute inset-0 gradient-breathe" />

    {/* Subtle pattern overlay */}
    <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.15) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }} />

    <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5
    }} className="relative z-10 w-full max-w-md mx-4">
      <div className="glass-card rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 200
          }} className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <LifeBuoy className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Chemical Equipment Visualizer</h1>
          <p className="text-muted-foreground mt-1">Parameter Analysis Dashboard</p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Login
          </button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${!isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div initial={false} animate={{
            height: isLogin ? 0 : 'auto',
            opacity: isLogin ? 0 : 1
          }} transition={{
            duration: 0.2
          }} className="overflow-hidden">
            {!isLogin && <div className="space-y-2 pb-4">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))} className="pl-10" />
              </div>
            </div>}
          </motion.div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))} className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))} className="pl-10" required />
            </div>
          </div>

          <motion.div whileHover={{
            scale: 1.01
          }} whileTap={{
            scale: 0.99
          }}>
            <Button type="submit" className="w-full btn-interactive glow-effect bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11" disabled={isLoading}>
              {isLoading ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </> : <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>}
            </Button>
          </motion.div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  </div>;
};
export default Login;