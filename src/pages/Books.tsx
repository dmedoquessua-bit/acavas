import { useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import bannerImage from "@/assets/hero-library.jpg";
import { useBooks } from "@/hooks/useCatalog";

type SortOption = "recent" | "price-low" | "price-high";

const Books = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [category, setCategory] = useState("todas");
  const { data: books = [], isLoading } = useBooks();

  const published = useMemo(() => books.filter((b) => b.published), [books]);
  const categories = useMemo(() => ["todas", ...Array.from(new Set(published.map((b) => b.category)))], [published]);

  const visible = useMemo(() => {
    const list = published.filter((b) => category === "todas" || b.category === category);
    switch (sortBy) {
      case "price-low":
        return [...list].sort((a, b) => a.price_cents - b.price_cents);
      case "price-high":
        return [...list].sort((a, b) => b.price_cents - a.price_cents);
      default:
        return list;
    }
  }, [published, category, sortBy]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[50vh] overflow-hidden">
        <motion.img
          src={bannerImage}
          alt="Estantes de livros"
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main className="py-24 lg:py-32 px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Catálogo</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">Todos os livros</h1>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              Explore os títulos disponíveis para leitura online
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] text-sm font-light">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "todas" ? "Todas as categorias" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] text-sm font-light">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-low">Preço: menor primeiro</SelectItem>
                  <SelectItem value="price-high">Preço: maior primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Carregando livros...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Nenhum livro encontrado.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Books;
