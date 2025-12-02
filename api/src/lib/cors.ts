/**
 * CORS Configuration for Desktop Application
 *
 * Allows requests from desktop app origins:
 * - http://localhost:8911 (development and production)
 * - tauri://localhost (Tauri desktop app)
 *
 * Reference: Report 09 (Desktop App Architecture) - CORS Configuration section
 */

export const corsConfig = {
  origin: [
    'http://localhost:8911',
    'http://localhost:8910', // Development port
    'tauri://localhost',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

export default corsConfig

