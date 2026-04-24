import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const db = new Database('game.db');
  
  // Initialize table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_state (
      id TEXT PRIMARY KEY,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/state', (req, res) => {
    try {
      const row = db.prepare('SELECT data FROM game_state WHERE id = ?').get('current') as { data: string } | undefined;
      if (row) {
        res.json(JSON.parse(row.data));
      } else {
        res.status(404).json({ error: 'No saved state' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch state' });
    }
  });

  app.post('/api/state', (req, res) => {
    try {
      const data = JSON.stringify(req.body);
      db.prepare('INSERT OR REPLACE INTO game_state (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run('current', data);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save state' });
    }
  });

  app.delete('/api/state', (req, res) => {
    try {
      db.prepare('DELETE FROM game_state WHERE id = ?').run('current');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset state' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
