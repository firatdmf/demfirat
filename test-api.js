const https = require('https');

// Read from env or default (hardcoded for test)
const baseUrl = 'https://nejum.com';

const categories = ['fabric', 'ready_made_curtain'];

categories.forEach(category => {
    const url = `${baseUrl}/marketing/api/get_products?product_category=${category}`;
    console.log(`Fetching ${url}...`);

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                if (res.statusCode !== 200) {
                    console.error(`[${category}] Failed: Status ${res.statusCode}`);
                    console.log('Body:', data.substring(0, 200));
                    return;
                }
                const json = JSON.parse(data);
                const count = json.products ? json.products.length : 0;
                console.log(`[${category}] Found ${count} products.`);
                if (count > 0) {
                    console.log(`[${category}] Sample Product:`, json.products[0].title);
                }
            } catch (e) {
                console.error(`[${category}] JSON Error:`, e.message);
            }
        });

    }).on('error', (err) => {
        console.error(`[${category}] Network Error:`, err.message);
    });
});
