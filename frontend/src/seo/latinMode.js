/**
 * Latin-script mirror (/lat/...): transliterates the rendered DOM.
 *
 * Started once from main.jsx when the page loads under /lat. A MutationObserver
 * watches the whole document and transliterates:
 *  - text nodes (skipping <script>, <style>, <code>, <pre>, <textarea>,
 *    contenteditable and anything inside [data-no-translit]);
 *  - user-visible attributes: title, alt, placeholder, aria-label;
 *  - raw <a href="/..."> links that React Router did not already prefix,
 *    so navigation stays inside /lat (Router <Link>s get the prefix from the
 *    router basename).
 * Input values are never touched. Head tags (title/meta/JSON-LD) are produced
 * already in Latin by components/SEO.jsx.
 */

import { cyrToLat, hasCyrillic } from './transliterate.js';
import { LAT_PREFIX } from './site.js';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'NOSCRIPT']);
const ATTRS = ['title', 'alt', 'placeholder', 'aria-label'];

function isSkipped(el) {
  for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
    if (SKIP_TAGS.has(node.tagName)) return true;
    if (node.hasAttribute('data-no-translit')) return true;
    if (node.isContentEditable) return true;
  }
  return false;
}

function fixText(node) {
  const value = node.nodeValue;
  if (!hasCyrillic(value)) return;
  if (node.parentElement && isSkipped(node.parentElement)) return;
  node.nodeValue = cyrToLat(value);
}

function shouldPrefixHref(href) {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return false;
  if (href === LAT_PREFIX || href.startsWith(`${LAT_PREFIX}/`) || href.startsWith(`${LAT_PREFIX}?`) || href.startsWith(`${LAT_PREFIX}#`)) return false;
  // Static files (/og-image.png, /data/x.json …) keep their path.
  const pathOnly = href.split(/[?#]/)[0];
  if (/\.[a-z0-9]{2,5}$/i.test(pathOnly)) return false;
  return true;
}

function fixElement(el) {
  if (isSkipped(el)) return;
  for (const attr of ATTRS) {
    const v = el.getAttribute(attr);
    if (v && hasCyrillic(v)) el.setAttribute(attr, cyrToLat(v));
  }
  if (el.tagName === 'A' && !el.hasAttribute('data-script-switch')) {
    const href = el.getAttribute('href');
    if (shouldPrefixHref(href)) el.setAttribute('href', href === '/' ? LAT_PREFIX : `${LAT_PREFIX}${href}`);
  }
}

function walk(root) {
  if (root.nodeType === 3) {
    fixText(root);
    return;
  }
  if (root.nodeType !== 1) return;
  if (isSkipped(root)) return;
  fixElement(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === 1 && (SKIP_TAGS.has(node.tagName) || node.hasAttribute('data-no-translit'))) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === 3) fixText(node);
    else fixElement(node);
  }
}

let started = false;

export function startLatinMode() {
  if (started || typeof document === 'undefined') return;
  started = true;
  document.documentElement.setAttribute('lang', 'sr-Latn');

  // The <title> lives in <head>; the body holds the app, portals and toasts.
  walk(document.body);
  const titleEl = document.querySelector('title');
  if (titleEl) walk(titleEl);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') {
        fixText(m.target);
      } else if (m.type === 'attributes') {
        if (m.target.nodeType === 1) fixElement(m.target);
      } else {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.tagName === 'TITLE') n.firstChild && fixText(n.firstChild);
          else walk(n);
        });
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRS, 'href'],
  });
}
