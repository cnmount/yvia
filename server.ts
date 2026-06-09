import express from "express";
import path from "path";
import fs from "fs";
import { open } from "./sqlite_sim.js";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = "d1_sim.db";

// Types
interface CourseData {
  id: string;
  name: string;
  nameZh: string;
  source: string;
  description: string;
  descriptionZh: string;
  ageGroup: string;
  duration: string;
  keyConcepts: string[];
  images: string[];
  approved: boolean;
  notes?: string;
}

interface EventData {
  id: string;
  title: string;
  titleZh: string;
  status: 'past' | 'upcoming';
  location: string;
  date: string;
  description: string;
  descriptionZh: string;
  targetAudience: string;
  images: string[];
  approved: boolean;
  notes?: string;
  creatorId?: string | null;
  creatorEmail?: string | null;
  submissionStatus?: 'approved' | 'pending' | 'rejected';
}

const staticCourses: CourseData[] = [
  {
    id: 'scratchmaths',
    name: 'UCL ScratchMaths',
    nameZh: 'UCL ScratchMaths',
    source: 'UCL Knowledge Lab (University College London)',
    ageGroup: 'Ages 9-11 (Primary Years)',
    duration: '10-12 Weeks Course',
    keyConcepts: [
      'Geometry & Spatial Directions',
      'Algorithms & Iteration',
      'Variables & Coordinate Systems',
      'Pattern Copying and Scale'
    ],
    description: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
    descriptionZh: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
    images: [
      '/src/assets/images/scratch_maths_learning_1780441786319.png',
      '/src/assets/images/scratch_maths_art_1780441801018.png',
      '/src/assets/images/scratch_maths_peer_1780441816378.png',
      '/src/assets/images/scratch_maths_interface_1780441832376.png'
    ],
    approved: true
  },
  {
    id: 'drone',
    name: 'Drone Robotics & Autonomous Control',
    nameZh: 'Drone Robotics & Autonomous Control',
    source: 'YVIA Applied STEM Curriculum',
    ageGroup: 'Ages 11-15 (Intermediate & High School)',
    duration: '8-10 Weeks Course',
    keyConcepts: [
      'Aerodynamics & Physics of Flight',
      'Autonomous Pilot Programming',
      'Coordinates in 3D Space',
      'Sensor Feedback & Telemetry'
    ],
    description: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
    descriptionZh: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
    images: [
      '/src/assets/images/drone_assembly_1780442981249.png',
      '/src/assets/images/drone_coding_pure_1780443362735.png',
      '/src/assets/images/drone_flight_1780443008643.png',
      '/src/assets/images/drone_physics_1780443022348.png'
    ],
    approved: true
  },
  {
    id: 'zmrobo',
    name: 'Modular Intelligent Robotics (MIR)',
    nameZh: 'Modular Intelligent Robotics',
    source: 'Robotics Education Ecosystem',
    ageGroup: 'Ages 8-13 (Junior STEM)',
    duration: '8-12 Weeks Course',
    keyConcepts: [
      'Sensory-Motor Control Loops',
      'Structural Engineering & Mechanics',
      'Conditional Logic & Branching',
      'Real-world Problem Solving'
    ],
    description: 'MIR combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
    descriptionZh: 'MIR combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
    images: [
      '/src/assets/images/zmrobo_assembly_1780443384038.png',
      '/src/assets/images/zmrobo_sensor_1780443400305.png',
      '/src/assets/images/zmrobo_programming_1780443416555.png',
      '/src/assets/images/zmrobo_mechanics_1780443454422.png'
    ],
    approved: true
  },
  {
    id: 'hawgent',
    name: 'Dynamic Visual Mathematics (DVM)',
    nameZh: 'Dynamic Visual Mathematics',
    source: 'Technology & Research Center',
    ageGroup: 'Ages 10-15 (Interactive Visuals)',
    duration: '6-8 Weeks Course',
    keyConcepts: [
      'Dynamic Geometric Models',
      'Visualizing Algebraic Formulae',
      '3D Coordinate Projections',
      'Interactive Functions & Tracing'
    ],
    description: 'Featuring Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
    descriptionZh: 'Featuring Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
    images: [
      '/src/assets/images/hawgent_dynamic_geometry_1780443868827.png',
      '/src/assets/images/hawgent_trigonometry_1780443884256.png',
      '/src/assets/images/hawgent_algebra_blocks_1780443899111.png',
      '/src/assets/images/hawgent_3d_projection_1780443911575.png'
    ],
    approved: true
  },
  {
    id: 'secondarymaths',
    name: 'Creative Middle & Secondary Mathematics',
    nameZh: 'Creative Middle & Secondary Mathematics',
    source: 'YVIA Deep Thinking Curriculum',
    ageGroup: 'Ages 12-16 (Middle School Maths)',
    duration: '10 Weeks Course',
    keyConcepts: [
      'Logical Deduction & Proof Writing',
      'Statistics, Probability & Data Science',
      'Calculus Intuitives & Infinite Series',
      'Cryptographic Functions & Game Theory'
    ],
    description: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
    descriptionZh: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
    images: [
      '/src/assets/images/secmaths_chalkboard_1780444627246.png',
      '/src/assets/images/secmaths_precision_1780444643265.png',
      '/src/assets/images/secmaths_academic_1780444658617.png',
      '/src/assets/images/secmaths_homework_1780444674614.png'
    ],
    approved: true
  },
  {
    id: 'aico-creation',
    name: 'AI Co-Creation & Playability Workshop',
    nameZh: 'AI Co-Creation & Playability Workshop',
    source: 'YVIA Next-Gen AI Technology',
    ageGroup: 'Ages 10-18 (AI Agency & Play)',
    duration: '8 Weeks Workshop',
    keyConcepts: [
      'Mastering AI Agency & Ownership',
      'Peer-led Group Collaboration',
      'Enhancing Real-World Playability',
      'Physical-Digital Hybrid Interaction'
    ],
    description: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
    descriptionZh: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
    images: [
      '/src/assets/images/aico_collaboration_1780446541477.png',
      '/src/assets/images/aico_prompt_design_1780445344415.png',
      '/src/assets/images/aico_storyboard_1780445362724.png',
      '/src/assets/images/aico_play_physical_1780446864951.png'
    ],
    approved: true
  }
];

