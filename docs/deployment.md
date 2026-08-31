# Running the DCSA Portal locally

A step-by-step guide to getting the portal running on your own machine — written for
**Windows 11**, with Linux and macOS covered further down.

No prior Laravel experience is assumed. Each step says what it does and why, so that
when something goes wrong you have some idea where to look.

**Set aside about 45 minutes the first time.** Most of that is downloads.

- [What you are about to install, and why](#what-you-are-about-to-install-and-why)
- [Windows 11](#windows-11)
  - [Path A — Laragon (recommended)](#path-a--laragon-recommended)
  - [Path B — install each piece yourself](#path-b--install-each-piece-yourself)
  - [Path C — Docker for the database only](#path-c--docker-for-the-database-only)
  - [First run](#first-run)
  - [Every day after that](#every-day-after-that)
  - [When something goes wrong](#when-something-goes-wrong)
- [Linux / macOS](#linux--macos)
- [Running the tests](#running-the-tests)
- [Password-reset email](#password-reset-email)
- [Going to production](#going-to-production)

---

## What you are about to install, and why

The portal is not a single program you double-click. It is a PHP application that needs
four separate things on your machine:

| | What it is | Why the portal needs it |
|---|---|---|
| **PHP** 8.2+ | The language the backend is written in | Runs all the server-side code |
| **Composer** 2.x | PHP's package manager | Downloads Laravel and the other PHP libraries |
| **Node.js** 20+ | A JavaScript runtime | Compiles the React frontend into files a browser can read |
| **MySQL** 8 or **MariaDB** 10.6+ | The database server | Stores every learner, subject, score and grade |

PHP also needs a handful of **extensions** switched on — small add-on modules that come
with PHP but are disabled by default:

```
pdo_mysql   mbstring   openssl   curl   fileinfo
zip         gd         intl      bcmath xml
```

Plus `pdo_sqlite` and `sqlite3` if you want to run the test suite.

If that list looks intimidating, use **Path A (Laragon)** below — it installs all four
things with the extensions already turned on, which is why it is the recommended route.

---

## Windows 11

Pick **one** of the three paths, then everyone rejoins at [First run](#first-run).

| Path | Pick this if |
|---|---|
| **A — Laragon** | You want the shortest route. Recommended for most people. |
| **B — install each piece** | You want to know exactly what is on your machine, or you already have some of it. |
| **C — Docker for the database** | You already run Docker Desktop and would rather not install MySQL. |

---

### Path A — Laragon (recommended)

Laragon is a single installer that bundles PHP, MySQL, Composer and Node together, with
the PHP extensions already enabled.

**1.** Download **Laragon Full** from <https://laragon.org/download/> and install it.

**2.** Launch Laragon and click **Start All**. Apache and MySQL start up. You will not
use Apache — the portal runs its own dev server — but MySQL is the database you need.

**3.** Open Laragon's own terminal (**Menu → Terminal**) and check the versions:

```
php -v          REM want 8.2 or newer
node -v         REM want 20 or newer
composer -V
```

If PHP is older than 8.2, use Laragon's menu → **PHP → Version** to pick a newer one, or
**Tools → Quick add → PHP** to fetch one.

**4.** Create an empty database. Laragon menu → **MySQL → phpMyAdmin**, then create a
database named `dcsa_portal` with collation `utf8mb4_unicode_ci`.

> **Use Laragon's Terminal for every command in this guide.** It puts Laragon's PHP,
> Composer and Node on your `PATH`. A plain PowerShell window will not find them and you
> will get "`php` is not recognized".

Laragon's default MySQL login is user `root` with an **empty** password. Remember that
for the `.env` step.

---

### Path B — install each piece yourself

<details>
<summary><b>Expand these instructions</b></summary>

**PHP**

1. Download the **non-thread-safe (NTS) x64** ZIP for PHP 8.4 from
   <https://windows.php.net/download/>.
2. Extract it to `C:\php`.
3. Copy `C:\php\php.ini-development` to `C:\php\php.ini`. This is PHP's config file;
   without it, no extensions load.
4. Open `php.ini` in Notepad and **remove the leading `;`** from each of these lines
   (the `;` is a comment marker, so removing it switches the extension on):

   ```ini
   extension_dir = "ext"
   extension=bcmath
   extension=curl
   extension=fileinfo
   extension=gd
   extension=intl
   extension=mbstring
   extension=openssl
   extension=pdo_mysql
   extension=pdo_sqlite
   extension=sqlite3
   extension=zip
   ```

5. Add `C:\php` to your system `PATH` so Windows can find `php.exe` from any folder:
   press <kbd>Win</kbd>, type *environment variables*, open **Edit the system
   environment variables → Environment Variables → Path → Edit → New**, and add
   `C:\php`.
6. Open a **new** terminal (PATH changes only apply to new ones) and confirm:

   ```
   php -v
   php -m          REM the module list should contain pdo_mysql
   ```

**Composer** — run the Windows installer from <https://getcomposer.org/download/>.
Point it at `C:\php\php.exe` when it asks. Verify with `composer -V`.

**Node.js** — install the **LTS** build from <https://nodejs.org/>. Verify with
`node -v` and `npm -v`.

**MySQL** — install **MySQL Community Server 8** from
<https://dev.mysql.com/downloads/installer/>, choose *Developer Default*, and set a root
password you will remember. Then create the database:

```
mysql -u root -p -e "CREATE DATABASE dcsa_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

</details>

---

### Path C — Docker for the database only

<details>
<summary><b>Expand these instructions</b></summary>

PHP, Composer and Node still have to be installed on the machine (do Path A or B for
those). Only the database moves into a container. The repo's `compose.yaml` already
describes it.

1. Install **Docker Desktop** from <https://www.docker.com/products/docker-desktop/> and
   let it enable the WSL 2 backend when it offers.
2. From the project folder:

   ```
   docker compose up -d
   ```

   That starts MariaDB 11 on `127.0.0.1:3307` with database `dcsa_portal`, user `dcsa`,
   password `dcsa_secret`. It uses port **3307** rather than the usual 3306 so it cannot
   collide with a MySQL already installed on the host.
3. In the `.env` step below, use `DB_PORT=3307`, `DB_USERNAME=dcsa`,
   `DB_PASSWORD=dcsa_secret`.

The container is set to `restart: unless-stopped`, so it comes back on its own after a
reboot. `docker compose down` stops it and keeps the data; `docker compose down -v`
throws the data away.

</details>

---

### First run

**1. Get the code**

```
git clone https://github.com/kevsmir02/dcsa-portal.git
cd dcsa-portal
```

**2. Install the dependencies**

```
composer install
npm install
```

`composer install` reads `composer.json` and downloads Laravel and the other PHP
libraries into `vendor/`. `npm install` does the same for the frontend, into
`node_modules/`. Neither folder is in git — that is why you have to run these.

`npm install` pulls a few hundred megabytes and is noticeably slow on Windows, because
Defender scans every file it writes. See
[when something goes wrong](#when-something-goes-wrong) if it crawls.

**3. Create your environment file**

```
copy .env.example .env
```

In PowerShell instead:

```powershell
Copy-Item .env.example .env
```

`.env` holds the settings specific to *your* machine — database password, app URL, mail
keys. It is deliberately not in git, which is why you copy the example.

**4. Point it at your database**

Open `.env` in an editor and set the `DB_*` block to match the path you chose:

| | Path A (Laragon) | Path B (MySQL installer) | Path C (Docker) |
|---|---|---|---|
| `DB_HOST` | `127.0.0.1` | `127.0.0.1` | `127.0.0.1` |
| `DB_PORT` | `3306` | `3306` | `3307` |
| `DB_DATABASE` | `dcsa_portal` | `dcsa_portal` | `dcsa_portal` |
| `DB_USERNAME` | `root` | `root` | `dcsa` |
| `DB_PASSWORD` | *(leave empty)* | your root password | `dcsa_secret` |

While you are in there, set `APP_URL=http://localhost:8000` to match the dev server.

**5. Generate the application key**

```
php artisan key:generate
```

This writes a random `APP_KEY` into `.env`. Laravel uses it to encrypt session cookies —
without it, every page errors out.

**6. Create the tables and the sample school**

```
php artisan migrate --seed
```

`migrate` runs the files in `database/migrations/` in order, each one creating or
altering a table — that is how the schema is built, rather than by importing a `.sql`
dump. `--seed` then fills it with a demo school: 128 learners, 15 teachers, 24 subjects,
6 sections, a closed first quarter and an open second quarter.

The sample data is generated from a fixed random seed, so you get the same names as
everyone else. Logins are in the [README](../README.md#sample-logins).

> To wipe everything and start fresh at any point: `php artisan migrate:fresh --seed`.

**7. Start it**

Open **two** terminals in the project folder.

Terminal 1 — the Laravel server:

```
php artisan serve
```

Terminal 2 — Vite, which compiles the React frontend and reloads the browser when you
edit a file:

```
npm run dev
```

Open <http://localhost:8000>. You should land on the public front page with **Sign in**
in the corner.

> **Do not use `composer run dev` on Windows.** That shortcut is in the README for
> Linux/macOS users. It runs Laravel Pail to tail the logs, and Pail needs the `pcntl`
> extension, which does not exist in PHP for Windows. The command dies with
> *"The [pcntl] extension is required to run Pail"*. Two terminals is the Windows
> equivalent.

**Showing the portal without keeping Vite running.** If you are demoing and would rather
not keep a second terminal open, compile the frontend once instead:

```
npm run build
php artisan serve
```

The app then serves the pre-built files from `public/build`. Re-run `npm run build`
after any frontend change.

---

### Every day after that

```
php artisan serve      REM terminal 1
npm run dev            REM terminal 2
```

Plus `docker compose up -d` first if you are on Path C and stopped the container.

After pulling new commits from git:

```
composer install       REM in case a PHP dependency was added
npm install            REM in case a JS dependency was added
php artisan migrate    REM in case a new table or column was added
```

---

### When something goes wrong

**`composer run dev` fails with "[pcntl] extension is required"**
Expected on Windows. Run `php artisan serve` and `npm run dev` in separate terminals
instead.

**PowerShell refuses to run `npm`** — *"npm.ps1 cannot be loaded because running scripts
is disabled on this system."*
Either call `npm.cmd run dev`, or allow local scripts once from an **Administrator**
PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**`SQLSTATE[HY000] [2002]` — connection refused**
The database is not running, or the port is wrong. Path A: is MySQL green in Laragon?
Path C: run `docker compose ps`, and check `DB_PORT=3307` in `.env`. Laravel caches
config aggressively, so after editing `.env` run:

```
php artisan config:clear
```

**`could not find driver`**
`pdo_mysql` is not enabled. Run `php --ini` to find which `php.ini` is actually being
read — it is often not the one you edited — uncomment `extension=pdo_mysql` there, then
open a new terminal.

**The page loads with no styling, or the browser console shows failed requests to
`localhost:5173`**
A stale `public/hot` file, left behind when a Vite process was killed rather than closed.
The app still thinks the dev server is running. Delete it:

```
del public\hot
```

Then either start `npm run dev` again, or run `npm run build`.

**`Failed to open stream: No such file or directory` for `.env`**
Step 3 did not take. Check with `dir .env` — if File Explorer is hiding extensions you
may have created `.env.txt`.

**Port 8000 is already in use**
`php artisan serve --port=8001`, and update `APP_URL` in `.env` to match.

**`npm install` is glacial, or errors about long paths**
Add the project folder to Windows Security → **Virus & threat protection → Manage
settings → Exclusions**. For *"path too long"*, enable long paths from an Administrator
PowerShell:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
```

**Do I need `php artisan storage:link`?**
No. The portal stores no uploaded files, so that symlink — which needs an elevated prompt
or Developer Mode on Windows — is not needed.

**Do I need a queue worker?**
No. Nothing in the portal is queued; mail sends inline and grades compute during the
request. `php artisan queue:listen` is harmless but unnecessary.

---

## Linux / macOS

Same steps, with the database in a container so no local MySQL root password is needed:

```bash
git clone https://github.com/kevsmir02/dcsa-portal.git
cd dcsa-portal
composer install
npm install
cp .env.example .env
php artisan key:generate

docker compose up -d          # MariaDB 11 on 127.0.0.1:3307
# .env: DB_PORT=3307, DB_USERNAME=dcsa, DB_PASSWORD=dcsa_secret
php artisan migrate --seed

composer run dev              # server + queue + logs + vite, all in one
```

`composer run dev` works here because `pcntl` is available, so Pail can tail the logs.
Open <http://localhost:8000>.

To use a natively installed MySQL/MariaDB instead, skip `docker compose` and create the
database yourself:

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS dcsa_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
               CREATE USER IF NOT EXISTS 'dcsa'@'localhost' IDENTIFIED BY 'dcsa_secret';
               GRANT ALL PRIVILEGES ON dcsa_portal.* TO 'dcsa'@'localhost';
               FLUSH PRIVILEGES;"
```

Then set `DB_PORT=3306` in `.env` and run `php artisan migrate --seed`.

---

## Running the tests

```
vendor/bin/phpunit           REM 131 tests
npx tsc --noEmit             REM frontend types
vendor/bin/pint              REM PHP formatting
npm run format               REM frontend formatting
npm run lint
```

The suite runs against an **in-memory SQLite database**, configured in `phpunit.xml`. It
never touches your MySQL data and needs no database server running — but it does need
PHP's `pdo_sqlite` and `sqlite3` extensions enabled.

---

## Password-reset email

Out of the box `MAIL_MAILER=log`, which means **Forgot password** writes the reset link
into `storage/logs/laravel.log` instead of emailing it. That is deliberate — it is enough
for development, and it means you cannot accidentally email a real person while testing.
Open the log and copy the URL.

To send real mail, the app ships with the Resend driver:

1. Create an account at <https://resend.com> and verify a sending domain.
2. Create an API key at <https://resend.com/api-keys>.
3. In `.env`:

   ```ini
   MAIL_MAILER=resend
   RESEND_KEY=re_your_key_here
   MAIL_FROM_ADDRESS="no-reply@your-verified-domain.com"
   MAIL_FROM_NAME="DCSA Portal"
   ```

`MAIL_FROM_ADDRESS` must be on a domain verified in that Resend account, or the send is
rejected. Run `php artisan config:clear` after editing.

Any other Laravel mailer works too — set `MAIL_MAILER=smtp` and fill in the
`MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` block already in
`.env.example`.

---

## Going to production

The portal is a standard Laravel application: point a web server's document root at
`public/` and serve it. Before it holds real learner data:

**Environment**

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain
SESSION_ENCRYPT=true
```

`APP_DEBUG=false` matters most — with it on, an error page shows your stack trace and
environment variables to whoever triggered it.

**Build and cache**

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Do not run `db:seed` on a live install.** Every seeded demo account shares the password
`password`, including `admin@dcsa.edu.ph`. Migrate an empty database, create one real
administrator, and add staff and learners through the portal so each gets their own
one-time password.

**The rest of the checklist**

- Sign-in addresses are derived from names (`first.last.id@dcsa.edu.ph`) and are
  therefore guessable. The one-time passwords are what keep an account private — ask
  people to change theirs from **Settings → Password** after first sign-in.
- Replace the `compose.yaml` credentials. They are development defaults bound to
  `127.0.0.1` and are not meant to leave your machine.
- Serve over HTTPS. Sessions and one-time passwords cross the wire at sign-in.
- Give the web server user write access to `storage/` and `bootstrap/cache/` only.
- Back up the MySQL database. It is the only place grades live, and there are no soft
  deletes — see [Known trade-offs](architecture.md#known-trade-offs).
- Configure a real mailer, or password reset silently does nothing useful.
