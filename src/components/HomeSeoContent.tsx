const FAQS = [
  {
    question: 'Is YapTier free to use?',
    answer:
      'Yes. YapTier is a free, open-source tier list maker with no ads, no account and no tracking.',
  },
  {
    question: 'Do I need an account to create a tier list?',
    answer:
      'No account is required. Your board is saved in your browser, so you can return to it later on the same device.',
  },
  {
    question: 'Can I export a tier list as an image?',
    answer:
      'Yes. Export your finished board as a PNG image at 2× scale, or save it as a JSON file so you can import and edit it later.',
  },
  {
    question: 'What can I rank in a tier list?',
    answer:
      'You can rank almost anything: games, anime, movies, music, food, sports teams, characters, products or your own custom categories.',
  },
] as const;

export function HomeSeoContent() {
  return (
    <section className="seo-content" aria-labelledby="tier-list-maker-heading">
      <div className="seo-inner">
        <h2 id="tier-list-maker-heading">
          Free online tier list maker for games, anime, movies and music
        </h2>
        <p>
          YapTier is a free tier list maker that runs entirely in your browser. Create a
          tier list for anything you want to rank — video games, anime characters, movies,
          albums, food, sports teams or your own custom categories. Drag items into S, A,
          B, C and D tiers, upload your own images, search open icon sets or add text
          items. There is no sign-up, no ads and no tracking.
        </p>

        <h3>Create a tier list in four steps</h3>
        <ol className="seo-steps">
          <li>Open the editor and give your list a title.</li>
          <li>Upload images, search icons or add text items to the collection.</li>
          <li>Drag each item into the tier that fits best.</li>
          <li>Export your finished tier list as a PNG image or JSON file.</li>
        </ol>

        <h3>Popular tier list makers</h3>
        <ul className="seo-link-grid">
          <li>
            <a href="/gaming-tier-list-maker">Gaming tier list maker</a>
            <span>Rank games, characters, weapons and consoles.</span>
          </li>
          <li>
            <a href="/anime-tier-list-maker">Anime tier list maker</a>
            <span>Sort series, characters, arcs and openings.</span>
          </li>
          <li>
            <a href="/movie-tier-list-maker">Movie tier list maker</a>
            <span>Compare films, franchises, genres and performances.</span>
          </li>
          <li>
            <a href="/music-tier-list-maker">Music tier list maker</a>
            <span>Rank albums, songs, artists and genres.</span>
          </li>
          <li>
            <a href="/how-to-make-a-tier-list">How to make a tier list</a>
            <span>A step-by-step guide to S–D tiers and fair rankings.</span>
          </li>
        </ul>

        <h3>Why use YapTier?</h3>
        <ul className="seo-benefits">
          <li>Free and open-source, with no account required.</li>
          <li>Drag-and-drop S–D tiers with custom names and colors.</li>
          <li>Upload PNG, JPG or WebP images, or search open icons.</li>
          <li>Auto-save in your browser and export to PNG or JSON.</li>
          <li>Works on desktop, tablet and mobile.</li>
        </ul>

        <h3>Tier list FAQ</h3>
        <div className="seo-faq">
          {FAQS.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        <p className="seo-more">
          Learn more <a href="/about">about YapTier</a> or read the{' '}
          <a href="/privacy">privacy policy</a>.
        </p>
      </div>
    </section>
  );
}
