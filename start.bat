@echo off
setlocal
title DCSA Portal
rem Runs the DCSA Portal demo. Double-click it - Docker Desktop is the only
rem thing that has to be installed first.
rem
rem Inside a copy of the project it runs that copy. Sent on its own, it
rem downloads the latest version from GitHub into %LOCALAPPDATA%\dcsa-portal-demo
rem each time, so it always runs what is on the main branch.

set "REPO_ZIP=https://github.com/kevsmir02/dcsa-portal/archive/refs/heads/main.zip"
set "DEMO_DIR=%LOCALAPPDATA%\dcsa-portal-demo"

call :ensure_docker || goto :failed

if exist "%~dp0compose.yaml" (
    cd /d "%~dp0"
) else (
    call :fetch_project || goto :failed
)

echo.
echo Starting the DCSA Portal.
echo The first time takes several minutes while it downloads and builds everything.
echo.
docker compose --profile demo up -d --build --wait --wait-timeout 900 || goto :failed

start "" http://localhost:8000
echo.
echo ================================================================
echo  The portal is open at http://localhost:8000
echo.
echo  Every account's password is:  password
echo.
echo    Administrator   admin@dcsa.edu.ph
echo    Teacher         corazon.villanueva@dcsa.edu.ph
echo    Student         mark.santos.1@dcsa.edu.ph
echo ================================================================
echo.
echo Keep this window open while you use the portal.
echo When you are done, press any key here to shut it down.
pause >nul
echo.
echo Shutting down...
docker compose --profile demo down
exit /b 0


:failed
echo.
echo Something went wrong - the messages above say what.
echo If it is not clear, send a screenshot of this window to whoever gave you this file.
pause
exit /b 1


:ensure_docker
where docker >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop is not installed.
    echo Install it from the page that is opening now, restart the PC, then double-click this file again.
    start "" https://www.docker.com/products/docker-desktop/
    exit /b 1
)
docker info >nul 2>&1
if not errorlevel 1 exit /b 0

echo Starting Docker Desktop...
echo If it shows a welcome or agreement screen, click through it - this window will wait.
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
for /l %%i in (1,1,60) do (
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1 && exit /b 0
)
echo Docker Desktop did not start within 5 minutes.
exit /b 1


:fetch_project
echo Downloading the latest version of the portal...
if not exist "%DEMO_DIR%" mkdir "%DEMO_DIR%"
curl -fsSL -o "%DEMO_DIR%\main.zip" "%REPO_ZIP%"
if errorlevel 1 (
    if exist "%DEMO_DIR%\app\compose.yaml" (
        echo Could not download it, so using the copy already on this PC.
        cd /d "%DEMO_DIR%\app"
        exit /b 0
    )
    echo Could not download the portal. Check the internet connection and try again.
    exit /b 1
)
rem The portal's data lives in Docker, not in these folders, so replacing them is safe.
if exist "%DEMO_DIR%\unpacked" rmdir /s /q "%DEMO_DIR%\unpacked"
mkdir "%DEMO_DIR%\unpacked"
tar -xf "%DEMO_DIR%\main.zip" -C "%DEMO_DIR%\unpacked" || exit /b 1
if exist "%DEMO_DIR%\app" rmdir /s /q "%DEMO_DIR%\app"
move "%DEMO_DIR%\unpacked\dcsa-portal-main" "%DEMO_DIR%\app" >nul || exit /b 1
rmdir /s /q "%DEMO_DIR%\unpacked"
del "%DEMO_DIR%\main.zip"
cd /d "%DEMO_DIR%\app"
exit /b 0
