const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting...");
    const start = Date.now();
    const res = await fetch('http://127.0.0.1:8000/marketing/api/get_products?product_category=fabric');
    const data = await res.json();
    const apiTime = Date.now() - start;
    console.log('Django API Time:', apiTime, 'ms');
    console.log('Products:', data.products?.length, 'Variants:', data.product_variants?.length);

    const productIds = data.products.map(p => BigInt(p.id));
    const variantIds = data.product_variants.filter(v => productIds.includes(BigInt(v.product_id))).map(v => BigInt(v.id));

    const dbStart = Date.now();
    const files = await prisma.marketing_productfile.findMany({
        where: {
            OR: [
                { product_id: { in: productIds } },
                { product_variant_id: { in: variantIds } }
            ],
            file_url: { not: null }
        }
    });
    const dbTime = Date.now() - dbStart;
    console.log('DB Query Time:', dbTime, 'ms', 'Files found:', files.length);
    await prisma.$disconnect();
}
main().catch(console.error);
