import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, useNews, usePurchases } from "@/hooks/useCatalog";
import { formatPrice, slugify } from "@/lib/format";

const emptyBook = {
  title: "",
  author: "",
  description: "",
  cover_url: "",
  price: "0",
  category: "Geral",
  published: true,
  featured: false,
};

const emptyNews = {
  title: "",
  excerpt: "",
  content: "",
  cover_url: "",
  category: "Cultura",
  published: true,
};

const emptyChapter = { book_id: "", title: "", content: "", position: "1", is_free_preview: false };

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: books = [] } = useBooks();
  const { data: news = [] } = useNews();
  const { data: purchases = [] } = usePurchases();

  const [book, setBook] = useState(emptyBook);
  const [article, setArticle] = useState(emptyNews);
  const [chapter, setChapter] = useState(emptyChapter);
  const [busy, setBusy] = useState(false);

  const { data: chapters = [] } = useQuery({
    queryKey: ["admin-chapters", chapter.book_id],
    enabled: !!chapter.book_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("id,title,position")
        .eq("book_id", chapter.book_id)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!chapter.book_id && books.length) setChapter((c) => ({ ...c, book_id: books[0].id }));
  }, [books, chapter.book_id]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const refresh = (keys: string[]) => keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

  const saveBook = async () => {
    if (!book.title.trim() || !book.author.trim()) {
      toast({ title: "Preencha título e autor", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("books").insert({
      title: book.title.trim().slice(0, 200),
      author: book.author.trim().slice(0, 120),
      description: book.description.trim(),
      cover_url: book.cover_url.trim() || null,
      price_cents: Math.max(0, Math.round(Number(book.price) * 100) || 0),
      category: book.category.trim() || "Geral",
      published: book.published,
      featured: book.featured,
    });
    setBusy(false);
    if (error) return toast({ title: "Erro ao salvar livro", description: error.message, variant: "destructive" });
    setBook(emptyBook);
    refresh(["books"]);
    toast({ title: "Livro publicado" });
  };

  const saveChapter = async () => {
    if (!chapter.book_id || !chapter.title.trim()) {
      toast({ title: "Escolha o livro e informe o título", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("chapters").insert({
      book_id: chapter.book_id,
      title: chapter.title.trim().slice(0, 200),
      content: chapter.content,
      position: Math.max(1, Number(chapter.position) || 1),
      is_free_preview: chapter.is_free_preview,
    });
    setBusy(false);
    if (error) return toast({ title: "Erro ao salvar capítulo", description: error.message, variant: "destructive" });
    setChapter((c) => ({ ...emptyChapter, book_id: c.book_id, position: String(Number(c.position) + 1) }));
    refresh(["admin-chapters", "chapters"]);
    toast({ title: "Capítulo adicionado" });
  };

  const saveArticle = async () => {
    if (!article.title.trim()) {
      toast({ title: "Informe o título da notícia", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("news").insert({
      title: article.title.trim().slice(0, 200),
      slug: `${slugify(article.title).slice(0, 80)}-${Date.now().toString(36)}`,
      excerpt: article.excerpt.trim(),
      content: article.content,
      cover_url: article.cover_url.trim() || null,
      category: article.category.trim() || "Geral",
      published: article.published,
    });
    setBusy(false);
    if (error) return toast({ title: "Erro ao salvar notícia", description: error.message, variant: "destructive" });
    setArticle(emptyNews);
    refresh(["news"]);
    toast({ title: "Notícia publicada" });
  };

  const setPurchaseStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("purchases").update({ status }).eq("id", id);
    if (error) return toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    refresh(["purchases"]);
    toast({ title: status === "paid" ? "Compra liberada" : "Compra cancelada" });
  };

  const remove = async (table: "books" | "news", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    refresh([table]);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <span className="eyebrow">Administração</span>
        <h1 className="mt-2 font-display text-3xl">Painel de conteúdo</h1>

        {!isAdmin && (
          <div className="mt-6 rounded-sm border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
            Sua conta ainda não tem o papel de administrador, então salvar e ver pedidos ficará
            bloqueado pelas regras de segurança.
          </div>
        )}

        <Tabs defaultValue="books" className="mt-8">
          <TabsList>
            <TabsTrigger value="books">Livros</TabsTrigger>
            <TabsTrigger value="chapters">Capítulos</TabsTrigger>
            <TabsTrigger value="news">Notícias</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6 space-y-8">
            <div className="grid gap-4 rounded-sm border border-border bg-card p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={book.title} maxLength={200} onChange={(e) => setBook({ ...book, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={book.author} maxLength={120} onChange={(e) => setBook({ ...book, author: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Textarea rows={4} maxLength={4000} value={book.description} onChange={(e) => setBook({ ...book, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL da capa</Label>
                <Input value={book.cover_url} maxLength={500} onChange={(e) => setBook({ ...book, cover_url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" min="0" step="0.01" value={book.price} onChange={(e) => setBook({ ...book, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={book.category} maxLength={60} onChange={(e) => setBook({ ...book, category: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={book.published} onCheckedChange={(v) => setBook({ ...book, published: v })} /> Publicado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={book.featured} onCheckedChange={(v) => setBook({ ...book, featured: v })} /> Destaque
                </label>
              </div>
              <div className="flex items-end justify-end">
                <Button onClick={saveBook} disabled={busy}>Salvar livro</Button>
              </div>
            </div>

            <div className="space-y-2">
              {books.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-sm border border-border bg-card px-4 py-3 text-sm">
                  <span>
                    <strong className="font-display">{b.title}</strong>
                    <span className="ml-2 text-muted-foreground">{b.author} · {formatPrice(b.price_cents, b.currency)}</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => remove("books", b.id)}>Remover</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="mt-6 space-y-6">
            <div className="grid gap-4 rounded-sm border border-border bg-card p-6">
              <div className="space-y-2">
                <Label>Livro</Label>
                <Select value={chapter.book_id} onValueChange={(v) => setChapter({ ...chapter, book_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Escolha um livro" /></SelectTrigger>
                  <SelectContent>
                    {books.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                <div className="space-y-2">
                  <Label>Título do capítulo</Label>
                  <Input value={chapter.title} maxLength={200} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input type="number" min="1" value={chapter.position} onChange={(e) => setChapter({ ...chapter, position: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea rows={10} value={chapter.content} onChange={(e) => setChapter({ ...chapter, content: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={chapter.is_free_preview} onCheckedChange={(v) => setChapter({ ...chapter, is_free_preview: v })} />
                  Amostra grátis
                </label>
                <Button onClick={saveChapter} disabled={busy}>Adicionar capítulo</Button>
              </div>
            </div>

            <div className="space-y-2">
              {chapters.map((c) => (
                <div key={c.id} className="rounded-sm border border-border bg-card px-4 py-2 text-sm">
                  <span className="mr-3 text-muted-foreground">{c.position}</span>{c.title}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6 space-y-8">
            <div className="grid gap-4 rounded-sm border border-border bg-card p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={article.title} maxLength={200} onChange={(e) => setArticle({ ...article, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={article.category} maxLength={60} onChange={(e) => setArticle({ ...article, category: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Resumo</Label>
                <Textarea rows={2} maxLength={400} value={article.excerpt} onChange={(e) => setArticle({ ...article, excerpt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea rows={10} value={article.content} onChange={(e) => setArticle({ ...article, content: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL da imagem</Label>
                <Input value={article.cover_url} maxLength={500} onChange={(e) => setArticle({ ...article, cover_url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={article.published} onCheckedChange={(v) => setArticle({ ...article, published: v })} /> Publicada
                </label>
                <Button onClick={saveArticle} disabled={busy}>Publicar notícia</Button>
              </div>
            </div>

            <div className="space-y-2">
              {news.map((n) => (
                <div key={n.id} className="flex items-center justify-between rounded-sm border border-border bg-card px-4 py-3 text-sm">
                  <span className="font-display">{n.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => remove("news", n.id)}>Remover</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-3">
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
            ) : (
              purchases.map((p) => {
                const b = books.find((x) => x.id === p.book_id);
                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm">
                    <div>
                      <p className="font-display">{b?.title ?? p.book_id}</p>
                      <p className="text-muted-foreground">
                        {formatPrice(p.amount_cents, p.currency)} · {p.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPurchaseStatus(p.id, "paid")} disabled={p.status === "paid"}>
                        Confirmar pagamento
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPurchaseStatus(p.id, "cancelled")}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
