@echo off
setlocal DisableDelayedExpansion

REM ============================================================
REM SMART ELECTRICITY BILLING SYSTEM - ONE-CLICK LAUNCHER
REM ============================================================
REM Double-Click Resilience:
REM When double-clicked from Windows Explorer, cmdcmdline contains /c.
REM Re-launching under cmd.exe /k ensures the launcher console window
REM stays permanently open and visible even if a failure occurs.
REM ============================================================
if not "%~1"=="--launcher-child" (
    echo %cmdcmdline% | findstr /i /c:"/c" >nul
    if not errorlevel 1 (
        start "Smart Electricity Launcher" cmd.exe /k ""%~f0" --launcher-child %*"
        exit /b
    )
)

title Smart Electricity Billing System - Launcher
cls

echo ============================================================
echo   SMART ELECTRICITY BILLING SYSTEM - ONE-CLICK LAUNCHER
echo ============================================================
echo.

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%"
cd /d "%PROJECT_ROOT%"

REM ------------------------------------------------------------
REM 1. ENVIRONMENT DETECTION (Java 21, Maven 3.9.9, Node, npm)
REM ------------------------------------------------------------
echo [1/5] Checking environment dependencies...

REM Check Java
where java >nul 2>&1
if not errorlevel 1 goto JAVA_ALREADY_IN_PATH

if exist "C:\Program Files\Java\jdk-21.0.12\bin\java.exe" goto SET_JAVA_PF
if exist "D:\tools\jdk-21.0.12.1+1\bin\java.exe" goto SET_JAVA_TOOLS
goto VERIFY_JAVA

:SET_JAVA_PF
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
set "PATH=C:\Program Files\Java\jdk-21.0.12\bin;%PATH%"
goto VERIFY_JAVA

:SET_JAVA_TOOLS
set "JAVA_HOME=D:\tools\jdk-21.0.12.1+1"
set "PATH=D:\tools\jdk-21.0.12.1+1\bin;%PATH%"
goto VERIFY_JAVA

:JAVA_ALREADY_IN_PATH
if not defined JAVA_HOME if exist "C:\Program Files\Java\jdk-21.0.12" set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"

:VERIFY_JAVA
where java >nul 2>&1
if not errorlevel 1 goto JAVA_OK
set "FAIL_STEP=1/5 [Java Detection]"
set "FAIL_MSG=Java 21 was not found in PATH or at C:\Program Files\Java\jdk-21.0.12."
goto ERROR_EXIT

:JAVA_OK
REM Check Maven
where mvn >nul 2>&1
if not errorlevel 1 goto MAVEN_OK

if exist "D:\tools\apache-maven-3.9.9\bin\mvn.cmd" goto SET_MVN_TOOLS
if exist "C:\Program Files\apache-maven-3.9.9\bin\mvn.cmd" goto SET_MVN_PF
goto VERIFY_MAVEN

:SET_MVN_TOOLS
set "MAVEN_HOME=D:\tools\apache-maven-3.9.9"
set "PATH=D:\tools\apache-maven-3.9.9\bin;%PATH%"
goto VERIFY_MAVEN

:SET_MVN_PF
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.9"
set "PATH=C:\Program Files\apache-maven-3.9.9\bin;%PATH%"
goto VERIFY_MAVEN

:VERIFY_MAVEN
where mvn >nul 2>&1
if not errorlevel 1 goto MAVEN_OK
set "FAIL_STEP=1/5 [Maven Detection]"
set "FAIL_MSG=Apache Maven was not found in PATH or at D:\tools\apache-maven-3.9.9\bin."
goto ERROR_EXIT

:MAVEN_OK
REM Check Node.js and npm
where npm >nul 2>&1
if not errorlevel 1 goto NODE_CHECK

if exist "C:\Program Files\nodejs\npm.cmd" set "PATH=C:\Program Files\nodejs;%PATH%"

:NODE_CHECK
where node >nul 2>&1
if not errorlevel 1 goto NPM_CHECK
set "FAIL_STEP=1/5 [Node.js Detection]"
set "FAIL_MSG=Node.js was not found in PATH or at C:\Program Files\nodejs."
goto ERROR_EXIT

:NPM_CHECK
where npm >nul 2>&1
if not errorlevel 1 goto ENV_ALL_OK
set "FAIL_STEP=1/5 [npm Detection]"
set "FAIL_MSG=npm was not found in PATH or at C:\Program Files\nodejs."
goto ERROR_EXIT

:ENV_ALL_OK
echo [OK] Java 21, Maven 3.9.9, Node.js, and npm detected successfully.

REM ------------------------------------------------------------
REM 2. MYSQL DATABASE SERVICE & PORT 3306 CHECK
REM ------------------------------------------------------------
echo.
echo [2/5] Checking MySQL Database Service...

set "MYSQL_ONLINE=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":3306 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "MYSQL_ONLINE=1"
)

