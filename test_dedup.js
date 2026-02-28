const normalizeUrl = (url) => {
    if (!url) return '';
    let clean = url.split('?')[0];
    clean = clean.replace(/\/v\d+\//, '/');
    return clean;
};

const videoFiles = [
    { id: 2279, file: 'https://demfiratkarven.b-cdn.net/media/product_images/product_K25318/phasbdtku9yys78weo0t.mp4' },
    { id: 2277, file: 'https://demfiratkarven.b-cdn.net/media/product_images/product_K25318/phasbdtku9yys78weo0t.mp4' },
    { id: 2280, file: 'https://demfiratkarven.b-cdn.net/media/product_images/product_K25318/phasbdtku9yys78weo0t.mp4' },
    { id: 2281, file: 'https://demfiratkarven.b-cdn.net/media/product_images/product_K25318/phasbdtku9yys78weo0t.mp4' }
];

const uniqueVideos = Array.from(new Map(videoFiles.filter(v => v.file).map(v => [normalizeUrl(v.file), v])).values());

console.log("Input count:", videoFiles.length);
console.log("Output count:", uniqueVideos.length);
console.log("Output:", uniqueVideos);
