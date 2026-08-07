import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import brandIcon from "@/assets/worscoi-icon.png";

const links = [
  { to: "/livros", label: "Livros" },
  { to: "/noticias", label: "Notícias" },
  { to: "/biblioteca", label: "Minha biblioteca" },
];

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={brandIcon} alt="Worscoi" width={28} height={28} className="h-7 w-7 rounded-md" />
          <span className="font-display text-lg">Worscoi</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              Painel
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sair
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm">
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="text-sm">
                Painel
              </Link>
            )}
            {user ? (
              <button className="text-left text-sm text-muted-foreground" onClick={handleSignOut}>
                Sair
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm text-primary">
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
