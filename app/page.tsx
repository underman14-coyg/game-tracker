
'use client';

import { useEffect, useMemo, useState } from 'react';

type GameStatus = 'Playing' | 'Completed' | 'Backlog' | 'Dropped' | 'Wishlist';

type Game = {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  rating: number;
  hours: number;
  genre: string;
  mood: string;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = 'save-point-games-v1';

const seedGames: Game[] = [
  {
    id: 'gt7',
    title: 'Gran Turismo 7',
    platform: 'PS5',
    status: 'Playing',
    rating: 8.5,
    hours: 42,
    genre: 'Racing',
    mood: 'Wheel required',
    notes: 'Great with the racing wheel. License tests remain psychological warfare.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deus-ex',
    title: 'Deus Ex',
    platform: 'PC',
    status: 'Completed',
    rating: 9.5,
    hours: 28,
    genre: 'Immersive Sim',
    mood: 'Conspiracy brain',
    notes: 'Still ridiculously good. Every ending makes you feel slightly guilty.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    platform: 'PS5',
    status: 'Backlog',
    rating: 0,
    hours: 0,
    genre: 'Action RPG',
    mood: 'Pain and suffering',
    notes: 'Bought with confidence. Opened with fear.',
    createdAt: new Date().toISOString(),
  },
];

const statuses: GameStatus[] = ['Playing', 'Completed', 'Backlog', 'Dropped', 'Wishlist'];

function emptyForm(): Omit<Game, 'id' | 'createdAt'> {
  return {
    title: '',
    platform: 'PS5',
    status: 'Backlog',
    rating: 0,
    hours: 0,
    genre: '',
    mood: '',
    notes: '',
  };
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<'All' | GameStatus>('All');
  const [query, setQuery] = useState('');
  const [recommendation, setRecommendation] = useState<Game | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGames(JSON.parse(stored));
    } else {
      setGames(seedGames);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedGames));
    }
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    }
  }, [games]);

  const stats = useMemo(() => {
    const completed = games.filter((game) => game.status === 'Completed');
    const totalHours = games.reduce((sum, game) => sum + Number(game.hours || 0), 0);
    const rated = games.filter((game) => game.rating > 0);
    const averageRating =
      rated.length === 0
        ? 0
        : rated.reduce((sum, game) => sum + Number(game.rating || 0), 0) / rated.length;
    const backlog = games.filter((game) => game.status === 'Backlog').length;

    return {
      total: games.length,
      completed: completed.length,
      totalHours,
      averageRating,
      backlog,
    };
  }, [games]);

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => activeStatus === 'All' || game.status === activeStatus)
      .filter((game) => {
        const text = `${game.title} ${game.platform} ${game.genre} ${game.mood} ${game.notes}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [games, activeStatus, query]);

  function saveGame() {
    if (!form.title.trim()) return;

    if (editingId) {
      setGames((current) =>
        current.map((game) =>
          game.id === editingId
            ? {
                ...game,
                ...form,
                title: form.title.trim(),
                rating: Number(form.rating),
                hours: Number(form.hours),
              }
            : game
        )
      );
      setEditingId(null);
    } else {
      const newGame: Game = {
        ...form,
        id: crypto.randomUUID(),
        title: form.title.trim(),
        rating: Number(form.rating),
        hours: Number(form.hours),
        createdAt: new Date().toISOString(),
      };
      setGames((current) => [newGame, ...current]);
    }

    setForm(emptyForm());
  }

  function editGame(game: Game) {
    setEditingId(game.id);
    setForm({
      title: game.title,
      platform: game.platform,
      status: game.status,
      rating: game.rating,
      hours: game.hours,
      genre: game.genre,
      mood: game.mood,
      notes: game.notes,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteGame(id: string) {
    setGames((current) => current.filter((game) => game.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm());
    }
  }

  function pickBacklogGame() {
    const candidates = games.filter((game) => game.status === 'Backlog' || game.status === 'Wishlist');
    if (candidates.length === 0) {
      setRecommendation(null);
      return;
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    setRecommendation(chosen);
  }

  function resetDemo() {
    setGames(seedGames);
    setForm(emptyForm());
    setEditingId(null);
    setRecommendation(null);
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="kicker">Save Point</div>
          <h1>Your gaming diary, without the backlog guilt.</h1>
          <p className="subtitle">
            Track what you are playing, what you finished, what you abandoned, and what your taste actually looks like over time.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn primary" onClick={pickBacklogGame}>Pick my next game</button>
          <button className="btn ghost" onClick={resetDemo}>Reset demo</button>
        </div>
      </section>

      <section className="grid stats">
        <div className="card">
          <div className="stat-label">Games tracked</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
        <div className="card">
          <div className="stat-label">Hours logged</div>
          <div className="stat-value">{stats.totalHours}</div>
        </div>
        <div className="card">
          <div className="stat-label">Avg rating</div>
          <div className="stat-value">{stats.averageRating ? stats.averageRating.toFixed(1) : '—'}</div>
        </div>
      </section>

      {recommendation && (
        <section className="card recommendation">
          <div className="kicker">Backlog Goblin says</div>
          <div className="rec-title">Play {recommendation.title}</div>
          <div className="rec-copy">
            It is sitting in your {recommendation.status.toLowerCase()} pile on {recommendation.platform}.
            {recommendation.mood ? ` Current vibe: ${recommendation.mood}.` : ''}
          </div>
        </section>
      )}

      <section className="grid main" style={{ marginTop: 16 }}>
        <aside className="card">
          <h2>{editingId ? 'Edit game' : 'Add game'}</h2>
          <div className="form">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Final Fantasy VII Rebirth" />
            </div>

            <div className="row">
              <div className="field">
                <label>Platform</label>
                <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="PS5" />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GameStatus })}>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Rating / 10</label>
                <input type="number" min="0" max="10" step="0.5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div className="field">
                <label>Hours</label>
                <input type="number" min="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Genre</label>
                <input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Racing" />
              </div>
              <div className="field">
                <label>Mood</label>
                <input value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} placeholder="Chill, sweaty, cinematic..." />
              </div>
            </div>

            <div className="field">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What made it good, bad, bloated, or worth finishing?" />
            </div>

            <button className="btn primary" onClick={saveGame}>{editingId ? 'Save changes' : 'Add to library'}</button>
            {editingId && (
              <button className="btn ghost" onClick={() => { setEditingId(null); setForm(emptyForm()); }}>Cancel edit</button>
            )}
          </div>
        </aside>

        <section className="card">
          <div className="toolbar">
            <div className="tabs">
              {(['All', ...statuses] as Array<'All' | GameStatus>).map((status) => (
                <button
                  key={status}
                  className={`tab ${activeStatus === status ? 'active' : ''}`}
                  onClick={() => setActiveStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games..." />
          </div>

          <div className="games">
            {filteredGames.length === 0 ? (
              <div className="empty">No games found. Add one, or change your filters.</div>
            ) : (
              filteredGames.map((game) => (
                <article className="game-card" key={game.id}>
                  <div className="cover">{game.title.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <div className="game-title">{game.title}</div>
                    <div className="meta">
                      <span className="pill status">{game.status}</span>
                      <span className="pill">{game.platform}</span>
                      {game.genre && <span className="pill">{game.genre}</span>}
                      {game.rating > 0 && <span className="pill">{game.rating}/10</span>}
                      {game.hours > 0 && <span className="pill">{game.hours}h</span>}
                    </div>
                    {game.notes && <div className="notes">{game.notes}</div>}
                  </div>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => editGame(game)} aria-label={`Edit ${game.title}`}>✎</button>
                    <button className="icon-btn" onClick={() => deleteGame(game.id)} aria-label={`Delete ${game.title}`}>×</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
