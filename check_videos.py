import os
import sys
import django

sys.path.append(r'C:\Users\enes3\erp\erp')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp.settings')
django.setup()

from marketing.models import Product, ProductFile, ProductVariant

with open('videos_output.txt', 'w', encoding='utf-8') as f:
    videos = ProductFile.objects.filter(file_type='video')
    products_with_videos = set(v.product_id for v in videos)
    
    f.write(f"Total products with videos: {len(products_with_videos)}\n")

    for pid in list(products_with_videos):
        product = Product.objects.get(id=pid)
        f.write(f"\nProduct: {product.title} (SKU: {product.sku})\n")
        files = ProductFile.objects.filter(product=product).order_by('sequence', 'id')
        
        video_files = [file for file in files if file.file_type == 'video' or (file.file_url and str(file.file_url).lower().endswith(('.mp4', '.mov', '.webm')))]
        
        f.write(f"  Total Videos for this product: {len(video_files)}\n")
        
        # Group videos by Variant to see if one variant has multiple video records
        from collections import defaultdict
        variant_vids = defaultdict(list)
        for v in video_files:
            variant_vids[v.product_variant_id].append(v)
            
        for var_id, vids in variant_vids.items():
            f.write(f"  Variant ID {var_id} has {len(vids)} video records.\n")
            for v in vids:
                f.write(f"    - ID: {v.id}, URL: {v.file_url}, Primary: {v.is_primary}, Seq: {v.sequence}\n")

print("Done writing to videos_output.txt")
