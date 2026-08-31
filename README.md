# DCSA Portal

**Datamex College of Saint Adeline — Grade 12 Grading Management System**

A web portal that replaces the spreadsheet a Senior High School registrar would
otherwise keep by hand. Teachers encode raw scores; the portal turns them into official
DepEd grades and printable report cards.

| | |
|---|---|
| 📦 **Set it up** | **[docs/deployment.md](docs/deployment.md)** — step by step, for Windows 11 |
| 🏗 **Understand the code** | **[docs/architecture.md](docs/architecture.md)** — how it is built and why |

---

## What problem does it solve?

Philippine Senior High School grading is defined by **DepEd Order No. 8, s. 2015**. It is
not a simple average. For every subject, every quarter, a teacher must:

1. Sort every quiz, project and exam into one of three **components** — Written Work,
   Performance Task, Quarterly Assessment.
2. Convert each component to a percentage, then weight it — and the weights differ
   depending on the subject and the learner's track.
3. Add the weighted scores into an **Initial Grade**.
4. Convert that through a **transmutation table** onto the official 60–100 scale.
5. Average the two quarters into a semestral grade, and the subjects into a general
   average.

Doing that in Excel for 128 learners across 24 subjects is slow and easy to get wrong,
and a mistake in step 4 changes whether someone passes. This portal does the arithmetic,
enforces the rules, and prints the DepEd forms.

## Who uses it, and what they see

Sign-in is **by invitation only** — the registrar creates every account, and public
sign-up is switched off deliberately. What you see afterwards depends on your role.

**👩‍💼 Administrator** — the registrar's side.
The registry of students, teachers, subjects and sections; enrolment; every class record
in the school; an overview of which class records are done and which are outstanding;
and Settings, which holds the academic calendar (activating a semester, opening and
closing quarters), the school details, and the account list where passwords are reset
and accounts disabled.

**👨‍🏫 Teacher** — their own teaching load, and nothing else.
The classes assigned to them, and a class record for each: add written work, performance
tasks and the quarterly assessment, encode raw scores, and watch the quarterly grade
compute as you type. Editing stops the moment the administrator closes the quarter.

**🎓 Student** — their own grades only.
A dashboard for the current quarter, the full grade breakdown per subject, and their
report card.

**🌐 Everyone** — a public landing page at `/` that explains the grading scheme, plus
printable DepEd forms for the roles allowed to see them.

---

## The tech stack, and what each piece is for

If you are new to this stack, here is what every tool is actually doing.

### Backend

| Tool | What it is | Why it is here |
|---|---|---|
| **PHP 8.2+** | The server-side language | Everything in `app/` is written in it |
| **Laravel 12** | A PHP web framework | Gives us routing, database access, validation, authentication and mail without writing them from scratch |
| **Eloquent** | Laravel's ORM (built in) | Turns database rows into PHP objects, so `$student->enrollments` works instead of hand-written SQL |
| **MySQL 8 / MariaDB** | The database server | Stores every learner, subject, score and grade |

### Frontend

