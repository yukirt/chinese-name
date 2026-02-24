import time
import subprocess
import statistics
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

def run_benchmark():
    server = start_server()
    if not server:
        print("Failed to start server.")
        return

    durations = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            print(f"Navigating to {SERVER_URL}...")
            page.goto(SERVER_URL)

            # Wait for data to load
            try:
                # Wait for global variables to be defined, though we might mock them anyway
                page.wait_for_function("window.$chineseCharacters !== undefined", timeout=5000)
                page.wait_for_function("window.$sancai !== undefined", timeout=5000)
            except Exception as e:
                print(f"Failed to load data (timeout): {e}")
                # Continue anyway as we mock getCombinations

            # Inject mock data
            page.evaluate("""
                window.mockData = [];
                for (var i = 0; i < 5000; i++) {
                    window.mockData.push({
                        key: "key_" + i,
                        value: 100,
                        top: 10,
                        middle: 10,
                        bottom: 10
                    });
                }

                // Override getCombinations
                window.getCombinations = function(familyName) {
                    return window.mockData;
                };
            """)

            # Set value so it doesn't return early
            page.fill("#familyName", "王")

            # Run multiple times
            for i in range(5):
                # Clear existing options first to ensure we measure append
                page.evaluate('$("#combination").empty();')

                # Measure
                duration = page.evaluate("""
                    () => {
                        const start = performance.now();
                        $("#familyName").trigger("change");
                        const end = performance.now();
                        return end - start;
                    }
                """)
                durations.append(duration)
                print(f"Run {i+1}: {duration:.2f} ms")
                time.sleep(0.5)

            browser.close()

    finally:
        if server:
            server.terminate()
            server.wait()
            subprocess.run(f"lsof -ti:{PORT} | xargs kill -9 2>/dev/null || true", shell=True)

    if durations:
        avg = statistics.mean(durations)
        print(f"Average Benchmark Result: {avg:.2f} ms")
        return avg
    return None

if __name__ == "__main__":
    run_benchmark()
