Write-Host "🚀 Starting TVM Academy Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "📁 Current Directory: $PWD" -ForegroundColor Cyan
Write-Host "🌐 Node.js Version:" -ForegroundColor Cyan
node --version
Write-Host ""
Write-Host "✅ Loading environment variables..." -ForegroundColor Green
Write-Host "📊 Starting server on port 5000..." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    node server.js
} catch {
    Write-Host "❌ Error starting server" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
