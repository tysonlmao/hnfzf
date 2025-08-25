import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

interface Product {
  productID: string;
  productName: string;
  description: string;
  imageUrl: string;
  images: string[];
  productUrl: string;
  price: string;
  lastUpdated: string;
}

const extractProductImages = async (
  productUrl: string,
  mainImageUrl: string
): Promise<string[]> => {
  const images: string[] = [];

  try {
    // First, try to extract different sizes from the main image URL
    if (mainImageUrl) {
      // Clean up the main image URL
      let cleanImageUrl = mainImageUrl;
      if (cleanImageUrl.startsWith("//")) {
        cleanImageUrl = "https:" + cleanImageUrl;
      }

      // If it's a thumbnail URL from resultspage.com, try to get the original
      if (cleanImageUrl.includes("resultspage.com/thumb.php")) {
        const urlParams = new URLSearchParams(cleanImageUrl.split("?")[1]);
        const originalUrl = urlParams.get("f");
        if (originalUrl) {
          const decodedOriginal = decodeURIComponent(originalUrl);
          images.push(decodedOriginal);

          // Generate different image sizes from imgix URL
          if (decodedOriginal.includes("imgix.net")) {
            const baseUrl = decodedOriginal.split("?")[0];
            images.push(baseUrl + "?w=800&h=800&fit=fill");
            images.push(baseUrl + "?w=1200&h=1200&fit=fill");
            images.push(baseUrl + "?w=400&h=400&fit=fill");
          }
        }
      } else {
        images.push(cleanImageUrl);
      }
    }

    // Extract the direct Harvey Norman URL from the resultspage.com URL
    const url = new URL(productUrl);
    const directUrl = url.searchParams.get("url");

    if (!directUrl) {
      console.warn(`No direct URL found in: ${productUrl}`);
      return images; // Return what we have so far
    }

    const decodedUrl = decodeURIComponent(directUrl);
    console.log(`Fetching images from: ${decodedUrl}`);

    // Use different headers to try to bypass bot detection
    const response = await axios.get(decodedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Look for common image carousel selectors on Harvey Norman
    const imageSelectors = [
      ".product-gallery img",
      ".product-images img",
      ".image-carousel img",
      ".carousel img",
      ".swiper-slide img",
      ".product-image img",
      '[data-testid="product-image"] img',
      ".gallery img",
      ".thumbnail img",
    ];

    for (const selector of imageSelectors) {
      $(selector).each((_, element) => {
        const src = $(element).attr("src");
        const dataSrc = $(element).attr("data-src");
        const dataSrcset = $(element).attr("data-srcset");

        // Try to get the highest quality image URL
        let imageUrl = src || dataSrc;

        if (dataSrcset) {
          // Extract the largest image from srcset
          const srcsetUrls = dataSrcset.split(",").map((s) => s.trim());
          const largestUrl = srcsetUrls[srcsetUrls.length - 1]?.split(" ")[0];
          if (largestUrl) imageUrl = largestUrl;
        }

        if (imageUrl && !images.includes(imageUrl)) {
          // Convert relative URLs to absolute
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          } else if (imageUrl.startsWith("/")) {
            imageUrl = "https://www.harveynorman.com.au" + imageUrl;
          }

          // Filter out placeholder, icon, or very small images
          if (
            !imageUrl.includes("placeholder") &&
            !imageUrl.includes("icon") &&
            !imageUrl.includes("logo") &&
            !imageUrl.includes("spinner")
          ) {
            images.push(imageUrl);
          }
        }
      });
    }

    // Remove duplicates and return
    return [...new Set(images)];
  } catch (error) {
    console.error(
      `Error extracting images from ${productUrl}:`,
      error instanceof Error ? error.message : String(error)
    );
    return images; // Return what we have so far
  }
};

export const ingestProduct = async (searchTerm: string): Promise<Product[]> => {
  try {
    const { data } = await axios.get(
      `https://harveynorman-au.resultspage.com/search?ts=rac-data&w=${searchTerm}&rt=rac&dv=o&strategy=rac&showProducts=true`
    );

    const $ = cheerio.load(data);
    const products: Product[] = [];

    // Extract product data first
    const productElements: any[] = [];
    $(".sli_ac_product").each((_: number, element) => {
      const $el = $(element);
      const title = $el.find(".sli_ac_title").text().trim();
      const description = $el.find(".sli_ac_excerpt").text().trim();
      const imageUrl = $el.find(".sli_ac_image").attr("src") || "";
      const productUrl = $el.find('[data-role="main-link"]').attr("href") || "";
      const sku = $el.attr("data-sku") || "";
      const price = $el.find(".price").text().trim() || "";

      productElements.push({
        productID: sku,
        productName: title,
        description,
        imageUrl,
        productUrl,
        price,
        lastUpdated: new Date().toISOString(),
      });
    });

    // Process each product to extract additional images
    for (const productData of productElements) {
      let images: string[] = [];
      if (productData.productUrl) {
        try {
          images = await extractProductImages(
            productData.productUrl,
            productData.imageUrl
          );
        } catch (error) {
          console.warn(
            `Failed to extract images for ${productData.productID}:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }

      products.push({
        ...productData,
        images,
      });
    }

    return products;
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    throw new Error(`Failed to fetch products`);
  }
};

// test with:
// npx ts-node src/ingest.ts "[product code]" [limit]
if (require.main === module) {
  const searchTerm = process.argv[2] || "WH1000XM4B";
  const limit = parseInt(process.argv[3]) || 0; // 0 means no limit
  const startTime = Date.now();

  console.log(
    `\n🔍 Searching for: "${searchTerm}"${
      limit > 0 ? ` (max ${limit} results)` : ""
    }\n`
  );

  ingestProduct(searchTerm)
    .then((products) => {
      const duration = Date.now() - startTime;

      if (products.length === 0) {
        console.log("❌ No products found\n");
        return;
      }

      // Apply limit if specified
      const limitedProducts = limit > 0 ? products.slice(0, limit) : products;

      console.log(
        `✅ Found ${products.length} product(s)${
          limit > 0 ? `, showing ${limitedProducts.length}` : ""
        }\n`
      );

      limitedProducts.forEach((product, index) => {
        console.log(`📦 Product ${index + 1}/${limitedProducts.length}`);
        console.log("━".repeat(60));
        console.log(`SKU: ${product.productID}`);
        console.log(`Name: ${product.productName}`);
        console.log(`Price: ${product.price || "N/A"}`);
        console.log(`Main Image: ${product.imageUrl}`);
        console.log(
          `Additional Images: ${
            product.images.length > 0
              ? product.images.length + " found"
              : "None found"
          }`
        );
        if (product.images.length > 0) {
          product.images.slice(0, 3).forEach((img, i) => {
            console.log(`  🖼️  ${i + 1}: ${img}`);
          });
          if (product.images.length > 3) {
            console.log(`  ... and ${product.images.length - 3} more`);
          }
        }
        console.log(`URL: ${product.productUrl}`);
        console.log("━".repeat(60));
      });

      if (limit > 0 && products.length > limit) {
        console.log(
          `\n📊 ... and ${products.length - limit} more products available\n`
        );
      }

      console.log(`\n⏱️  Request completed in ${duration}ms\n`);
    })
    .catch((err) => {
      console.error("\n❌ Error occurred:", err.message);
    });
}
