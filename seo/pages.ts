export const SITE_URL = 'https://yap-tier.vercel.app';
export const SITE_NAME = 'YapTier';
export const GITHUB_URL = 'https://github.com/FaizanAhmed2008/YapTier';
export const FEEDBACK_EMAIL = 'root.ahmed.127.0.0.1@gmail.com';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const LOGO_IMAGE = `${SITE_URL}/apple-touch-icon.png`;
export const LAST_UPDATED = '2026-11-11';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PageSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: boolean;
}

export interface ExampleTier {
  label: string;
  color: string;
  items: string[];
}

export type PageKind = 'maker' | 'howto' | 'about' | 'privacy';

export interface SeoPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  kind: PageKind;
  sections: PageSection[];
  exampleTiers?: ExampleTier[];
  exampleTitle?: string;
  faqs: FaqItem[];
  related: string[];
  howToSteps?: string[];
  updated: string;
}

const makerRelated = [
  'gaming-tier-list-maker',
  'anime-tier-list-maker',
  'movie-tier-list-maker',
  'music-tier-list-maker',
  'how-to-make-a-tier-list',
];

export const pages: SeoPage[] = [
  {
    slug: 'gaming-tier-list-maker',
    title: 'Gaming Tier List Maker — Rank Games & Characters Free | YapTier',
    description:
      'Create a gaming tier list online for free. Rank games, characters, weapons and consoles with drag-and-drop S–D tiers, custom images and PNG export. No sign-up.',
    h1: 'Gaming Tier List Maker',
    eyebrow: 'Games, characters and gear',
    intro:
      'Rank the games you love, the characters you main and the gear you swear by. YapTier is a free gaming tier list maker that runs in your browser, so you can build a ranking in minutes and export it as a clean PNG image.',
    kind: 'maker',
    sections: [
      {
        heading: 'Rank games, characters, weapons and consoles',
        paragraphs: [
          'A gaming tier list is a quick way to compare everything from all-time favourite games to the best weapons in a single title. Drag each item into S, A, B, C or D, then reorder items inside a tier until the ranking feels right.',
          'Because YapTier works entirely on your device, you can upload game screenshots, cover art or character portraits without creating an account. You can also search open icon collections for controllers, consoles, genres and other gaming symbols.',
        ],
        bullets: [
          'Best games of all time or best games of the year',
          'Favourite characters, bosses, weapons and maps',
          'Console generations, controllers and accessories',
          'Game genres, difficulty levels and replay value',
          'Mobile games, indie games and co-op favourites',
        ],
      },
      {
        heading: 'How to make a gaming tier list',
        paragraphs: [
          'Start with a clear category, then add only the games or characters you actually want to compare. A focused list is easier to rank and more useful to share with friends.',
        ],
        bullets: [
          'Open YapTier and choose New List.',
          'Upload cover art or screenshots, search icons, or add text items for each game.',
          'Drag every item into the tier where it belongs.',
          'Rename tiers and change tier colors to match your ranking style.',
          'Export the finished board as a PNG image or save the JSON file for later.',
        ],
        ordered: true,
      },
      {
        heading: 'Gaming tier list ideas',
        paragraphs: [
          'Not sure what to rank first? These prompts make it easy to start a conversation with friends or your community.',
        ],
        bullets: [
          'Every mainline entry in a long-running series, ranked from best to worst.',
          'The best and worst maps in your favourite multiplayer game.',
          'Starter Pokémon, classes, heroes or factions ranked by fun and power.',
          'Games you would replay, games you would recommend and games you would skip.',
          'The most iconic video game soundtracks or boss fights.',
        ],
      },
      {
        heading: 'Tips for a fair gaming ranking',
        paragraphs: [
          'Write down the criteria before you start. Are you ranking nostalgia, story, gameplay, replay value or competitive strength? A tier list is more convincing when the rules are clear.',
          'Do not feel pressured to fill every tier. Empty tiers are valid, and moving an item later is as easy as dragging it to a new row. If you change your mind, use undo and redo to compare versions.',
        ],
      },
    ],
    exampleTiers: [
      {
        label: 'S',
        color: '#ff7f7f',
        items: ['Elden Ring', 'Baldur’s Gate 3', 'Hades'],
      },
      {
        label: 'A',
        color: '#ffbf7f',
        items: ['Hollow Knight', 'Stardew Valley', 'Halo 3'],
      },
      {
        label: 'B',
        color: '#ffdf7f',
        items: ['Minecraft', 'Skyrim', 'Overwatch 2'],
      },
      {
        label: 'C',
        color: '#bfff7f',
        items: ['Sonic Frontiers', 'Anthem', 'Duke Nukem Forever'],
      },
      {
        label: 'D',
        color: '#7fbfff',
        items: ['Your least favourite game', 'A game you bounced off', 'A meme pick'],
      },
    ],
    exampleTitle: 'Example gaming tier list',
    faqs: [
      {
        question: 'Is YapTier free to use?',
        answer:
          'Yes. YapTier is free, open source and ad-free. You can create and export gaming tier lists without a subscription or account.',
      },
      {
        question: 'Do I need an account to make a gaming tier list?',
        answer:
          'No account is required. Your board is saved in your browser so you can come back to it later on the same device.',
      },
      {
        question: 'Can I upload game screenshots and cover art?',
        answer:
          'Yes. You can upload PNG, JPG and WebP images up to 5 MB each. You can also search open icon collections or add text items if you prefer not to upload files.',
      },
      {
        question: 'Can I export a gaming tier list as an image?',
        answer:
          'Yes. Export your finished board as a PNG image at 2× scale, or save it as a JSON file so you can import and edit it later.',
      },
    ],
    related: makerRelated.filter((slug) => slug !== 'gaming-tier-list-maker'),
    updated: LAST_UPDATED,
  },
  {
    slug: 'anime-tier-list-maker',
    title: 'Anime Tier List Maker — Rank Anime & Characters Free | YapTier',
    description:
      'Make an anime tier list for free. Rank series, characters, arcs and openings with drag-and-drop S–D tiers, custom images and PNG export. No account needed.',
    h1: 'Anime Tier List Maker',
    eyebrow: 'Series, characters and arcs',
    intro:
      'Build an anime ranking that actually matches your taste. YapTier lets you sort series, characters, story arcs and openings into S–D tiers, then export the result as a shareable PNG image.',
    kind: 'maker',
    sections: [
      {
        heading: 'Rank anime series, characters, arcs and openings',
        paragraphs: [
          'Anime rankings are personal, so start with the category that matters most to you. You might compare entire series, rank the best arcs inside one show, or decide which openings you never skip.',
          'Add anime posters, screenshots or character art from your device, or use text items when you want a clean, fast list. Drag items between tiers and reorder them within a tier until the order feels right.',
        ],
        bullets: [
          'Best anime series by genre or season',
          'Favourite protagonists, villains and supporting characters',
          'Story arcs ranked from best to most frustrating',
          'Openings, endings and soundtracks',
          'Studio filmographies and adaptation quality',
        ],
      },
      {
        heading: 'How to build an anime tier list',
        paragraphs: [
          'Keep the list focused. Ranking 100 series at once is possible, but a shorter list usually produces a more useful result.',
        ],
        bullets: [
          'Create a new list and add the anime, characters or arcs you want to compare.',
          'Drag each item into S, A, B, C or D.',
          'Rename the tiers if you want labels such as Masterpiece, Great, Good or Dropped.',
          'Use tier colors to separate genres or seasons.',
          'Export the board as a PNG image or save the JSON file for later edits.',
        ],
        ordered: true,
      },
      {
        heading: 'Anime tier list ideas',
        paragraphs: [
          'These prompts work well for a solo ranking, a watch-party debate or a community post.',
        ],
        bullets: [
          'Every season of a long-running shonen series, ranked.',
          'The best anime of the decade, with one pick per year.',
          'Sub versus dub for your favourite shows.',
          'Studio rankings based on animation, storytelling and consistency.',
          'Anime you would recommend to someone who has never watched anime.',
        ],
      },
      {
        heading: 'Tips for a fair anime ranking',
        paragraphs: [
          'Separate personal enjoyment from objective quality. A show can be flawed and still be your favourite, and that is a perfectly valid ranking criterion.',
          'If you are ranking with friends, agree on the criteria first. Otherwise one person may be ranking animation while another is ranking story, and the list becomes difficult to compare.',
        ],
      },
    ],
    exampleTiers: [
      {
        label: 'S',
        color: '#ff7f7f',
        items: [
          'Fullmetal Alchemist: Brotherhood',
          'Attack on Titan',
          'Steins;Gate',
        ],
      },
      {
        label: 'A',
        color: '#ffbf7f',
        items: ['Demon Slayer', 'Jujutsu Kaisen', 'One Punch Man'],
      },
      {
        label: 'B',
        color: '#ffdf7f',
        items: ['My Hero Academia', 'Spy × Family', 'Chainsaw Man'],
      },
      {
        label: 'C',
        color: '#bfff7f',
        items: ['A guilty pleasure', 'A slow starter', 'A divisive sequel'],
      },
      {
        label: 'D',
        color: '#7fbfff',
        items: ['A show you dropped', 'A disappointing ending', 'A meme pick'],
      },
    ],
    exampleTitle: 'Example anime tier list',
    faqs: [
      {
        question: 'Can I rank anime characters instead of series?',
        answer:
          'Yes. Use the same board to rank protagonists, villains, supporting cast members or any other character category. Upload portraits or use text items for each character.',
      },
      {
        question: 'Can I add anime screenshots or posters?',
        answer:
          'Yes. Upload PNG, JPG or WebP images from your device. YapTier stores them locally in your browser and includes them in PNG exports.',
      },
      {
        question: 'Is the anime tier list maker free?',
        answer:
          'Yes. YapTier is free to use, with no ads, no account and no tracking. The project is open source and community maintained.',
      },
      {
        question: 'Can I save an anime tier list and edit it later?',
        answer:
          'Yes. Your board auto-saves in your browser. You can also export a JSON file and import it later on another device.',
      },
    ],
    related: makerRelated.filter((slug) => slug !== 'anime-tier-list-maker'),
    updated: LAST_UPDATED,
  },
  {
    slug: 'movie-tier-list-maker',
    title: 'Movie Tier List Maker — Rank Films & Franchises Free | YapTier',
    description:
      'Create a movie tier list for free. Rank films, franchises, genres and actors with drag-and-drop S–D tiers, posters, custom images and PNG export. No sign-up.',
    h1: 'Movie Tier List Maker',
    eyebrow: 'Films, franchises and genres',
    intro:
      'Settle the debate over the best films, franchises and performances. YapTier is a free movie tier list maker with drag-and-drop tiers, custom images and a clean PNG export.',
    kind: 'maker',
    sections: [
      {
        heading: 'Rank films, franchises, genres and actors',
        paragraphs: [
          'A movie tier list can compare almost anything: the films of a director, every entry in a franchise, the best picture winners of a decade, or the performances of a favourite actor.',
          'Add posters and stills from your device, or keep it simple with text items. The board works on desktop, tablet and mobile, so you can rank films alone or with a group.',
        ],
        bullets: [
          'Best films of all time or best films of the year',
          'Franchises ranked from strongest to weakest entry',
          'Directors, actors and cinematographers',
          'Genres, comfort movies and guilty pleasures',
          'Oscar winners, cult classics and box-office flops',
        ],
      },
      {
        heading: 'How to make a movie tier list',
        paragraphs: [
          'Choose a clear theme before you add titles. A list called “best movies” is harder to rank than “best science-fiction movies of the 2010s”.',
        ],
        bullets: [
          'Open YapTier and start a new list.',
          'Add movie posters, stills or text items for each film.',
          'Drag each title into S, A, B, C or D.',
          'Rename tiers to match your ranking language.',
          'Export the finished board as a PNG image or JSON file.',
        ],
        ordered: true,
      },
      {
        heading: 'Movie tier list ideas',
        paragraphs: [
          'These formats are easy to explain and fun to compare with friends.',
        ],
        bullets: [
          'Every film from one director, ranked.',
          'Best picture winners from a single decade.',
          'Franchise entries, including the sequels everyone argues about.',
          'Movies that are better than the book, and movies that are not.',
          'Comfort movies ranked by rewatch value.',
        ],
      },
      {
        heading: 'Tips for a fair movie ranking',
        paragraphs: [
          'Decide whether you are ranking craft, entertainment or cultural impact. A film can be historically important without being your personal favourite.',
          'Use the undo and redo controls to test different orders. Moving a title to a new tier is instant, so you can compare two rankings before exporting the final version.',
        ],
      },
    ],
    exampleTiers: [
      {
        label: 'S',
        color: '#ff7f7f',
        items: ['The Godfather', 'The Shawshank Redemption', 'Parasite'],
      },
      {
        label: 'A',
        color: '#ffbf7f',
        items: ['Inception', 'The Dark Knight', 'Spirited Away'],
      },
      {
        label: 'B',
        color: '#ffdf7f',
        items: ['The Matrix', 'Mad Max: Fury Road', 'Arrival'],
      },
      {
        label: 'C',
        color: '#bfff7f',
        items: ['A fun blockbuster', 'A flawed sequel', 'A guilty pleasure'],
      },
      {
        label: 'D',
        color: '#7fbfff',
        items: ['A film you walked out of', 'A disappointing remake', 'A meme pick'],
      },
    ],
    exampleTitle: 'Example movie tier list',
    faqs: [
      {
        question: 'Can I rank movie franchises instead of individual films?',
        answer:
          'Yes. Add each franchise as a text item or use a poster for each one. The tier board works the same way regardless of what you are ranking.',
      },
      {
        question: 'Can I upload movie posters?',
        answer:
          'Yes. YapTier accepts PNG, JPG and WebP images up to 5 MB each. Uploaded images are stored locally in your browser.',
      },
      {
        question: 'Is the movie tier list maker free?',
        answer:
          'Yes. YapTier is free and open source, with no ads, no account and no tracking.',
      },
      {
        question: 'Can I export a movie tier list as an image?',
        answer:
          'Yes. Use Export PNG to download a high-resolution image of the finished board. You can also save the list as JSON for later editing.',
      },
    ],
    related: makerRelated.filter((slug) => slug !== 'movie-tier-list-maker'),
    updated: LAST_UPDATED,
  },
  {
    slug: 'music-tier-list-maker',
    title: 'Music Tier List Maker — Rank Albums, Songs & Artists | YapTier',
    description:
      'Make a music tier list for free. Rank albums, songs, artists and genres with drag-and-drop S–D tiers, cover art, custom images and PNG export. No account.',
    h1: 'Music Tier List Maker',
    eyebrow: 'Albums, songs and artists',
    intro:
      'Turn your music opinions into a clean ranking. YapTier is a free music tier list maker for albums, songs, artists and genres, with drag-and-drop tiers and PNG export.',
    kind: 'maker',
    sections: [
      {
        heading: 'Rank albums, songs, artists and genres',
        paragraphs: [
          'Music rankings can be as broad or as specific as you like. Compare a discography, rank the tracks on one album, or sort an entire genre into tiers.',
          'Add album covers from your device, search open icons for instruments and genres, or use text items for a fast list. Drag items into S–D tiers and reorder them until the ranking feels right.',
        ],
        bullets: [
          'Best albums of the year or of all time',
          'Every track on a favourite album',
          'Artists ranked by discography, live performance or influence',
          'Genres, subgenres and eras',
          'Soundtracks, mixtapes and one-hit wonders',
        ],
      },
      {
        heading: 'How to make a music tier list',
        paragraphs: [
          'A music tier list is most useful when the category is clear. “Best albums of the 2020s” is easier to rank than “best music”.',
        ],
        bullets: [
          'Start a new list in YapTier.',
          'Add album covers, artist photos or text items.',
          'Drag each entry into S, A, B, C or D.',
          'Rename tiers to match your criteria.',
          'Export the board as a PNG image or save the JSON file.',
        ],
        ordered: true,
      },
      {
        heading: 'Music tier list ideas',
        paragraphs: [
          'These prompts work for a personal ranking, a listening club or a social media post.',
        ],
        bullets: [
          'A complete discography ranked from best to most skippable.',
          'The tracks on one album, ranked by replay value.',
          'Artists who defined a decade.',
          'Albums that are better live, and albums that are better in headphones.',
          'One-hit wonders ranked by how often you still play them.',
        ],
      },
      {
        heading: 'Tips for a fair music ranking',
        paragraphs: [
          'Define your criteria before you start. Are you ranking songwriting, production, cultural impact or pure personal enjoyment? Any of these can be the basis of a good list.',
          'Do not worry about filling every tier. A shorter list with clear reasoning is more interesting than a list padded with albums you barely remember.',
        ],
      },
    ],
    exampleTiers: [
      {
        label: 'S',
        color: '#ff7f7f',
        items: ['To Pimp a Butterfly', 'OK Computer', 'Rumours'],
      },
      {
        label: 'A',
        color: '#ffbf7f',
        items: ['Blonde', 'The Miseducation of Lauryn Hill', 'Kid A'],
      },
      {
        label: 'B',
        color: '#ffdf7f',
        items: ['Currents', 'Good Kid, M.A.A.D City', '1989'],
      },
      {
        label: 'C',
        color: '#bfff7f',
        items: ['A solid album', 'A grower', 'A nostalgic pick'],
      },
      {
        label: 'D',
        color: '#7fbfff',
        items: ['A skip', 'A disappointing follow-up', 'A meme pick'],
      },
    ],
    exampleTitle: 'Example music tier list',
    faqs: [
      {
        question: 'Can I rank songs instead of albums?',
        answer:
          'Yes. Use text items or cover art for each song, then drag them into tiers. You can also rank albums first and add a separate song list later.',
      },
      {
        question: 'Can I upload album covers?',
        answer:
          'Yes. YapTier accepts PNG, JPG and WebP images up to 5 MB each. Images stay in your browser and are included in PNG exports.',
      },
      {
        question: 'Is the music tier list maker free?',
        answer:
          'Yes. YapTier is free and open source, with no ads, no account and no tracking.',
      },
      {
        question: 'Can I save my music tier list?',
        answer:
          'Yes. Your board auto-saves in your browser, and you can export a JSON file to import on another device later.',
      },
    ],
    related: makerRelated.filter((slug) => slug !== 'music-tier-list-maker'),
    updated: LAST_UPDATED,
  },
  {
    slug: 'how-to-make-a-tier-list',
    title: 'How to Make a Tier List — Free Step-by-Step Guide | YapTier',
    description:
      'Learn how to make a tier list in five steps. Understand S–D tiers, choose ranking criteria, add images or text, and export a clean PNG with YapTier.',
    h1: 'How to Make a Tier List',
    eyebrow: 'Beginner guide',
    intro:
      'A tier list is a simple way to rank items from best to worst. This guide explains what the tiers mean, how to choose a fair ranking method and how to build a tier list in YapTier for free.',
    kind: 'howto',
    sections: [
      {
        heading: 'What is a tier list?',
        paragraphs: [
          'A tier list groups items into ordered categories, usually labelled S, A, B, C and D. S is the top tier, A is excellent, B is good, C is average or mixed, and D is the bottom tier. The exact meaning is up to you, which is why tier lists work for games, anime, movies, music, food, sports and almost anything else.',
          'Tier lists are popular because they are visual and easy to compare. One glance shows where each item landed, and the order inside a tier adds another layer of detail.',
        ],
      },
      {
        heading: 'Understand the S–D tiers',
        paragraphs: [
          'The S–D scale comes from Japanese games and fan communities. You can keep the standard labels or rename them to match your list. For example, a movie ranking might use Masterpiece, Great, Good, Fine and Skip.',
        ],
        bullets: [
          'S — the best of the best; your top recommendations.',
          'A — excellent, with only minor flaws.',
          'B — good, enjoyable and worth trying.',
          'C — mixed, average or only for a specific audience.',
          'D — the bottom tier; not recommended or not for you.',
        ],
      },
      {
        heading: 'Step-by-step: create a tier list in YapTier',
        paragraphs: [
          'YapTier runs entirely in your browser. You do not need an account, and your board auto-saves on your device as you work.',
        ],
        bullets: [
          'Open YapTier and choose New List.',
          'Add items by uploading images, searching open icons or typing text.',
          'Drag each item into the S, A, B, C or D tier.',
          'Rename tiers and choose colors that match your ranking.',
          'Export your finished tier list as a PNG image or JSON file.',
        ],
        ordered: true,
      },
      {
        heading: 'Tips for better tier lists',
        paragraphs: [
          'Choose one clear criterion before you rank. “Most fun”, “best story” and “most influential” can produce very different lists. Write the criterion in the list title so viewers understand the context.',
          'Keep the list focused. A ranking of 15–30 items is usually easier to read than a list of 100. Use empty tiers when they are honest, and do not be afraid to move items after you see the full board.',
          'If you are ranking with other people, ask everyone to share their criteria first. The disagreement is often more interesting than the final order.',
        ],
      },
      {
        heading: 'Where to share your tier list',
        paragraphs: [
          'Export the board as a PNG image and share it in a group chat, forum, social post or video thumbnail. You can also export a JSON file to keep an editable copy or move the list to another device.',
          'YapTier does not upload your board to a server, so the image or JSON file is the shareable copy. That also means your list stays private unless you choose to share it.',
        ],
      },
    ],
    howToSteps: [
      'Open YapTier and choose New List.',
      'Add items by uploading images, searching open icons or typing text.',
      'Drag each item into the S, A, B, C or D tier.',
      'Rename tiers and choose colors that match your ranking.',
      'Export your finished tier list as a PNG image or JSON file.',
    ],
    faqs: [
      {
        question: 'What does S tier mean?',
        answer:
          'S tier is the highest tier in the S–D scale. It usually means the best of the best or a top recommendation. You can rename the tier if you prefer another label.',
      },
      {
        question: 'How many items should a tier list have?',
        answer:
          'There is no fixed number. A focused list of 15–30 items is usually easier to read and compare than a very long list, but you can rank as many items as you need.',
      },
      {
        question: 'Do I need an account to make a tier list?',
        answer:
          'No. YapTier works without an account. Your board is saved locally in your browser, and you can export it as a PNG or JSON file.',
      },
      {
        question: 'Can I make a tier list on my phone?',
        answer:
          'Yes. YapTier supports touch drag-and-drop and responsive layouts on phones and tablets, as well as mouse and keyboard controls on desktop.',
      },
    ],
    related: [
      'gaming-tier-list-maker',
      'anime-tier-list-maker',
      'movie-tier-list-maker',
      'music-tier-list-maker',
      'about',
    ],
    updated: LAST_UPDATED,
  },
  {
    slug: 'about',
    title: 'About YapTier — Free, Open-Source Tier List Maker',
    description:
      'Learn about YapTier, a free and open-source tier list maker that runs in your browser. No accounts, no ads, no tracking and no server-side storage.',
    h1: 'About YapTier',
    eyebrow: 'The project',
    intro:
      'YapTier is a free, open-source tier list maker built for people who want to rank things without an account, ads or tracking. Everything runs locally in your browser.',
    kind: 'about',
    sections: [
      {
        heading: 'What YapTier is',
        paragraphs: [
          'YapTier is a browser-based editor for creating tier lists. You can upload images, search open icon collections, add text items, drag items between S–D tiers, customize tier names and colors, and export the finished board as a PNG image or JSON file.',
          'The project is designed to be fast and simple. There is no feed, no public profile and no server-side list storage. Your board belongs to you and stays on your device unless you choose to share an export.',
        ],
      },
      {
        heading: 'Why it is free and open source',
        paragraphs: [
          'YapTier is released under the MIT license. The source code is public, so anyone can inspect it, report bugs, suggest improvements or contribute changes. The project does not rely on ads, tracking or paid tiers.',
          'Open source also makes the privacy claims verifiable. You can check how storage, image handling and exports work instead of taking a marketing page at its word.',
        ],
      },
      {
        heading: 'Privacy by default',
        paragraphs: [
          'YapTier stores tier lists in IndexedDB with a localStorage fallback. Images you upload stay in your browser and are not sent to a server. Icon search requests go directly to the public Iconify API when you search, but your board contents are not uploaded.',
          'There are no analytics scripts, advertising pixels or third-party tracking cookies. See the privacy policy for a plain-language summary.',
        ],
      },
      {
        heading: 'How to contribute',
        paragraphs: [
          'Bug reports, feature ideas and pull requests are welcome. The repository includes contribution guidelines, a development setup and a test suite. If you find a problem, open an issue with the steps to reproduce it and the browser you are using.',
          'If you would like to support the project, sharing it with someone who needs a simple tier list maker is the best place to start.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'You can reach the maintainers through the public GitHub repository or by email. Please use the issue tracker for bugs and feature requests so the discussion stays searchable for other contributors.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Who builds YapTier?',
        answer:
          'YapTier is maintained by an open-source community of contributors. The source code and issue tracker are public on GitHub.',
      },
      {
        question: 'Is YapTier affiliated with TierMaker or other tier list sites?',
        answer:
          'No. YapTier is an independent open-source project. It is not affiliated with TierMaker or any other tier list service.',
      },
      {
        question: 'How can I report a bug?',
        answer:
          'Open an issue on the GitHub repository with the steps to reproduce the problem, the expected result and your browser version.',
      },
    ],
    related: [
      'how-to-make-a-tier-list',
      'gaming-tier-list-maker',
      'anime-tier-list-maker',
      'movie-tier-list-maker',
      'music-tier-list-maker',
    ],
    updated: LAST_UPDATED,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy — YapTier',
    description:
      'YapTier privacy policy: no accounts, no ads, no analytics and no server-side storage. Learn how tier lists, images and icon searches are handled.',
    h1: 'Privacy Policy',
    eyebrow: 'Plain-language privacy',
    intro:
      'YapTier is designed to work locally in your browser. This page explains what is stored, what is sent over the network and what is never collected.',
    kind: 'privacy',
    sections: [
      {
        heading: 'Data stored in your browser',
        paragraphs: [
          'YapTier stores your active tier list in IndexedDB, with a localStorage fallback when IndexedDB is unavailable. Uploaded images are stored in your browser so the board can be restored when you return. You can clear this data at any time with the New List action or by clearing your browser storage.',
        ],
      },
      {
        heading: 'No accounts, analytics or advertising',
        paragraphs: [
          'YapTier does not require an account and does not include analytics scripts, advertising networks or tracking pixels. There are no third-party cookies for advertising or profiling.',
        ],
      },
      {
        heading: 'Third-party icon requests',
        paragraphs: [
          'When you use Find Icons, your search term is sent to the public Iconify API to retrieve matching icons. The request includes the search query and standard network information such as your IP address, which is handled by Iconify under its own policies. Your tier list and uploaded images are not sent to Iconify.',
        ],
      },
      {
        heading: 'Exports and sharing',
        paragraphs: [
          'PNG and JSON exports are created on your device. YapTier does not upload exported files. If you share an export in a chat, forum or social network, that service handles the file under its own privacy policy.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'If you have a privacy question, contact the maintainers through the public GitHub repository or the feedback email linked in the footer.',
        ],
      },
    ],
    faqs: [],
    related: ['about', 'how-to-make-a-tier-list', 'gaming-tier-list-maker'],
    updated: LAST_UPDATED,
  },
];

export const pageBySlug = new Map(pages.map((page) => [page.slug, page]));
