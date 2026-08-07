import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Check, Clock, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBook, useChapters, usePurchases } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/format";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: book, isLoading } = useBook(id);
  const { data: chapters = [] } = useChapters(id);
  const { data: purchases = [] } = usePurchases();
  const [submitting, setSubmitting] = useState(false);

  const purchase = purchases.find((p) => p.book_id === id);
  const owned = purchase?.status === "paid";
  const pending = purchase?.status === "pending";

  const handleBuy = async () => {
    if (!user) {
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
      toast({ title: "Não foi possível criar o pedido", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["purchases"] });
    toast({
      title: "Pedido registrado",
      description: "Assim que o pagamento for confirmado, o livro aparece na sua biblioteca.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <p className="mx-auto max-w-6xl px-5 py-20 text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h1 className="font-display text-2xl">Livro não encontrado</h1>
          <Link to="/livros" className="mt-3 inline-block text-sm text-primary hover:underline">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-12 md:grid-cols-[320px_1fr]">
          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-sm bg-secondary shadow-[var(--shadow-page)]">
              {book.cover_url ? (
                <img src={book.cover_url} alt={`Capa do livro ${book.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center font-display text-xl text-muted-foreground">
                  {book.title}
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="eyebrow">{book.category}</span>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">{book.title}</h1>
            <p className="mt-2 text-muted-foreground">por {book.author}</p>

            <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/90">{book.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="font-display text-2xl text-primary">
                {formatPrice(book.price_cents, book.currency)}
              </span>
              {owned ? (
                <Button asChild size="lg">
                  <Link to={`/ler/${book.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Ler agora
                  </Link>
                </Button>
              ) : pending ? (
                <span className="inline-flex items-center gap-2 rounded-sm bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Pagamento em análise
                </span>
              ) : (
                <Button size="lg" onClick={handleBuy} disabled={submitting}>
                  {submitting ? "Processando…" : "Comprar livro"}
                </Button>
              )}
            </div>

            <div className="mt-12 rule pt-6">
              <h2 className="font-display text-xl">Sumário</h2>
              {chapters.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Os capítulos ficam disponíveis após a compra.
                </p>
              ) : (
                <ol className="mt-4 space-y-2">
                  {chapters.map((c) => (
                    <li key={c.id} className="flex items-center justify-between border-b border-border py-2 text-sm">
                      <span>
                        <span className="mr-3 text-muted-foreground">{String(c.position).padStart(2, "0")}</span>
                        {c.title}
                      </span>
                      {owned ? (
                        <Check className="h-4 w-4 text-accent" />
                      ) : c.is_free_preview ? (
                        <Link to={`/ler/${book.id}`} className="text-xs text-primary hover:underline">
                          Amostra grátis
                        </Link>
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookDetail;
