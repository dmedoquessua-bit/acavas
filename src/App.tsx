import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Library from "./pages/Library";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ContentDetail from "./pages/ContentDetail";
import ContentReader from "./pages/ContentReader";
import WebtoonDetail from "./pages/WebtoonDetail";
import Webtoons from "./pages/Webtoons";
import ForYou from "./pages/ForYou";
import ContinueReading from "./pages/ContinueReading";
import Search from "./pages/Search";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import PurchaseCancelled from "./pages/PurchaseCancelled";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookieConsent from "./components/consent/CookieConsent";
import TermsGate from "./components/consent/TermsGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CookieConsent />
        <TermsGate />
        <Routes>

          <Route path="/" element={<Index />} />
          <Route path="/livros" element={<Books />} />
          <Route path="/livros/:id" element={<BookDetail />} />
          <Route path="/ler/:id" element={<Reader />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/noticias/:slug" element={<NewsArticle />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/conteudo/:id" element={<ContentDetail />} />
          <Route path="/leitura/:id" element={<ContentReader />} />
          <Route path="/webtoons" element={<Webtoons />} />
          <Route path="/webtoon/:id" element={<WebtoonDetail />} />
          <Route path="/webtoon/:id/ep/:episodeId" element={<ContentReader />} />
          <Route path="/para-voce" element={<ForYou />} />
          <Route path="/continuar-lendo" element={<ContinueReading />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/compra/sucesso" element={<PurchaseSuccess />} />
          <Route path="/compra/cancelada" element={<PurchaseCancelled />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
