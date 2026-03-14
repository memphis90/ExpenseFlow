@echo off
setlocal EnableDelayedExpansion
title Spese Tracker

SET APP_DIR=%~dp0
IF "%APP_DIR:~-1%"=="\" SET APP_DIR=%APP_DIR:~0,-1%

:: Controlla Node.js
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  msg * "Node.js non trovato. Scaricalo da https://nodejs.org"
  exit /b 1
)

:: Server gia attivo? Apri solo il browser
netstat -an 2>nul | findstr ":3000" >nul 2>&1
IF NOT ERRORLEVEL 1 (
  start "" http://localhost:3000
  exit /b 0
)

:: Prima installazione automatica
IF NOT EXIST "%APP_DIR%\server\node_modules" (
  echo [Spese Tracker] Prima installazione: dipendenze server...
  cd /d "%APP_DIR%\server"
  call npm install --loglevel=error
  IF ERRORLEVEL 1 ( echo Errore npm install server. & pause & exit /b 1 )
)
IF NOT EXIST "%APP_DIR%\client\dist" (
  IF NOT EXIST "%APP_DIR%\client\node_modules" (
    echo [Spese Tracker] Dipendenze client...
    cd /d "%APP_DIR%\client"
    call npm install --loglevel=error
    IF ERRORLEVEL 1 ( echo Errore npm install client. & pause & exit /b 1 )
  )
  echo [Spese Tracker] Build frontend...
  cd /d "%APP_DIR%\client"
  call npm run build
  IF ERRORLEVEL 1 ( echo Errore build. & pause & exit /b 1 )
)

:: Avvia server in background (finestra minimizzata separata)
cd /d "%APP_DIR%\server"
start "SpeseTrackerServer" /min node index.js

:: Polling: aspetta fino a 15 secondi
SET /A CNT=0
:POLL
timeout /t 1 /nobreak >nul
netstat -an 2>nul | findstr "0.0.0.0:3000" >nul 2>&1
IF NOT ERRORLEVEL 1 GOTO OPEN
netstat -an 2>nul | findstr "[::]:3000" >nul 2>&1
IF NOT ERRORLEVEL 1 GOTO OPEN
SET /A CNT=CNT+1
IF %CNT% LSS 15 GOTO POLL
echo Timeout: il server non si e avviato. Controlla che la porta 3000 sia libera.
pause
exit /b 1

:OPEN
start "" http://localhost:3000
:: Questa finestra si chiude subito - il server resta aperto nella sua finestra
exit /b 0
