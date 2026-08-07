import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import brandIcon from "@/assets/worscoi-icon.png";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  variant?: "default" | "dark";
}

const Navigation = ({ variant = "default" }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = variant === "dark";
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const handleReserve = () => {
    if (isHomePage) {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const navItems = [
    { label: "Livros", href: "/livros" },
    { label: "Notícias", href: "/noticias" },
    { label: user ? "Minha estante" : "Entrar", href: user ? "/biblioteca" : "/auth" },
    ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  const lightText = isMobileMenuOpen || isDark || !isScrolled;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${
        isMobileMenuOpen
          ? "bg-foreground"
          : isDark
            ? isScrolled
              ? "bg-foreground/95 backdrop-blur-lg shadow-soft"
              : "bg-foreground"
            : isScrolled
              ? "bg-card/95 backdrop-blur-lg shadow-soft"
              : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 py-5">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 cursor-pointer">
              <img src={brandIcon} alt="Worscoi" width={20} height={20} className="h-5 w-5 rounded-[4px]" />
              <span className={`text-sm font-normal tracking-wide ${lightText ? "text-white" : "text-foreground"}`}>
                Worscoi
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-[11px] uppercase tracking-wider font-normal smooth-hover hover:opacity-60 ${
                  isDark || !isScrolled ? "text-white" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full smooth-hover text-[11px] uppercase tracking-wider font-normal backdrop-blur-md border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] px-5 ${
                isDark || !isScrolled
                  ? "bg-white/10 text-white hover:bg-primary/80 hover:text-white hover:border-primary/80"
                  : "bg-white/20 text-foreground hover:bg-primary/80 hover:text-white hover:border-primary/80"
              }`}
              onClick={handleReserve}
            >
              Reservar Livro
            </Button>
          </div>

          <button
            className={`md:hidden ${lightText ? "text-white" : "text-foreground"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={`md:hidden mt-6 pb-4 -mx-6 px-6 rounded-b-xl ${isDark || !isScrolled ? "bg-foreground" : "bg-card"}`}
            >
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block py-3 text-[11px] uppercase tracking-wider font-normal smooth-hover hover:opacity-60 ${
                    isDark || !isScrolled ? "text-white" : "text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="outline"
                className={`w-full mt-4 rounded-full text-[11px] uppercase tracking-wider font-normal backdrop-blur-md border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] px-5 ${
                  isDark || !isScrolled
                    ? "bg-white/10 text-white hover:bg-primary/80 hover:text-white hover:border-primary/80"
                    : "bg-white/20 text-foreground hover:bg-primary/80 hover:text-white hover:border-primary/80"
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleReserve();
                }}
              >
                Reservar Livro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
