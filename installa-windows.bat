@echo off
setlocal EnableDelayedExpansion
title Spese Tracker - Installazione

echo.
echo  ================================================
echo   Spese Tracker - Installazione
echo  ================================================
echo.

:: ── Cartella dell'installer ──
SET APP_DIR=%~dp0
IF "%APP_DIR:~-1%"=="\" SET APP_DIR=%APP_DIR:~0,-1%

echo  Cartella app: %APP_DIR%
echo.

:: ── Controlla Node.js ──
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo  [ERRORE] Node.js non trovato!
  echo.
  echo  Scarica e installa Node.js da: https://nodejs.org
  echo  Poi ri-esegui questo installer.
  echo.
  pause
  exit /b 1
)

FOR /F "tokens=*" %%i IN ('node -v') DO SET NODE_VER=%%i
echo  Node.js trovato: %NODE_VER%

:: ── Installa dipendenze server ──
echo.
echo  [1/4] Installazione dipendenze server...
cd /d "%APP_DIR%\server"
call npm install --loglevel=error
IF %ERRORLEVEL% NEQ 0 (
  echo  [ERRORE] npm install server fallito.
  pause & exit /b 1
)
echo  OK

:: ── Installa dipendenze client ──
echo.
echo  [2/4] Installazione dipendenze client...
cd /d "%APP_DIR%\client"
call npm install --loglevel=error
IF %ERRORLEVEL% NEQ 0 (
  echo  [ERRORE] npm install client fallito.
  pause & exit /b 1
)
echo  OK

:: ── Build frontend ──
echo.
echo  [3/4] Build del frontend (potrebbe richiedere 1-2 minuti)...
cd /d "%APP_DIR%\client"
call npm run build
IF %ERRORLEVEL% NEQ 0 (
  echo  [ERRORE] Build fallita.
  pause & exit /b 1
)
echo  OK

:: ── Crea icona .ico via PowerShell ──
echo.
echo  [4/4] Creazione icona e collegamento...

:: Crea un'icona minima tramite PowerShell (cerchio colorato)
powershell -NoProfile -Command ^
  "$w=32;$h=32;Add-Type -AssemblyName System.Drawing;" ^
  "$bmp=New-Object System.Drawing.Bitmap $w,$h;" ^
  "$g=[System.Drawing.Graphics]::FromImage($bmp);" ^
  "$g.SmoothingMode='AntiAlias';" ^
  "$g.Clear([System.Drawing.Color]::Transparent);" ^
  "$brush=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,35,98,232));" ^
  "$g.FillEllipse($brush,1,1,$w-2,$h-2);" ^
  "$font=New-Object System.Drawing.Font('Arial',13,[System.Drawing.FontStyle]::Bold);" ^
  "$wbrush=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White);" ^
  "$sf=New-Object System.Drawing.StringFormat;" ^
  "$sf.Alignment='Center';$sf.LineAlignment='Center';" ^
  "$g.DrawString([char]0x20AC,$font,$wbrush,[System.Drawing.RectangleF]::new(0,0,$w,$h),$sf);" ^
  "$g.Dispose();$ms=New-Object System.IO.MemoryStream;" ^
  "$bmp.Save($ms,[System.Drawing.Imaging.ImageFormat]::Png);" ^
  "$bytes=$ms.ToArray();" ^
  "$ico=[System.IO.File]::Open('%APP_DIR%\spese.ico',[System.IO.FileMode]::Create);" ^
  "$bw=New-Object System.IO.BinaryWriter($ico);" ^
  "$bw.Write([byte[]](0,0,1,0,1,0,32,32,0,0,1,0,32,0));" ^
  "$offset=22;$size=$bytes.Length;" ^
  "$bw.Write([int]$size);$bw.Write([int]$offset);" ^
  "$bw.Write($bytes);$bw.Close();$ico.Close();" ^
  "Write-Host 'Icona creata'" 2>nul

IF NOT EXIST "%APP_DIR%\spese.ico" (
  echo  (icona non creata, si usera icona di default)
)

