import json
from pathlib import Path
from django.core.management.base import BaseCommand
from shop.models import Category, Product

class Command(BaseCommand):
    help = 'Load the sample Foodstuff menu. Default: add missing items only (never overwrites your edits).'
    def add_arguments(self, p):
        p.add_argument('--if-empty', action='store_true', help='do nothing if products already exist')
        p.add_argument('--reset', action='store_true', help='overwrite existing sample items with the original values')
    def handle(self, *a, **o):
        if o['if_empty'] and Product.objects.exists(): return self.stdout.write('Menu already has products; skipped.')
        data = json.loads((Path(__file__).resolve().parents[2] / 'fixtures' / 'menu.json').read_text(encoding='utf-8'))
        make = (lambda m, k, d: m.objects.update_or_create(defaults=d, **k)) if o['reset'] else (lambda m, k, d: m.objects.get_or_create(defaults=d, **k))
        added = 0
        for c in data['categories']: make(Category, {'slug': c['id']}, {'name': c['name'], 'emoji': c['emoji']})
        for f in data['foods']:
            _, new = make(Product, {'id': f['id']}, dict(category=Category.objects.get(slug=f['category']), name=f['name'], description=f['desc'], price=f['price'],
                image_url=f['img'], emoji=f['emoji'], rating=f['rating'], reviews=f['reviews'], prep_time=f['time'], calories=f['cal'], is_veg=f['veg'], is_popular=f['popular']))
            added += bool(new)
        self.stdout.write(self.style.SUCCESS(f"Menu ready: {Product.objects.count()} products in {Category.objects.count()} categories ({added} added)."))
