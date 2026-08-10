import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContentFiltersBar, { useUrlFilters } from "@/components/ContentFilters";
import WebtoonHero from "@/components/WebtoonHero";
import WebtoonCard, { WebtoonCardSkeleton, WebtoonGrid } from "@/components/WebtoonCard";
import TemporaryOffer from "@/components/TemporaryOffer";
import CreatorFeed from "@/components/CreatorFeed";
import { useContentFeed } from "@/hooks/useContentFeed";
import { useContents } from "@/hooks/useContents";
import { useContentProtection } from "@/hooks/useContentProtection";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const PILLS = ["Tudo", "Drama", "Fantasia", "Comédia", "Ação"];

const Webtoons = () => {
  useContentProtection();
  const { filters } = useUrlFilters();
  const feed = useContentFeed({ ...filters, type: "webtoon" });
  const rawItems = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);

  const [pill, setPill] = useState("Tudo");
  const items = useMemo(() => {
    if (pill === "Tudo") return rawItems;
    const needle = pill.toLowerCase();
    return rawItems.filter(
      (i) =>
        i.category?.toLowerCase().includes(needle) || i.tags?.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [rawItems, pill]);

  const { data: all = [] } = useContents({ type: "webtoon" });
  const options = useMemo(
    () => ({
      categories: Array.from(new Set(all.map((i) => i.category))).sort(),
      tags: Array.from(new Set(all.flatMap((i) => i.tags))).sort(),
      languages: Array.from(new Set(all.map((i) => i.language))).sort(),
      formats: [],
      years: Array.from(new Set(all.map((i) => i.year).filter(Boolean) as number[])).sort((a, b) => b - a),
    }),
    [all],
  );

  const popular = useMemo(() => [...all].sort((a, b) => b.views - a.views).slice(0, 3), [all]);
  const featured = useMemo(() => all.find((i) => i.featured) ?? all[0], [all]);

  const { ref, inView } = useInView({ rootMargin: "600px 0px" });
  useEffect(() => {
    if (inView && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  }, [inView, feed]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <WebtoonHero item={featured} />

      <section id="catalogo" className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <ContentFiltersBar options={options} />

          <div className="flex flex-wrap gap-2 mb-10">
            {PILLS.map((p) => (
              <button
                key={p}
                onClick={() => setPill(p)}
                className={`text-[11px] uppercase tracking-wider font-light px-4 py-2 rounded-full border transition-colors ${
                  pill === p
                    ? "bg-foreground text-background border-foreground"
                    : "bg-accent text-accent-foreground border-border hover:bg-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {feed.isLoading ? (
            <WebtoonGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <WebtoonCardSkeleton key={i} />
              ))}
            </WebtoonGrid>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-light py-16">
              Nenhum webtoon encontrado com esses filtros.
            </p>
          ) : (
            <>
              <WebtoonGrid>
                {items.map((item) => (
                  <WebtoonCard key={item.id} item={item} />
                ))}
              </WebtoonGrid>
              <div ref={ref} className="h-12" />
              {feed.isFetchingNextPage && (
                <WebtoonGrid>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <WebtoonCardSkeleton key={i} />
                  ))}
                </WebtoonGrid>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-secondary/40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Promoções</span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Ofertas temporárias</h2>
          </div>
          <TemporaryOffer item={featured} />
        </div>
      </section>

      {popular.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Ranking</span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Populares em alta</h2>
            </div>
            <WebtoonGrid>
              {popular.map((item, i) => (
                <WebtoonCard key={item.id} item={item} rank={i + 1} />
              ))}
            </WebtoonGrid>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24 bg-secondary/40">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Comunidade</span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Feed dos criadores</h2>
          </div>
          <CreatorFeed items={all} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Webtoons;