const staticEvents: EventData[] = [
  {
    id: 'aicocamp',
    title: 'AI Co-Creation Camp: Playability in Uncertainty',
    titleZh: 'AI Co-Creation Camp: Playability in Uncertainty',
    status: 'past',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Held: May 2026',
    description: 'We will guide all participants to use AI tools to transform daily life into fun, interactive experiences. Through teamwork, we nurture children\'s innovative thinking and AI application skills while enhancing interaction among participants and exploring the endless possibilities of AI and playability together. Based on Citizens of Play references.',
    descriptionZh: 'We will guide all participants to use AI tools to transform daily life into fun, interactive experiences. Through teamwork, we nurture children\'s innovative thinking and AI application skills while enhancing interaction among participants and exploring the endless possibilities of AI and playability together. Based on Citizens of Play references.',
    targetAudience: 'Youth & Family Teams (7-16 years with parents)',
    images: [
      '/src/assets/images/aico_collaboration_1780446541477.png',
      '/src/assets/images/aico_prompt_design_1780445344415.png',
      '/src/assets/images/aico_storyboard_1780445362724.png',
      '/src/assets/images/aico_play_physical_1780446864951.png'
    ],
    approved: true,
    creatorId: null,
    creatorEmail: null,
    submissionStatus: 'approved'
  },
  {
    id: 'explore-scratch',
    title: 'Exploring with UCL ScratchMaths',
    titleZh: 'Exploring with UCL ScratchMaths',
    status: 'upcoming',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Upcoming: June 2026',
    description: 'Dive directly into the ScratchMaths curriculum with hands-on, interactive computer challenges. Guided by YVIA youth peer leaders, children will learn how geometric angles trace beautiful spiral art and code their very first mathematically verified coordinate-chasing arcade game.',
    descriptionZh: 'Dive directly into the ScratchMaths curriculum with hands-on, interactive computer challenges. Guided by YVIA youth peer leaders, children will learn how geometric angles trace beautiful spiral art and code their very first mathematically verified coordinate-chasing arcade game.',
    targetAudience: 'Suggested Ages 8-12 (No laptop required, YVIA provided)',
    images: [
      '/src/assets/images/scratch_maths_learning_1780441786319.png',
      '/src/assets/images/scratch_maths_peer_1780441816378.png',
      '/src/assets/images/scratch_maths_art_1780441801018.png',
      '/src/assets/images/scratch_maths_interface_1780441832376.png'
    ],
    approved: true,
    creatorId: null,
    creatorEmail: null,
    submissionStatus: 'approved'
  }
];

