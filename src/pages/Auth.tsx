import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(72),
  displayName: z.string().trim().max(80).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/biblioteca");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/biblioteca");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = schema.safeParse({ email, password, displayName });
    if (!validation.success) {
      toast({ title: "Verifique os dados", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "Não foi possível entrar",
            description: error.message === "Invalid login credentials"
              ? "E-mail ou senha incorretos."
              : error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) {
          toast({
            title: "Não foi possível criar a conta",
            description: error.message.includes("already registered")
              ? "Este e-mail já está cadastrado. Faça login."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Confirme seu e-mail",
            description: "Enviamos um link de confirmação para concluir o cadastro.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-5 flex items-center justify-center gap-2 text-ink-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-display text-lg">Worscoi</span>
          </div>
          <h1 className="font-display text-2xl text-ink-foreground">
            {isLogin ? "Entrar na sua conta" : "Criar conta"}
          </h1>
          <p className="mt-2 text-sm text-ink-foreground/60">
            {isLogin ? "Acesse seus livros comprados" : "Compre livros e leia direto no navegador"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-ink-foreground/70">Nome</Label>
              <Input
                id="name"
                value={displayName}
                maxLength={80}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado"
                className="border-ink-foreground/20 bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-foreground/30"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-ink-foreground/70">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="border-ink-foreground/20 bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-foreground/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-ink-foreground/70">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-ink-foreground/20 bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-foreground/30"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-ink-foreground/60 hover:text-ink-foreground">
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-xs text-ink-foreground/40 hover:text-ink-foreground/70"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar ao site
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