:: ── Crea launcher .vbs (avvia senza finestra nera) ──
SET VBS_FILE=%APP_DIR%\avvia-silente.vbs
(
echo Set oShell = CreateObject("WScript.Shell"^)
echo oShell.CurrentDirectory = "%APP_DIR%"
echo oShell.Run "cmd /c avvia-app.bat", 1, False
) > "%VBS_FILE%"

:: ── Crea avvia-app.bat (il vero launcher) ──
SET BAT_FILE=%APP_DIR%\avvia-app.bat
(
echo @echo off
echo setlocal
echo SET APP_DIR=%%~dp0
echo IF "%%APP_DIR:~-1%%"=="\" SET APP_DIR=%%APP_DIR:~0,-1%%
echo.
echo :: Controlla se il server e gia in ascolto
echo netstat -an 2^>nul ^| findstr ":3000" ^>nul 2^>&1
echo IF NOT ERRORLEVEL 1 (
echo   start http://localhost:3000
echo   exit /b 0
echo )
echo.
echo :: Avvia il server in background
echo cd /d "%%APP_DIR%%\server"
echo start "SpeseTrackerServer" /min node index.js
echo.
echo :: Aspetta che il server sia pronto (max 10 tentativi)
echo SET /A ATTEMPTS=0
echo :WAIT_LOOP
echo timeout /t 1 /nobreak ^>nul
echo netstat -an 2^>nul ^| findstr ":3000" ^>nul 2^>&1
echo IF NOT ERRORLEVEL 1 GOTO SERVER_READY
echo SET /A ATTEMPTS=%%ATTEMPTS%%+1
echo IF %%ATTEMPTS%% LSS 10 GOTO WAIT_LOOP
echo echo Server non risponde dopo 10 secondi.
echo pause
echo exit /b 1
echo :SERVER_READY
echo start http://localhost:3000
echo exit /b 0
) > "%BAT_FILE%"

:: ── Crea collegamento Desktop tramite PowerShell ──
SET DESKTOP=%USERPROFILE%\Desktop
SET SHORTCUT=%DESKTOP%\Spese Tracker.lnk
SET ICO_PATH=%APP_DIR%\spese.ico
IF NOT EXIST "%ICO_PATH%" SET ICO_PATH=%SystemRoot%\system32\shell32.dll,13

powershell -NoProfile -Command ^
  "$ws=New-Object -ComObject WScript.Shell;" ^
  "$s=$ws.CreateShortcut('%SHORTCUT%');" ^
  "$s.TargetPath='%APP_DIR%\avvia-silente.vbs';" ^
  "$s.WorkingDirectory='%APP_DIR%';" ^
  "$s.IconLocation='%ICO_PATH%';" ^
  "$s.Description='Spese Tracker';" ^
  "$s.Save()" 2>nul

IF EXIST "%SHORTCUT%" (
  echo  Collegamento creato: %SHORTCUT%
) ELSE (
  echo  Collegamento non creato (permessi Desktop^).
)

:: ── Crea anche collegamento nel menu Start ──
SET STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
SET SHORTCUT2=%STARTMENU%\Spese Tracker.lnk

powershell -NoProfile -Command ^
  "$ws=New-Object -ComObject WScript.Shell;" ^
  "$s=$ws.CreateShortcut('%SHORTCUT2%');" ^
  "$s.TargetPath='%APP_DIR%\avvia-silente.vbs';" ^
  "$s.WorkingDirectory='%APP_DIR%';" ^
  "$s.IconLocation='%ICO_PATH%';" ^
  "$s.Description='Spese Tracker';" ^
  "$s.Save()" 2>nul

echo.
echo  ================================================
echo   Installazione completata!
echo  ================================================
echo.
echo   - Collegamento creato sul Desktop
echo   - Collegamento nel menu Start
echo   - Avvia con: doppio click su "Spese Tracker"
echo   - Dati salvati in: %APP_DIR%\estratti-conti\
echo.

SET /P START_NOW= Avviare l'app adesso? (S/N): 
IF /I "%START_NOW%"=="S" (
  call "%BAT_FILE%"
)

echo.
pause
