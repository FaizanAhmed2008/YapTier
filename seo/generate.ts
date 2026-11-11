import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  FEEDBACK_EMAIL,
  GITHUB_URL,
  LAST_UPDATED,
  LOGO_IMAGE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  pageBySlug,
  pages,
} from './pages.ts';
import type { SeoPage } from './pages.ts';

const PRIMARY_NAV = [
  { slug: '', label: 'Tier list maker' },
  { slug: 'gaming-tier-list-maker', label: 'Gaming' },
  { slug: 'anime-tier-list-maker', label: 'Anime' },
  { slug: 'movie-tier-list-maker', label: 'Movies' },
  { slug: 'music-tier-list-maker', label: 'Music' },
  { slug: 'how-to-make-a-tier-list', label: 'How to' },
] as const;

const RELATED_PAGES = [
  'gaming-tier-list-maker',
  'anime-tier-list-maker',
  'movie-tier-list-maker',
  'music-tier-list-maker',
  'how-to-make-a-tier-list',
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

function absoluteUrl(slug: string): string {
  return `${SITE_URL}/${slug}`;
}

function navHref(slug: string): string {
  return slug ? `/${slug}` : '/';
}

function renderHeader(activeSlug: string): string {
  const links = PRIMARY_NAV.map((item) => {
    const current = item.slug === activeSlug ? ' aria-current="page"' : '';
    return `<a href="${navHref(item.slug)}"${current}>${escapeHtml(item.label)}</a>`;
  }).join('');

  return `<header class="site-header">
  <a class="brand" href="/" aria-label="YapTier home">
    <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
    <span class="brand-name">Yap<span>Tier</span></span>
  </a>
  <nav class="site-nav" aria-label="Primary">${links}</nav>
</header>`;
}

function renderFooter(): string {
  const makerLinks = RELATED_PAGES.slice(0, 4)
    .map((slug) => {
      const page = pageBySlug.get(slug);
      return page ? `<li><a href="/${page.slug}">${escapeHtml(page.h1)}</a></li>` : '';
    })
    .join('');

  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a class="footer-logo" href="/">Yap<span>Tier</span></a>
      <p>Rank everything. Yap about anything. Free, open source and ad-free.</p>
    </div>
    <nav class="footer-nav" aria-label="Tier list makers">
      <h2>Tier list makers</h2>
      <ul>${makerLinks}</ul>
    </nav>
    <nav class="footer-nav" aria-label="Project">
      <h2>Project</h2>
      <ul>
        <li><a href="/how-to-make-a-tier-list">How to make a tier list</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/privacy">Privacy</a></li>
        <li><a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        <li><a href="mailto:${FEEDBACK_EMAIL}">Feedback</a></li>
      </ul>
    </nav>
  </div>
  <p class="footer-copy">© ${new Date().getFullYear()} YapTier. Open source, ad-free and free to use.</p>
</footer>`;
}

function renderBreadcrumbs(page: SeoPage): string {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li aria-current="page">${escapeHtml(page.h1)}</li>
  </ol>
</nav>`;
}

function renderSections(page: SeoPage): string {
  return page.sections
    .map((section) => {
      const list = section.bullets?.length
        ? `<${section.ordered ? 'ol' : 'ul'}>${section.bullets
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</${section.ordered ? 'ol' : 'ul'}>`
        : '';

      return `<section>
  <h2>${escapeHtml(section.heading)}</h2>
  ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n  ')}
  ${list}
</section>`;
    })
    .join('\n');
}

function renderExampleTiers(page: SeoPage): string {
  if (!page.exampleTiers?.length) {
    return '';
  }

  const title = page.exampleTitle ?? 'Example tier list';
  const rows = page.exampleTiers
    .map(
      (tier) => `<tr>
  <th scope="row" style="background:${escapeHtml(tier.color)}">${escapeHtml(tier.label)}</th>
  <td>${tier.items.map((item) => `<span class="tier-chip">${escapeHtml(item)}</span>`).join('')}</td>
</tr>`,
    )
    .join('\n');

  return `<section class="sample-tier-section" aria-labelledby="sample-tier-heading">
  <h2 id="sample-tier-heading">${escapeHtml(title)}</h2>
  <p>This sample shows how a finished tier list can look. Your own ranking can be completely different — that is the point of making one.</p>
  <table class="sample-tier-table">
    <caption class="visually-hidden">${escapeHtml(title)}</caption>
    <tbody>
      ${rows}
    </tbody>
  </table>
</section>`;
}

function renderFaqs(page: SeoPage): string {
  if (!page.faqs.length) {
    return '';
  }

  return `<section class="faq-section" aria-labelledby="faq-heading">
  <h2 id="faq-heading">Frequently asked questions</h2>
  ${page.faqs
    .map(
      (faq) => `<details>
    <summary>${escapeHtml(faq.question)}</summary>
    <p>${escapeHtml(faq.answer)}</p>
  </details>`,
    )
    .join('\n  ')}
</section>`;
}

function renderRelated(page: SeoPage): string {
  const related = page.related
    .filter((slug) => slug !== page.slug)
    .map((slug) => pageBySlug.get(slug))
    .filter((item): item is SeoPage => Boolean(item));

  if (related.length === 0) {
    return '';
  }

  return `<section class="related" aria-labelledby="related-heading">
  <h2 id="related-heading">Related tier list pages</h2>
  <ul class="related-grid">
    ${related
      .map(
        (item) =>
          `<li><a href="/${item.slug}"><strong>${escapeHtml(item.h1)}</strong><span>${escapeHtml(
            item.description,
          )}</span></a></li>`,
      )
      .join('\n    ')}
  </ul>
</section>`;
}

function renderSidebar(page: SeoPage): string {
  const popular = RELATED_PAGES.map((slug) => pageBySlug.get(slug))
    .filter((item): item is SeoPage => Boolean(item))
    .filter((item) => item.slug !== page.slug)
    .slice(0, 4);

  return `<aside class="sidebar">
  <section class="card">
    <h2>Start ranking</h2>
    <p>Open the free editor and build your own tier list in your browser. No account, ads or tracking.</p>
    <a class="button button-primary" href="/">Open the tier list maker</a>
  </section>
  <section class="card">
    <h2>Popular pages</h2>
    <ul>
      ${popular.map((item) => `<li><a href="/${item.slug}">${escapeHtml(item.h1)}</a></li>`).join('\n      ')}
    </ul>
  </section>
</aside>`;
}

function renderSchema(page: SeoPage, canonical: string): string {
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_IMAGE,
        width: 180,
        height: 180,
      },
      sameAs: [GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description:
        'Free open-source online tier list maker. Drag and drop items into S, A, B, C and D tiers, upload images, search open icons, add text items and export as PNG or JSON.',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      screenshot: OG_IMAGE,
    },
    {
      '@type':
        page.kind === 'about'
          ? 'AboutPage'
          : page.kind === 'privacy'
            ? 'PrivacyPolicy'
            : 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about:
        page.kind === 'about' || page.kind === 'privacy'
          ? { '@id': `${SITE_URL}/#organization` }
          : { '@id': `${SITE_URL}/#webapp` },
      ...(page.kind === 'about'
        ? { mainEntity: { '@id': `${SITE_URL}/#organization` } }
        : {}),
      inLanguage: 'en',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: OG_IMAGE,
        width: 1200,
        height: 630,
      },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.h1,
          item: canonical,
        },
      ],
    },
  ];

  if (page.kind === 'howto' && page.howToSteps?.length) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${canonical}#howto`,
      name: page.h1,
      description: page.description,
      step: page.howToSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step,
        text: step,
      })),
    });
  }

  if (page.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );

  return `<script type="application/ld+json">${json}</script>`;
}

