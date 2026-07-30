@echo off
setlocal
cd /d "%~dp0"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install the LTS version from:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found.
  echo Reinstall the Node.js LTS version from:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing packages for the first launch...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Package installation failed.
    echo Check your network connection and try again.
    pause
    exit /b 1
  )
)

if not exist "Arasaki_Staff_Planner_v0_8_Deploy\assets\js\config.js" (
  copy /Y "Arasaki_Staff_Planner_v0_8_Deploy\assets\js\config.example.js" "Arasaki_Staff_Planner_v0_8_Deploy\assets\js\config.js" >nul
)

echo.
echo Starting ARASAKI Staff Planner...
echo Open http://localhost:5173/?localPreview=1 in your browser.
echo Press Ctrl+C here to stop the server.
echo.
call npm.cmd run dev

if errorlevel 1 (
  echo.
  echo The local server stopped with an error.
  pause
  exit /b 1
)

endlocal
