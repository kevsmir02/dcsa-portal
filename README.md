# DCSA Portal

**Datamex College of Saint Adeline — Grade 12 Grading Management System**

A Senior High School grading portal built on the DepEd classroom assessment rules
(DepEd Order No. 8, s. 2015). Administrators run the registry, teachers keep class
records, and learners see their own grades.

---

## Stack

| Layer | Choice |
|---|---|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | Inertia v2 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Database | MySQL / MariaDB (MariaDB 11 via `compose.yaml` in dev) |

## Requirements

PHP 8.2+ with `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `gd`, `intl`, `bcmath`,
`fileinfo` · Composer 2 · Node 20+ · MySQL 8 or MariaDB 10.6+ (or Docker, see below)

## Setup

### Quick start (this machine — already done)

The database runs in a container, so no MySQL root password is needed on the host:

```bash
docker compose up -d     # MariaDB 11 on 127.0.0.1:3307
composer run dev         # Laravel :8000 + Vite :5173 + queue + logs
```

Open <http://localhost:8000>. The container has `restart: unless-stopped`, so it
comes back on its own after a reboot.

If the database is ever empty or you want to start over:

```bash
php artisan migrate:fresh --seed
```

### From scratch (a fresh clone)

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate

docker compose up -d
# .env: set DB_PORT=3307 to match compose.yaml
php artisan migrate --seed

composer run dev
```

### Using a native MySQL / MariaDB instead of the container

Point `.env` at it and skip `docker compose` entirely:

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS dcsa_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
               CREATE USER IF NOT EXISTS 'dcsa'@'localhost' IDENTIFIED BY 'dcsa_secret';
               GRANT ALL PRIVILEGES ON dcsa_portal.* TO 'dcsa'@'localhost';
               FLUSH PRIVILEGES;"
```

Then set `DB_PORT=3306` in `.env` and run `php artisan migrate --seed`.

### On XAMPP / Laragon (how the client will run it)

Point the vhost document root at `public/`, create the `dcsa_portal` database in
phpMyAdmin, set the `DB_*` values in `.env` (port `3306`, your MySQL user), then:

```bash
composer install && npm install
php artisan key:generate
php artisan migrate --seed
npm run build              # compile assets once; no Vite process needed for a demo
php artisan serve
```

## Sample accounts

Seeded by `php artisan migrate --seed`. **Every seeded account uses the password `password`.**
These exist only to make the demo data usable — see the security note at the end
before putting this anywhere real.

| Role | Email | Sees |
|---|---|---|
| Administrator | `admin@dcsa.edu.ph` | Everything |
| Teacher | `corazon.villanueva@dcsa.edu.ph` | Their own classes and class records |
| Student | `juan.dela.cruz.1@dcsa.edu.ph` | Their own grades and report card |

The seeded school: 128 learners, 15 teachers, 24 subjects, 6 sections across STEM,
HUMSS, ABM and GAS, with a fully encoded first quarter (closed) and second quarter (open).

## How grading works

Each quarter, a subject class holds a class record with three components:

```
raw score ──► Percentage Score ──► Weighted Score ──► Initial Grade ──► Transmuted Grade
             (raw ÷ HPS × 100)     (PS × weight)      (sum of the WS)   (60–100 scale)
```

Component weights depend on the subject type and the section's track:

| Applies to | WW | PT | QA |
|---|---|---|---|
| Core subjects, all tracks | 25% | 50% | 25% |
| Academic track — applied & specialized | 25% | 45% | 30% |
| TVL / Sports / Arts & Design — applied & specialized | 20% | 60% | 20% |

A subject may override these from **Subjects → Edit**, as long as the three total 100%.

- **Semestral final grade** = mean of the semester's two quarterly grades.
- **General average** = mean of the semestral final grades across subjects.
- **Passing** = 75. Descriptors: 90–100 Outstanding · 85–89 Very Satisfactory ·
  80–84 Satisfactory · 75–79 Fairly Satisfactory · below 75 Did Not Meet Expectations.

A quarter earns a final grade only once all three components have at least one encoded
score, so a half-encoded quarter never reads as a failure.

### Finalising grades

Teachers edit freely while a quarter is open. The administrator closes a quarter from
**Settings → Academic Calendar**, which freezes every class record in it at once;
reopening it lets encoding resume.

## Printable reports

| Report | Where |
|---|---|
| SF9 Learner's Progress Report Card | Student profile, student dashboard, or Reports |
| Class record (per subject, per quarter) | Class record page, My Classes, or Reports |
| Section master list & grade sheet | Sections page or Reports |

Each opens as a print-ready page; use the browser's Print dialog (Ctrl/Cmd + P) to
produce a PDF or paper copy.

## Where things live

```
app/
  Enums/                 UserRole, Track, SubjectType, GradeComponent
  Support/
    TransmutationTable   DepEd Order 8 s.2015 Appendix B, pinned by tests
    ComponentWeights     resolves WW/PT/QA weights per subject and track
    GradeDescriptor      descriptors and the 75 passing mark
  Services/
    GradeCalculator      class record ──► quarterly grades
    AcademicRecord       quarterly grades ──► report card figures
  Http/Controllers/
    Admin/ Teacher/ Student/ Reports/
    ClassRecordController  shared by teachers and administrators
resources/
  js/pages/              Inertia screens, one folder per module
  views/reports/         the printable Blade forms
database/
  migrations/  seeders/
```

## Tests

```bash
vendor/bin/phpunit           # 67 tests
npx tsc --noEmit             # frontend types
vendor/bin/pint              # PHP formatting
npm run format               # frontend formatting
```

The grading rules carry the heaviest coverage: `TransmutationTableTest` checks every
band boundary and walks all 10,001 possible initial grades, `GradeCalculatorTest`
verifies the computation end to end against hand-worked figures, `QuarterLockTest`
covers finalisation, and `PortalSmokeTest` opens every screen as each role.

## Notes

- Accounts are issued by the registrar; public sign-up is disabled by design.
- Accounts created through the portal get a random one-time password, shown to the
  registrar once at the top of the screen. Reset one from **Settings → Accounts**,
  which issues a fresh one the same way.
### Before deploying anywhere real

- Set `APP_ENV=production` and `APP_DEBUG=false`.
- **Do not run `db:seed` on a live install.** The seeded demo accounts all share
  the password `password`, including `admin@dcsa.edu.ph`. Seed an empty database
  with a real administrator instead, then add staff and learners through the portal
  so each gets their own one-time password.
- Sign-in addresses are derived from names (`first.last.id@dcsa.edu.ph`) and so are
  guessable; the one-time passwords are what keep an account private. Ask people to
  change theirs from **Settings → Password** after their first sign-in.
- Replace the `compose.yaml` database credentials, which are development defaults
  bound to `127.0.0.1`.
