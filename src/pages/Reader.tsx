import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBook, useChapters } from "@/hooks/useCatalog";

const Reader = () => {
  const { id } = useParams();
  const { data: book } = useBook(id);
  const { data: chapters = [], isLoading } = useChapters(id);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  const chapter = chapters[index];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link to={`/livros/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {book?.title ?? "Voltar"}
          </Link>
          {chapters.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {index + 1} / {chapters.length}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : chapters.length === 0 ? (
          <div className="py-20 text-center">
            <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
            <h1 className="mt-4 font-display text-2xl">Conteúdo bloqueado</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Este livro ainda não está liberado para a sua conta. Compre o livro para desbloquear a
              leitura completa.
            </p>
            <Button asChild className="mt-6">
              <Link to={`/livros/${id}`}>Ver o livro</Link>
            </Button>
          </div>
        ) : (
          <article>
            <span className="eyebrow">Capítulo {chapter.position}</span>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">{chapter.title}</h1>
            {chapter.is_free_preview && (
              <p className="mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                Amostra grátis
              </p>
            )}
            <div className="prose-reader mt-10">
              {chapter.content.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-14 flex items-center justify-between rule pt-6">
              <Button
                variant="ghost"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="ghost"
                disabled={index >= chapters.length - 1}
                onClick={() => setIndex((i) => Math.min(chapters.length - 1, i + 1))}
              >
                Próximo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default Reader;
