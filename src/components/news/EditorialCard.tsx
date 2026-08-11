import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedImage from "@/components/ProtectedImage";
import { formatDate } from "@/lib/format";
import { readingTime, type CuratedNews } from "@/lib/news";

/** Wide editorial card used in the two-column news grid. */
const EditorialCard = ({ item }: { item: CuratedNews }) => (
  <Card className="overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow duration-300 h-full">
    <Link to={`/noticias/${item.slug}`} className="block h-full" data-protected-media>
      <div className="aspect-video overflow-hidden bg-accent">
        <ProtectedImage
          src={item.cover_url}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 bg-accent text-accent-foreground rounded-sm font-light mb-3">
          {item.category}
        </span>
        <h3 className="text-lg font-medium mb-2 text-card-foreground tracking-tight leading-snug">{item.title}</h3>
        <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-2 mb-5">{item.excerpt}</p>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{formatDate(item.published_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime(item)} min read
          </span>
        </div>
      </div>
    </Link>
  </Card>
);

export default EditorialCard;
