import { useEffect } from 'react';

interface SeoOptions {
  /** Page title — appended with " | URA" unless it already ends with URA. */
  title?: string;
  description?: string;
  /** Absolute image URL for social previews. */
  image?: string;
  /** Absolute canonical URL for this page. */
  url?: string;
  type?: 'website' | 'product' | 'article' | 'profile';
}

const SITE = 'https://www.ura.com.ng';
const DEFAULT_IMAGE = `${SITE}/images/newurahero.jpeg`;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets per-page SEO tags (title, description, Open Graph, Twitter, canonical)
 * on mount and restores the document title on unmount. Because the app is a
 * client-rendered SPA, this updates the live <head> — Google renders JS and
 * reads the updated tags, so each page can rank with its own title/description.
 */
export function useSeo({ title, description, image, url, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title;

    const fullTitle = title
      ? /URA/i.test(title)
        ? title
        : `${title} | URA`
      : document.title;
    document.title = fullTitle;

    const img = image || DEFAULT_IMAGE;
    const canonical = url || window.location.href.split('?')[0];

    if (description) upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', fullTitle);
    if (description) upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('name', 'twitter:title', fullTitle);
    if (description) upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', img);
    upsertCanonical(canonical);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, url, type]);
}
