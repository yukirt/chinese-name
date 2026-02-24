import unittest
from html.parser import HTMLParser
import os

class SecurityParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.insecure_links = []
        self.missing_rel_links = []
        self.protocol_relative_scripts = []
        self.javascript_void_links = []
        # Domains allowed to be HTTP because they don't support HTTPS
        self.allowed_http_domains = [
            'www.ivantsoi.com',
            'www.131.com.tw',
            'www.chaostec.com',
            'numerologys.net'
        ]

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a':
            href = attrs_dict.get('href', '')
            target = attrs_dict.get('target', '')
            rel = attrs_dict.get('rel', '')

            if href.startswith('http://'):
                is_allowed = any(domain in href for domain in self.allowed_http_domains)
                if not is_allowed:
                    self.insecure_links.append(href)

            if target == '_blank':
                if rel != 'noopener noreferrer':
                    self.missing_rel_links.append(href)

            if 'javascript:void(0)' in href:
                self.javascript_void_links.append(href)

        if tag == 'script':
            src = attrs_dict.get('src', '')
            if src.startswith('//'):
                self.protocol_relative_scripts.append(src)
            elif src.startswith('http://'):
                self.protocol_relative_scripts.append(src)

class TestSecurity(unittest.TestCase):
    def test_security_attributes(self):
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()

        parser = SecurityParser()
        parser.feed(html_content)

        with self.subTest("Insecure links"):
            self.assertEqual(len(parser.insecure_links), 0, f"Found insecure HTTP links (not in allowlist): {parser.insecure_links}")

        with self.subTest("Missing rel attribute"):
            self.assertEqual(len(parser.missing_rel_links), 0, f"Found links missing rel='noopener noreferrer': {parser.missing_rel_links}")

        with self.subTest("Insecure or Protocol-relative scripts"):
            self.assertEqual(len(parser.protocol_relative_scripts), 0, f"Found insecure or protocol-relative scripts: {parser.protocol_relative_scripts}")

        with self.subTest("Javascript void links"):
            self.assertEqual(len(parser.javascript_void_links), 0, f"Found links with javascript:void(0): {parser.javascript_void_links}")

if __name__ == '__main__':
    unittest.main()
