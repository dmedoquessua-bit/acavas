import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useArticle } from "@/hooks/useCatalog";
import { formatDate } from "@/lib/format";

const NewsArticle = () => {
  const { slug } = useParams();
  const { data: article, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <p className="mx-auto max-w-3xl px-5 py-20 text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-display text-2xl">Notícia não encontrada</h1>
          <Link to="/noticias" className="mt-3 inline-block text-sm text-primary hover:underline">
            Voltar às notícias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <Link to="/noticias" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Notícias
        </Link>

        <span className="eyebrow mt-8 block">
          {article.category} · {formatDate(article.published_at)}
        </span>
        <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>

        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            loading="lazy"
            className="mt-10 aspect-[16/9] w-full rounded-sm object-cover"
          />
        )}

        <div className="prose-reader mt-10">
          {article.content.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsArticle;
