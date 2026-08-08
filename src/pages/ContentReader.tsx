import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useContent, useEpisodes, useSaveProgress, useTrackInteraction } from "@/hooks/useContents";

const ContentReader = () => {
  const { id, episodeId } = useParams();
  const { data: item, isLoading } = useContent(id);
  const { data: episodes = [] } = useEpisodes(item?.type === "webtoon" ? id : undefined);
  const saveProgress = useSaveProgress();
  const track = useTrackInteraction();
  const lastSaved = useRef(0);

  const episode = useMemo(() => episodes.find((e) => e.id === episodeId), [episodes, episodeId]);
  const index = episode ? episodes.findIndex((e) => e.id === episode.id) : -1;
  const next = index >= 0 ? episodes[index + 1] : undefined;
  const prev = index > 0 ? episodes[index - 1] : undefined;

  useEffect(() => {
    if (id) track(id, "read");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, episodeId]);

  useEffect(() => {
    if (!id) return;
    const onScroll = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      if (pct - lastSaved.current >= 10 || pct >= 99) {
        lastSaved.current = pct;
        saveProgress.mutate({ contentId: id, percentage: pct, episodeId: episodeId ?? null });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, episodeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <p className="pt-40 text-center text-sm text-muted-foreground font-light">Carregando leitura…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dark" />
        <div className="pt-40 text-center">
          <p className="text-sm text-muted-foreground font-light mb-6">Conteúdo indisponível.</p>
          <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            <Link to="/livros">Ver catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dark" />

      <main className="pt-36 pb-24 px-6 lg:px-12">
        <article className="max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">
            {item.title}
            {episode ? ` · Ep. ${episode.number}` : ""}
          </span>
          <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight mb-10">
            {episode ? episode.title : item.title}
          </h1>

          {episode?.images?.length ? (
            <div className="space-y-2 mb-10">
              {episode.images.map((src, i) => (
                <img key={i} src={src} alt={`${episode.title} — página ${i + 1}`} loading="lazy" className="w-full rounded-md" />
              ))}
            </div>
          ) : null}

          <div className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line">
            {episode ? episode.body : item.body || item.description}
          </div>

          <div className="flex items-center justify-between mt-16">
            {prev ? (
              <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
                <Link to={`/webtoon/${item.id}/ep/${prev.id}`}>
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Anterior
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button asChild className="rounded-full text-[11px] uppercase tracking-wider font-normal bg-primary text-primary-foreground">
                <Link to={`/webtoon/${item.id}/ep/${next.id}`}>
                  Próximo
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
                <Link to={item.type === "webtoon" ? `/webtoon/${item.id}` : `/conteudo/${item.id}`}>
                  Voltar ao detalhe
                </Link>
              </Button>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ContentReader;
