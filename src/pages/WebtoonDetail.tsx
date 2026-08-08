import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ArrowRight, Eye, Heart, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContentSection from "@/components/ContentSection";
import { Button } from "@/components/ui/button";
import { useContent, useEpisodes, useProgress, useTrackInteraction } from "@/hooks/useContents";
import { useSimilar, useBecauseYouRead } from "@/hooks/useRecommendations";
import { formatDate } from "@/lib/format";

const WebtoonDetail = () => {
  const { id } = useParams();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { data: item, isLoading } = useContent(id);
  const { data: episodes = [] } = useEpisodes(id);
  const { data: progress } = useProgress(id);
  const { data: similar = [] } = useSimilar(id, 4);
  const { data: because = [] } = useBecauseYouRead(id, 4);
  const track = useTrackInteraction();

  useEffect(() => {
    if (id) track(id, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <p className="pt-40 text-center text-sm text-muted-foreground font-light">Carregando…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <div className="pt-40 text-center">
          <p className="text-sm text-muted-foreground font-light mb-6">Webtoon não encontrado.</p>
          <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            <Link to="/webtoons">Ver webtoons</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextEpisode =
    episodes.find((e) => e.id === progress?.episode_id) ?? episodes[0];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[60vh] overflow-hidden">
        <motion.img
          src={item.cover || "/placeholder.svg"}
          alt={`Capa de ${item.title}`}
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-12 left-6 md:left-12 lg:left-16 text-white">
          <span className="text-[11px] uppercase tracking-wider text-white/70 mb-3 block">Webtoon · {item.category}</span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight max-w-xl">{item.title}</h1>
          <p className="text-sm font-light text-white/80 mt-2 flex items-center gap-2">
            <BookOpen className="h-3 w-3" />
            {item.author}
          </p>
          <div className="flex items-center gap-5 mt-3 text-xs font-light text-white/70">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.views.toLocaleString("pt-BR")} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.rating_count.toLocaleString("pt-BR")} super likes
            </span>
          </div>
        </div>
      </div>

      <main className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Sinopse</span>
            <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line mb-6">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-10">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wide px-2 py-1 bg-accent text-accent-foreground rounded-sm font-light"
                >
                  {tag}
                </span>
              ))}
            </div>

            {nextEpisode && (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal mb-14 px-6"
              >
                <Link to={`/webtoon/${item.id}/ep/${nextEpisode.id}`} onClick={() => track(item.id, "read")}>
                  {progress?.episode_id ? "Continuar lendo" : "Começar a ler"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Episódios</span>
            <div className="space-y-3">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center justify-between border border-border rounded-md bg-card px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-normal text-card-foreground tracking-tight">
                      Ep. {ep.number} — {ep.title}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-light">
                      {formatDate(ep.published_at)}
                      {ep.is_free ? " · Grátis" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress?.episode_id === ep.id && <Check className="h-3 w-3 text-primary" />}
                    <Button asChild variant="ghost" size="sm" className="text-primary text-xs font-light">
                      <Link to={`/webtoon/${item.id}/ep/${ep.id}`}>
                        Ler
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {episodes.length === 0 && (
                <p className="text-xs text-muted-foreground font-light">Episódios em breve.</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <ContentSection
        eyebrow="Recomendações"
        title="Readers Also Like"
        subtitle="Webtoons e histórias com o mesmo clima"
        items={similar}
        showSimilarity
        className="bg-secondary/30"
      />

      <ContentSection
        eyebrow="Baseado nesta leitura"
        title={`Porque você leu "${item.title}"`}
        items={because.filter((b) => !similar.some((s) => s.id === b.id))}
        showReason
      />

      <Footer />
    </div>
  );
};

export default WebtoonDetail;
