export type FeedPost = {
  user: string;
  place: string;
  kind: "post" | "reel";
  ih: number;
  cost: string;
  note: string;
  likes: string;
  comments: string;
  saves: string;
  pressure: string;
  caption: string;
  photo: string;
  sponsored?: boolean;
};

export type Story = {
  name: string;
  photo: string;
};

export type Alternative = {
  e: string;
  t: string;
  d: string;
  hpb: number;
};

export const POSTS: FeedPost[] = [
  {
    user: "lina.daily",
    place: "Berlin, Germany",
    kind: "post",
    ih: 168,
    cost: "+18 Sek",
    note: "weg",
    likes: "12.482",
    comments: "328",
    saves: "1.204",
    pressure: "Nur kurz schauen",
    caption: "kurzer Blick, langer Loop",
    photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "reelpilot",
    place: "For you",
    kind: "reel",
    ih: 190,
    cost: "+32 Sek",
    note: "Dopamin",
    likes: "48.201",
    comments: "1.947",
    saves: "8.320",
    pressure: "Bleib dran",
    caption: "noch ein Clip, dann wirklich Pause",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "noah.frames",
    place: "Cafe Mitte",
    kind: "post",
    ih: 176,
    cost: "+21 Sek",
    note: "nichts behalten",
    likes: "9.874",
    comments: "214",
    saves: "903",
    pressure: "Der naechste Post passt besser",
    caption: "alles gesehen, nichts gespeichert",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "studio.after",
    place: "New post",
    kind: "reel",
    ih: 184,
    cost: "+44 Sek",
    note: "Autopilot",
    likes: "31.590",
    comments: "876",
    saves: "4.112",
    pressure: "Du hast langsamer gescrollt",
    caption: "der Feed merkt schneller als du, was dich haelt",
    photo: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "slowoutdoors",
    place: "Dolomites",
    kind: "post",
    ih: 202,
    cost: "+16 Sek",
    note: "Fokus weg",
    likes: "22.118",
    comments: "502",
    saves: "3.771",
    pressure: "Speichern für spaeter",
    caption: "eigentlich wolltest du nur eine Nachricht checken",
    photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "citybreaks",
    place: "Lisbon",
    kind: "post",
    ih: 174,
    cost: "+27 Sek",
    note: "nur noch eins",
    likes: "15.730",
    comments: "439",
    saves: "2.018",
    pressure: "Nur noch einer",
    caption: "aus einem Post wird eine halbe Stunde",
    photo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "night.study",
    place: "Saved reel",
    kind: "reel",
    ih: 188,
    cost: "+38 Sek",
    note: "Zeit verrauscht",
    likes: "67.042",
    comments: "3.492",
    saves: "10.870",
    pressure: "Das koennte wichtig sein",
    caption: "gespeichert für spaeter, vergessen für immer",
    photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "crew.room",
    place: "Campus",
    kind: "post",
    ih: 166,
    cost: "+12 Sek",
    note: "Scrollreflex",
    likes: "6.318",
    comments: "118",
    saves: "609",
    pressure: "Alle schauen kurz",
    caption: "alle schauen kurz. keiner merkt wie lange",
    photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "morning.fit",
    place: "Story replay",
    kind: "reel",
    ih: 196,
    cost: "+29 Sek",
    note: "Daumen weiter",
    likes: "18.506",
    comments: "768",
    saves: "2.661",
    pressure: "Noch 7 Sekunden",
    caption: "du bist nicht müde, du bist überreizt",
    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "soft.news",
    place: "Explore",
    kind: "post",
    sponsored: true,
    ih: 170,
    cost: "+41 Sek",
    note: "noch ein Tab",
    likes: "53.809",
    comments: "2.084",
    saves: "7.442",
    pressure: "Empfohlen, weil du geblieben bist",
    caption: "alles wichtig, nichts dringend",
    photo: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=560&q=80",
  },
];

export const STORIES: Story[] = [
  { name: "Du", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=70" },
  { name: "Fokus", photo: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=120&q=70" },
  { name: "Zeit", photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=120&q=70" },
  { name: "Pause", photo: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=120&q=70" },
];

export const PARTICLES = ["+18 Sek", "+32 Sek", "+21 Sek", "+44 Sek", "+16 Sek", "+27 Sek", "+38 Sek", "+12 Sek", "+29 Sek", "+41 Sek"];

export const FEED_POSTS: FeedPost[] = [
  POSTS[4],
  POSTS[1],
  POSTS[2],
  POSTS[3],
  POSTS[0],
  ...POSTS.slice(5),
];

export const SCROLLED_POSTS = POSTS.length;

export const ALTS: Alternative[] = [
  { e: "📚", t: "Bücher lesen", d: "12 Bücher / Jahr", hpb: 8 },
  { e: "🧘", t: "Meditieren", d: "Fokus & Ruhe", hpb: 0.5 },
  { e: "🌿", t: "Spazierengehen", d: "Frische Luft, echter Fortschritt", hpb: 1 },
  { e: "🎸", t: "Instrument", d: "1 Jahr = spielbares Lied", hpb: 200 },
  { e: "🍳", t: "Kochen", d: "Gesünder & günstiger", hpb: 2 },
  { e: "✍️", t: "Tagebuch", d: "Gedanken klären", hpb: 1 },
  { e: "🏋️", t: "Sport", d: "Mehr Energie, besser schlafen", hpb: 1 },
  { e: "🌍", t: "Sprache lernen", d: "Grundkenntnisse in 6 Mon.", hpb: 150 },
];
