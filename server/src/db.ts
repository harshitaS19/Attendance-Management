import Database from 'better-sqlite3';

export const db = new Database('attendly.sqlite');

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','staff','student')),
  profileId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  courseId TEXT NOT NULL,
  staffId TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  assignedSubjects TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rollNumber TEXT NOT NULL,
  email TEXT NOT NULL,
  courseId TEXT NOT NULL,
  subjects TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  studentId TEXT NOT NULL,
  subjectId TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present','absent'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('warning','info','success')),
  read INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);
`);

const getCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
if (getCount.c === 0) {
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO users (id, username, password, role, profileId) VALUES (?, ?, ?, ?, ?)').run('1','admin','admin123','admin','1');
    db.prepare('INSERT INTO users (id, username, password, role, profileId) VALUES (?, ?, ?, ?, ?)').run('2','staff1','staff123','staff','1');
    db.prepare('INSERT INTO users (id, username, password, role, profileId) VALUES (?, ?, ?, ?, ?)').run('3','student1','student123','student','1');

    db.prepare('INSERT INTO courses (id, name, code) VALUES (?, ?, ?)').run('1','Information Technology','IT');
    db.prepare('INSERT INTO courses (id, name, code) VALUES (?, ?, ?)').run('2','Computer Science','CS');

    db.prepare('INSERT INTO subjects (id, name, code, courseId, staffId) VALUES (?, ?, ?, ?, ?)').run('1','Artificial Intelligence','AI101','1','1');
    db.prepare('INSERT INTO subjects (id, name, code, courseId, staffId) VALUES (?, ?, ?, ?, ?)').run('2','Database Management Systems','DBMS101','1','1');
    db.prepare('INSERT INTO subjects (id, name, code, courseId) VALUES (?, ?, ?, ?)').run('3','Web Development','WEB101','1');

    db.prepare('INSERT INTO staff (id, name, email, assignedSubjects) VALUES (?, ?, ?, ?)').run('1','Dr. John Smith','john@example.com', JSON.stringify(['1','2']));

    db.prepare('INSERT INTO students (id, name, rollNumber, email, courseId, subjects) VALUES (?, ?, ?, ?, ?, ?)').run('1','Harshi','IT001','harshi@example.com','1', JSON.stringify(['1','2','3']));
    db.prepare('INSERT INTO students (id, name, rollNumber, email, courseId, subjects) VALUES (?, ?, ?, ?, ?, ?)').run('2','Priya Sharma','IT002','priya@example.com','1', JSON.stringify(['1','2']));
  });
  tx();
}


