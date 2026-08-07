import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Newspaper, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { useBooks, useNews } from "@/hooks/useCatalog";

const Index = () => {
  const { data: books = [], isLoading: loadingBooks } = useBooks();
  const { data: news = [], isLoading: loadingNews } = useNews();

  const featured = books.filter((b) => b.featured).slice(0, 4);
  const shelf = (featured.length ? featured : books).slice(0, 4);
  const [lead, ...rest] = news;

  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
            <span className="eyebrow text-ink-foreground/60">Livraria digital &amp; jornal de ideias</span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] text-ink-foreground md:text-6xl">
              Compre um livro. Comece a ler no mesmo minuto.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/70">
              Catálogo digital com leitura direto no navegador, mais uma redação diária de notícias
              sobre cultura, literatura e ideias.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/livros">
                  Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground">
                <Link to="/noticias">Ler notícias</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Propostas */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: BookOpen, title: "Leitura no navegador", text: "Cada livro comprado abre num leitor limpo, capítulo a capítulo, sem download." },
              { icon: Newspaper, title: "Notícias todo dia", text: "Reportagens e ensaios curtos sobre o mercado editorial e a vida cultural." },
              { icon: Sparkles, title: "Amostras grátis", text: "Leia os primeiros capítulos antes de decidir se o livro é para você." },
            ].map((f) => (
              <div key={f.title}>
                <f.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-display text-lg">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Livros */}
        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-8 flex items-end justify-between rule pt-6">
            <h2 className="font-display text-2xl md:text-3xl">Na estante</h2>
            <Link to="/livros" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          {loadingBooks ? (
            <p className="text-sm text-muted-foreground">Carregando livros…</p>
          ) : shelf.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum livro publicado ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {shelf.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </section>

        {/* Notícias */}
        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-8 flex items-end justify-between rule pt-6">
            <h2 className="font-display text-2xl md:text-3xl">Últimas notícias</h2>
            <Link to="/noticias" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          {loadingNews ? (
            <p className="text-sm text-muted-foreground">Carregando notícias…</p>
          ) : news.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma notícia publicada ainda.</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              <NewsCard item={lead} large />
              <div className="space-y-8">
                {rest.slice(0, 3).map((n) => <NewsCard key={n.id} item={n} />)}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
