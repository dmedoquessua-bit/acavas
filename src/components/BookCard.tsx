import { Link } from "react-router-dom";
import { Book } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/format";

const BookCard = ({ book }: { book: Book }) => (
  <Link
    to={`/livros/${book.id}`}
    className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow hover:shadow-[var(--shadow-lift)]"
  >
    <div className="aspect-[3/4] overflow-hidden bg-secondary">
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt={`Capa do livro ${book.title}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center font-display text-lg text-muted-foreground">
          {book.title}
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col p-4">
      <span className="eyebrow">{book.category}</span>
      <h3 className="mt-1.5 font-display text-base leading-snug">{book.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
      <p className="mt-3 text-sm font-medium text-primary">{formatPrice(book.price_cents, book.currency)}</p>
    </div>
  </Link>
);

export default BookCard;
