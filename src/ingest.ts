import axios from "axios";
import * as cheerio from "cheerio";

interface Product {
  productID: string;
  productName: string;
  description: string;
  imageUrl: string;
  productUrl: string;
  price: string;
  lastUpdated: string;
}

export const ingestProduct = async (searchTerm: string): Promise<Product[]> => {
  try {
    const { data } = await axios.get(
      `https://harveynorman-au.resultspage.com/search?ts=rac-data&w=${searchTerm}&rt=rac&dv=o&strategy=rac&showProducts=true`
    );

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".sli_ac_product").each((_: number, element) => {
      const $el = $(element);
      const title = $el.find(".sli_ac_title").text().trim();
      const description = $el.find(".sli_ac_excerpt").text().trim();
      const imageUrl = $el.find(".sli_ac_image").attr("src") || "";
      const productUrl = $el.find('[data-role="main-link"]').attr("href") || "";
      const sku = $el.attr("data-sku") || "";
      const price = $el.find(".price").text().trim() || "";

      products.push({
        productID: sku,
        productName: title,
        description,
        imageUrl,
        productUrl,
        price,
        lastUpdated: new Date().toISOString(),
      });
    });

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
