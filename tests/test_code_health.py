import unittest
import os

class TestCodeHealth(unittest.TestCase):
    def test_no_leftover_console_logs(self):
        filepath = "index.js"
        if not os.path.exists(filepath):
            self.fail(f"{filepath} not found")

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # We want to ensure these specific console.log calls are gone
        self.assertNotIn("console.log(results);", content)
        self.assertNotIn("console.log(familyName);", content)
        self.assertNotIn("console.log($chineseCharacters[key]);", content)
        self.assertNotIn("console.log($chineseCharacters[key].chars.indexOf(familyName));", content)

if __name__ == '__main__':
    unittest.main()
