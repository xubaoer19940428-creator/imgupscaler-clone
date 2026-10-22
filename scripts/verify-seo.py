"""Verify built pages: python3 scripts/verify-seo.py BASE_URL SITE_ORIGIN [--indexable]."""

import concurrent.futures
import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse, parse_qs
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

BASE_URL, SITE_ORIGIN = (value.rstrip('/') for value in sys.argv[1:3])
INDEXABLE = '--indexable' in sys.argv[3:]
ROOT = Path(__file__).resolve().parents[1]
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({})) if urlparse(BASE_URL).hostname in ('localhost', '127.0.0.1', '::1') else urllib.request.build_opener()
LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'it', 'ru', 'ar', 'tr', 'nl']
PAGES = {'home': '', 'enhancer': '/enhancer', 'reimagine': '/reimagine', 'pricing': '/pricing',
         'account': '/account', 'privacy': '/privacy-policy', 'terms': '/terms', 'cookies': '/cookies'}


def path_for(locale, page):
    return (('' if locale == 'en' else '/' + locale) + page) or '/'


def language(locale):
    return 'zh-CN' if locale == 'zh' else locale


def expected_alternates(page):
    return {**{language(locale): SITE_ORIGIN + path_for(locale, page) for locale in LOCALES},
            'x-default': SITE_ORIGIN + (page or '/')}


def html_url(url):
    # Next's metadata serializer omits the optional slash on a bare origin.
    return SITE_ORIGIN if url == SITE_ORIGIN + '/' else url


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.html_attrs = {}
        self.meta = {}
        self.canonicals = []
        self.alternates = {}
        self.h1_count = 0
        self.title = ''
        self.in_title = False
        self.in_json = False
        self.json_text = ''
        self.schemas = []
        self.images = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.html_attrs = attrs
        elif tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content')
        elif tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs['href'])
        elif tag == 'link' and attrs.get('rel') == 'alternate' and 'hreflang' in attrs:
            assert attrs['hreflang'] not in self.alternates, 'Duplicate hreflang'
            self.alternates[attrs['hreflang']] = attrs['href']
        elif tag == 'h1':
            self.h1_count += 1
        elif tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_json = True
            self.json_text = ''
        elif tag == 'img':
            assert 'alt' in attrs, 'Image missing alt attribute'
            self.images.append(attrs)

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'script' and self.in_json:
            self.schemas.append(json.loads(self.json_text))
            self.in_json = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_json:
            self.json_text += data


def fetch(path):
    with OPENER.open(BASE_URL + path, timeout=25) as response:
        assert response.status == 200, (path, response.status)
        return response.read().decode()