let db: any;

function safeJsonArray(value: any, fallback: any[] = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function initializeDatabase() {
  db = await open({
    filename: DB_FILE,
  });

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON;");

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      country TEXT,
      city TEXT,
      neighborhood TEXT,
      profession TEXT,
      professionalTitle TEXT,
      desiredTracks TEXT, -- JSON string array
      submittedAt TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      level TEXT DEFAULT 'Graduate Node',
      points INTEGER DEFAULT 10
    );
  `);

  // Create Courses Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameZh TEXT NOT NULL,
      source TEXT NOT NULL,
      description TEXT NOT NULL,
      descriptionZh TEXT NOT NULL,
      ageGroup TEXT NOT NULL,
      duration TEXT NOT NULL,
      keyConcepts TEXT NOT NULL, -- JSON string array
      images TEXT NOT NULL, -- JSON string array
      approved INTEGER DEFAULT 1,
      notes TEXT
    );
  `);

  // Create Events Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      titleZh TEXT NOT NULL,
      status TEXT NOT NULL, -- 'past' | 'upcoming'
      location TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      descriptionZh TEXT NOT NULL,
      targetAudience TEXT NOT NULL,
      images TEXT NOT NULL, -- JSON string array
      approved INTEGER DEFAULT 1,
      notes TEXT,
      creatorId TEXT,
      creatorEmail TEXT,
      submissionStatus TEXT DEFAULT 'approved', -- 'approved' | 'pending' | 'rejected'
      FOREIGN KEY(creatorId) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Create Event Registrations Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userEmail TEXT NOT NULL,
      fullName TEXT NOT NULL,
      registeredAt TEXT NOT NULL,
      FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(eventId, userId)
    );
  `);

  // Create Simulated Mail Logs Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails_sent (
      id TEXT PRIMARY KEY,
      toEmail TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      sentAt TEXT NOT NULL
    );
  `);

  // Seed Users if empty
  const usersCount = await db.get("SELECT COUNT(*) as count FROM users");
  if (usersCount && usersCount.count === 0) {
    console.log("Seeding initial users into SQLite Database...");
    const sampleUsers = [
      {
        id: "cf-reg-1",
        fullName: "Alifelix Vance",
        email: "af.vance@waikato.ac.nz",
        password: "af.vance", // Default email prefix password
        country: "New Zealand",
        city: "Hamilton",
        neighborhood: "Rototuna North",
        profession: "Senior Firmware Architect",
        professionalTitle: "Director of Embedded Robotics",
        desiredTracks: JSON.stringify(["Mentor", "Growth"]),
        submittedAt: "2026-06-01T10:44:00Z",
        role: "user",
        level: "Silicon Expert Node",
        points: 400
      },
      {
        id: "cf-reg-2",
        fullName: "Dr. Clara Hastings",
        email: "clara.hastings@geometry.org",
        password: "clara.hastings",
        country: "United Kingdom",
        city: "London",
        neighborhood: "Bloomsbury",
        profession: "Mathematical Computing Lecturer",
        professionalTitle: "Research Fellow, UCL Knowledge Lab",
        desiredTracks: JSON.stringify(["Growth", "Prosumer"]),
        submittedAt: "2026-06-02T14:12:30Z",
        role: "user",
        level: "Academic Research Leader Node",
        points: 300
      },
      {
        id: "cf-reg-3",
        fullName: "Zimol Zhang",
        email: "zimol.zhang@outlook.com",
        password: "zimol.zhang",
        country: "China",
        city: "Shenzhen",
        neighborhood: "Nanshan Tech Park",
        profession: "AI Hardware Student Maker",
        professionalTitle: "Youth Lead Team Lead",
        desiredTracks: JSON.stringify(["Mentee", "Mentor"]),
        submittedAt: "2026-06-02T22:15:22Z",
        role: "user",
        level: "Junior STEM Maker Node",
        points: 50
      }
    ];

    for (const u of sampleUsers) {
      await db.run(
        `INSERT INTO users (id, fullName, email, password, country, city, neighborhood, profession, professionalTitle, desiredTracks, submittedAt, role, level, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.fullName, u.email, u.password, u.country, u.city, u.neighborhood, u.profession, u.professionalTitle, u.desiredTracks, u.submittedAt, u.role, u.level, u.points]
      );
    }
  }

  // Seed Courses if empty
  const coursesCount = await db.get("SELECT COUNT(*) as count FROM courses");
  if (coursesCount && coursesCount.count === 0) {
    console.log("Seeding default courses into SQLite Database...");
    for (const c of staticCourses) {
      await db.run(
        `INSERT INTO courses (id, name, nameZh, source, description, descriptionZh, ageGroup, duration, keyConcepts, images, approved, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.nameZh, c.source, c.description, c.descriptionZh, c.ageGroup, c.duration, JSON.stringify(c.keyConcepts), JSON.stringify(c.images), c.approved ? 1 : 0, c.notes || '']
      );
    }
  }

  // Seed Events if empty
  const eventsCount = await db.get("SELECT COUNT(*) as count FROM events");
  if (eventsCount && eventsCount.count === 0) {
    console.log("Seeding default events into SQLite Database...");
    for (const e of staticEvents) {
      await db.run(
        `INSERT INTO events (id, title, titleZh, status, location, date, description, descriptionZh, targetAudience, images, approved, notes, creatorId, creatorEmail, submissionStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.id, e.title, e.titleZh, e.status, e.location, e.date, e.description, e.descriptionZh, e.targetAudience, JSON.stringify(e.images), e.approved ? 1 : 0, e.notes || '', e.creatorId, e.creatorEmail, e.submissionStatus]
      );
    }
  }

  console.log("Database initialized successfully with seeded tables.");
}

// Mail Notification Sender helper
async function queueEmail(toEmail: string, subject: string, content: string) {
  const id = "email-" + Date.now() + Math.floor(Math.random() * 1000);
  const sentAt = new Date().toISOString();
  await db.run(
    "INSERT INTO emails_sent (id, toEmail, subject, content, sentAt) VALUES (?, ?, ?, ?, ?)",
    [id, toEmail, subject, content, sentAt]
  );
  console.log(`[MAIL DISPATCHED] to: ${toEmail} | sub: "${subject}"`);
}

async function startServer() {
  await initializeDatabase();

  const app = express();
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", typeof origin === "string" ? origin : "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(express.json());

  // API ─── USERS / GATEWAYS ───
  app.post("/api/login", async (req, res) => {
    const { email = "", password = "" } = req.body || {};
    try {
      const user = await db.get("SELECT * FROM users WHERE email = ? COLLATE NOCASE", [String(email).trim()]);
      if (!user) {
        return res.status(401).json({ error: "Invalid Email Address." });
      }
      if (user.password !== password) {
        return res.status(412).json({ error: "Incorrect Security Passphrase." });
      }

      // Parse JSON fields
      const resUser = {
        ...user,
        desiredTracks: safeJsonArray(user.desiredTracks),
      };
      res.json(resUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const {
        fullName = "",
        email = "",
        country = "",
        city = "",
        neighborhood = "",
        profession = "",
        professionalTitle = "",
        desiredTracks = [],
        surplusSkills = []
      } = req.body || {};

      const emailLower = String(email || "").trim().toLowerCase();
      if (!emailLower) {
        return res.status(400).json({ error: "Email is required." });
      }

      const cleanFullName = String(fullName).trim();
      if (!cleanFullName) {
        return res.status(400).json({ error: "Full name is required." });
      }

      // Check duplicate
      const existing = await db.get("SELECT id FROM users WHERE email = ?", [emailLower]);
      if (existing) {
        return res.status(409).json({ error: "Email already registered in system." });
      }

      const cleanCountry = String(country).trim();
      const cleanCity = String(city).trim();
      const cleanNeighborhood = String(neighborhood).trim();
      const cleanProfession = String(profession).trim();
      const cleanProfessionalTitle = String(professionalTitle).trim() || "STEM Participant";

      const cleanDesiredTracks = Array.isArray(desiredTracks) ? desiredTracks : [];

      const id = "cf-" + Date.now();
      const defaultPassword = emailLower.split('@')[0] || "password123";
      const submittedAt = new Date().toISOString();

      // Simple rating/classification of Node Level
      let level = "Graduate Node Member";

      await db.run(
        `INSERT INTO users (id, fullName, email, password, country, city, neighborhood, profession, professionalTitle, desiredTracks, submittedAt, role, level, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          cleanFullName,
          emailLower,
          defaultPassword,
          cleanCountry,
          cleanCity,
          cleanNeighborhood,
          cleanProfession,
          cleanProfessionalTitle,
          JSON.stringify(cleanDesiredTracks),
          submittedAt,
          "user",
          level,
          15
        ]
      );

      const registeredUser = await db.get("SELECT * FROM users WHERE id = ?", [id]);
      const responseUser = {
        ...registeredUser,
        desiredTracks: safeJsonArray(registeredUser?.desiredTracks),
      };

      await queueEmail(
        emailLower,
        "Welcome to YVIA Grid! [Credentials Security Notice]",
        `Hello ${cleanFullName}! Your account has been created. Username: ${emailLower}, Default passphrase: ${defaultPassword}`.trim()
      );
      res.status(201).json(responseUser);
    } catch (e: any) {
      console.error("Crash in custom registration endpoint:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/user/update", async (req, res) => {
    try {
      const { id, fullName = "", neighborhood = "", profession = "", professionalTitle = "", password = "" } = req.body || {};
      
      const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
      if (!user) {
        return res.status(404).json({ error: "User profile not found." });
      }

      await db.run(
        `UPDATE users 
         SET fullName = ?, neighborhood = ?, profession = ?, professionalTitle = ?, password = ?
         WHERE id = ?`,
        [
          String(fullName).trim(),
          String(neighborhood).trim(),
          String(profession).trim(),
          String(professionalTitle).trim(),
          String(password).trim(),
          id
        ]
      );

      // Fetch updated user
      const updatedUser = await db.get("SELECT * FROM users WHERE id = ?", [id]);
      const resUser = {
        ...updatedUser,
        desiredTracks: safeJsonArray(updatedUser?.desiredTracks),
      };
      res.json(resUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin access all registry submissions
  app.get("/api/submissions", async (req, res) => {
    try {
      const users = await db.all("SELECT * FROM users ORDER BY submittedAt DESC");
      const parsedUsers = users.map(u => ({
        ...u,
        desiredTracks: safeJsonArray(u?.desiredTracks),
      }));
      res.json(parsedUsers);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // API ─── COURSES ───
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await db.all("SELECT * FROM courses");
      const parsed = courses.map(c => ({
        ...c,
        keyConcepts: safeJsonArray(c.keyConcepts),
        images: safeJsonArray(c.images),
        approved: c.approved === 1
      }));
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/courses/toggle-approve", async (req, res) => {
    const { id, approved } = req.body;
    try {
      await db.run("UPDATE courses SET approved = ? WHERE id = ?", [approved ? 1 : 0, id]);
      res.json({ success: true, id, approved });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // API ─── EVENTS ───
  // GET events will join registration count - REQ 5
  app.get("/api/events", async (req, res) => {
    try {
      const query = `
        SELECT e.*, COUNT(r.id) as attendeeCount 
        FROM events e
        LEFT JOIN event_registrations r ON e.id = r.eventId
        GROUP BY e.id
      `;
      const events = await db.all(query);
      const parsed = events.map(e => ({
        ...e,
        images: safeJsonArray(e.images),
        approved: e.approved === 1,
        attendeeCount: e.attendeeCount || 0
      }));
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // User submits/hosts a new Event - REQ 6
  app.post("/api/events/initiate", async (req, res) => {
    const {
      title,
      location,
      date,
      description,
      targetAudience,
      images,
      creatorId,
      creatorEmail
    } = req.body;

    try {
      // Validate host requirements: high level or completed an event registration (already has points or registrations)
      const user = await db.get("SELECT level, points FROM users WHERE id = ?", [creatorId]);
      if (!user) {
        return res.status(403).json({ error: "Host User Node not found in registry." });
      }

      // Check registrations count as condition
      const regCount = await db.get("SELECT COUNT(*) as count FROM event_registrations WHERE userId = ?", [creatorId]);
      const meetsCondition = 
        (user.level && user.level.includes("Silicon")) || 
        (user.level && user.level.includes("Academic")) || 
        (user.level && user.level.includes("Systems")) ||
        (regCount && regCount.count >= 1);

      if (!meetsCondition) {
        return res.status(403).json({ 
          error: "Inadequate Grid Reputation. To host a decentralized playability event, you must either possess a Pioneer level node ('Silicon Expert'/'Academic Leader') OR have actively participated as a registered attendee in at least 1 verified YVIA event." 
        });
      }

      const id = "evt-" + Date.now();
      const imgsJson = JSON.stringify(images && images.length > 0 ? images : ['/src/assets/images/aico_collaboration_1780446541477.png']);

      await db.run(
        `INSERT INTO events (id, title, titleZh, status, location, date, description, descriptionZh, targetAudience, images, approved, notes, creatorId, creatorEmail, submissionStatus)
         VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?, 0, '', ?, ?, 'pending')`,
        [id, title, title, location, date, description, description, targetAudience, imgsJson, creatorId, creatorEmail]
      );

      // Confirm user hosted submission email - REQ 6
      const emailContent = `
Hello ${creatorEmail}!

Your YVIA Event proposal: "${title}" has been successfully broadcast to the grid mesh. 

Status: [🔒 PENDING REVIEW]
Submitted Coords: ${location} | Scheduled: ${date}

Your proposal is currently queued for security audit by network administrators. Once approved, the event will instantly publish on the Events roster under the "Cooperative Grid Initiated Events" sector. You will receive an automated dispatch email on approval.

Thank you for fueling peer STEM leadership!

Sincerely,
YVIA Core Infrastructure Automation Agent
      `.trim();

      await queueEmail(creatorEmail, `Event Proposal Logged: ${title}`, emailContent);

      res.status(201).json({ success: true, message: "Event initiated. Sent for administrator review." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin approves/declines event submission - REQ 7
  app.post("/api/events/toggle-approve", async (req, res) => {
    const { id, approved, submissionStatus } = req.body; // submissionStatus can be 'approved', 'pending', 'rejected'
    try {
      const event = await db.get("SELECT * FROM events WHERE id = ?", [id]);
      if (!event) {
        return res.status(404).json({ error: "Mesh event not found." });
      }

      const statusVal = submissionStatus || (approved ? 'approved' : 'pending');
      const approvedNum = approved ? 1 : 0;

      await db.run(
        "UPDATE events SET approved = ?, submissionStatus = ? WHERE id = ?",
        [approvedNum, statusVal, id]
      );

      // If user-initiated, dispatch notification email - REQ 7
      if (event.creatorEmail) {
        let subject = `YVIA Mesh Update: Event Proposal Audit Complete`;
        let mailContent = '';

        if (statusVal === 'approved') {
          subject = `Approved: YVIA Custom Event Confirmed for Display [${event.title}]`;
          mailContent = `
Dear Host ${event.creatorEmail},

Congratulations! Your customized YVIA Citizen Playability event proposal has passed mesh security audits.

• Event Node: "${event.title}"
• Grid Location: ${event.location}
• Status: [✅ ACTIVE DISPLAY]

The event is now officially active and listed on the YVIA grid system. Registered members can now start signing up!

Best of luck with your event,
YVIA Core Infrastructure Automation Agent
          `.trim();
        } else if (statusVal === 'rejected') {
          subject = `Audit Update: Event Proposal Returned for Refinement`;
          mailContent = `
Dear Host ${event.creatorEmail},

Your event proposal: "${event.title}" has been reviewed by administrators. This node has been returned for refinement.

• Event Node: "${event.title}"
• Status: [❌ REFINED/REJECTED]

Please feel free to resubmit an updated proposal matching local youth hardware guidelines at your leisure.

Sincerely,
YVIA Core Infrastructure Automation Agent
          `.trim();
        }

        if (mailContent) {
          await queueEmail(event.creatorEmail, subject, mailContent);
        }
      }

      res.json({ success: true, id, approved, submissionStatus: statusVal });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // API ─── EVENT REGISTRATIONS ───
  // Registered for event - REQ 5
  app.post("/api/events/register", async (req, res) => {
    const { eventId, userId } = req.body;
    try {
      // Validate
      const event = await db.get("SELECT * FROM events WHERE id = ?", [eventId]);
      if (!event) {
        return res.status(404).json({ error: "Requested event is unavailable." });
      }
      if (event.approved === 0 || event.submissionStatus !== 'approved') {
        return res.status(400).json({ error: "Event is not approved or currently active for registrations." });
      }

      const user = await db.get("SELECT fullName, email, points FROM users WHERE id = ?", [userId]);
      if (!user) {
        return res.status(404).json({ error: "User credential profile not found." });
      }

      // Check duplication
      const existing = await db.get(
        "SELECT id FROM event_registrations WHERE eventId = ? AND userId = ?",
        [eventId, userId]
      );
      if (existing) {
        return res.status(409).json({ error: "You are already actively registered for this event." });
      }

      const id = "reg-link-" + Date.now();
      const registeredAt = new Date().toISOString();

      await db.run(
        `INSERT INTO event_registrations (id, eventId, userId, userEmail, fullName, registeredAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, eventId, userId, user.email, user.fullName, registeredAt]
      );

      // User gains grid reputation points by registering/participating in events!
      const newPoints = (user.points || 0) + 50;
      await db.run("UPDATE users SET points = ? WHERE id = ?", [newPoints, userId]);

      // Dispatch auto registration email - REQ 5
      const emailContent = `
Dear ${user.fullName},

We have safely processed your registration for YVIA Citizen playability event!

• Event: "${event.title}"
• Host Location: ${event.location}
• Time Scheduled: ${event.date}
• Ticket Ingress: ${id}

📊 Reputation Award: You earned +50 Gp (Grid Power reputation). 
Your current Grid reputation is: ${newPoints} Gp.

Thank you for choosing to integrate tech learning directly into your community. We hope to see you there!

Sincerely,
YVIA Core Infrastructure Automation Agent
      `.trim();

      await queueEmail(user.email, `Registration Confirmed: ${event.title}`, emailContent);

      res.status(201).json({ success: true, newPoints });
    } catch (e: any) {
      if (e.message.includes("UNIQUE")) {
        return res.status(409).json({ error: "You are already actively registered for this event." });
      }
      res.status(500).json({ error: e.message });
    }
  });

  // Get active registrations for user portal - REQ 5
  app.get("/api/user/registrations", async (req, res) => {
    const { userId } = req.query;
    try {
      const query = `
        SELECT r.id as registrationId, r.registeredAt, e.*
        FROM event_registrations r
        JOIN events e ON r.eventId = e.id
        WHERE r.userId = ?
        ORDER BY r.registeredAt DESC
      `;
      const list = await db.all(query, [userId]);
      const parsed = list.map(item => ({
        registrationId: item.registrationId,
        registeredAt: item.registeredAt,
        event: {
          id: item.id,
          title: item.title,
          titleZh: item.titleZh,
          status: item.status,
          location: item.location,
          date: item.date,
          description: item.description,
          descriptionZh: item.descriptionZh,
          targetAudience: item.targetAudience,
          images: safeJsonArray(item.images), // stringified so component can handle consistently if parsed
          approved: item.approved === 1,
          submissionStatus: item.submissionStatus
        }
      }));
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // API ─── EMAILS SUB-SYSTEM OUTBOX (Viewable in Admin/Profile) ───
  app.get("/api/emails", async (req, res) => {
    try {
      const logs = await db.all("SELECT * FROM emails_sent ORDER BY sentAt DESC");
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API ─── EXPORT FULL DATABASE BACKDOOR LOG ───
  app.get("/api/admin/export", async (req, res) => {
    try {
      const users = await db.all("SELECT * FROM users");
      const courses = await db.all("SELECT * FROM courses");
      const events = await db.all("SELECT * FROM events");
      const registrations = await db.all("SELECT * FROM event_registrations");
      const emails = await db.all("SELECT * FROM emails_sent");

      res.json({
        exportDate: new Date().toISOString(),
        users,
        courses,
        events,
        registrations,
        emails
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // Serve frontend routes with static files inside development/production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for unknown endpoints (Single Page App routing support)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK GRID SERVER RUNNING] http://localhost:${PORT}`);
  });
}

startServer();
