import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";

// Mock data from the provided JSON
const mockProducts = [
  {
    productID: "WH1000XM5B",
    productName: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black",
    description: "…with premium sound quality, the Sony WH-1000XM5 Wireless Noise Cancelling Headphones deliver…",
    imageUrl: "//harveynorman-au.resultspage.com/thumb.php?f=https%3a%2f%2fhnau.imgix.net%2fmedia%2fcatalog%2fproduct%2f1%2f_%2f1_wh-1000xm5_standard_black-large_1.jpg&",
    productUrl: "https://harveynorman-au.resultspage.com/search?isort=score&lgkey=%2fsony-wh-1000xm5-premium-noise-cancelling-wireless-headphones-black.html&lgsku=WH1000XM5B&method=and&p=R&rk=1&rsc=EJxzE5PrV5cqn82A&ts=rac-data&uid=236619598&url=https%3a%2f%2fwww.harveynorman.com.au%2fsony-wh-1000xm5-premium-noise-cancelling-wireless-headphones-black.html&w=wh1000xm5&rt=racclick",
    price: "$478.00",
    lastUpdated: "2025-08-25T12:07:41.036Z"
  },
  {
    productID: "WH1000XM5P",
    productName: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Pink",
    description: "…with premium sound quality, the Sony WH-1000XM5 Wireless Noise Cancelling Headphones deliver…",
    imageUrl: "//harveynorman-au.resultspage.com/thumb.php?f=https%3a%2f%2fhnau.imgix.net%2fmedia%2fcatalog%2fproduct%2fw%2fh%2fwh1000xm5p-sony.jpg&",
    productUrl: "https://harveynorman-au.resultspage.com/search?isort=score&lgkey=%2fsony-wh-1000xm5-wireless-noise-cancelling-headphones-pink.html&lgsku=WH1000XM5P&method=and&p=R&rk=2&rsc=5COi%3aMfdu6mYFflx&ts=rac-data&uid=236619598&url=https%3a%2f%2fwww.harveynorman.com.au%2fsony-wh-1000xm5-wireless-noise-cancelling-headphones-pink.html&w=wh1000xm5&rt=racclick",
    price: "$478.00",
    lastUpdated: "2025-08-25T12:07:41.037Z"
  },
  {
    productID: "WH1000XM5S",
    productName: "Sony WH-1000XM5 Premium Noise Cancelling Wireless Headphones - Silver",
    description: "…design, and sleek looks, the Sony WH-1000XM5 Premium Noise Cancelling Wireless Headphones…",
    imageUrl: "//harveynorman-au.resultspage.com/thumb.php?f=https%3a%2f%2fhnau.imgix.net%2fmedia%2fcatalog%2fproduct%2f1%2f_%2f1_wh-1000xm5_standard_silver-large_5.jpg&",
    productUrl: "https://harveynorman-au.resultspage.com/search?isort=score&lgkey=%2fsony-wh-1000xm5-premium-noise-cancelling-wireless-headphones-silver.html&lgsku=WH1000XM5S&method=and&p=R&rk=3&rsc=oWd-BO4t928n0fQe&ts=rac-data&uid=236619598&url=https%3a%2f%2fwww.harveynorman.com.au%2fsony-wh-1000xm5-premium-noise-cancelling-wireless-headphones-silver.html&w=wh1000xm5&rt=racclick",
    price: "$478.00",
    lastUpdated: "2025-08-25T12:07:41.038Z"
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate search with mock data
  const filteredProducts = mockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productID.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0 && !hasSearched) {
      setHasSearched(true);
      setIsLoading(true);
      // Simulate loading
      setTimeout(() => setIsLoading(false), 800);
    }
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className={cn(
        "transition-all duration-500 ease-in-out",
        hasSearched 
          ? "py-6 border-b border-border bg-gradient-surface" 
          : "min-h-screen flex items-center justify-center"
      )}>
        <div className="container mx-auto px-4">
          <div className={cn(
            "flex flex-col items-center transition-all duration-500 ease-in-out",
            hasSearched ? "space-y-4" : "space-y-8"
          )}>
            {!hasSearched && (
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Product Search
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Find the perfect products with our lightning-fast search
                </p>
              </div>
            )}
            
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              onClear={handleClearSearch}
              className={cn(
                "w-full transition-all duration-500 ease-in-out",
                hasSearched ? "max-w-lg" : "max-w-2xl"
              )}
              autoFocus={!hasSearched}
            />

            {hasSearched && (
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Searching..."
                ) : (
                  `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-8">
          <ProductGrid products={currentProducts} loading={isLoading} />
          
          {!isLoading && filteredProducts.length > productsPerPage && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
