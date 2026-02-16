import time
import threading
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

def run_server():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print("Server started on port 8000")
    try:
        httpd.serve_forever()
    except Exception:
        pass

# Start server in a thread
server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()
time.sleep(2) # Wait for server

os.makedirs('verification', exist_ok=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:8000')

        # Check if jQuery loaded
        is_jquery = page.evaluate('typeof jQuery !== "undefined"')
        if not is_jquery:
             print("jQuery failed to load. Exiting.")
             exit(1)

        # Wait for data to load
        page.wait_for_function('typeof $chineseCharacters !== "undefined"', timeout=10000)

        # Fill family name
        page.fill('#familyName', '李')
        page.evaluate('$("#familyName").trigger("change")')

        # Wait for results
        page.wait_for_function('document.querySelector("#combination").options.length > 1', timeout=5000)

        # Select first option
        page.evaluate('document.querySelector("#combination").selectedIndex = 1')
        page.evaluate('$("#combination").trigger("change")')

        # Wait for .giveName1_normal to have text
        page.wait_for_function('document.querySelector(".giveName1_normal").innerText.length > 0', timeout=5000)

        # Take screenshot
        screenshot_path = 'verification/result.png'
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()
except Exception as e:
    print(f"Error: {e}")
    exit(1)
