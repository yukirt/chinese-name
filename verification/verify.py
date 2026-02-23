from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto("http://localhost:3000")

        # Type family name
        page.fill("#familyName", "陳")
        # Trigger change event
        page.evaluate("$('#familyName').trigger('change')")

        # Wait for options
        time.sleep(1)

        # Select an option
        options = page.eval_on_selector_all("#combination option", "opts => opts.map(o => o.value)")
        if len(options) > 1:
            val = options[1]
            page.select_option("#combination", val)
            page.evaluate("$('#combination').trigger('change')")
            time.sleep(2)

        page.screenshot(path="verification/screenshot.png")
        browser.close()

if __name__ == "__main__":
    run()
