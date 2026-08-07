import { Link } from "react-router-dom";
import { NewsItem } from "@/hooks/useCatalog";
import { formatDate } from "@/lib/format";

const NewsCard = ({ item, large = false }: { item: NewsItem; large?: boolean }) => (
  <Link to={`/noticias/${item.slug}`} className="group block">
    {item.cover_url && (
      <div className={`mb-4 overflow-hidden rounded-sm bg-secondary ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <img
          src={item.cover_url}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    )}
    <span className="eyebrow">{item.category} · {formatDate(item.published_at)}</span>
    <h3 className={`mt-2 font-display leading-snug group-hover:text-primary ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>
      {item.title}
    </h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
  </Link>
);

export default NewsCard;
