import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Headphones, Share2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import SaveButton from "./SaveButton";
import type { Content } from "@/hooks/useContents";
import { useTrackInteraction } from "@/hooks/useContents";
import { useCheckout } from "@/hooks/useCheckout";
import { useOwnsContent } from "@/hooks/usePurchases";

const tapProps = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.96 } };

interface ActionButtonsProps {
  item: Content;
  readHref: string;
  readLabel?: string;
}

/** Ler / Comprar / Ouvir / Download / Partilhar / Salvar */
const ActionButtons = ({ item, readHref, readLabel = "Ler agora" }: ActionButtonsProps) => {
  const track = useTrackInteraction();
  const { checkout, isPending } = useCheckout();
  const { data: owned } = useOwnsContent(item.id);
  const isPaid = item.price_cents > 0;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: item.title, url }).catch(() => undefined);
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    }
    track(item.id, "share");
  };

  return (
    <div className="space-y-3">
      <motion.div {...tapProps}>
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
        >
          <Link to={readHref} onClick={() => track(item.id, "read")}>
            {readLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {isPaid && !owned && (
        <motion.div {...tapProps}>
          <Button
            disabled={isPending}
            onClick={() => checkout(item.id)}
            className="w-full rounded-md text-[11px] uppercase tracking-wider font-normal"
          >
            <ShoppingCart className="mr-2 h-3 w-3" />
            {isPending ? "A abrir pagamento…" : "Comprar"}
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <motion.div {...tapProps}>
          <Button
            variant="outline"
            className="rounded-md text-[11px] uppercase tracking-wider font-normal w-full"
            onClick={() => {
              track(item.id, "listen");
              toast.info("Audiolivro em breve");
            }}
          >
            <Headphones className="mr-2 h-3 w-3" />
            Ouvir
          </Button>
        </motion.div>

        <motion.div {...tapProps}>
          <Button
            variant="outline"
            className="rounded-md text-[11px] uppercase tracking-wider font-normal w-full"
            onClick={() => {
              track(item.id, "download");
              if (isPaid && !owned) toast.info("Disponível após a compra");
              else toast.info("Preparando o seu ficheiro…");
            }}
          >
            <Download className="mr-2 h-3 w-3" />
            Baixar
          </Button>
        </motion.div>

        <motion.div {...tapProps}>
          <Button
            variant="outline"
            className="rounded-md text-[11px] uppercase tracking-wider font-normal w-full"
            onClick={share}
          >
            <Share2 className="mr-2 h-3 w-3" />
            Partilhar
          </Button>
        </motion.div>

        <SaveButton item={item} />
      </div>
    </div>
  );
};

export default ActionButtons;