if "%MYSQL_ONLINE%"=="1" goto MYSQL_IS_RUNNING

echo [INFO] Port 3306 is not listening. Checking MySQL80 Windows service...
sc query "MySQL80" | findstr /i "RUNNING" >nul 2>&1
if not errorlevel 1 goto WAIT_MYSQL_PORT

echo [INFO] Service MySQL80 is stopped. Starting service...
net start MySQL80 >nul 2>&1
if not errorlevel 1 goto WAIT_MYSQL_PORT

echo [INFO] Requesting administrator elevation to start MySQL80 service...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c net start MySQL80' -Verb RunAs -Wait" >nul 2>&1

:WAIT_MYSQL_PORT
ping -n 3 127.0.0.1 >nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":3306 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "MYSQL_ONLINE=1"
)

if "%MYSQL_ONLINE%"=="1" goto MYSQL_IS_RUNNING

echo [WARNING] MySQL does not appear to be listening on port 3306.
echo           Spring Boot may fail to connect if the database service is offline.
echo           Please start MySQL80 via services.msc if startup fails.
goto STEP_3_DB_CONFIG

:MYSQL_IS_RUNNING
echo [OK] MySQL service is active and listening on port 3306.

REM ------------------------------------------------------------
REM 3. DATABASE CONFIGURATION & LOCAL .ENV LOADING
REM ------------------------------------------------------------
:STEP_3_DB_CONFIG
echo.
echo [3/5] Configuring database credentials...

set "DB_HOST=localhost"
set "DB_PORT=3306"
set "DB_NAME=smart_billing"
set "DB_USERNAME=root"
set "DB_PASSWORD="

REM Load from local .env if present (protected by .gitignore)
if not exist "%PROJECT_ROOT%\.env" goto PROMPT_DB_PASSWORD

for /f "usebackq eol=# tokens=1* delims==" %%A in ("%PROJECT_ROOT%\.env") do (
    if /i "%%A"=="DB_HOST" set "DB_HOST=%%B"
    if /i "%%A"=="DB_PORT" set "DB_PORT=%%B"
    if /i "%%A"=="DB_NAME" set "DB_NAME=%%B"
    if /i "%%A"=="DB_USERNAME" set "DB_USERNAME=%%B"
    if /i "%%A"=="DB_PASSWORD" set "DB_PASSWORD=%%B"
)

if not defined DB_PASSWORD goto PROMPT_DB_PASSWORD

echo [OK] Loaded database settings from local .env file.
echo      Host: %DB_HOST%:%DB_PORT%, Database: %DB_NAME%, User: %DB_USERNAME%
echo      Password loaded securely without display.
goto DB_CONFIG_DONE

:PROMPT_DB_PASSWORD
echo [CONFIG] No DB_PASSWORD configured in .env or environment.
echo          Default is 'root'. If your MySQL root password is different, enter it below.
set "INPUT_PWD="
set /p "INPUT_PWD=Enter MySQL Password (or press Enter for default 'root'): "
if not defined INPUT_PWD goto SET_DEFAULT_PWD

set "DB_PASSWORD=%INPUT_PWD%"
echo.
set "SAVE_ENV=Y"
set /p "SAVE_ENV=Save this password to local .env file for future one-click launches? (Y/N, default Y): "
if /i "%SAVE_ENV%"=="N" goto DB_CONFIG_DONE

(
    echo # Smart Electricity Billing System - Local Environment Config
    echo DB_HOST=%DB_HOST%
    echo DB_PORT=%DB_PORT%
    echo DB_NAME=%DB_NAME%
    echo DB_USERNAME=%DB_USERNAME%
    echo DB_PASSWORD=%INPUT_PWD%
) > "%PROJECT_ROOT%\.env"
echo [OK] Configuration saved to '%PROJECT_ROOT%\.env' [protected by .gitignore].
goto DB_CONFIG_DONE

:SET_DEFAULT_PWD
set "DB_PASSWORD=root"

:DB_CONFIG_DONE
echo [OK] Database credentials prepared for Spring Boot.

REM ------------------------------------------------------------
REM 4. SPRING BOOT BACKEND CHECK & START
REM ------------------------------------------------------------
echo.
echo [4/5] Checking Spring Boot Backend (Port 8080)...

set "PORT_8080_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "PORT_8080_PID=%%a"
)

if not defined PORT_8080_PID goto LAUNCH_BACKEND

echo [INFO] Port 8080 is currently occupied by PID %PORT_8080_PID%.
echo [INFO] Verifying if Spring Boot backend is already responsive...

curl.exe -s -f --connect-timeout 2 "http://localhost:8080/actuator/health" >nul 2>&1
if not errorlevel 1 goto BACKEND_ALREADY_HEALTHY

curl.exe -s -f --connect-timeout 2 "http://localhost:8080/api/tariffs" >nul 2>&1
if not errorlevel 1 goto BACKEND_ALREADY_HEALTHY

