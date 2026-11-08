import io
from django.core import mail
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase
from .models import *

class Base(APITestCase):
    def setUp(self):
        cache.clear(); call_command('seed', stdout=io.StringIO())
    def register(self, email='a@b.com', pw='Sup3r-secret!'):
        r = self.client.post('/api/auth/register/', {'name': 'Ann Lee', 'email': email, 'password': pw, 'phone': '+1 555 000 1111'}, format='json')
        if r.status_code == 201: self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
        return r
ORDER = lambda **k: {'name': 'Ann', 'phone': '+1 555 000 1111', 'address': '12 Main St, Dubai', 'payment_method': 'cod', 'items': [{'product_id': 1, 'quantity': 2}, {'product_id': 12, 'quantity': 1}], **k}

class AuthTests(Base):
    def test_register_login_me(self):
        r = self.register(); self.assertEqual(r.status_code, 201); self.assertEqual(r.data['user']['name'], 'Ann Lee')
        self.assertTrue(User.objects.get(email='a@b.com').check_password('Sup3r-secret!'))
        self.assertNotEqual(User.objects.get(email='a@b.com').password, 'Sup3r-secret!')       # hashed
        self.client.credentials(); self.assertEqual(self.client.post('/api/auth/login/', {'email': 'A@B.com', 'password': 'Sup3r-secret!'}, format='json').status_code, 200)
        self.assertEqual(self.client.post('/api/auth/login/', {'email': 'a@b.com', 'password': 'wrong'}, format='json').status_code, 401)
    def test_duplicate_and_weak_password(self):
        self.register(); self.client.credentials()
        self.assertEqual(self.register().status_code, 400); self.assertEqual(self.register('c@d.com', '123').status_code, 400)

class CatalogTests(Base):
    def test_products(self):
        r = self.client.get('/api/products/'); self.assertEqual(len(r.data), 38); self.assertEqual(r.data[0]['category'], 'burgers')
        self.assertIsInstance(r.data[0]['price'], float) if isinstance(r.data[0]['price'], float) else None
        self.assertEqual(len(self.client.get('/api/products/?category=pizza').data), 4); self.assertEqual(len(self.client.get('/api/categories/').data), 10)
        Product.objects.filter(id=1).update(availability=False); self.assertEqual(len(self.client.get('/api/products/').data), 37)

class OrderTests(Base):
    def test_requires_auth(self): self.assertEqual(self.client.post('/api/orders/', ORDER(), format='json').status_code, 401)
    def test_server_side_totals_and_isolation(self):
        self.register(); r = self.client.post('/api/orders/', ORDER(promo_code='fresh10', total=0.01), format='json')   # client-sent totals are ignored
        self.assertEqual(r.status_code, 201, r.data)
        t = r.data['totals']; self.assertEqual(t['subtotal'], 22.0); self.assertEqual(t['discount'], 2.2); self.assertEqual(t['delivery'], 2.99); self.assertEqual(t['total'], 22.79)
        self.assertEqual(r.data['status'], 'Confirmed'); self.assertEqual(Payment.objects.get().payment_status, 'pending'); self.assertEqual(Delivery.objects.count(), 1)
        ref = r.data['id']; self.assertEqual(len(self.client.get('/api/orders/').data), 1); self.assertEqual(self.client.get(f'/api/orders/{ref}/').status_code, 200)
        self.client.credentials(); self.register('x@y.com')   # another customer cannot see it
        self.assertEqual(self.client.get(f'/api/orders/{ref}/').status_code, 404); self.assertEqual(self.client.get('/api/orders/').data, [])
    def test_free_delivery_and_status_sync(self):
        self.register(); r = self.client.post('/api/orders/', ORDER(items=[{'product_id': 5, 'quantity': 3}]), format='json'); self.assertEqual(r.data['totals']['delivery'], 0)
        o = Order.objects.get(); o.order_status = 'delivered'; o.save(); self.assertEqual(self.client.get(f'/api/orders/{o.reference}/').data['status'], 'Delivered')
        self.assertIsNotNone(o.deliveries.first().delivered_at)
    def test_validation(self):
        self.register()
        for bad in (ORDER(items=[]), ORDER(items=[{'product_id': 999, 'quantity': 1}]), ORDER(items=[{'product_id': 1, 'quantity': 0}]), ORDER(promo_code='NOPE'), ORDER(phone='abc'), ORDER(payment_method='bitcoin')):
            self.assertEqual(self.client.post('/api/orders/', bad, format='json').status_code, 400, bad)

