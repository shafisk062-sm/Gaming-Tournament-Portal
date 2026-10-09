const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexus-arena-secret';

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['player', 'organizer', 'admin'], default: 'player' },
    avatar: { type: String, default: 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=Player' },
    favoriteGame: { type: String, default: 'Valorant' },
    points: { type: Number, default: 1200 },
    wins: { type: Number, default: 14 },
    matchesPlayed: { type: Number, default: 26 },
    status: { type: String, enum: ['active', 'banned', 'pending'], default: 'active' },
  },
  { timestamps: true }
);

const tournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: String, required: true },
    format: { type: String, enum: ['Solo', 'Duo', 'Squad', 'Team'], required: true },
    status: { type: String, enum: ['Upcoming', 'Registration Open', 'Live', 'Completed'], default: 'Registration Open' },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 5000 },
    registrationDeadline: { type: String, required: true },
    startsAt: { type: String, required: true },
    description: { type: String, default: 'Competitive tournament for elite players.' },
    rules: [{ type: String }],
    banner: { type: String, default: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
    slots: { type: Number, default: 64 },
    registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const matchSchema = new mongoose.Schema(
  {
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    title: { type: String, required: true },
    round: { type: String, default: 'Quarter Finals' },
    status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming' },
    scheduledAt: { type: String, required: true },
    participants: [{ type: String }],
    score: { type: Object, default: { teamA: 0, teamB: 0 } },
    winner: { type: String, default: '' },
    lastUpdated: { type: String, default: Date.now },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'info' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Match = mongoose.model('Match', matchSchema);
const Notification = mongoose.model('Notification', notificationSchema);

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_arena';
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    favoriteGame: user.favoriteGame,
    points: user.points,
    wins: user.wins,
    matchesPlayed: user.matchesPlayed,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function issueToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function seedData() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  const organizerHash = await bcrypt.hash('organizer123', 10);

  const users = await User.insertMany([
    {
      name: 'Astra Phoenix',
      username: 'astraphoenix',
      email: 'admin@nexusarena.gg',
      passwordHash,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?background=7c3aed&color=fff&name=Astra',
      favoriteGame: 'Valorant',
      points: 3200,
      wins: 58,
      matchesPlayed: 66,
    },
    {
      name: 'Raven Echo',
      username: 'ravenecho',
      email: 'organizer@nexusarena.gg',
      passwordHash: organizerHash,
      role: 'organizer',
      avatar: 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=Raven',
      favoriteGame: 'Counter-Strike 2',
      points: 2500,
      wins: 44,
      matchesPlayed: 52,
    },
    {
      name: 'Nova Drift',
      username: 'novadrift',
      email: 'nova@nexusarena.gg',
      passwordHash: await bcrypt.hash('player123', 10),
      role: 'player',
      avatar: 'https://ui-avatars.com/api/?background=22c55e&color=fff&name=Nova',
      favoriteGame: 'Free Fire',
      points: 1940,
      wins: 22,
      matchesPlayed: 35,
    },
    {
      name: 'Blaze Viper',
      username: 'blazeviper',
      email: 'blaze@nexusarena.gg',
      passwordHash: await bcrypt.hash('player123', 10),
      role: 'player',
      avatar: 'https://ui-avatars.com/api/?background=f59e0b&color=fff&name=Blaze',
      favoriteGame: 'BGMI',
      points: 1880,
      wins: 20,
      matchesPlayed: 42,
    },
  ]);

  const organizer = users[1];
  const admin = users[0];

  const tournaments = await Tournament.insertMany([
    {
      title: 'NEXUS CUP: Valorant Masters',
      game: 'Valorant',
      format: 'Squad',
      status: 'Registration Open',
      entryFee: 15,
      prizePool: 15000,
      registrationDeadline: '2026-11-05T18:00:00Z',
      startsAt: '2026-11-08T18:00:00Z',
      description: 'Elite 5v5 tactical showdown featuring top-ranked squads and high stakes prize money.',
      rules: ['Teams of 5', 'Must register before deadline', 'Map veto and custom rules apply'],
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      slots: 32,
      registeredPlayers: [users[2]._id, users[3]._id],
      organizer: organizer._id,
      approved: true,
    },
    {
      title: 'Skyfall BGMI Clash',
      game: 'BGMI',
      format: 'Squad',
      status: 'Live',
      entryFee: 10,
      prizePool: 8000,
      registrationDeadline: '2026-10-15T16:00:00Z',
      startsAt: '2026-10-20T18:00:00Z',
      description: 'Fast-paced tactical battle on battle royale maps with live scoring and spectator action.',
      rules: ['4-player squads', 'No cheating or emulation', 'Match results submitted by organizers'],
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      slots: 24,
      registeredPlayers: [users[2]._id],
      organizer: organizer._id,
      approved: true,
    },
    {
      title: 'Glitch Prime CS2 Open',
      game: 'Counter-Strike 2',
      format: 'Team',
      status: 'Upcoming',
      entryFee: 20,
      prizePool: 12000,
      registrationDeadline: '2026-12-02T12:00:00Z',
      startsAt: '2026-12-09T18:00:00Z',
      description: 'Professional-level tactical shooter tournament with bracket-based progression.',
      rules: ['5-player lineup required', 'Map pool announced 24 hours before start', 'Matches may include ref checks'],
      banner: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80',
      slots: 16,
      registeredPlayers: [users[3]._id],
      organizer: admin._id,
      approved: true,
    },
  ]);

  await Match.insertMany([
    {
      tournamentId: tournaments[0]._id,
      title: 'Valorant Semifinal',
      round: 'Semifinal',
      status: 'Live',
      scheduledAt: '2026-10-11T18:30:00Z',
      participants: ['Apex Legion', 'Nebula 5'],
      score: { teamA: 12, teamB: 10 },
      winner: '',
      lastUpdated: new Date().toISOString(),
    },
    {
      tournamentId: tournaments[1]._id,
      title: 'BGMI Finals',
      round: 'Finals',
      status: 'Upcoming',
      scheduledAt: '2026-10-20T20:00:00Z',
      participants: ['Sky Breakers', 'Storm Riders'],
      score: { teamA: 0, teamB: 0 },
      winner: '',
      lastUpdated: new Date().toISOString(),
    },
    {
      tournamentId: tournaments[2]._id,
      title: 'CS2 Quarterfinal',
      round: 'Quarter Final',
      status: 'Completed',
      scheduledAt: '2026-09-18T19:00:00Z',
      participants: ['Crashpoint', 'Inferno Unit'],
      score: { teamA: 16, teamB: 12 },
      winner: 'Crashpoint',
      lastUpdated: new Date().toISOString(),
    },
  ]);

  await Notification.insertMany([
    { userId: users[2]._id, type: 'registration', message: 'You are registered for NEXUS CUP: Valorant Masters.', read: false },
    { userId: users[2]._id, type: 'match', message: 'Your next match is scheduled for Thursday at 18:30 UTC.', read: false },
    { userId: users[3]._id, type: 'result', message: 'The latest tournament standings have been updated.', read: true },
  ]);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NEXUS ARENA API is running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, password, role, favoriteGame } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be completed.' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email or username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      email,
      passwordHash,
      role: role || 'player',
      favoriteGame: favoriteGame || 'Valorant',
    });

    const token = issueToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({ token: issueToken(user), user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
    const tournaments = await Tournament.find({ registeredPlayers: user._id }).lean();
    const upcomingMatches = await Match.find({ participants: { $in: [user.username] } }).lean();

    return res.json({
      user: sanitizeUser(user),
      tournaments,
      notifications: notifications.map((item) => ({ id: item._id, message: item.message, type: item.type, read: item.read })),
      upcomingMatches,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile', error: error.message });
  }
});

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('organizer', 'name username').sort({ createdAt: -1 }).lean();
    return res.json(
      tournaments.map((item) => ({
        ...item,
        registeredCount: item.registeredPlayers.length,
        organizerName: item.organizer ? item.organizer.name : 'NEXUS ARENA',
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tournaments', error: error.message });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('organizer', 'name username').lean();
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const attendees = await User.find({ _id: { $in: tournament.registeredPlayers } }, 'name username avatar').lean();
    return res.json({
      ...tournament,
      registeredCount: tournament.registeredPlayers.length,
      attendees,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tournament', error: error.message });
  }
});

app.post('/api/tournaments', authMiddleware, async (req, res) => {
  try {
    const { title, game, format, status, entryFee, prizePool, registrationDeadline, startsAt, slots, description, rules } = req.body;

    const tournament = await Tournament.create({
      title,
      game,
      format,
      status: status || 'Registration Open',
      entryFee: Number(entryFee || 0),
      prizePool: Number(prizePool || 5000),
      registrationDeadline,
      startsAt,
      slots: Number(slots || 32),
      description: description || 'New tournament created by organizer.',
      rules: Array.isArray(rules) ? rules : ['Follow all tournament rules.'],
      organizer: req.user.id,
      approved: true,
    });

    return res.status(201).json(tournament);
  } catch (error) {
    return res.status(500).json({ message: 'Tournament creation failed', error: error.message });
  }
});

app.post('/api/tournaments/:id/register', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tournament = await Tournament.findById(req.params.id);

    if (!user || !tournament) {
      return res.status(404).json({ message: 'Tournament or player not found' });
    }

    if (tournament.status === 'Completed') {
      return res.status(400).json({ message: 'This tournament is already completed.' });
    }

    if (tournament.registeredPlayers.some((id) => id.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'You are already registered for this tournament.' });
    }

    if (tournament.registeredPlayers.length >= tournament.slots) {
      return res.status(400).json({ message: 'Tournament is full.' });
    }

    tournament.registeredPlayers.push(user._id);
    await tournament.save();

    await Notification.create({
      userId: user._id,
      type: 'registration',
      message: `Registration confirmed for ${tournament.title}.`,
      read: false,
    });

    io.emit('tournament-update', { tournamentId: tournament._id, registeredCount: tournament.registeredPlayers.length });

    return res.json({ message: 'Registration successful', registeredCount: tournament.registeredPlayers.length });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['player', 'admin'] } }).sort({ points: -1 }).limit(10).lean();
    return res.json(users.map((user, index) => ({
      ...sanitizeUser(user),
      rank: index + 1,
      winRate: user.matchesPlayed ? ((user.wins / user.matchesPlayed) * 100).toFixed(1) : 0,
    })));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load leaderboard', error: error.message });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ scheduledAt: 1 }).lean();
    return res.json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch matches', error: error.message });
  }
});

