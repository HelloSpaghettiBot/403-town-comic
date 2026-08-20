import { Router, type IRouter } from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

type Card = {
  id: string;
  name: string;
  faction: string;
  role: string;
  rarity: string;
  image?: string;
  attack: number;
  health: number;
  ability: string;
  owned?: number;
};

type User = {
  id: string;
  handle: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatar?: string;
  credits: number;
  createdAt: string;
};

type Session = {
  token: string;
  userId: string;
  createdAt: string;
};

type Deck = {
  id: string;
  userId: string;
  name: string;
  cardIds: string[];
  createdAt: string;
  updatedAt: string;
};

type Collection = {
  userId: string;
  owned: Record<string, number>;
  shards: number;
  updatedAt: string;
};

type StoryStage = "briefing" | "choice" | "battle" | "complete";

type StoryBattleState = {
  enemyHp: number;
  playerHp: number;
  energy: number;
  turn: number;
  deckIds?: string[];
  discardIds?: string[];
  enemyBoardIds?: string[];
  enemyBoardHp?: number[];
  handIds: string[];
  boardIds: string[];
  boardHp?: number[];
  selectedId?: string | null;
  undoableIds: string[];
  log: string[];
};

type StoryProgress = {
  userId: string;
  version: string;
  chapter: number;
  stage: StoryStage;
  battleState?: StoryBattleState | null;
  updatedAt: string;
};

type PlayerState = {
  userId: string;
  handle: string;
  deck: string[];
  hand: string[];
  board: string[];
  boardHp?: number[];
  discard: string[];
  hp: number;
  energy: number;
  ready: boolean;
};

type Match = {
  id: string;
  status: "waiting" | "active" | "complete";
  turnUserId: string;
  winnerUserId?: string;
  log: string[];
  players: [PlayerState, PlayerState];
  updatedAt: string;
};

type Store = {
  users: User[];
  sessions: Session[];
  decks: Deck[];
  collections: Collection[];
  storyProgress: StoryProgress[];
  waitingUserId: string | null;
  waitingSince?: string | null;
  matches: Match[];
};

const router: IRouter = Router();
const dataFile = process.env["TCG_DATA_FILE"] ?? "/var/lib/403-town-tcg/store.json";
const storyProgressVersion = "2026-08-20-server-story-02";
const storyChapterCount = 6;
const maxHandSize = 4;
const maxBoardSize = 3;
const matchmakingQueueTtlMs = 2 * 60 * 1000;

