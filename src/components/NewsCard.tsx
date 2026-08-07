import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { NewsItem } from "@/hooks/useCatalog";
import { formatDate } from "@/lib/format";

const NewsCard = ({ item }: { item: NewsItem }) => (
  <Card className="overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow duration-300">
    <Link to={`/noticias/${item.slug}`} className="block">
      <div className="relative h-48 overflow-hidden bg-accent">
        <img
          src={item.cover_url || "/placeholder.svg"}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <Newspaper className="h-3 w-3 text-primary" />
          <span className="font-light text-xs">{item.category}</span>
        </div>
      </div>
      <div className="p-6">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
          {formatDate(item.published_at)}
        </span>
        <h3 className="text-base font-normal mb-2 text-card-foreground tracking-tight">{item.title}</h3>
        <p className="text-xs text-muted-foreground font-light leading-relaxed mb-5 line-clamp-3">{item.excerpt}</p>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs font-light px-0">
          Ler notícia
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Link>
  </Card>
);

export default NewsCard;
