// Debug script to analyze SOAP request structure
// Run with: node debug-soap.js

const { InvoiceBuilder } = require('./src/lib/isnet/invoice-builder.ts');

// Test order data
const testOrderData = {
    orderId: 12345,
    orderDate: '2024-12-17',
    customer: {
        name: 'Test Musteri',
        taxNumber: '11111111111',
        email: 'test@example.com',
        phone: '5551234567',
        address: 'Test Cadde No:1',
        city: 'Istanbul',
        district: 'Kadikoy',
        postalCode: '34710'
    },
    items: [
        {
            productCode: 'TEST-001',
            productName: 'Test Urun',
            quantity: 1,
            unitPrice: 100,
            vatRate: 20
        }
    ],
    paymentMethod: 'card'
};

// Build invoice
const invoice = InvoiceBuilder.buildArchiveInvoice(testOrderData);

console.log('=== GENERATED INVOICE ===');
console.log(JSON.stringify(invoice, null, 2));

// Check for null/undefined values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkNulls(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (value === null || value === undefined) {
            console.log(`⚠️ NULL/UNDEFINED: ${currentPath}`);
        } else if (value === '') {
            console.log(`⚠️ EMPTY STRING: ${currentPath}`);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            checkNulls(value, currentPath);
        } else if (Array.isArray(value)) {
            value.forEach((item, i) => {
                if (typeof item === 'object') {
                    checkNulls(item, `${currentPath}[${i}]`);
                }
            });
        }
    }
}

console.log('\n=== CHECKING FOR NULL/EMPTY VALUES ===');
checkNulls(invoice);
