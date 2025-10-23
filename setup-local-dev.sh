#!/bin/bash

echo "Setting up PTG UI Schematics for local development..."
echo

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Step 1: Setting up React Schematics..."
cd "$SCRIPT_DIR/react-schematics"
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install react-schematics dependencies"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build react-schematics"
    exit 1
fi

npm link
if [ $? -ne 0 ]; then
    echo "Failed to link react-schematics"
    exit 1
fi

echo
echo "Step 2: Setting up CLI..."
cd "$SCRIPT_DIR/cli"
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install CLI dependencies"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build CLI"
    exit 1
fi

npm link
if [ $? -ne 0 ]; then
    echo "Failed to link CLI"
    exit 1
fi

echo
echo "✅ Setup completed successfully!"
echo
echo "You can now run 'ptg-ui-cli' from any directory to create React applications."
echo