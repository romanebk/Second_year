@echo off

IF NOT EXIST node_modules (
    echo Dependencies not found. Installing...
    npm install
) ELSE (
    echo Dependencies already installed. Skipping npm install.
)

npm run dev
