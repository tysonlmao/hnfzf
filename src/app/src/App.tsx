import { useState } from "react";
import axios from "axios";
import {
  Search,
  Package,
  DollarSign,
  Info,
  ExternalLink,
  Hash,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import "./App.css";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:1337/api/product/${searchTerm}`
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

  const formatPrice = (price: any) => {
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
                <Dialog key={product.id}>
                  <DialogTrigger asChild>
                    <Card className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 cursor-pointer hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="primary" className="text-xs">
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
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary" className="text-xs">
                              {product.productID || "N/A"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs text-emerald-500"
                            >
                              {product.price || "N/A"}
                            </Badge>
                          </div>
                          <DialogTitle className="text-2xl pr-8">
                            {product.productName || "Unnamed Product"}
                          </DialogTitle>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Product Description */}
                      <div>
                        <p className="text-muted-foreground leading-relaxed">
                          {product.description ||
                            "No description available for this product."}
                        </p>
                      </div>

                      {/* Product Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">
                            Product Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Product ID:
                              </span>
                              <span className="font-mono text-sm">
                                {product.productID || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Price:
                              </span>
                              <span className="font-semibold text-emerald-500">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            {product.category && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Category:
                                </span>
                                <span>{product.category}</span>
                              </div>
                            )}
                            {product.brand && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Brand:
                                </span>
                                <span>{product.brand}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">
                            Additional Information
                          </h4>
                          <div className="space-y-2">
                            {product.sku && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  SKU:
                                </span>
                                <span className="font-mono text-sm">
                                  {product.sku}
                                </span>
                              </div>
                            )}
                            {product.availability && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Availability:
                                </span>
                                <Badge
                                  variant={
                                    product.availability === "In Stock"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {product.availability}
                                </Badge>
                              </div>
                            )}
                            {product.rating && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Rating:
                                </span>
                                <span>⭐ {product.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
      </div>
    </div>
  );
}

export default App;
