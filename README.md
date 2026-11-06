# Foodstuff – full-stack food delivery (React + Django REST + MySQL)

## Run everything from ONE address (recommended)
Django serves the website, the API and the admin together, so there is a single link: **http://localhost:8000**
```
# 1) build the website once (re-run after frontend changes)
cd frontend && npm install && npm run build && cd ..

# 2) set up and start Django
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # Windows: copy .env.example .env
python manage.py migrate
python manage.py seed                                  # adds the sample menu (38 dishes); never overwrites your edits
python manage.py createsuperuser                       # for /admin/
python manage.py runserver                             # open http://localhost:8000
```
Already have a database from before? Just run `python manage.py seed` again to add the new dishes. Your customers, orders and edited prices are kept.

## Deploy as one link (Railway example)
The project ships as one Docker image: website + API + admin on a single URL.
1. Put the `foodstuff-app` folder in a GitHub repository (the `Dockerfile` must be at the repo root; `backend/.env` is git-ignored, never commit it).
2. Railway: **New Project -> Deploy from GitHub repo**. It detects the Dockerfile.
3. In the same project add **New -> Database -> MySQL**.
4. Open your web service -> **Variables** and add (replace `MySQL` with your database service name):
   `DJANGO_SECRET_KEY` = a long random string, `MYSQLHOST=${{MySQL.MYSQLHOST}}`, `MYSQLPORT=${{MySQL.MYSQLPORT}}`, `MYSQLUSER=${{MySQL.MYSQLUSER}}`, `MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}`, `MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD` (creates your admin login on first start), optional `ADMIN_NAME`, `CONTACT_RECIPIENT` and SMTP settings (`EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`, `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`).
5. **Settings -> Networking -> Generate Domain**. That domain is your single link; `/admin/` is the admin.
On start the container runs migrations, loads the menu (first start only), creates the admin and starts Gunicorn. Railway's public domain is allowed automatically (`RAILWAY_PUBLIC_DOMAIN`); on other hosts set `DJANGO_ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS=https://yourdomain.com`.
Any host that runs Docker works the same way. Use MySQL (or another server database) in production. SQLite files are lost on hosts with temporary disks.
Try the full stack with MySQL on your own PC: `docker compose up --build`, then open http://localhost:8000.

## Develop with hot reload (two terminals)
Backend as above (`runserver`), then `cd frontend && npm install && cp .env.example .env && npm run dev` and open http://localhost:5173.
Leave `VITE_API_URL` empty for an offline demo mode that needs no backend.

## What is stored where
Customers (hashed passwords), products, orders, order items, payments, deliveries and contact messages live in the database. View/edit them at `/admin/`.
Change an order's status in Admin (list view dropdown or actions) and the customer's tracking page updates within a few seconds.

## API
`GET /api/categories/` · `GET /api/products/[?category=&q=&veg=1]` · `POST /api/auth/register/` · `POST /api/auth/login/` · `POST /api/auth/refresh/` · `GET|PATCH /api/auth/me/`
`GET|POST /api/orders/` · `GET /api/orders/<ref>/` · `POST /api/contact/`

## Before going live
Set `DJANGO_DEBUG=0`, a strong `DJANGO_SECRET_KEY`, your real `DJANGO_ALLOWED_HOSTS` (and `CSRF_TRUSTED_ORIGINS=https://yourdomain.com` if admin login is rejected), and SMTP settings for contact email. `CORS_ALLOWED_ORIGINS` is only needed if the website is hosted separately. Payments are recorded as `pending`: connect a gateway (e.g. Stripe) before treating orders as paid.
