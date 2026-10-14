@echo off
setlocal DisableDelayedExpansion

REM ============================================================
REM SMART ELECTRICITY BILLING SYSTEM - SHUTDOWN SCRIPT
REM ============================================================
REM Double-click resilience: if launched via Explorer (/c), re-launch with cmd /k
if not "%~1"=="--launcher-child" (
    echo %cmdcmdline% | findstr /i /c:"/c" >nul
    if not errorlevel 1 (
        start "Smart Electricity Shutdown" cmd.exe /k ""%~f0" --launcher-child %*"
        exit /b
    )
)

title Smart Electricity Billing System - Shutdown Script
cls

echo ============================================================
echo   SMART ELECTRICITY BILLING SYSTEM - SHUTDOWN SCRIPT
echo ============================================================
echo.

set "STOPPED_ANY=0"

REM ------------------------------------------------------------
REM 1. STOP SPRING BOOT BACKEND (PORT 8080)
REM ------------------------------------------------------------
set "BACKEND_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "BACKEND_PID=%%a"
)

if not defined BACKEND_PID (
    echo [INFO] No backend process detected on port 8080.
    goto STOP_FRONTEND_STEP
)

set "BACKEND_PROC="
for /f "usebackq tokens=1 delims=," %%p in (`tasklist /FI "PID eq %BACKEND_PID%" /FO CSV /NH 2^>nul`) do (
    set "BACKEND_PROC=%%~p"
)

echo [FOUND] Process on port 8080: PID %BACKEND_PID% [Image: %BACKEND_PROC%]
if /i "%BACKEND_PROC%"=="java.exe" goto DO_KILL_BACKEND
if /i "%BACKEND_PROC%"=="cmd.exe" goto DO_KILL_BACKEND
if /i "%BACKEND_PROC%"=="OpenConsole.exe" goto DO_KILL_BACKEND
if /i "%BACKEND_PROC%"=="conhost.exe" goto DO_KILL_BACKEND

echo [SKIP] PID %BACKEND_PID% does not belong to Spring Boot. Leaving untouched.
goto STOP_FRONTEND_STEP

:DO_KILL_BACKEND
echo [STOPPING] Terminating Spring Boot backend [PID %BACKEND_PID%]...
taskkill /F /T /PID %BACKEND_PID% >nul 2>&1
if not errorlevel 1 (
    echo [OK] Spring Boot backend terminated successfully.
    set "STOPPED_ANY=1"
) else (
    echo [WARNING] Could not terminate backend PID %BACKEND_PID%.
)

REM ------------------------------------------------------------
REM 2. STOP REACT FRONTEND (PORT 5173)
REM ------------------------------------------------------------
:STOP_FRONTEND_STEP
echo.
set "FRONTEND_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":5173 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "FRONTEND_PID=%%a"
)

if not defined FRONTEND_PID (
    echo [INFO] No React frontend process detected on port 5173.
    goto SUMMARY_STEP
)

set "FRONTEND_PROC="
for /f "usebackq tokens=1 delims=," %%p in (`tasklist /FI "PID eq %FRONTEND_PID%" /FO CSV /NH 2^>nul`) do (
    set "FRONTEND_PROC=%%~p"
)

echo [FOUND] Process on port 5173: PID %FRONTEND_PID% [Image: %FRONTEND_PROC%]
if /i "%FRONTEND_PROC%"=="node.exe" goto DO_KILL_FRONTEND
if /i "%FRONTEND_PROC%"=="cmd.exe" goto DO_KILL_FRONTEND
if /i "%FRONTEND_PROC%"=="OpenConsole.exe" goto DO_KILL_FRONTEND
if /i "%FRONTEND_PROC%"=="conhost.exe" goto DO_KILL_FRONTEND

echo [SKIP] PID %FRONTEND_PID% does not belong to Vite frontend. Leaving untouched.
goto SUMMARY_STEP

:DO_KILL_FRONTEND
echo [STOPPING] Terminating React Vite frontend [PID %FRONTEND_PID%]...
taskkill /F /T /PID %FRONTEND_PID% >nul 2>&1
if not errorlevel 1 (
    echo [OK] React Vite frontend terminated successfully.
    set "STOPPED_ANY=1"
) else (
    echo [WARNING] Could not terminate frontend PID %FRONTEND_PID%.
)

REM ------------------------------------------------------------
REM 3. SUMMARY
REM ------------------------------------------------------------
:SUMMARY_STEP
echo.
echo ------------------------------------------------------------
echo [INFO] MySQL80 database service was left running.
echo        To stop MySQL, run: net stop MySQL80 as Administrator
echo ------------------------------------------------------------

if "%STOPPED_ANY%"=="1" (
    echo [SUCCESS] Application services have been stopped cleanly.
) else (
    echo [INFO] No active Smart Electricity application processes were running.
)

echo.
echo Press any key to close this window.
pause >nul
