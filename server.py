#!/usr/bin/env python3
"""
Simple HTTP server for EcoLearn AI static files
Serves files with proper MIME types and CORS headers for Replit environment
"""

import http.server
import socketserver
import os
import mimetypes
from urllib.parse import urlparse

class EcoLearnHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for all requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        # Disable caching for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Handle service worker requests
        if self.path == '/sw.js':
            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.send_header('Service-Worker-Allowed', '/')
            self.end_headers()
            with open('sw.js', 'rb') as f:
                self.wfile.write(f.read())
            return
        
        # Handle manifest.json requests
        if self.path == '/manifest.json':
            self.send_response(200)
            self.send_header('Content-type', 'application/manifest+json')
            self.end_headers()
            # Create a basic manifest if it doesn't exist
            manifest = """{
    "name": "EcoLearn AI",
    "short_name": "EcoLearn",
    "description": "Sustainable Learning Platform",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#2E7D32",
    "theme_color": "#2E7D32",
    "icons": [
        {
            "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232E7D32'/%3E%3Ctext x='50' y='60' text-anchor='middle' fill='white' font-size='40'%3E🌱%3C/text%3E%3C/svg%3E",
            "sizes": "192x192",
            "type": "image/svg+xml"
        }
    ]
}"""
            self.wfile.write(manifest.encode())
            return
        
        # Default handling
        super().do_GET()

def run_server():
    PORT = 5000
    Handler = EcoLearnHandler
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"✅ EcoLearn AI server running on http://0.0.0.0:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("🌱 Visit the app to start your sustainable learning journey!")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()