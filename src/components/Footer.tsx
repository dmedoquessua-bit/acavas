import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import brandIcon from "@/assets/worscoi-icon.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={brandIcon} alt="Worscoi" width={16} height={16} className="h-4 w-4 rounded-[3px]" />
              <span className="text-sm font-normal tracking-wide">Worscoi</span>
            </div>
            <p className="text-background/70 text-xs font-light leading-relaxed max-w-xs">
              Livros digitais para ler no navegador e notícias sobre cultura, literatura e ideias.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Páginas</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li>
                <Link to="/" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/livros" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Livros
                </Link>
              </li>
              <li>
                <Link to="/noticias" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Notícias
                </Link>
              </li>
              <li>
                <Link to="/biblioteca" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Minha estante
                </Link>
              </li>
              <li>
                <a href="/#booking" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Reservar livro
                </a>
              </li>
              <li>
                <Link to="/termos" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Painel Admin
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Fale conosco</h4>
            <div className="flex flex-col gap-2 mb-8">
              <a
                href="mailto:ola@worscoi.com"
                className="text-background/70 hover:text-background smooth-hover text-xs font-light flex items-center gap-2"
              >
                <Mail className="h-3 w-3" />
                ola@worscoi.com
              </a>
              <p className="text-background/70 text-xs font-light">Seg - Sex: 9h - 18h</p>
            </div>

            <h4 className="text-sm font-medium mb-4">Siga-nos</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="text-background/70 hover:text-background smooth-hover" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-background/70 hover:text-background smooth-hover" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-background/70 hover:text-background smooth-hover" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-12 text-center text-background/50 text-xs font-light">
          <p>&copy; 2026 Worscoi. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
