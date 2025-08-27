import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Flag } from "lucide-react";

interface ProductFlag {
  id: number;
  sku: string;
  flagType: string;
  flagValue?: string;
  additionalData?: Record<string, unknown>;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: {
    productID: string;
    productName: string;
    description: string;
    imageUrl: string;
    productUrl: string;
    price: string;
    lastUpdated: string;
    hasFlags?: boolean;
    flags?: ProductFlag[];
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-surface border hover:shadow-hover transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
        </div>
        {product.hasFlags && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="destructive"
              className="text-xs flex items-center gap-1"
            >
              <Flag className="w-3 h-3" />
              Tagged
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {product.productName}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="text-xs font-bold bg-primary/10 text-primary border-primary/20"
            >
              {product.price}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {product.productID}
            </span>
          </div>

          {product.hasFlags && product.flags && (
            <div className="flex flex-wrap gap-1">
              {product.flags.map((flag) => (
                <Badge key={flag.id} variant="outline" className="text-xs">
                  {flag.flagType}: {flag.flagValue || "Set"}
                  {flag.expiryDate && (
                    <span className="ml-1 text-muted-foreground">
                      (expires {new Date(flag.expiryDate).toLocaleDateString()})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