| Tool | What it is | Why it is here |
|---|---|---|
| **React 19** | A UI library | Builds the interactive screens — the class record grid, the filters, the dialogs |
| **TypeScript** | JavaScript with types | Catches a mistyped prop at build time instead of as a blank screen in the browser |
| **Inertia v2** | The glue between Laravel and React | Lets a Laravel controller render a React page directly. **This is why there is no REST API in this project** — see [architecture](docs/architecture.md#how-a-request-travels-through-the-app) |
| **Tailwind CSS v4** | A styling framework | Styles are written as utility classes in the markup rather than in separate CSS files |
| **shadcn/ui** | Accessible UI components | Buttons, dialogs, dropdowns — copied into `resources/js/components/ui/` rather than installed, so they can be edited |
| **Recharts** | A charting library | The dashboard graphs |
| **Vite 6** | Dev server and bundler | Compiles TypeScript and React into browser files, and hot-reloads them while you edit |
| **Ziggy** | A Laravel↔JS bridge | Makes Laravel's named routes usable from React |

### Supporting cast

| Tool | For |
|---|---|
| **PHPUnit** | The 131-test suite |
| **Pint** | Formatting PHP to one consistent style |
| **ESLint + Prettier** | Linting and formatting the frontend |
| **Resend** | Sending password-reset email (optional — logs to a file by default) |
| **Docker Compose** | Running the dev database in a container, so you need no MySQL root password |
| **GitHub Actions** | Running the tests and linters on every push |

---

## Quick start

**First time? Follow [docs/deployment.md](docs/deployment.md) instead** — it explains
every prerequisite and every step. This section is the short version for people who
already have PHP, Composer, Node and MySQL working.

```bash
composer install
npm install
cp .env.example .env          # copy .env.example .env   on Windows
php artisan key:generate

docker compose up -d          # MariaDB 11 on 127.0.0.1:3307
# .env: DB_PORT=3307, DB_USERNAME=dcsa, DB_PASSWORD=dcsa_secret
php artisan migrate --seed

composer run dev              # Laravel :8000 + Vite :5173 + queue + logs
```

Open <http://localhost:8000>. To wipe the data and start over:
`php artisan migrate:fresh --seed`.

> ⚠️ **On Windows, `composer run dev` does not work** — it needs a PHP extension that
> does not exist there. Run `php artisan serve` and `npm run dev` in two separate
> terminals. [Full explanation](docs/deployment.md#first-run).

## Sample logins

Created by `php artisan migrate --seed`. **Every seeded account uses the password
`password`.** They exist to make the demo data usable — read
[Going to production](docs/deployment.md#going-to-production) before putting this
anywhere real.

| Role | Email | Password | Sees |
|---|---|---|---|
| Administrator | `admin@dcsa.edu.ph` | `password` | Everything |
| Teacher | `corazon.villanueva@dcsa.edu.ph` | `password` | Their own classes and class records |
| Student | `mark.santos.1@dcsa.edu.ph` | `password` | Their own grades and report card |

The seeded school has 128 learners, 15 teachers, 24 subjects and 6 sections across STEM,
HUMSS, ABM and GAS, with a fully encoded first quarter (closed) and a second quarter
still open. The data is generated from a fixed random seed, so these names are identical
on every machine.

---

## How grading works

Each quarter, a subject class holds a class record with three components:

```
raw score ──► Percentage Score ──► Weighted Score ──► Initial Grade ──► Transmuted Grade
             (raw ÷ HPS × 100)     (PS × weight)      (sum of the WS)   (60–100 scale)
```

**Worked example** — a learner's Written Work in a core subject, where WW is worth 25%:

| Step | Figure |
|---|---|
| Encoded scores add up to 46 out of a possible 50 | 46 / 50 |
| Percentage Score = 46 ÷ 50 × 100 | 92.00 |
| Weighted Score = 92.00 × 25% | 23.00 |
| …plus the Performance Task and Quarterly Assessment weighted scores | + 44.50 + 22.75 |
| **Initial Grade** | **90.25** |
| **Transmuted Grade** (via the DepEd table) | **93** — Outstanding |

Component weights depend on the subject type and the section's track:

| Applies to | WW | PT | QA |
|---|---|---|---|
| Core subjects, all tracks | 25% | 50% | 25% |
| Academic track — applied & specialised | 25% | 45% | 30% |
| TVL / Sports / Arts & Design — applied & specialised | 20% | 60% | 20% |

A subject may override these from **Subjects → Edit**, as long as the three total 100%.

- **Semestral final grade** = the mean of the semester's two quarterly grades.
- **General average** = the mean of the semestral final grades across subjects.
- **Passing** = 75. Descriptors: 90–100 Outstanding · 85–89 Very Satisfactory ·
  80–84 Satisfactory · 75–79 Fairly Satisfactory · below 75 Did Not Meet Expectations.

A quarter earns a final grade only once all three components have at least one encoded
score, so a half-encoded quarter never reads as a failure.

### Finalising grades

Teachers edit freely while a quarter is open. The administrator closes a quarter from
**Settings → Academic Calendar**, which freezes every class record in it at once;
reopening it lets encoding resume.

## Printable reports

| Report | Where to find it |
|---|---|
| SF9 Learner's Progress Report Card | Student profile, student dashboard, or Reports |
| Class record (per subject, per quarter) | Class record page, My Classes, or Reports |
| Section master list & grade sheet | Sections page or Reports |

Each opens as a print-ready page — use the browser's Print dialog (Ctrl/Cmd + P) to
produce a PDF or a paper copy.

## Accounts and passwords

- The registrar issues every account. Public sign-up is disabled by design.
- Accounts created through the portal get a **random one-time password**, shown to the
  registrar once at the top of the screen. Reset one from **Settings → Accounts**, which
  issues a fresh one the same way.
- Disabling an account ends its open session on the very next request, not just at the
  next sign-in.
- **Forgot password** emails a reset link. With the default `MAIL_MAILER=log` the link is
  written to `storage/logs/laravel.log` instead of sent — see
  [Password-reset email](docs/deployment.md#password-reset-email) to wire up real
  delivery.

---

## Where things live

```
app/
  Enums/                 UserRole, Track, SubjectType, GradeComponent — the vocabulary
  Support/               The DepEd rules, as pure classes with no database access
    TransmutationTable     DepEd Order 8 s.2015 Appendix B, pinned by tests
    ComponentWeights       resolves WW/PT/QA weights per subject and track
    GradeDescriptor        descriptors and the 75 passing mark
    TemporaryPassword      the one-time passwords issued to new accounts
  Services/              Orchestration — these read and write the database
    GradeCalculator        class record ──► quarterly grades
    AcademicRecord         quarterly grades ──► report card figures
  Models/                One Eloquent model per table
  Http/
    Controllers/           Admin/ Teacher/ Student/ Auth/ Settings/ Reports/
      ClassRecordController  shared by teachers and administrators
      WelcomeController      the public landing page
    Middleware/
      EnsureUserHasRole      the `role:` route middleware
      EnsureUserIsActive     signs out a disabled account mid-session

resources/
  js/pages/              Inertia screens — one file per page, one folder per module
  js/components/         Reusable React components (ui/ is shadcn)
  views/reports/         The printable Blade forms

database/
  migrations/            The schema, one file per change
  seeders/               The demo school

routes/
  web.php  auth.php  settings.php
```

**New to the codebase?** Read [docs/architecture.md](docs/architecture.md) — it walks a
request from the browser to the screen, and explains why the database is shaped the way
it is.

## Tests

```bash
vendor/bin/phpunit           # 131 tests
npx tsc --noEmit             # frontend types
vendor/bin/pint              # PHP formatting
npm run format               # frontend formatting
npm run lint
```

The suite runs against an in-memory SQLite database (`phpunit.xml`), so it needs no
database running and never touches your MySQL data.

The grading rules carry the heaviest coverage: `TransmutationTableTest` checks every band
boundary and walks all 10,001 possible initial grades, `GradeCalculatorTest` verifies the
computation end to end against hand-worked figures, `QuarterLockTest` covers
finalisation, the `Feature/Admin/` suites cover every registry write path and its
authorisation, and `PortalSmokeTest` opens every screen as each role.

Both workflows in `.github/workflows/` run on every push and pull request.