function renderPage(page: SeoPage): string {
  const canonical = absoluteUrl(page.slug);
  const ogType = page.kind === 'maker' ? 'website' : 'article';
  const imageAlt = 'YapTier tier list maker with S, A, B, C and D tier rows';
  const secondaryAction =
    page.kind === 'howto'
      ? { href: '/gaming-tier-list-maker', label: 'Browse tier list makers' }
      : { href: '/how-to-make-a-tier-list', label: 'How it works' };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="theme-color" content="#08090f" />
  <meta name="application-name" content="${SITE_NAME}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="x-default" href="${canonical}" />

  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${escapeHtml(page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${imageAlt}" />
  <meta property="og:locale" content="en_US" />
  ${page.kind !== 'maker' ? `<meta property="article:modified_time" content="${page.updated}T00:00:00+00:00" />` : ''}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.title)}" />
  <meta name="twitter:description" content="${escapeHtml(page.description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="twitter:image:alt" content="${imageAlt}" />

  <link rel="stylesheet" href="/seo.css" />
  ${renderSchema(page, canonical)}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderHeader(page.slug)}
  <main id="main-content" class="page">
    ${renderBreadcrumbs(page)}
    <section class="hero">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lede">${escapeHtml(page.intro)}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="/">Open the tier list maker</a>
        <a class="button button-secondary" href="${secondaryAction.href}">${secondaryAction.label}</a>
      </div>
    </section>
    <div class="page-grid">
      <article class="prose">
        ${renderSections(page)}
        ${renderExampleTiers(page)}
        ${renderFaqs(page)}
      </article>
      ${renderSidebar(page)}
    </div>
    ${renderRelated(page)}
  </main>
  ${renderFooter()}