app.post('/api/matches/:id/result', authMiddleware, async (req, res) => {
  try {
    const { teamA, teamB, winner, status } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.score = { teamA: Number(teamA || match.score.teamA), teamB: Number(teamB || match.score.teamB) };
    match.winner = winner || match.winner;
    match.status = status || 'Completed';
    match.lastUpdated = new Date().toISOString();
    await match.save();

    io.emit('match-update', { matchId: match._id, score: match.score, status: match.status, winner: match.winner });

    return res.json({ message: 'Match result updated', match });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update match result', error: error.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalTournaments, totalRegistrations, matches] = await Promise.all([
      User.countDocuments(),
      Tournament.countDocuments(),
      Tournament.aggregate([{ $project: { total: { $size: '$registeredPlayers' } } }, { $group: { _id: null, count: { $sum: '$total' } } }]),
      Match.find().sort({ scheduledAt: 1 }).limit(5).lean(),
    ]);

    const activeTournaments = await Tournament.countDocuments({ status: { $in: ['Registration Open', 'Live'] } });
    const upcomingMatches = await Match.countDocuments({ status: 'Upcoming' });

    return res.json({
      stats: {
        totalUsers,
        totalTournaments,
        activeTournaments,
        totalRegistrations: totalRegistrations[0]?.count || 0,
        upcomingMatches,
      },
      recentMatches: matches,
      participation: [
        { name: 'Valorant', users: 42 },
        { name: 'BGMI', users: 31 },
        { name: 'CS2', users: 26 },
        { name: 'FIFA', users: 18 },
      ],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load dashboard data', error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

(async () => {
  try {
    await connectDatabase();
    await seedData();

    io.on('connection', (socket) => {
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
      });
    });

    server.listen(PORT, () => {
      console.log(`NEXUS ARENA server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start NEXUS ARENA. Check MONGO_URI and ensure MongoDB is reachable.', error);
    process.exit(1);
  }
})();
