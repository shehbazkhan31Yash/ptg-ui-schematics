@echo off
echo Setting up PTG UI Schematics for local development...
echo.

echo Step 1: Setting up React Schematics...
cd /d "%~dp0react-schematics"
call npm install
if %errorlevel% neq 0 (
    echo Failed to install react-schematics dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo Failed to build react-schematics
    pause
    exit /b 1
)

call npm link
if %errorlevel% neq 0 (
    echo Failed to link react-schematics
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up CLI...
cd /d "%~dp0cli"
call npm install
if %errorlevel% neq 0 (
    echo Failed to install CLI dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo Failed to build CLI
    pause
    exit /b 1
)

call npm link
if %errorlevel% neq 0 (
    echo Failed to link CLI
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo You can now run 'ptg-ui-cli' from any directory to create React applications.
echo.
pause