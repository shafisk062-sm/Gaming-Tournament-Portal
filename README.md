# NEXUS ARENA — Gaming Tournament Portal

## Run locally

1. Install and start MongoDB Community Server, or create a MongoDB Atlas database.
2. In `server`, copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string. For a local MongoDB server, use:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/nexus_arena
   ```

   For Atlas, use the URI from your Atlas deployment and replace its username, password, and database name. Keep `.env` private.
3. Start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

4. In a second terminal, start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`. The API health check is at `http://localhost:5000/api/health`.

Sample tournaments and demo accounts are inserted into MongoDB when the database is empty. Demo accounts:

- Admin: `admin@nexusarena.gg` / `admin123`
- Organizer: `organizer@nexusarena.gg` / `organizer123`
- Player: `nova@nexusarena.gg` / `player123`

Change demo credentials and `JWT_SECRET` before deploying this application.
