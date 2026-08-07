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
import { Button } from "@/components/ui/button";
import { useNews } from "@/hooks/useCatalog";

const Index = () => {
  const { data: news = [] } = useNews();
  const latest = news.filter((n) => n.published).slice(0, 3);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <FeaturedBooks />
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
