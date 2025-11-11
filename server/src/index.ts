import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { db } from './db.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const id = () => Date.now().toString();

app.post('/auth/login', (req, res) => {
  const schema = z.object({ username: z.string(), password: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

  const { username, password } = parsed.data;
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  const user = stmt.get(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user });
});

app.get('/courses', (_req, res) => {
  const rows = db.prepare('SELECT * FROM courses').all();
  res.json(rows);
});

app.get('/subjects', (_req, res) => {
  const rows = db.prepare('SELECT * FROM subjects').all();
  res.json(rows);
});

app.get('/students', (_req, res) => {
  const rows = db.prepare('SELECT * FROM students').all()
    .map((s: any) => ({ ...s, subjects: JSON.parse(s.subjects) }));
  res.json(rows);
});

const studentSchema = z.object({
  name: z.string().min(1),
  rollNumber: z.string().min(1),
  email: z.string().email(),
  courseId: z.string().min(1),
  subjects: z.array(z.string())
});

app.post('/students', (req, res) => {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const sid = id();
  const s = parsed.data;
  db.prepare('INSERT INTO students (id, name, rollNumber, email, courseId, subjects) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sid, s.name, s.rollNumber, s.email, s.courseId, JSON.stringify(s.subjects));
  const created = db.prepare('SELECT * FROM students WHERE id = ?').get(sid) as any;
  res.status(201).json({ ...created, subjects: JSON.parse(created.subjects) });
});

app.put('/students/:id', (req, res) => {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const s = parsed.data;
  const result = db.prepare('UPDATE students SET name=?, rollNumber=?, email=?, courseId=?, subjects=? WHERE id=?')
    .run(s.name, s.rollNumber, s.email, s.courseId, JSON.stringify(s.subjects), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
  res.json({ ...updated, subjects: JSON.parse(updated.subjects) });
});

app.delete('/students/:id', (req, res) => {
  const result = db.prepare('DELETE FROM students WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

app.get('/notifications/:userId', (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE userId = ?').all(req.params.userId)
    .map((n: any) => ({ ...n, read: !!n.read }));
  res.json(rows);
});

app.post('/notifications', (req, res) => {
  const schema = z.object({
    userId: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.enum(['warning','info','success']),
    read: z.boolean().default(false)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const payload = parsed.data;
  const nid = id();
  db.prepare('INSERT INTO notifications (id, userId, title, message, type, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(nid, payload.userId, payload.title, payload.message, payload.type, payload.read ? 1 : 0, new Date().toISOString());
  const created = db.prepare('SELECT * FROM notifications WHERE id = ?').get(nid) as any;
  res.status(201).json({ ...created, read: !!created.read });
});

app.put('/notifications/:id/read', (req, res) => {
  const result = db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const n = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id) as any;
  res.json({ ...n, read: !!n.read });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});


