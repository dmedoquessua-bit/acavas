import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedImage from "@/components/ProtectedImage";
import { Content, contentHref } from "@/hooks/useContents";
import { formatPrice } from "@/lib/format";

/** Catalog card: 2/3 cover, title, author, category pill and price. */
const BookGridCard = ({ book, free }: { book: Content; free?: boolean }) => (
  <Card className="overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow duration-300">
    <Link to={contentHref(book)} className="flex">
      <div className="w-32 sm:w-40 shrink-0 aspect-[2/3] bg-accent overflow-hidden" data-protected-media>
        <ProtectedImage
          src={book.cover}
          alt={`Capa do livro ${book.title}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="text-base font-normal text-card-foreground tracking-tight line-clamp-2 mb-1">{book.title}</h3>
          <div className="flex items-center gap-1 text-muted-foreground mb-4 text-xs font-light">
            <BookOpen className="h-3 w-3" />
            <span className="truncate">{book.author}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wide px-2 py-1 bg-accent text-accent-foreground rounded-sm font-light">
            {book.category}
          </span>
        </div>
        <div className="mt-5">
          <span className="text-lg font-light text-foreground">
            {free ? "Grátis" : formatPrice(book.price_cents, book.currency)}
          </span>
          {!free && book.price_cents > 0 && (
            <span className="text-muted-foreground text-xs font-light"> /acesso</span>
          )}
        </div>
      </div>
    </Link>
  </Card>
);

export default BookGridCard;
