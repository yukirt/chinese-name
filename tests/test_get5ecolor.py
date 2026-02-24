import unittest
from playwright.sync_api import sync_playwright
import time
import os

class TestGet5EColor(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.page = cls.browser.new_page()

        # Instead of loading index.html which depends on external jQuery,
        # we load index.js directly and mock jQuery.
        with open("index.js", "r", encoding="utf-8") as f:
            js_content = f.read()

        # Mock jQuery to avoid errors when index.js is executed
        cls.page.goto("about:blank")
        cls.page.evaluate("window.$ = function(fn) { if (typeof fn === 'function') fn(); return window.$; }; window.$.on = function() { return window.$; };")
        cls.page.add_script_tag(content=js_content)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_get5ecolor_wood(self):
        # 木: "木", 1, 2
        for val in ["木", 1, 2]:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, "<b style='color:green'>(木)</b>", f"Failed for {val}")

    def test_get5ecolor_fire(self):
        # 火: "火", 3, 4
        for val in ["火", 3, 4]:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, "<b style='color:red'>(火)</b>", f"Failed for {val}")

    def test_get5ecolor_earth(self):
        # 土: "土", 5, 6
        for val in ["土", 5, 6]:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, "<b style='color:brown'>(土)</b>", f"Failed for {val}")

    def test_get5ecolor_metal(self):
        # 金: "金", 7, 8
        for val in ["金", 7, 8]:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, "<b style='color:gold'>(金)</b>", f"Failed for {val}")

    def test_get5ecolor_water(self):
        # 水: "水", 0, 9
        for val in ["水", 0, 9]:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, "<b style='color:blue'>(水)</b>", f"Failed for {val}")

    def test_get5ecolor_string_numbers(self):
        # Test string numbers - ensuring the function handles string inputs
        cases = [
            ("1", "<b style='color:green'>(木)</b>"),
            ("3", "<b style='color:red'>(火)</b>"),
            ("5", "<b style='color:brown'>(土)</b>"),
            ("7", "<b style='color:gold'>(金)</b>"),
            ("0", "<b style='color:blue'>(水)</b>"),
        ]
        for val, expected in cases:
            result = self.page.evaluate(f"get5EColor({repr(val)})")
            self.assertEqual(result, expected, f"Failed for string input {val}")

if __name__ == "__main__":
    unittest.main()
