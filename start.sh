#!/bin/bash

echo "🐳 Starting HNFZF Docker Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ HNFZF is running!"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend: http://localhost:1337"
echo "💾 Database: localhost:5432"
echo ""
echo "📋 Commands:"
echo "  View logs: npm run docker:logs"
echo "  Stop: npm run docker:down"
echo "  Ingest: npm run docker:ingest"
echo ""
echo "📖 Full documentation: see Docker-README.md"