def check_page(locale, page, suffix):
    path = path_for(locale, suffix)
    html = fetch(path)
    doc = Document(html)
    copy = json.loads((ROOT / f'messages/{locale}.json').read_text())['metadata'][page]
    canonical = html_url(SITE_ORIGIN + path)
    assert doc.html_attrs.get('lang') == language(locale), f'{path}: wrong SSR language'
    assert doc.html_attrs.get('dir') == ('rtl' if locale == 'ar' else 'ltr'), f'{path}: wrong direction'
    assert doc.title == copy['title'], f'{path}: wrong title'
    assert doc.meta.get('description') == copy['description'], f'{path}: wrong description'
    assert doc.canonicals == [canonical], f'{path}: wrong canonical'
    alternates = {key: html_url(url) for key, url in expected_alternates(suffix).items()} if page != 'account' else {}
    assert doc.alternates == alternates, f'{path}: wrong hreflang'
    assert ('noindex' not in doc.meta['robots']) == (INDEXABLE and page != 'account'), f'{path}: wrong index policy'
    assert doc.meta.get('og:url') == canonical, f'{path}: wrong Open Graph URL'
    assert doc.meta.get('og:title') == copy['title'], f'{path}: wrong Open Graph title'
    assert doc.meta.get('twitter:card') == 'summary_large_image', f'{path}: missing sharing metadata'
    if page != 'account':
        assert doc.h1_count == 1, f'{path}: expected one h1, got {doc.h1_count}'
    if INDEXABLE:
        assert any(schema.get('@type') == 'WebSite' and schema.get('inLanguage') == language(locale)
                   and schema.get('url') == SITE_ORIGIN + path_for(locale, '') for schema in doc.schemas), f'{path}: wrong website schema'
        graph = [node for schema in doc.schemas for node in schema.get('@graph', [])]
        webpages = [node for node in graph if node.get('@type') == 'WebPage']
        breadcrumbs = [node for node in graph if node.get('@type') == 'BreadcrumbList']
        if page == 'account':
            assert not webpages and not breadcrumbs, f'{path}: account should not advertise public page schema'
        else:
            assert len(webpages) == 1, f'{path}: expected one page schema'
            webpage = webpages[0]
            assert webpage['url'] == SITE_ORIGIN + path and webpage['name'] == copy['title']
            assert webpage['description'] == copy['description'] and webpage['inLanguage'] == language(locale)
            assert webpage['isPartOf']['@id'] == SITE_ORIGIN + path_for(locale, '') + '#website'
            if suffix:
                assert len(breadcrumbs) == 1, f'{path}: missing breadcrumb schema'
                items = breadcrumbs[0]['itemListElement']
                assert [(item['position'], item['item']) for item in items] == [(1, SITE_ORIGIN + path_for(locale, '')), (2, SITE_ORIGIN + path)]
            else:
                assert not breadcrumbs, f'{path}: homepage should not have a redundant breadcrumb'
    if locale != 'en':
        assert 'Choose image' not in html, f'{path}: English message payload leaked'
    assert 'XZSEPZX' not in html, f'{path}: legacy translation marker'
    images = set()
    for image in doc.images:
        src = image.get('src', '')
        parsed = urlparse(src)
        original = parse_qs(parsed.query).get('url', [parsed.path])[0]
        if original.startswith('/reference/'):
            assert parsed.path == '/_next/image' and image.get('srcset') and image.get('sizes'), f'{path}: marketing image is not responsive'
            assert image.get('width') and image.get('height'), f'{path}: image dimensions missing'
            images.add(SITE_ORIGIN + original)
    return path, images


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    futures = [pool.submit(check_page, locale, page, suffix)
               for locale in LOCALES for page, suffix in PAGES.items()]
    rendered_images = dict(future.result() for future in futures)
print(f'All {len(futures)} pages: HTTP 200, SSR language/direction, titles, descriptions, canonical, hreflang, headings and sharing metadata passed.')

sitemap = ET.fromstring(fetch('/sitemap.xml'))
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml', 'image': 'http://www.google.com/schemas/sitemap-image/1.1'}
entries = sitemap.findall('s:url', ns)
expected_urls = {SITE_ORIGIN + path_for(locale, suffix): expected_alternates(suffix)
                 for locale in LOCALES for page, suffix in PAGES.items() if page != 'account'} if INDEXABLE else {}
assert len(entries) == len(expected_urls), 'Wrong sitemap size'
for entry in entries:
    loc = entry.findtext('s:loc', namespaces=ns)
    assert loc in expected_urls, f'Unexpected sitemap URL: {loc}'
    links = {link.attrib['hreflang']: link.attrib['href'] for link in entry.findall('x:link', ns)}
    assert links == expected_urls[loc], f'{loc}: wrong sitemap alternates'
    images = {image.findtext('image:loc', namespaces=ns) for image in entry.findall('image:image', ns)}
    assert images == rendered_images[urlparse(loc).path or '/'], f'{loc}: image sitemap differs from page images'
    del expected_urls[loc]
assert not expected_urls, 'Missing sitemap URLs'
robots = fetch('/robots.txt')
if INDEXABLE:
    assert 'Allow: /' in robots and 'Sitemap: ' + SITE_ORIGIN + '/sitemap.xml' in robots
else:
    assert 'Disallow: /' in robots and 'Sitemap:' not in robots
print(f'Sitemap: {len(entries)} canonical public URLs, reciprocal alternates and robots policy passed.')
for image in {url for urls in rendered_images.values() for url in urls}:
    request = urllib.request.Request(BASE_URL + urlparse(image).path, method='HEAD')
    with OPENER.open(request, timeout=25) as response:
        assert response.status == 200 and response.headers.get_content_type().startswith('image/'), f'{image}: invalid image response'
print('Responsive marketing images and sitemap image URLs passed.')

for path in ['/xx', '/en', '/ja/does-not-exist']:
    try:
        fetch(path)
    except urllib.error.HTTPError as error:
        assert error.code == 404, f'{path}: expected 404, got {error.code}'
    else:
        raise AssertionError(f'{path}: should return 404')
print('Unsupported locales and unknown pages correctly return HTTP 404.')
