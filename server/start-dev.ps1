# Start MongoDB
Start-Process "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" -ArgumentList "--dbpath", "C:\data\db"

# Wait for MongoDB to start
Start-Sleep -Seconds 5

# Start the Node.js server
npm run dev
