import time
import subprocess
import json
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

def verify_correctness():
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

            # Wait for options to be populated
            # Check length > 1 because default is "請選擇" (Select)
            page.wait_for_function('$("#combination option").length > 1', timeout=5000)

            # Extract options
            options = page.evaluate("""
                () => {
                    var opts = [];
                    $("#combination option").each(function() {
                        opts.push({
                            value: $(this).attr("value"),
                            text: $(this).text()
                        });
                    });
                    return opts;
                }
            """)

            # Output to verify
            print(f"Found {len(options)} options.")

            # Save or assert
            # For now just print to stdout so I can redirect to file if needed, or check logic
            print(json.dumps(options, indent=2, ensure_ascii=False))

            browser.close()
            return options

    finally:
        if server:
            server.terminate()
            server.wait()
            subprocess.run(f"lsof -ti:{PORT} | xargs kill -9 2>/dev/null || true", shell=True)

if __name__ == "__main__":
    verify_correctness()