const cards: Card[] = [
  { id: "atrisk", name: "atRisk", faction: "403 Town", role: "Signal Leader", rarity: "LEGENDARY", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/atRisk.webp", attack: 84, health: 92, ability: "Signal Rally", owned: 2 },
  { id: "koding", name: "KODING", faction: "403 Town", role: "Street Defender", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/Koding.webp", attack: 88, health: 86, ability: "Code Swing", owned: 2 },
  { id: "chroma", name: "CHROMA", faction: "403 Town", role: "Color Keeper", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/Chroma.webp", attack: 72, health: 104, ability: "Restore Hue", owned: 2 },
  { id: "grid", name: "GRID", faction: "403 Town", role: "Firewall Guard", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/Grid.webp", attack: 70, health: 112, ability: "Block Packet", owned: 3 },
  { id: "flicker", name: "FLICKER", faction: "403 Town", role: "Speed Signal", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/Flicker.webp", attack: 76, health: 82, ability: "Quick Blink", owned: 2 },
  { id: "sue-shi", name: "SUE-SHI", faction: "403 Town", role: "Blade Cook", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Heroes/Sue-Shi.webp", attack: 90, health: 84, ability: "Neon Slice", owned: 2 },
  { id: "backslash", name: "BACKSLASH", faction: "Blackout Protocol", role: "Code Cutter", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Villains/Backslash.webp", attack: 87, health: 86, ability: "Slash Route", owned: 1 },
  { id: "crosstalk", name: "CROSSTALK", faction: "Blackout Protocol", role: "Signal Jammer", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Villains/CrossTalk.webp", attack: 93, health: 97, ability: "Static Spill", owned: 2 },
  { id: "ghostroute", name: "GHOSTROUTE", faction: "Blackout Protocol", role: "Path Haunter", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Villains/GhostRoute.webp", attack: 82, health: 88, ability: "Route Fade", owned: 1 },
  { id: "latch", name: "LATCH", faction: "Blackout Protocol", role: "Grappler", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Villains/Latch.webp", attack: 92, health: 96, ability: "Catch Hold", owned: 2 },
  { id: "redkey", name: "REDKEY", faction: "Blackout Protocol", role: "Breacher", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Villains/RedKey.webp", attack: 98, health: 95, ability: "Master Override", owned: 1 },
  { id: "softlock", name: "SOFTLOCK", faction: "Blackout Protocol", role: "Turn Freezer", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Villains/SoftLock.webp", attack: 80, health: 108, ability: "Freeze Input", owned: 1 },
  { id: "zerobyte", name: "ZEROBYTE", faction: "Static Void", role: "Corruptor", rarity: "LEGENDARY", image: "/cards/named/403-Town-Cards-Named-Split/Villains/ZeroByte.webp", attack: 106, health: 96, ability: "USB Tendrils", owned: 1 },
  { id: "5miles", name: "5MILES", faction: "Extras", role: "Runner", rarity: "COMMON", image: "/cards/named/403-Town-Cards-Named-Split/Extras/5miles.webp", attack: 66, health: 72, ability: "Long Route", owned: 2 },
  { id: "darkcomit", name: "DARKCOMIT.exe", faction: "System Anarchy", role: "Autonomous Threat", rarity: "LEGENDARY", image: "/cards/named/403-Town-Cards-Named-Split/Extras/DarkComit.exe.webp", attack: 96, health: 94, ability: "Rollback Bite", owned: 1 },
  { id: "err0r", name: "ERR0R", faction: "Extras", role: "Crash Signal", rarity: "COMMON", image: "/cards/named/403-Town-Cards-Named-Split/Extras/Err0r.webp", attack: 68, health: 70, ability: "Error Burst", owned: 2 },
  { id: "hunta", name: "HUNTA.exe", faction: "Blackout Protocol", role: "Virus Hunter", rarity: "EPIC", image: "/cards/named/403-Town-Cards-Named-Split/Extras/HUNTA.exe.webp", attack: 94, health: 90, ability: "Trace Hunt", owned: 1 },
  { id: "proxy", name: "PROXY", faction: "Extras", role: "Mask Signal", rarity: "COMMON", image: "/cards/named/403-Town-Cards-Named-Split/Extras/Proxy.webp", attack: 64, health: 88, ability: "Mirror Ping", owned: 2 },
  { id: "ravenkey", name: "RAVENKEY", faction: "Extras", role: "Key Runner", rarity: "RARE", image: "/cards/named/403-Town-Cards-Named-Split/Extras/RavenKey.webp", attack: 83, health: 80, ability: "Key Drop", owned: 1 },
];

const defaultDeck = ["atrisk", "koding", "chroma", "grid", "flicker", "sue-shi", "darkcomit", "hunta", "redkey", "crosstalk", "latch", "softlock"];
const shopItems = [
  { id: "starter", name: "Starter Breach Pack", kind: "PACK", price: 240, currency: "CREDITS", detail: "5 signals // guaranteed rare", featured: true, size: 5, guaranteedRare: true },
  { id: "blackout", name: "Blackout Protocol Pack", kind: "PACK", price: 300, currency: "CREDITS", detail: "6 signals // faction weighted", size: 6, guaranteedRare: true },
  { id: "night", name: "Night Protocol Pack", kind: "PACK", price: 60, currency: "SHARDS", detail: "3 signals // blackout pool", size: 3, guaranteedRare: false },
];
const rarityWeight: Record<string, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };

async function readStore(): Promise<Store> {
  try {
    const parsed = JSON.parse(await readFile(dataFile, "utf8")) as Partial<Store>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      decks: parsed.decks ?? [],
      collections: parsed.collections ?? [],
      storyProgress: parsed.storyProgress ?? [],
      waitingUserId: parsed.waitingUserId ?? null,
      waitingSince: parsed.waitingSince ?? null,
      matches: parsed.matches ?? [],
    };
  } catch {
    return { users: [], sessions: [], decks: [], collections: [], storyProgress: [], waitingUserId: null, waitingSince: null, matches: [] };
  }
}

async function writeStore(store: Store) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

function publicUser(user: User) {
  return { id: user.id, handle: user.handle, email: user.email, avatar: user.avatar ?? "sigil-403", credits: user.credits, createdAt: user.createdAt };
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function verifyPassword(password: string, user: User) {
  const attempt = scryptSync(password, user.salt, 64);
  const expected = Buffer.from(user.passwordHash, "hex");
  return expected.length === attempt.length && timingSafeEqual(expected, attempt);
}

async function requireUser(req: Parameters<Parameters<IRouter["get"]>[1]>[0]) {
  const auth = req.header("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  const store = await readStore();
  const session = store.sessions.find((item) => item.token === token);
  const user = session ? store.users.find((item) => item.id === session.userId) : null;
  return { store, user, token };
}

function cardById(id: string) {
  return cards.find((card) => card.id === id) ?? cards[0];
}

function absorbMatchDamage(player: PlayerState, damage: number) {
  let remaining = damage;
  const nextBoard: string[] = [];
  const nextBoardHp: number[] = [];
  const destroyed: string[] = [];
  player.board.forEach((cardId, index) => {
    if (remaining <= 0) {
      nextBoard.push(cardId);
      nextBoardHp.push(player.boardHp?.[index] ?? cardById(cardId).health);
      return;
    }
    const currentHp = player.boardHp?.[index] ?? cardById(cardId).health;
    const afterHit = currentHp - remaining;
    if (afterHit > 0) {
      nextBoard.push(cardId);
      nextBoardHp.push(afterHit);
      remaining = 0;
    } else {
      destroyed.push(cardById(cardId).name);
      remaining = Math.abs(afterHit);
    }
  });
  player.board = nextBoard;
  player.boardHp = nextBoardHp;
  player.hp = Math.max(0, player.hp - remaining);
  return { spill: remaining, destroyed };
}

function freshStoryProgress(userId: string): StoryProgress {
  return { userId, version: storyProgressVersion, chapter: 0, stage: "briefing", battleState: null, updatedAt: new Date().toISOString() };
}

function freshCollection(userId: string): Collection {
  return {
    userId,
    owned: Object.fromEntries(cards.map((card) => [card.id, card.owned ?? 0])),
    shards: 18,
    updatedAt: new Date().toISOString(),
  };
}

function getCollection(store: Store, userId: string) {
  let collection = store.collections.find((item) => item.userId === userId);
  if (!collection) {
    collection = freshCollection(userId);
    store.collections.push(collection);
  } else {
    const validIds = new Set(cards.map((card) => card.id));
    collection.owned = Object.fromEntries(Object.entries(collection.owned).filter(([id]) => validIds.has(id)));
    for (const card of cards) {
      if (collection.owned[card.id] === undefined) collection.owned[card.id] = card.owned ?? 0;
    }
    collection.updatedAt = new Date().toISOString();
  }
  return collection;
}

function getStoryProgress(store: Store, userId: string) {
  let progress = store.storyProgress.find((item) => item.userId === userId);
  if (!progress || progress.version !== storyProgressVersion) {
    progress = freshStoryProgress(userId);
    store.storyProgress = store.storyProgress.filter((item) => item.userId !== userId);
    store.storyProgress.push(progress);
  }
  return progress;
}

function cardsForCollection(collection: Collection) {
  return cards.map((card) => ({ ...card, owned: collection.owned[card.id] ?? 0 }));
}

function openPack(size: number, guaranteedRare = false) {
  return Array.from({ length: size }, (_unused, index) => {
    const eligible = cards.filter((card) => !(guaranteedRare && index === size - 1) || rarityWeight[card.rarity.toUpperCase()] >= 1);
    return eligible[Math.floor(Math.random() * eligible.length)] ?? cards[0];
  });
}

function cleanBattleState(value: unknown): StoryBattleState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<StoryBattleState>;
  const enemyHp = Number(state.enemyHp);
  const playerHp = Number(state.playerHp);
  const energy = Number(state.energy);
  const turn = Number(state.turn);
  if (![enemyHp, playerHp, energy, turn].every(Number.isFinite)) return null;
  const allIds = new Set(cards.map((card) => card.id));
  const cleanIds = (ids: unknown, limit = 24) => Array.isArray(ids) ? ids.map(String).filter((id) => allIds.has(id)).slice(0, limit) : [];
  const selectedId = typeof state.selectedId === "string" && allIds.has(state.selectedId) ? state.selectedId : null;
  const log = Array.isArray(state.log) ? state.log.map(String).slice(0, 8) : [];
  const cleanHp = (values: unknown, limit = maxBoardSize) => Array.isArray(values) ? values.map(Number).filter(Number.isFinite).map((hp) => Math.max(0, Math.min(999, Math.round(hp)))).slice(0, limit) : [];
  return {
    enemyHp: Math.max(0, Math.min(999, Math.round(enemyHp))),
    playerHp: Math.max(0, Math.min(999, Math.round(playerHp))),
    energy: Math.max(0, Math.min(12, Math.round(energy))),
    turn: Math.max(1, Math.min(99, Math.round(turn))),
    deckIds: cleanIds(state.deckIds, 30),
    discardIds: cleanIds(state.discardIds, 30),
    enemyBoardIds: cleanIds(state.enemyBoardIds, maxBoardSize),
    enemyBoardHp: cleanHp(state.enemyBoardHp, maxBoardSize),
    handIds: cleanIds(state.handIds, maxHandSize),
    boardIds: cleanIds(state.boardIds, maxBoardSize),
    boardHp: cleanHp(state.boardHp, maxBoardSize),
    selectedId,
    undoableIds: cleanIds(state.undoableIds, maxBoardSize),
    log,
  };
}

function makePlayer(user: User, deckIds: string[]): PlayerState {
  const validIds = new Set(cards.map((card) => card.id));
  const cleanDeck = deckIds.filter((id) => validIds.has(id));
  const deck = [...(cleanDeck.length >= 5 ? cleanDeck : defaultDeck)].sort(() => Math.random() - 0.5);
  return {
    userId: user.id,
    handle: user.handle,
    deck: deck.slice(maxHandSize),
    hand: deck.slice(0, maxHandSize),
    board: [],
    boardHp: [],
    discard: [],
    hp: 240,
    energy: 3,
    ready: false,
  };
}

function viewMatch(match: Match, viewerId: string) {
  return {
    ...match,
    players: match.players.map((player) => ({
      userId: player.userId,
      handle: player.handle,
      board: player.board.map(cardById),
      boardHp: player.board.map((cardId, index) => player.boardHp?.[index] ?? cardById(cardId).health),
      handCount: player.hand.length,
      hand: player.userId === viewerId ? player.hand.map(cardById) : [],
      deckCount: player.deck.length,
      discard: player.discard.map(cardById),
      hp: player.hp,
      energy: player.energy,
      ready: player.ready,
      isYou: player.userId === viewerId,
    })),
  };
}

function draw(player: PlayerState, count = 1) {
  for (let i = 0; i < count; i += 1) {
    if (player.hand.length >= maxHandSize) return;
    const next = player.deck.shift();
    if (next) player.hand.push(next);
  }
}

router.post("/auth/register", async (req, res) => {
  const handle = String(req.body?.handle ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (handle.length < 2 || email.length < 5 || password.length < 8) return res.status(400).json({ message: "Use a handle, valid email, and password with at least 8 characters." });
  const store = await readStore();
  if (store.users.some((user) => user.email === email || user.handle.toLowerCase() === handle.toLowerCase())) return res.status(409).json({ message: "That handle or email is already registered." });
  const passwordData = hashPassword(password);
  const user: User = { id: randomUUID(), handle, email, passwordHash: passwordData.hash, salt: passwordData.salt, avatar: "sigil-403", credits: 1200, createdAt: new Date().toISOString() };
  const token = randomBytes(32).toString("hex");
  store.users.push(user);
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  store.decks.push({ id: randomUUID(), userId: user.id, name: "Starter Signal Deck", cardIds: defaultDeck, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  store.collections.push(freshCollection(user.id));
  store.storyProgress.push(freshStoryProgress(user.id));
  await writeStore(store);
  return res.status(201).json({ token, user: publicUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const store = await readStore();
  const user = store.users.find((item) => item.email === email);
  if (!user || !verifyPassword(password, user)) return res.status(401).json({ message: "Login failed. Check the email and password." });
  const token = randomBytes(32).toString("hex");
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  await writeStore(store);
  return res.json({ token, user: publicUser(user) });
});

router.get("/me", async (req, res) => {
  const { user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  return res.json({ user: publicUser(user) });
});

router.patch("/me/profile", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });

  const handle = String(req.body?.handle ?? user.handle).trim();
  if (handle.length < 2 || handle.length > 24) return res.status(400).json({ message: "Handle must be 2 to 24 characters." });
  if (store.users.some((item) => item.id !== user.id && item.handle.toLowerCase() === handle.toLowerCase())) return res.status(409).json({ message: "That handle is already taken." });

  const avatar = String(req.body?.avatar ?? user.avatar ?? "sigil-403").trim();
  const presets = new Set(["sigil-403", "atrisk", "koding", "chroma", "grid", "zero", "zerobyte"]);
  if (avatar.startsWith("data:image/")) {
    if (avatar.length > 750_000) return res.status(413).json({ message: "Profile image is too large. Use an image under 500 KB." });
    user.avatar = avatar;
  } else if (presets.has(avatar)) {
    user.avatar = avatar;
  } else if (avatar) {
    return res.status(400).json({ message: "Choose a 403 icon or upload a valid image." });
  }

  user.handle = handle;
  store.decks.filter((deck) => deck.userId === user.id).forEach((deck) => { deck.updatedAt = new Date().toISOString(); });
  store.matches.forEach((match) => {
    match.players.forEach((player) => {
      if (player.userId === user.id) player.handle = handle;
    });
  });
  await writeStore(store);
  return res.json({ user: publicUser(user) });
});

router.get("/cards", (_req, res) => {
  return res.json({ cards });
});

router.get("/collection", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const collection = getCollection(store, user.id);
  await writeStore(store);
  return res.json({ cards: cardsForCollection(collection), credits: user.credits, shards: collection.shards });
});

router.get("/shop", (_req, res) => {
  return res.json({ items: shopItems });
});

router.post("/shop/purchase", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const itemId = String(req.body?.itemId ?? "");
  const item = shopItems.find((entry) => entry.id === itemId);
  if (!item) return res.status(404).json({ message: "Pack not found." });
  const collection = getCollection(store, user.id);

  if (item.currency === "CREDITS") {
    if (user.credits < item.price) return res.status(409).json({ message: "Not enough coins for that pack." });
    user.credits -= item.price;
  } else {
    if (collection.shards < item.price) return res.status(409).json({ message: "Not enough shards for that pack." });
    collection.shards -= item.price;
  }

  const opened = openPack(item.size, item.guaranteedRare);
  opened.forEach((card) => {
    collection.owned[card.id] = (collection.owned[card.id] ?? 0) + 1;
  });
  collection.updatedAt = new Date().toISOString();
  await writeStore(store);
  return res.json({ opened, cards: cardsForCollection(collection), credits: user.credits, shards: collection.shards });
});

router.get("/decks", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  return res.json({ decks: store.decks.filter((deck) => deck.userId === user.id), cards });
});

router.get("/story-progress", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const progress = getStoryProgress(store, user.id);
  await writeStore(store);
  return res.json({ progress });
});

router.put("/story-progress", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const chapter = Number(req.body?.chapter);
  const stage = String(req.body?.stage ?? "");
  if (!Number.isInteger(chapter) || chapter < 0 || chapter >= storyChapterCount) return res.status(400).json({ message: "Story chapter is out of range." });
  if (!["briefing", "choice", "battle", "complete"].includes(stage)) return res.status(400).json({ message: "Story stage is invalid." });
  const progress = getStoryProgress(store, user.id);
  if (stage === "complete" && progress.stage !== "complete") {
    user.credits += [120, 180, 260, 320, 420, 560][chapter] ?? 120;
  }
  progress.chapter = chapter;
  progress.stage = stage as StoryStage;
  progress.battleState = stage === "battle" ? cleanBattleState(req.body?.battleState) : null;
  progress.updatedAt = new Date().toISOString();
  await writeStore(store);
  return res.json({ progress });
});

router.put("/decks/:id", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const deck = store.decks.find((item) => item.id === req.params.id && item.userId === user.id);
  if (!deck) return res.status(404).json({ message: "Deck not found." });
  const cardIds = Array.isArray(req.body?.cardIds) ? req.body.cardIds.map(String).filter((id: string) => cards.some((card) => card.id === id)).slice(0, 30) : deck.cardIds;
  deck.cardIds = cardIds.length >= 5 ? cardIds : deck.cardIds;
  deck.name = String(req.body?.name ?? deck.name).trim() || deck.name;
  deck.updatedAt = new Date().toISOString();
  await writeStore(store);
  return res.json({ deck });
});

router.post("/matchmaking/join", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const existingActive = store.matches.find((match) => match.status === "active" && match.players.some((player) => player.userId === user.id));
  if (existingActive) return res.json({ status: "matched", match: viewMatch(existingActive, user.id) });

  const waitingAge = store.waitingSince ? Date.now() - Date.parse(store.waitingSince) : Number.POSITIVE_INFINITY;
  const waitingIsStale = !store.waitingUserId || !Number.isFinite(waitingAge) || waitingAge > matchmakingQueueTtlMs;
  if (waitingIsStale) {
    store.waitingUserId = null;
    store.waitingSince = null;
  }

  if (store.waitingUserId && store.waitingUserId !== user.id) {
    const opponent = store.users.find((item) => item.id === store.waitingUserId);
    const opponentActive = store.matches.some((match) => match.status === "active" && match.players.some((player) => player.userId === store.waitingUserId));
    if (!opponent || opponentActive) {
      store.waitingUserId = user.id;
      store.waitingSince = new Date().toISOString();
      await writeStore(store);
      return res.json({ status: "queued" });
    }
    const userDeck = store.decks.find((deck) => deck.userId === user.id)?.cardIds ?? defaultDeck;
    const opponentDeck = store.decks.find((deck) => deck.userId === opponent.id)?.cardIds ?? defaultDeck;
    const match: Match = {
      id: randomUUID(),
      status: "active",
      turnUserId: opponent.id,
      log: [`Match started: ${opponent.handle} vs ${user.handle}.`, `${opponent.handle} has the first turn.`],
      players: [makePlayer(opponent, opponentDeck), makePlayer(user, userDeck)],
      updatedAt: new Date().toISOString(),
    };
    store.waitingUserId = null;
    store.waitingSince = null;
    store.matches.push(match);
    await writeStore(store);
    return res.json({ status: "matched", match: viewMatch(match, user.id) });
  }
  store.waitingUserId = user.id;
  store.waitingSince = new Date().toISOString();
  await writeStore(store);
  return res.json({ status: "queued" });
});

router.get("/matches/active", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const active = store.matches.find((match) => match.status === "active" && match.players.some((player) => player.userId === user.id));
  return res.json({ match: active ? viewMatch(active, user.id) : null });
});

router.get("/matches/:id", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const match = store.matches.find((item) => item.id === req.params.id);
  if (!match || !match.players.some((player) => player.userId === user.id)) return res.status(404).json({ message: "Match not found." });
  return res.json({ match: viewMatch(match, user.id) });
});

router.post("/matches/:id/actions", async (req, res) => {
  const { store, user } = await requireUser(req);
  if (!user) return res.status(401).json({ message: "Sign in to continue." });
  const match = store.matches.find((item) => item.id === req.params.id);
  if (!match || match.status !== "active") return res.status(404).json({ message: "Active match not found." });
  const player = match.players.find((item) => item.userId === user.id);
  const opponent = match.players.find((item) => item.userId !== user.id);
  if (!player || !opponent) return res.status(404).json({ message: "Player not found." });
  if (match.turnUserId !== user.id) return res.status(409).json({ message: "Wait for your turn." });

  const action = String(req.body?.action ?? "");
  if (action === "play") {
    const cardId = String(req.body?.cardId ?? "");
    const handIndex = player.hand.indexOf(cardId);
    if (handIndex < 0) return res.status(400).json({ message: "That card is not in your hand." });
    if (player.energy < 1) return res.status(400).json({ message: "Not enough energy." });
    if (player.board.length >= maxBoardSize) return res.status(400).json({ message: "Your field is full. You can keep 3 cards in play." });
    player.hand.splice(handIndex, 1);
    player.board.push(cardId);
    player.boardHp = [...(player.boardHp ?? []), cardById(cardId).health];
    player.energy -= 1;
    match.log.unshift(`${player.handle} played ${cardById(cardId).name}.`);
  } else if (action === "attack") {
    const cardId = String(req.body?.cardId ?? "");
    if (!player.board.includes(cardId)) return res.status(400).json({ message: "That card is not on your board." });
    const damage = Math.max(10, Math.round(cardById(cardId).attack / 3));
    const hit = absorbMatchDamage(opponent, damage);
    match.log.unshift(`${player.handle}'s ${cardById(cardId).name} dealt ${damage}. ${hit.spill} reached ${opponent.handle}.`);
    hit.destroyed.forEach((name) => match.log.unshift(`${name} was knocked out before player damage.`));
    if (opponent.hp === 0) {
      match.status = "complete";
      match.winnerUserId = player.userId;
      user.credits += 180;
      match.log.unshift(`${player.handle} wins the match.`);
      match.log.unshift(`${player.handle} earned 180 coins.`);
    }
  } else if (action === "endTurn") {
    draw(opponent, 1);
    opponent.energy = Math.min(8, opponent.energy + 1);
    match.turnUserId = opponent.userId;
    match.log.unshift(`${player.handle} ended their turn.`);
  } else {
    return res.status(400).json({ message: "Unknown match action." });
  }
  match.updatedAt = new Date().toISOString();
  await writeStore(store);
  return res.json({ match: viewMatch(match, user.id) });
});

export default router;
