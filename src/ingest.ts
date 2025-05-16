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
// npx ts-node src/ingest.ts "[product code]"
if (require.main === module) {
  const searchTerm = process.argv[2] || "WH1000XM4B";
  const startTime = Date.now();

  ingestProduct(searchTerm)
    .then((products) => {
      const duration = Date.now() - startTime;
      console.log(JSON.stringify(products, null, 2));
      console.log(`\n⏱️  Request took ${duration}ms\n`);
    })
    .catch((err) => console.error(err));
}