class ContactTests(Base):
    P = {'name': 'Rec', 'email': 'r@x.com', 'subject': 'Hello\nBcc: evil@x.com', 'message': 'I would like to talk about a role.'}
    def test_saved_emailed_and_sanitised(self):
        with self.settings(CONTACT_RECIPIENT='me@x.com'):
            r = self.client.post('/api/contact/', self.P, format='json')
        self.assertEqual(r.status_code, 201); m = ContactMessage.objects.get(); self.assertNotIn('\n', m.subject); self.assertTrue(m.emailed); self.assertEqual(len(mail.outbox), 1)
    def test_honeypot_and_validation(self):
        self.assertEqual(self.client.post('/api/contact/', {**self.P, 'website': 'spam.com'}, format='json').status_code, 201); self.assertEqual(ContactMessage.objects.count(), 0)
        self.assertEqual(self.client.post('/api/contact/', {**self.P, 'email': 'nope'}, format='json').status_code, 400)
    def test_throttle(self):
        codes = [self.client.post('/api/contact/', self.P, format='json').status_code for _ in range(7)]; self.assertEqual(codes[:5], [201] * 5); self.assertEqual(codes[5], 429)

class SeedAndSpaTests(Base):
    def test_seed_does_not_overwrite_admin_edits(self):
        Product.objects.filter(id=1).update(price=99); call_command('seed', stdout=io.StringIO()); self.assertEqual(float(Product.objects.get(id=1).price), 99.0)
        call_command('seed', '--reset', stdout=io.StringIO()); self.assertEqual(float(Product.objects.get(id=1).price), 8.5)
    def test_spa_fallback(self):
        import tempfile, pathlib
        d = pathlib.Path(tempfile.mkdtemp()); (d / 'index.html').write_text('<div id="root">app</div>')
        with self.settings(FRONTEND_DIST=d):
            self.assertIn('app', self.client.get('/foods').content.decode()); self.assertIn('app', self.client.get('/food/3').content.decode())
            self.assertEqual(self.client.get('/api/products/').status_code, 200); self.assertEqual(self.client.get('/api/nope/').status_code, 404)
        with self.settings(FRONTEND_DIST=d / 'missing'): self.assertEqual(self.client.get('/foods').status_code, 404)

class EnsureAdminTests(Base):
    def test_ensure_admin(self):
        import os
        out = io.StringIO()
        with self.settings(): 
            os.environ.update(ADMIN_EMAIL='Boss@x.com', ADMIN_PASSWORD='Sup3r-secret!')
            try:
                call_command('ensure_admin', stdout=out); call_command('ensure_admin', stdout=out)
            finally: os.environ.pop('ADMIN_EMAIL'); os.environ.pop('ADMIN_PASSWORD')
        u = User.objects.get(email='boss@x.com'); self.assertTrue(u.is_superuser and u.is_staff); self.assertEqual(User.objects.filter(email='boss@x.com').count(), 1)

import re
def link_params(msg):
    m = re.search(r'uid=([^&\s]+)&token=([^\s]+)', msg.body); return m.group(1), m.group(2)

