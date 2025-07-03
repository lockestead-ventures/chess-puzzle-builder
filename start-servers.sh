#!/bin/bash

echo "🚀 Starting Chess Puzzle Builder servers..."

# Kill any existing processes
echo "🔄 Stopping existing servers..."
pkill -f "node.*index.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# Start backend server
echo "📡 Starting backend server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend server running on port 5001"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server running on port 3000"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
echo "🎉 Both servers are running!"
echo "📡 Backend: http://localhost:5001"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 