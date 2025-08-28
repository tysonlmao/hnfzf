import {
  Package,
  DollarSign,
  Calendar,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef, useEffect } from "react";

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

interface FocusableCarouselProps {
  images: string[];
  productName?: string;
}

function FocusableCarousel({ images, productName }: FocusableCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the carousel when it mounts
    const timer = setTimeout(() => {
      carouselRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Carousel ref={carouselRef} className="w-full outline-none" tabIndex={0}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="aspect-square">
              <img
                src={image}
                alt={`${productName || "Product"} image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

interface OptusPlansData {
  plans: {
    [key: string]: {
      cost: string;
      monthly: string;
      upfront: string;
      duration: string;
      end_date: string;
      description: string;
    };
  };
  outright: string;
}

interface OptusPlansDisplayProps {
  data: OptusPlansData;
}

function OptusPlansDisplay({ data }: OptusPlansDisplayProps) {
  const planKeys = Object.keys(data.plans);

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Smartphone className="w-5 h-5" />
          Optus Plans Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outright Purchase */}
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Buy Outright</h4>
              <p className="text-sm text-gray-600">Pay once, own forever</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                ${data.outright}
              </div>
            </div>
          </div>
        </div>

        {/* Contract Plans */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Contract Plans</h4>
          <Tabs defaultValue={planKeys[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {planKeys.map((planKey) => (
                <TabsTrigger key={planKey} value={planKey} className="text-sm">
                  {planKey} Plan
                </TabsTrigger>
              ))}
            </TabsList>
            {planKeys.map((planKey) => {
              const plan = data.plans[planKey];
              return (
                <TabsContent key={planKey} value={planKey} className="mt-4">
                  <Card className="border-orange-200">
                    <CardContent className="p-4 space-y-4">
                      {/* Plan Header */}
                      <div className="text-center pb-2 border-b border-orange-100">
                        <h5 className="font-semibold text-lg text-gray-900">
                          {planKey} Contract
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CreditCard className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-700">
                              Monthly
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            ${plan.monthly}
                          </div>
                          <div className="text-xs text-gray-600">per month</div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              Upfront
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            ${plan.upfront}
                          </div>
                          <div className="text-xs text-gray-600">
                            initial cost
                          </div>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Duration
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {plan.duration}M
                          </div>
                          <div className="text-xs text-gray-600">months</div>
                        </div>
                      </div>

                      {/* Total Cost & End Date */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Total Cost:
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ${plan.cost}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Offer ends:
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {plan.end_date}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductDialogProps {
  product: Product;
  trigger: React.ReactNode;
  formatPrice: (price: string | number | undefined) => string;
}

export const ProductDialog = ({
  product,
  trigger,
  formatPrice,
}: ProductDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {product.productID || "N/A"}
                </Badge>
                <Badge variant="secondary" className="text-xs text-emerald-500">
                  {product.price || "N/A"}
                </Badge>
              </div>
              <DialogTitle className="text-2xl pr-8">
                {product.productName || "Unnamed Product"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {(() => {
          // Check if product has Optus plans
          const hasOptusPlans = product.flags?.some(
            (flag) => flag.flagType === "optus" && flag.additionalData
          );

          if (hasOptusPlans) {
            // Simplified layout for Optus products: Image + Optus Plans only
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Image Only */}
                <div className="space-y-4">
                  {(() => {
                    const productImages = [];

                    // Only use images from the images array (skip thumbnail imageUrl)
                    if (product.images && Array.isArray(product.images)) {
                      productImages.push(...product.images);
                    }

                    // Remove duplicates
                    const uniqueImages = [...new Set(productImages)];

                    if (uniqueImages.length === 0) {
                      return (
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-16 h-16 text-muted-foreground" />
                        </div>
                      );
                    }

                    if (uniqueImages.length === 1) {
                      return (
                        <div className="aspect-square">
                          <img
                            src={uniqueImages[0]}
                            alt={product.productName || "Product image"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      );
                    }

                    return (
                      <FocusableCarousel
                        images={uniqueImages}
                        productName={product.productName}
                      />
                    );
                  })()}
                </div>

                {/* Right Side - Optus Plans Only */}
                <div className="space-y-4">
                  {product.flags
                    ?.filter(
                      (flag) => flag.flagType === "optus" && flag.additionalData
                    )
                    .map((flag) => (
                      <OptusPlansDisplay
                        key={flag.id}
                        data={flag.additionalData as unknown as OptusPlansData}
                      />
                    ))}
                </div>
              </div>
            );
          }

          // Default layout for non-Optus products
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Image Carousel */}
              <div className="space-y-4">
                {(() => {
                  const productImages = [];

                  // Only use images from the images array (skip thumbnail imageUrl)
                  if (product.images && Array.isArray(product.images)) {
                    productImages.push(...product.images);
                  }

                  // Remove duplicates (though there shouldn't be any now)
                  const uniqueImages = [...new Set(productImages)];

                  if (uniqueImages.length === 0) {
                    return (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    );
                  }

                  if (uniqueImages.length === 1) {
                    return (
                      <div className="aspect-square">
                        <img
                          src={uniqueImages[0]}
                          alt={product.productName || "Product image"}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                            <svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                          </div>
                        `;
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <FocusableCarousel
                      images={uniqueImages}
                      productName={product.productName}
                    />
                  );
                })()}
              </div>

              {/* Right Side - Product Information */}
              <div className="space-y-6">
                {/* Product Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description ||
                      "No description available for this product."}
                  </p>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 gap-4">
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
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold text-emerald-500">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {product.hasFlags && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Flags:
                            </span>
                            <span className="text-orange-500 font-medium">
                              {product.flags?.length || 0} active
                            </span>
                          </div>
                          {product.flags && (
                            <div className="space-y-1">
                              {product.flags.map((flag) => (
                                <div
                                  key={flag.id}
                                  className="bg-muted/50 rounded p-2"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">
                                      {flag.flagType}
                                    </span>
                                    {flag.flagValue && (
                                      <span className="text-xs text-muted-foreground">
                                        {flag.flagValue}
                                      </span>
                                    )}
                                  </div>
                                  {flag.expiryDate && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Expires:{" "}
                                      {new Date(
                                        flag.expiryDate
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
                          <span className="text-muted-foreground">Brand:</span>
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
                          <span className="text-muted-foreground">SKU:</span>
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
                          <span className="text-muted-foreground">Rating:</span>
                          <span>⭐ {product.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optus Plans Display */}
                {product.flags &&
                  product.flags.some(
                    (flag) => flag.flagType === "optus" && flag.additionalData
                  ) && (
                    <div className="mt-6">
                      {product.flags
                        .filter(
                          (flag) =>
                            flag.flagType === "optus" && flag.additionalData
                        )
                        .map((flag) => (
                          <OptusPlansDisplay
                            key={flag.id}
                            data={
                              flag.additionalData as unknown as OptusPlansData
                            }
                          />
                        ))}
                    </div>
                  )}
              </div>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
};
