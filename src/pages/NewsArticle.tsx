import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useArticle } from "@/hooks/useCatalog";
import { formatDate } from "@/lib/format";

const NewsArticle = () => {
  const { slug } = useParams();
  const { data: article, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <p className="pt-40 text-center text-sm text-muted-foreground font-light">Carregando notícia...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <div className="pt-40 text-center">
          <p className="text-sm text-muted-foreground font-light mb-6">Notícia não encontrada.</p>
          <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            <Link to="/noticias">Ver notícias</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[50vh] overflow-hidden">
        <img
          src={article.cover_url || "/placeholder.svg"}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <main className="py-24 lg:py-32 px-6 lg:px-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">
            {article.category} · {formatDate(article.published_at)}
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-6">{article.title}</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-10">{article.excerpt}</p>
          <div className="text-sm text-foreground/80 font-light leading-relaxed whitespace-pre-line">
            {article.content}
          </div>

          <Button asChild variant="ghost" className="mt-12 text-xs font-light text-muted-foreground px-0">
            <Link to="/noticias">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Todas as notícias
            </Link>
          </Button>
        </motion.article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsArticle;
