import time
import subprocess
import os
from playwright.sync_api import sync_playwright

PORT = 8000
SERVER_URL = f"http://localhost:{PORT}"

def start_server():
    # Kill existing process
    subprocess.run(f"lsof -ti:{PORT} | xargs kill -9 2>/dev/null || true", shell=True)

    server_process = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        cwd="."
    )
    time.sleep(2)
    return server_process

def verify_visual():
    server = start_server()
    if not server:
        print("Failed to start server.")
        return

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            print(f"Navigating to {SERVER_URL}...")
            page.goto(SERVER_URL)

            # Wait for data to load
            try:
                page.wait_for_function("window.$chineseCharacters !== undefined", timeout=5000)
                page.wait_for_function("window.$sancai !== undefined", timeout=5000)
            except Exception as e:
                print(f"Failed to load data (timeout): {e}")
                return

            # Input family name
            page.fill("#familyName", "王")
            # Trigger change
            page.evaluate('$("#familyName").trigger("change");')

            # Wait for options
            page.wait_for_function('$("#combination option").length > 1', timeout=5000)

            # Take screenshot of the form area
            element = page.locator("form")
            element.screenshot(path="tests/visual_verification.png")
            print("Screenshot saved to tests/visual_verification.png")

            browser.close()

    finally:
        if server:
            server.terminate()
            server.wait()
            subprocess.run(f"lsof -ti:{PORT} | xargs kill -9 2>/dev/null || true", shell=True)

if __name__ == "__main__":
    verify_visual()
