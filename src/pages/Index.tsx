import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedBooks from "@/components/FeaturedBooks";
import Experience from "@/components/Experience";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import ContentSection from "@/components/ContentSection";
import { Button } from "@/components/ui/button";
import { useNews } from "@/hooks/useCatalog";
import { useContents, useTrending } from "@/hooks/useContents";
import { useAuth } from "@/hooks/useAuth";
import { useForYou, useContinueReading } from "@/hooks/useRecommendations";

const Index = () => {
  const { data: news = [] } = useNews();
  const latest = news.filter((n) => n.published).slice(0, 3);
  const { user } = useAuth();

  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { data: continueItems = [] } = useContinueReading(4);
  const { data: forYou = [], isLoading: forYouLoading } = useForYou(4);
  const { data: trending = [] } = useTrending(period, 4);
  const { data: allContents = [] } = useContents({ limit: 60 });

  const featuredCollections = useMemo(
    () => allContents.filter((c) => c.featured).slice(0, 4),
    [allContents],
  );
  const webtoons = useMemo(() => allContents.filter((c) => c.type === "webtoon").slice(0, 4), [allContents]);
  const academic = useMemo(() => allContents.filter((c) => c.type === "academic").slice(0, 4), [allContents]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />

      {user && continueItems.length > 0 && (
        <ContentSection
          eyebrow="Retome de onde parou"
          title="Continue Reading"
          items={continueItems}
          showProgress
          to="/continuar-lendo"
          className="bg-secondary/30"
        />
      )}

      <ContentSection
        eyebrow="Recomendações"
        title="Para Você"
        subtitle="Sugestões geradas a partir do seu histórico de leitura"
        items={forYou}
        isLoading={forYouLoading}
        showReason
        showSimilarity
        to="/para-voce"
      />

      <ContentSection
        eyebrow="Em alta"
        title="Most Popular"
        subtitle="O que a comunidade está lendo agora"
        items={trending}
        className="bg-secondary/30"
        action={
          <div className="flex gap-2">
            {(["today", "week", "month"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal px-5"
                onClick={() => setPeriod(p)}
              >
                {p === "today" ? "Hoje" : p === "week" ? "Semana" : "Mês"}
              </Button>
            ))}
          </div>
        }
      />

      <FeaturedBooks />

      <ContentSection
        eyebrow="Coleções"
        title="Featured Collections"
        subtitle="Seleções editoriais da redação"
        items={featuredCollections}
      />

      <ContentSection
        eyebrow="Séries"
        title="Webtoons & Comics"
        items={webtoons}
        to="/webtoons"
        className="bg-secondary/30"
      />

      <ContentSection eyebrow="Pesquisa" title="Academic" items={academic} />

      <Experience />

      <section className="py-32 lg:py-40 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Redação</span>
            <h2 className="text-2xl md:text-3xl font-light mb-4 text-foreground tracking-tight">Últimas notícias</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-light">
              Cultura, literatura e ideias em textos curtos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <NewsCard item={item} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="rounded-full text-[11px] uppercase tracking-wider font-normal px-6"
            >
              <Link to="/noticias">
                Ver todas
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Booking />
      <Footer />
    </div>
  );
};

export default Index;
