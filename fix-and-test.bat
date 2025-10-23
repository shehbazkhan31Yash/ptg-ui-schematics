@echo off
echo Re-linking PTG React Schematics...
echo.

echo Step 1: Re-linking react-schematics...
cd /d "d:\YashProjects\ptg-ui-schematics\react-schematics"
call npm link
if %errorlevel% neq 0 (
    echo Failed to link react-schematics
    pause
    exit /b 1
)

echo.
echo Step 2: Linking in workspace...
cd /d "d:\YashProjects\ptg-ui-schematics\my-react-app\nxChanges"
call npm link @ptg-ui/react-schematics --force
if %errorlevel% neq 0 (
    echo Failed to link in workspace
    pause
    exit /b 1
)

echo.
echo Step 3: Testing generation...
call npx nx generate @ptg-ui/react-schematics:application --name=testApp --style=css --framework=none --routing=true --redux=true --i18n=true --auth=custom --no-interactive
if %errorlevel% neq 0 (
    echo Generation failed
    pause
    exit /b 1
)

echo.
echo ✅ Success! React application generated.
echo.
pause