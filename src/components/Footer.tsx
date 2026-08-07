import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import brandIcon from "@/assets/worscoi-icon.png";

const Footer = () => (
  <footer className="mt-24 border-t border-border bg-secondary/40">
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img src={brandIcon} alt="Worscoi" width={28} height={28} className="h-7 w-7 rounded-md" />
            <span className="font-display text-lg">Worscoi</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Uma livraria digital e um jornal de ideias. Compre, leia no navegador e acompanhe o que
            move a cultura.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Navegar</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/livros" className="hover:text-foreground">Catálogo de livros</Link></li>
            <li><Link to="/noticias" className="hover:text-foreground">Notícias</Link></li>
            <li><Link to="/biblioteca" className="hover:text-foreground">Minha biblioteca</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Conta</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Entrar ou criar conta</Link></li>
          </ul>
        </div>
      </div>
      <p className="mt-12 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Worscoi. Todos os direitos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
