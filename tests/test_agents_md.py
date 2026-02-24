import os
import unittest

class TestAgentsMd(unittest.TestCase):
    def test_agents_md_exists(self):
        self.assertTrue(os.path.exists("AGENTS.md"), "AGENTS.md file is missing")

    def test_agents_md_content(self):
        if not os.path.exists("AGENTS.md"):
            self.fail("AGENTS.md file is missing, cannot check content")

        with open("AGENTS.md", "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("核心原則 (Core Principles)", content)
            self.assertIn("TDD (測試驅動開發)", content)
            self.assertIn("Git 規範 (Git Standards)", content)

if __name__ == '__main__':
    unittest.main()