</body>
</html>
`;
}

function renderNotFound(): string {
  const popular = RELATED_PAGES.map((slug) => pageBySlug.get(slug))
    .filter((item): item is SeoPage => Boolean(item))
    .slice(0, 5);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page not found — YapTier</title>
  <meta name="description" content="The page you requested could not be found. Return to the YapTier tier list maker." />
  <meta name="robots" content="noindex, follow" />
  <meta name="theme-color" content="#08090f" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="stylesheet" href="/seo.css" />
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderHeader('404')}
  <main id="main-content" class="page not-found">
    <p class="eyebrow">404</p>
    <h1>Page not found</h1>
    <p class="lede">The page you requested does not exist or has moved. Use the links below to get back to the tier list maker.</p>
    <div class="hero-actions">
      <a class="button button-primary" href="/">Open the tier list maker</a>
      <a class="button button-secondary" href="/how-to-make-a-tier-list">How to make a tier list</a>
    </div>
    <section class="related" aria-labelledby="related-heading">
      <h2 id="related-heading">Popular pages</h2>
      <ul class="related-grid">
        ${popular
          .map(
            (page) =>
              `<li><a href="/${page.slug}"><strong>${escapeHtml(page.h1)}</strong><span>${escapeHtml(
                page.description,
              )}</span></a></li>`,
          )
          .join('\n        ')}
      </ul>
    </section>
  </main>
  ${renderFooter()}
</body>
</html>
`;
}

function renderSitemap(): string {
  const entries = [
    {
      loc: `${SITE_URL}/`,
      lastmod: LAST_UPDATED,
      changefreq: 'weekly',
      priority: '1.0',
    },
    ...pages.map((page) => ({
      loc: absoluteUrl(page.slug),
      lastmod: page.updated,
      changefreq:
        page.kind === 'maker'
          ? 'weekly'
          : page.kind === 'howto'
            ? 'monthly'
            : page.kind === 'about'
              ? 'monthly'
              : 'yearly',
      priority:
        page.kind === 'maker'
          ? '0.8'
          : page.kind === 'howto'
            ? '0.7'
            : page.kind === 'about'
              ? '0.5'
              : '0.3',
    })),
  ];

  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderRobots(): string {
  return `User-agent: *
Allow: /

# Keep error, private and duplicate URLs out of search results.
Disallow: /404
Disallow: /404.html
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /index.html
Disallow: /*?utm_
Disallow: /*?ref=
Disallow: /*?fbclid=

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export function generateSeoFiles(): Map<string, string> {
  const files = new Map<string, string>();

  for (const page of pages) {
    files.set(`${page.slug}.html`, renderPage(page));
  }

  files.set('sitemap.xml', renderSitemap());
  files.set('robots.txt', renderRobots());
  files.set('404.html', renderNotFound());

  return files;
}

export function writeSeoFiles(outDir: string): void {
  for (const [fileName, content] of generateSeoFiles()) {
    const filePath = join(outDir, fileName);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content, 'utf8');
  }
}
