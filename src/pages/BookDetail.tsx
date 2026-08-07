import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBook, useChapters, usePurchases } from "@/hooks/useCatalog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { data: book, isLoading } = useBook(id);
  const { data: chapters = [] } = useChapters(id);
  const { data: purchases = [], refetch } = usePurchases();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const purchase = purchases.find((p) => p.book_id === id);
  const owned = purchase?.status === "paid";

  const handleReserve = async () => {
    if (!user) {
      toast.error("Entre na sua conta para reservar");
      navigate("/auth");
      return;
    }
    if (!book) return;
    setSubmitting(true);
    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      book_id: book.id,
      amount_cents: book.price_cents,
      currency: book.currency,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível registrar a reserva");
      return;
    }
    toast.success("Reserva registrada! Confirmaremos o pagamento em breve.");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <p className="pt-40 text-center text-sm text-muted-foreground font-light">Carregando livro...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <div className="pt-40 text-center">
          <p className="text-sm text-muted-foreground font-light mb-6">Livro não encontrado.</p>
          <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            <Link to="/livros">Ver catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[60vh] overflow-hidden">
        <motion.img
          src={book.cover_url || "/placeholder.svg"}
          alt={`Capa do livro ${book.title}`}
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-12 left-6 md:left-12 lg:left-16 text-white">
          <span className="text-[11px] uppercase tracking-wider text-white/70 mb-3 block">{book.category}</span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight max-w-xl">{book.title}</h1>
          <p className="text-sm font-light text-white/80 mt-2 flex items-center gap-2">
            <BookOpen className="h-3 w-3" />
            {book.author}
          </p>
        </div>
      </div>

      <main className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Sobre a obra</span>
            <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line mb-12">
              {book.description}
            </p>

            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Capítulos</span>
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between border border-border rounded-md bg-card px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-normal text-card-foreground tracking-tight">
                      {chapter.position}. {chapter.title}
                    </p>
                    {chapter.is_free_preview && (
                      <span className="text-[10px] uppercase tracking-wide text-primary font-light">
                        Amostra grátis
                      </span>
                    )}
                  </div>
                  {(chapter.is_free_preview || owned) && (
                    <Button asChild variant="ghost" size="sm" className="text-primary text-xs font-light">
                      <Link to={`/ler/${book.id}`}>
                        Ler
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="text-xs text-muted-foreground font-light">
                  Os capítulos ficam disponíveis após a confirmação da reserva.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="p-8 shadow-soft border border-border bg-card sticky top-28">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-light text-foreground">
                  {formatPrice(book.price_cents, book.currency)}
                </span>
                <span className="text-xs text-muted-foreground font-light">/acesso completo</span>
              </div>

              <ul className="space-y-3 mb-8">
                {["Leitura online ilimitada", "Capítulos liberados na sua estante", "Acesso em qualquer dispositivo"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground font-light">
                      <Check className="h-3 w-3 text-primary mt-0.5" />
                      {item}
                    </li>
                  ),
                )}
              </ul>

              {owned ? (
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                >
                  <Link to={`/ler/${book.id}`}>
                    Ler agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : purchase ? (
                <div className="text-center">
                  <Sparkles className="h-4 w-4 text-primary mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground font-light">
                    Reserva pendente — liberamos assim que o pagamento for confirmado.
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                  onClick={handleReserve}
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Reservar livro"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              <Button
                asChild
                variant="ghost"
                className="w-full mt-3 text-xs font-light text-muted-foreground"
              >
                <Link to="/livros">
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Voltar ao catálogo
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookDetail;
