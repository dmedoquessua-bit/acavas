import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Book } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/format";

interface BookCardProps {
  book: Book;
}

export const BookCardContent = ({ book }: BookCardProps) => (
  <Link to={`/livros/${book.id}`} className="block">
    <div className="relative h-48 overflow-hidden bg-accent">
      <img
        src={book.cover_url || "/placeholder.svg"}
        alt={`Capa do livro ${book.title}`}
        loading="lazy"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
      {book.featured && (
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <Sparkles className="h-3 w-3 fill-primary text-primary" />
          <span className="font-light text-xs">Destaque</span>
        </div>
      )}
    </div>
    <div className="p-6">
      <h3 className="text-base font-normal mb-1 text-card-foreground tracking-tight">{book.title}</h3>
      <div className="flex items-center gap-1 text-muted-foreground mb-4 text-xs font-light">
        <BookOpen className="h-3 w-3" />
        <span>{book.author}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        <span className="text-[10px] uppercase tracking-wide px-2 py-1 bg-accent text-accent-foreground rounded-sm font-light">
          {book.category}
        </span>
        <span className="text-[10px] uppercase tracking-wide px-2 py-1 bg-accent text-accent-foreground rounded-sm font-light">
          Leitura online
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-light text-foreground">{formatPrice(book.price_cents, book.currency)}</span>
          <span className="text-muted-foreground text-xs font-light"> /acesso</span>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs font-light">
          Ver detalhes
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  </Link>
);

const BookCard = ({ book }: BookCardProps) => (
  <Card className="overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow duration-300">
    <BookCardContent book={book} />
  </Card>
);

export default BookCard;