echo [WARNING] Port 8080 is in use but did not return 200 on /actuator/health.
echo           Proceeding with launch attempt or check running processes.
goto LAUNCH_BACKEND

:BACKEND_ALREADY_HEALTHY
echo [OK] Spring Boot backend is already running and healthy [PID %PORT_8080_PID%].
echo [OK] Skipping duplicate backend launch.
goto START_FRONTEND_STEP

:LAUNCH_BACKEND
echo [STARTING] Launching Spring Boot backend in a dedicated terminal window...
start "Smart Electricity - Backend (Spring Boot)" /D "%BACKEND_DIR%" cmd.exe /k "title Smart Electricity - Backend (Spring Boot) && echo ============================================================ && echo   SPRING BOOT BACKEND - LOG STREAM (Port 8080) && echo ============================================================ && mvn.cmd spring-boot:run"

echo [WAIT] Waiting for backend to become healthy on http://localhost:8080...
echo        Probing /actuator/health and /api/tariffs ...

set /a RETRY_COUNT=0
:POLL_BACKEND_LOOP
ping -n 3 127.0.0.1 >nul

curl.exe -s -f --connect-timeout 2 "http://localhost:8080/actuator/health" >nul 2>&1
if not errorlevel 1 goto BACKEND_CONFIRM_HEALTH

curl.exe -s -f --connect-timeout 2 "http://localhost:8080/api/tariffs" >nul 2>&1
if not errorlevel 1 goto BACKEND_CONFIRM_HEALTH

set /a RETRY_COUNT+=1
echo [WAIT] Checking backend health... (%RETRY_COUNT%/45)
if %RETRY_COUNT% lss 45 goto POLL_BACKEND_LOOP

echo.
echo ============================================================
echo [WARNING] Backend startup timed out after 90 seconds.
echo           Please check the 'Smart Electricity - Backend (Spring Boot)'
echo           terminal window for Maven build or database errors.
echo ============================================================
goto START_FRONTEND_STEP

:BACKEND_CONFIRM_HEALTH
echo.
echo [OK] Spring Boot backend is healthy and responding [HTTP 200]!

curl.exe -s -f --connect-timeout 2 "http://localhost:8080/api/tariffs" >nul 2>&1
if not errorlevel 1 goto TARIFFS_OK
echo [INFO] /api/tariffs endpoint warming up [database initializing].
goto START_FRONTEND_STEP

:TARIFFS_OK
echo [OK] /api/tariffs endpoint verified successfully [HTTP 200].

REM ------------------------------------------------------------
REM 5. REACT FRONTEND CHECK & START (Port 5173)
REM ------------------------------------------------------------
:START_FRONTEND_STEP
echo.
echo [5/5] Checking React Frontend (Port 5173)...

set "PORT_5173_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":5173 " ^| findstr /C:"LISTENING" 2^>nul') do (
    set "PORT_5173_PID=%%a"
)

if not defined PORT_5173_PID goto LAUNCH_FRONTEND

echo [OK] React Vite frontend is already running on port 5173 [PID %PORT_5173_PID%].
echo [OK] Skipping duplicate frontend launch.
goto OPEN_BROWSER_STEP

:LAUNCH_FRONTEND
echo [STARTING] Launching React Vite frontend in a dedicated terminal window...
start "Smart Electricity - Frontend (React/Vite)" /D "%FRONTEND_DIR%" cmd.exe /k "title Smart Electricity - Frontend (React/Vite) && echo ============================================================ && echo   REACT FRONTEND - VITE DEV SERVER (Port 5173) && echo ============================================================ && npm.cmd run dev"
ping -n 4 127.0.0.1 >nul
echo [OK] Frontend launched.

REM ------------------------------------------------------------
REM 6. OPEN DEFAULT BROWSER
REM ------------------------------------------------------------
:OPEN_BROWSER_STEP
echo.
echo [BROWSER] Opening application at http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo ============================================================
echo   SMART ELECTRICITY BILLING SYSTEM IS READY!
echo ============================================================
echo   Frontend Application : http://localhost:5173/
echo   Backend REST API     : http://localhost:8080/api
echo   Swagger / OpenAPI UI : http://localhost:8080/swagger-ui.html
echo   Actuator Health      : http://localhost:8080/actuator/health
echo ============================================================
echo   - Backend Logs  : See 'Smart Electricity - Backend (Spring Boot)' window
echo   - Frontend Logs : See 'Smart Electricity - Frontend (React/Vite)' window
echo   - To stop app   : Double-click stop-app.bat
echo ============================================================
echo.
echo Launcher completed successfully. You may close this window.
pause
exit /b 0

:ERROR_EXIT
echo.
echo ============================================================
echo   [ERROR] STARTUP FAILED AT STEP: %FAIL_STEP%
echo ============================================================
echo   %FAIL_MSG%
echo ============================================================
echo.
echo Please resolve the error above and try again.
pause
exit /b 1
