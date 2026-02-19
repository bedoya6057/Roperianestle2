#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build Frontend
cd frontend
npm install
npm run build
cd ..

# Ensure static files are ready
mkdir -p static