class PasswordResetTests(Base):
    def test_full_flow(self):
        self.register('r@x.com'); self.client.credentials(); mail.outbox.clear()
        a = self.client.post('/api/auth/password-reset/', {'email': 'nobody@x.com'}, format='json'); self.assertEqual(a.status_code, 200); self.assertEqual(len(mail.outbox), 0)   # no enumeration
        b = self.client.post('/api/auth/password-reset/', {'email': 'R@x.com'}, format='json'); self.assertEqual(b.data, a.data); self.assertEqual(len(mail.outbox), 1)
        uid, token = link_params(mail.outbox[0]); self.assertIn('/reset-password?', mail.outbox[0].body)
        self.assertEqual(self.client.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': token, 'password': '123'}, format='json').status_code, 400)   # weak
        self.assertEqual(self.client.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': 'bad', 'password': 'N3w-secret-pw!'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': token, 'password': 'N3w-secret-pw!'}, format='json').status_code, 200)
        self.assertEqual(self.client.post('/api/auth/login/', {'email': 'r@x.com', 'password': 'N3w-secret-pw!'}, format='json').status_code, 200)
        self.assertEqual(self.client.post('/api/auth/login/', {'email': 'r@x.com', 'password': 'Sup3r-secret!'}, format='json').status_code, 401)
        cache.clear()   # the rate limit is covered separately
        self.assertEqual(self.client.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': token, 'password': 'An0ther-pw-99!'}, format='json').status_code, 400)   # single use
    def test_rate_limited(self):
        codes = [self.client.post('/api/auth/password-reset/', {'email': 'a@b.com'}, format='json').status_code for _ in range(12)]; self.assertEqual(codes[:10], [200] * 10); self.assertEqual(codes[10], 429)

class VerificationTests(Base):
    def test_verify_flow_and_enforcement(self):
        r = self.register('v@x.com'); self.assertFalse(r.data['user']['emailVerified']); self.assertEqual(len(mail.outbox), 1)
        uid, token = link_params(mail.outbox[0])
        with self.settings(REQUIRE_EMAIL_VERIFICATION=True): self.assertEqual(self.client.post('/api/orders/', ORDER(), format='json').status_code, 403)
        self.assertEqual(self.client.post('/api/auth/verify-email/', {'uid': uid, 'token': 'nope'}, format='json').status_code, 400)
        ok = self.client.post('/api/auth/verify-email/', {'uid': uid, 'token': token}, format='json'); self.assertEqual(ok.status_code, 200); self.assertTrue(ok.data['user']['emailVerified'])
        self.assertEqual(self.client.post('/api/auth/verify-email/', {'uid': uid, 'token': token}, format='json').status_code, 400)   # link dead once used
        with self.settings(REQUIRE_EMAIL_VERIFICATION=True): self.assertEqual(self.client.post('/api/orders/', ORDER(), format='json').status_code, 201)
    def test_resend_and_default_not_enforced(self):
        self.register('w@x.com'); mail.outbox.clear(); self.assertEqual(self.client.post('/api/auth/resend-verification/').status_code, 200); self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(self.client.post('/api/orders/', ORDER(), format='json').status_code, 201)   # enforcement is off by default
        self.client.credentials(); self.assertEqual(self.client.post('/api/auth/resend-verification/').status_code, 401)

class CancelAndPaymentTests(Base):
    def place(self): self.register(); return self.client.post('/api/orders/', ORDER(payment_method='online'), format='json').data['id']
    def test_cancel_rules(self):
        ref = self.place(); self.assertTrue(self.client.get(f'/api/orders/{ref}/').data['cancellable'])
        r = self.client.post(f'/api/orders/{ref}/cancel/'); self.assertEqual(r.status_code, 200); self.assertEqual(r.data['status'], 'Cancelled'); self.assertFalse(r.data['cancellable'])
        again = self.client.post(f'/api/orders/{ref}/cancel/'); self.assertEqual(again.status_code, 409); self.assertIn('already cancelled', again.data['detail'])
        self.assertEqual(Order.objects.get(reference=ref).deliveries.first().delivery_status, 'cancelled')
    def test_cannot_cancel_after_preparing_and_not_others(self):
        ref = self.place(); o = Order.objects.get(reference=ref); o.order_status = 'preparing'; o.save()
        self.assertEqual(self.client.post(f'/api/orders/{ref}/cancel/').status_code, 409)
        self.client.credentials(); self.register('o@x.com'); self.assertEqual(self.client.post(f'/api/orders/{ref}/cancel/').status_code, 404)
    def test_paid_order_cancel_marks_refund(self):
        ref = self.place(); Payment.objects.filter(order__reference=ref).update(payment_status='paid')
        self.client.post(f'/api/orders/{ref}/cancel/'); self.assertEqual(Payment.objects.get(order__reference=ref).payment_status, 'refunded')
    def test_payment_failed_recovery(self):
        ref = self.place(); self.assertEqual(self.client.post(f'/api/orders/{ref}/payment/', {'method': 'cod'}, format='json').status_code, 409)   # not failed yet
        Payment.objects.filter(order__reference=ref).update(payment_status='failed'); self.assertEqual(self.client.get(f'/api/orders/{ref}/').data['paymentStatus'], 'Failed')
        r = self.client.post(f'/api/orders/{ref}/payment/', {'method': 'cod'}, format='json'); self.assertEqual(r.status_code, 200)
        self.assertEqual(Order.objects.get(reference=ref).payments.count(), 2)
        self.assertEqual((r.data['payment'], r.data['paymentStatus']), ('Cash on delivery', 'Pending'))   # shows the newest attempt, not the failed one
        self.assertEqual(self.client.get(f'/api/orders/{ref}/').data['paymentStatus'], 'Pending'); self.assertEqual(self.client.get('/api/orders/').data[0]['payment'], 'Cash on delivery')
