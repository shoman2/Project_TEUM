import path from "node:path";
import fs from "node:fs";
import { config } from "../config/env.js";

let db: any = null;
const memorySessions = new Map<string, any>();
const memoryEvents: any[] = [];

try {
  // Use /tmp on Vercel Serverless
  const rawPath = process.env.VERCEL ? "/tmp/tteum.db" : config.dbPath;
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const { DatabaseSync } = await import("node:sqlite");
  db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      anonymous_id TEXT NOT NULL,
      recommendation_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      place_name TEXT NOT NULL,
      predicted_minutes INTEGER NOT NULL,
      actual_minutes INTEGER,
      reflection TEXT,
      abandon_reason TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      anonymous_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
} catch (err) {
  // Fallback to in-memory store if node:sqlite or file system is restricted
  db = null;
}

export interface SessionRecord {
  id: string;
  anonymousId: string;
  recommendationId: string;
  placeId: string;
  placeName: string;
  predictedMinutes: number;
  actualMinutes?: number;
  reflection?: string;
  abandonReason?: string;
  status: "started" | "completed" | "abandoned";
  createdAt: string;
  updatedAt: string;
}

export const sessionRepository = {
  createSession(session: Omit<SessionRecord, "createdAt" | "updatedAt">): SessionRecord {
    const now = new Date().toISOString();
    const record: SessionRecord = {
      ...session,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO sessions (
            id, anonymous_id, recommendation_id, place_id, place_name,
            predicted_minutes, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          session.id,
          session.anonymousId,
          session.recommendationId,
          session.placeId,
          session.placeName,
          session.predictedMinutes,
          session.status,
          now,
          now
        );
      } catch {
        memorySessions.set(session.id, record);
      }
    } else {
      memorySessions.set(session.id, record);
    }

    return record;
  },

  completeSession(id: string, actualMinutes: number, reflection: string): void {
    const now = new Date().toISOString();
    if (db) {
      try {
        const stmt = db.prepare(`
          UPDATE sessions
          SET actual_minutes = ?, reflection = ?, status = 'completed', updated_at = ?
          WHERE id = ?
        `);
        stmt.run(actualMinutes, reflection, now, id);
        return;
      } catch {
        // fallback
      }
    }
    const mem = memorySessions.get(id);
    if (mem) {
      mem.actualMinutes = actualMinutes;
      mem.reflection = reflection;
      mem.status = "completed";
      mem.updatedAt = now;
    }
  },

  abandonSession(id: string, elapsedMinutes: number, reason: string): void {
    const now = new Date().toISOString();
    if (db) {
      try {
        const stmt = db.prepare(`
          UPDATE sessions
          SET actual_minutes = ?, abandon_reason = ?, status = 'abandoned', updated_at = ?
          WHERE id = ?
        `);
        stmt.run(elapsedMinutes, reason, now, id);
        return;
      } catch {
        // fallback
      }
    }
    const mem = memorySessions.get(id);
    if (mem) {
      mem.actualMinutes = elapsedMinutes;
      mem.abandonReason = reason;
      mem.status = "abandoned";
      mem.updatedAt = now;
    }
  },

  logEvent(anonymousId: string, eventName: string, payload: Record<string, unknown>): void {
    const now = new Date().toISOString();
    const id = "evt_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO events (id, anonymous_id, event_name, payload_json, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(id, anonymousId, eventName, JSON.stringify(payload), now);
        return;
      } catch {
        // fallback
      }
    }
    memoryEvents.push({ id, anonymousId, eventName, payload, createdAt: now });
  },
};
