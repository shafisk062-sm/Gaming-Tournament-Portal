import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Crown,
  Gamepad2,
  LayoutDashboard,
  Medal,
  Search,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  CalendarClock,
  Target,
  TimerReset,
  Map,
  UserCircle2,
  LogOut,
  Plus,
  ChartColumnBig,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const games = [
  'Free Fire',
  'BGMI',
  'Valorant',
  'Counter-Strike 2',
  'Call of Duty',
  'EA Sports FC',
];

const formatMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

const getInitialUser = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

const statusClasses = {
  Upcoming: 'bg-slate-700 text-slate-200',
  'Registration Open': 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
  Live: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
  Completed: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30',
};

function App() {
  const [user, setUser] = useState(getInitialUser);

  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/tournaments" element={<TournamentsPage user={user} />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage user={user} />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
          <Route path="/admin" element={<AdminPage user={user} onLogout={handleLogout} />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function PageShell({ children, user }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),transparent_35%),radial-gradient(circle_at_right,_rgba(34,211,238,0.15),transparent_32%),#020817] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-glow">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.18em] text-white">NEXUS</p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">ARENA</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <Link className="transition hover:text-white" to="/">Home</Link>
            <Link className="transition hover:text-white" to="/tournaments">Tournaments</Link>
            <Link className="transition hover:text-white" to="/leaderboard">Leaderboard</Link>
            <Link className="transition hover:text-white" to="/matches">Match Center</Link>
            <Link className="transition hover:text-white" to="/dashboard">Dashboard</Link>
            {user?.role === 'admin' || user?.role === 'organizer' ? <Link className="transition hover:text-white" to="/admin">Admin</Link> : null}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 md:flex">
              <Search className="h-4 w-4" />
              <input className="w-28 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search" />
            </div>
            <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200">
              <Bell className="h-4 w-4" />
            </button>
            {user ? (
              <div className="flex items-center gap-3 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1.5">
                <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.username)} alt="avatar" className="h-8 w-8 rounded-full border border-white/20" />
                <span className="hidden text-sm font-medium md:block">{user.username}</span>
              </div>
            ) : (
              <Link to="/auth" className="rounded-full border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 lg:px-8">
          <div>
            <p className="mb-4 text-lg font-black tracking-[0.2em] text-white">NEXUS</p>
            <p className="text-sm text-slate-400">Elite competition platform for players, teams, organizers, and communities seeking high-impact esports experiences.</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>About</li>
              <li>Careers</li>
              <li>Partners</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Community Rules</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Connect</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Discord</li>
              <li>X / Twitter</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ user }) {
  const [featured, setFeatured] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments'),
      api.get('/leaderboard'),
    ]).then(([tourRes, leadRes]) => {
      setFeatured(tourRes.data.slice(0, 4));
      setLeaderboard(leadRes.data.slice(0, 5));
    }).catch(() => {
      setFeatured([]);
      setLeaderboard([]);
    });
  }, []);

  const stats = [
    { label: 'Active tournaments', value: '97', icon: <Trophy className="h-5 w-5" /> },
    { label: 'Players online', value: '12.8K', icon: <Users className="h-5 w-5" /> },
    { label: 'Prize pools', value: '$1.4M', icon: <Medal className="h-5 w-5" /> },
  ];

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-slate-900/80 px-6 py-8 shadow-glow md:px-10 md:py-12">
          <div className="absolute inset-0 bg-grid bg-[length:30px_30px] opacity-40" />
          <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute right-10 top-0 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                <Zap className="h-3.5 w-3.5" />
                Esports ready
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">
                COMPETE. DOMINATE. CLAIM YOUR GLORY.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                A gaming tournament portal that helps players discover events, organize squads, track standings, and rise through competitive ladders.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/tournaments" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-glow transition hover:brightness-110">
                  Explore Tournaments <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/leaderboard" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                  Browse Games
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Featured event</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">NEXUS CUP</h2>
                </div>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-200">LIVE</span>
              </div>
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80" alt="Featured tournament" className="h-52 w-full rounded-2xl object-cover" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-slate-400">Pool</p>
                  <p className="mt-1 font-bold text-white">$15K</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-slate-400">Format</p>
                  <p className="mt-1 font-bold text-white">Squad</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 inline-flex rounded-xl border border-violet-400/20 bg-violet-500/10 p-2 text-violet-200">{item.icon}</div>
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Featured</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Upcoming tournaments</h2>
            </div>
            <Link to="/tournaments" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200">View all <ChevronRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {featured.map((event) => (
              <div key={event._id || event.title} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <img src={event.banner} alt={event.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses[event.status] || statusClasses.Upcoming}`}>{event.status}</span>
                    <span className="text-xs text-slate-300">{event.game}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{event.format} · {event.registeredCount}/{event.slots} slots</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Prize</span>
                    <span className="font-bold text-violet-200">{formatMoney(event.prizePool)}</span>
                  </div>
                  <Link to={`/tournaments/${event._id}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20">View event</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Popular games</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Trending titles</h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {games.map((game, idx) => (
                <div key={game} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-200">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{game}</p>
                      <p className="text-xs text-slate-400">{idx + 3} live events</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Leaderboard</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Top players</h2>
              </div>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={entry.id || entry.username} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 font-bold text-white">#{idx + 1}</div>
                    <div>
                      <p className="font-semibold text-white">{entry.username}</p>
                      <p className="text-xs text-slate-400">{entry.favoriteGame}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-200">{entry.points}</p>
                    <p className="text-xs text-slate-400">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Recent results</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Match recaps</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Apex Legion vs Nebula 5', result: 'Apex Legion wins 2-1', prize: '$3.5K' },
              { name: 'Crashpoint vs Inferno Unit', result: 'Crashpoint wins 16-12', prize: '$2.8K' },
              { name: 'Storm Riders vs Sky Breakers', result: 'Storm Riders lead 1-0', prize: '$4K' },
            ].map((match) => (
              <div key={match.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-200">Completed</span>
                  <span className="text-sm text-slate-400">{match.prize}</span>
                </div>
                <p className="text-base font-semibold text-white">{match.name}</p>
                <p className="mt-2 text-sm text-slate-300">{match.result}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">How it works</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Create, compete, conquer</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: <Star className="h-5 w-5" />, title: 'Create or join', text: 'Register as a player or organize tournament events for your community.' },
              { icon: <ShieldCheck className="h-5 w-5" />, title: 'Track stats', text: 'Follow results, leaderboard movement, and your tournament progress.' },
              { icon: <Crown className="h-5 w-5" />, title: 'Claim rewards', text: 'Unlock prize pools, rankings, and recognition across every event.' },
            ].map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-200">{step.icon}</div>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">0{index + 1}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function TournamentsPage({ user }) {
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [game, setGame] = useState('All');

  useEffect(() => {
    api.get('/tournaments').then((res) => setTournaments(res.data));
  }, []);

  const filtered = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.game.toLowerCase().includes(search.toLowerCase());
      const matchesGame = game === 'All' || item.game === game;
      const matchesStatus = status === 'All' || item.status === status;
      return matchesSearch && matchesGame && matchesStatus;
    });
  }, [tournaments, search, status, game]);

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">Discover</p>
            <h1 className="mt-2 text-4xl font-black text-white">Tournament listings</h1>
          </div>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100">Create team / join</Link>
        </div>

        <div className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" placeholder="Search event" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Game</label>
            <select value={game} onChange={(e) => setGame(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none">
              <option className="bg-slate-900">All</option>
              {games.map((item) => <option key={item} className="bg-slate-900">{item}</option>)}
            </select>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none">
              <option className="bg-slate-900">All</option>
              <option className="bg-slate-900">Upcoming</option>
              <option className="bg-slate-900">Registration Open</option>
              <option className="bg-slate-900">Live</option>
              <option className="bg-slate-900">Completed</option>
            </select>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Filters</label>
            <button onClick={() => { setSearch(''); setStatus('All'); setGame('All'); }} className="w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white">Reset filters</button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {filtered.map((event) => (
            <div key={event._id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
              <img src={event.banner} alt={event.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses[event.status] || statusClasses.Upcoming}`}>{event.status}</span>
                  <span className="text-xs text-slate-300">{event.game}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>Entry fee: <span className="font-semibold text-violet-200">{formatMoney(event.entryFee)}</span></p>
                  <p>Prize pool: <span className="font-semibold text-violet-200">{formatMoney(event.prizePool)}</span></p>
                  <p>Format: {event.format}</p>
                  <p>Deadline: {new Date(event.registrationDeadline).toLocaleString()}</p>
                  <p>{event.registeredCount}/{event.slots} slots filled</p>
                </div>
                <Link to={`/tournaments/${event._id}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 font-semibold text-white">View details</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

function TournamentDetailPage({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');

  const fetchEvent = () => {
    api.get(`/tournaments/${id}`).then((res) => setTournament(res.data)).catch(() => setError('Unable to load this tournament.'));
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const res = await api.post(`/tournaments/${id}/register`);
      setError('');
      fetchEvent();
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  if (!tournament) return <PageShell user={user}><main className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-300">{error || 'Loading tournament...'}</main></PageShell>;

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80">
          <img src={tournament.banner} alt={tournament.title} className="h-72 w-full object-cover" />
          <div className="p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">{tournament.game}</p>
                <h1 className="mt-2 text-4xl font-black text-white">{tournament.title}</h1>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${statusClasses[tournament.status] || statusClasses.Upcoming}`}>{tournament.status}</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="text-slate-300">{tournament.description}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-400">Prize pool</p>
                    <p className="mt-2 text-2xl font-black text-violet-200">{formatMoney(tournament.prizePool)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-400">Entry fee</p>
                    <p className="mt-2 text-2xl font-black text-violet-200">{formatMoney(tournament.entryFee)}</p>
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-white">Rules & eligibility</h2>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    {tournament.rules?.map((rule) => <li key={rule} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> {rule}</li>)}
                  </ul>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Registration</p>
                  <p className="mt-3 text-3xl font-black text-white">{tournament.registeredCount}/{tournament.slots}</p>
                  <button onClick={handleRegister} className="mt-5 w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 font-semibold text-white">Join Tournament</button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-cyan-300" /> {new Date(tournament.startsAt).toLocaleString()}</p>
                  <p className="mt-3 flex items-center gap-2"><TimerReset className="h-4 w-4 text-violet-300" /> Deadline: {new Date(tournament.registrationDeadline).toLocaleString()}</p>
                  <p className="mt-3 flex items-center gap-2"><Target className="h-4 w-4 text-emerald-300" /> Format: {tournament.format}</p>
                  <p className="mt-3 flex items-center gap-2"><Map className="h-4 w-4 text-amber-300" /> Organizer: {tournament.organizer?.name || 'NEXUS ARENA'}</p>
                </div>
              </aside>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-xl font-bold text-white">Registered participants</h3>
                <div className="mt-4 space-y-3">
                  {tournament.attendees?.map((player) => (
                    <div key={player._id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-2">
                      <img src={player.avatar} alt={player.username} className="h-10 w-10 rounded-full" />
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-slate-400">@{player.username}</p>
                      </div>
                    </div>
                  )) || <p className="text-slate-400">No participants yet.</p>}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-xl font-bold text-white">Leaderboard snapshot</h3>
                <div className="mt-4 space-y-3">
                  {['Astra Phoenix', 'Nova Drift', 'Blaze Viper','Raven Echo'].map((name, idx) => (
                    <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200">#{idx + 1}</span>
                        <span className="text-white">{name}</span>
                      </div>
                      <span className="text-sm text-slate-300">{1600 - idx * 120} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function LeaderboardPage({ user }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    api.get('/leaderboard').then((res) => setPlayers(res.data));
  }, []);

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Competitive ladder</p>
          <h1 className="mt-2 text-4xl font-black text-white">Global leaderboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {players.slice(0, 3).map((player, idx) => (
            <div key={player.id || player.username} className={`rounded-3xl border p-5 ${idx === 0 ? 'border-violet-400/50 bg-violet-500/10' : idx === 1 ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-amber-400/40 bg-amber-500/10'}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-white">Rank #{player.rank}</span>
                <Crown className="h-5 w-5 text-yellow-300" />
              </div>
              <div className="flex items-center gap-3">
                <img src={player.avatar} alt={player.username} className="h-14 w-14 rounded-full border border-white/10" />
                <div>
                  <p className="text-lg font-bold text-white">{player.username}</p>
                  <p className="text-sm text-slate-300">{player.favoriteGame}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-950/40 p-3"><p className="text-slate-400">Points</p><p className="mt-1 text-lg font-bold text-white">{player.points}</p></div>
                <div className="rounded-xl bg-slate-950/40 p-3"><p className="text-slate-400">Wins</p><p className="mt-1 text-lg font-bold text-white">{player.wins}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
          <div className="grid grid-cols-[0.6fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-xs uppercase tracking-[0.16em] text-slate-400">
            <span>Rank</span>
            <span>Player</span>
            <span>Game</span>
            <span>Wins</span>
            <span>Points</span>
          </div>
          {players.map((player) => (
            <div key={player.username} className="grid grid-cols-[0.6fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 px-5 py-4 text-sm text-slate-200 last:border-none">
              <span className="font-bold text-violet-200">#{player.rank}</span>
              <div className="flex items-center gap-3">
                <img src={player.avatar} alt={player.username} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-semibold text-white">{player.username}</p>
                  <p className="text-xs text-slate-400">{player.name}</p>
                </div>
              </div>
              <span>{player.favoriteGame}</span>
              <span>{player.wins}</span>
              <span className="font-bold text-violet-200">{player.points}</span>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

function MatchesPage({ user }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get('/matches').then((res) => setMatches(res.data));
  }, []);

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Match center</p>
            <h1 className="mt-2 text-4xl font-black text-white">Live schedule</h1>
          </div>
          <div className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Updated live</div>
        </div>

        <div className="space-y-5">
          {matches.map((match) => (
            <div key={match._id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{match.round}</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{match.title}</h2>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClasses[match.status] || statusClasses.Upcoming}`}>{match.status}</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Team A</p>
                  <p className="mt-2 text-2xl font-black text-white">{match.participants[0]}</p>
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-4 text-2xl font-black text-violet-200">
                  {match.score?.teamA ?? 0} : {match.score?.teamB ?? 0}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Team B</p>
                  <p className="mt-2 text-2xl font-black text-white">{match.participants[1]}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <span>{new Date(match.scheduledAt).toLocaleString()}</span>
                <span>Last updated: {new Date(match.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

function DashboardPage({ user, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/profile').then((res) => setProfile(res.data)).catch(() => setProfile(null));
  }, [user]);

  if (!user) {
    return (
      <PageShell user={user}>
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-black text-white">Player dashboard</h1>
          <p className="mt-4 text-slate-300">Sign in to manage tournaments, teams, notifications, and rankings.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-semibold text-white">Login to continue</Link>
        </main>
      </PageShell>
    );
  }

  const boards = [
    { label: 'Current rank', value: '#12', icon: <Trophy className="h-5 w-5" /> },
    { label: 'Registered tournaments', value: profile?.tournaments?.length || 0, icon: <CalendarClock className="h-5 w-5" /> },
    { label: 'Wins', value: user.wins || 14, icon: <Medal className="h-5 w-5" /> },
    { label: 'Points', value: user.points || 1850, icon: <Gamepad2 className="h-5 w-5" /> },
  ];

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Player dashboard</p>
            <h1 className="mt-2 text-4xl font-black text-white">Welcome back, {user.name || user.username}</h1>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"><LogOut className="h-4 w-4" />Logout</button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {boards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 inline-flex rounded-xl border border-violet-400/20 bg-violet-500/10 p-2 text-violet-200">{item.icon}</div>
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Registered tournaments</h2>
              <Link to="/tournaments" className="text-sm text-violet-200">Browse</Link>
            </div>
            <div className="space-y-3">
              {(profile?.tournaments || []).length ? profile.tournaments.map((event) => (
                <div key={event._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.game} · {event.status}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-200">Confirmed</span>
                </div>
              )) : <p className="text-slate-400">No tournaments joined yet.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <Bell className="h-5 w-5 text-violet-200" />
            </div>
            <div className="space-y-3">
              {(profile?.notifications || []).length ? profile.notifications.map((note) => (
                <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  {note.message}
                </div>
              )) : <p className="text-slate-400">No new notifications.</p>}
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function AdminPage({ user, onLogout }) {
  const [stats, setStats] = useState({ stats: { totalUsers: 0, totalTournaments: 0, activeTournaments: 0, totalRegistrations: 0, upcomingMatches: 0 } });
  const [form, setForm] = useState({ title: '', game: 'Valorant', format: 'Squad', entryFee: 10, prizePool: 5000, registrationDeadline: '', startsAt: '', slots: 32, status: 'Registration Open', description: '' });

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
    return (
      <PageShell user={user}>
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-violet-200" />
          <h1 className="mt-4 text-4xl font-black text-white">Access denied</h1>
          <p className="mt-3 text-slate-300">This dashboard is restricted to organizers and administrators.</p>
        </main>
      </PageShell>
    );
  }

  const handleCreateTournament = async (event) => {
    event.preventDefault();
    try {
      await api.post('/tournaments', form);
      alert('Tournament created successfully');
      setForm({ title: '', game: 'Valorant', format: 'Squad', entryFee: 10, prizePool: 5000, registrationDeadline: '', startsAt: '', slots: 32, status: 'Registration Open', description: '' });
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to create tournament');
    }
  };

  const chartData = [
    { name: 'Valorant', users: 42 },
    { name: 'BGMI', users: 31 },
    { name: 'CS2', users: 26 },
    { name: 'FC25', users: 18 },
  ];

  return (
    <PageShell user={user}>
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Admin console</p>
            <h1 className="mt-2 text-4xl font-black text-white">Tournament operations</h1>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"><LogOut className="h-4 w-4" />Logout</button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            { label: 'Total users', value: stats.stats.totalUsers },
            { label: 'Total tournaments', value: stats.stats.totalTournaments },
            { label: 'Active', value: stats.stats.activeTournaments },
            { label: 'Registrations', value: stats.stats.totalRegistrations },
            { label: 'Upcoming matches', value: stats.stats.upcomingMatches },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center gap-3">
              <ChartColumnBig className="h-5 w-5 text-violet-200" />
              <h2 className="text-2xl font-bold text-white">Participation overview</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Plus className="h-5 w-5 text-cyan-200" />
              <h2 className="text-2xl font-bold text-white">Create tournament</h2>
            </div>
            <form onSubmit={handleCreateTournament} className="grid gap-3 text-sm text-slate-200">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tournament title" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" required />
              <div className="grid gap-3 md:grid-cols-2">
                <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none">
                  {games.map((game) => <option key={game}>{game}</option>)}
                </select>
                <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none">
                  <option>Solo</option>
                  <option>Duo</option>
                  <option>Squad</option>
                  <option>Team</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="number" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" />
                <input type="number" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" required />
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" required />
              </div>
              <input type="number" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" />
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tournament description" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none" required />
              <button type="submit" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 font-semibold text-white">Publish tournament</button>
            </form>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function AuthPage({ onAuthSuccess, user }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', favoriteGame: 'Valorant' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, username: form.username, email: form.email, password: form.password, favoriteGame: form.favoriteGame };

      const res = await api.post(endpoint, payload);
      onAuthSuccess({ token: res.data.token, user: res.data.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    }
  };

  return (
    <PageShell user={user}>
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-8">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">Elite access</p>
          <h1 className="mt-4 text-4xl font-black text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-4 text-slate-300">Join a competitive gaming community built for players, organizers, and teams.</p>
          <div className="mt-8 space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Register for tournaments instantly</div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Manage teams and live match updates</div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Access organizers, dashboards, and rankings</div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-8">
          <div className="mb-6 flex gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 font-semibold ${mode === 'login' ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white' : 'text-slate-300'}`}>Login</button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 font-semibold ${mode === 'register' ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white' : 'text-slate-300'}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" required />
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" required />
              </>
            )}
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" required />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" required />
            {mode === 'register' && (
              <select value={form.favoriteGame} onChange={(e) => setForm({ ...form, favoriteGame: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none">
                {games.map((game) => <option key={game}>{game}</option>)}
              </select>
            )}
            {error && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 font-semibold text-white">{mode === 'login' ? 'Login to account' : 'Create account'}</button>
          </form>
        </div>
      </main>
    </PageShell>
  );
}

export default App;
