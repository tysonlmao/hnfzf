import { useState } from "react";
import axios from "axios";
import {
  Search,
  Package,
  DollarSign,
  Info,
  ExternalLink,
  Hash,
  Scan,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { ProductDialog } from "./components/ProductDialog";
import { BarcodeScannerComponent } from "./components/BarcodeScanner";
import { useIsMobile } from "./hooks/useIsMobile";
import "./App.css";

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

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  productID?: string;
  productName?: string;
  brand?: string;
  category?: string;
  sku?: string;
  availability?: string;
  rating?: number;
  hasFlags?: boolean;
  flags?: ProductFlag[];
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        process.env.NODE_ENV === "development"
          ? `http://localhost:1337/api/product/${searchTerm}`
          : `/api/product/${searchTerm}`
      );

      const data = response.data;
      console.log("API Response:", data); // Debug logging
      setProducts(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchTerm(barcode);
    setShowBarcodeScanner(false);
    // Automatically search after barcode is scanned
    setTimeout(async () => {
      if (!barcode.trim()) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          process.env.NODE_ENV === "development"
            ? `http://localhost:1337/api/product/${barcode}`
            : `/api/product/${barcode}`
        );

        const data = response.data;
        console.log("API Response:", data); // Debug logging
        setProducts(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const formatPrice = (price: string | number | undefined) => {
    // Handle different price formats and ensure we have a valid number
    let numPrice = 0;

    if (typeof price === "string") {
      // Remove any currency symbols, commas, and convert to number
      numPrice = parseFloat(price.replace(/[$,]/g, ""));
    } else if (typeof price === "number") {
      numPrice = price;
    }

    // If still not a valid number, return a fallback
    if (isNaN(numPrice)) {
      return "Price not available";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <h1 className="text-center mb-5">hnfzf</h1>
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Product Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter product ID or search term..."
                  className="pl-10 h-12 text-base"
                />
              </div>
              {isMobile && (
                <Button
                  onClick={() => setShowBarcodeScanner(true)}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Scan className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSearch} disabled={loading} size="lg">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </div>
                )}
              </Button>
            </div>
            {isMobile && (
              <p className="text-xs text-muted-foreground text-center">
                <Scan className="w-3 h-3 inline mr-1" />
                Tap the scan button to use your camera for barcode scanning
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="max-w-2xl mx-auto mb-8 border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <Info className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {products.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Found {products.length} product
                {products.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductDialog
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                  trigger={
                    <Card className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/20 cursor-pointer hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="default" className="text-xs">
                            {product.productID || "N/A"}
                          </Badge>

                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-2xl text-emerald-500">
                            {formatPrice(product.price).replace("$", "")}
                          </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {product.productName || "Name not available"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {product.description || "Description not available"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && searchTerm && (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Products Found
              </h3>
              <p className="text-muted-foreground">
                Try searching with a different term or product ID.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Barcode Scanner */}
        <BarcodeScannerComponent
          isOpen={showBarcodeScanner}
          onScanComplete={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </div>
    </div>
  );
}

export default App;
