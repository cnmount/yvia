// Cloudflare Pages Functions router
// Catch-all route to mock/adapt active Express endpoints to Cloudflare D1 Database

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// JSON helper
function safeJsonArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Transparent DB Wrappers mapping D1 API to SQLite syntax
async function dbGet(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const row = await stmt.bind(...params).first();
  return row || undefined;
}

async function dbAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const { results } = await stmt.bind(...params).all();
  return results || [];
}

async function dbRun(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const info = await stmt.bind(...params).run();
  return { lastID: null, changes: info.success ? 1 : 0 };
}

// Auto provisioning schema and data seeding if empty on Cloudflare D1
async function checkAndInitDatabase(db) {
  try {
    // Check if table 'users' exists
    await db.prepare("SELECT 1 FROM users LIMIT 1").first();
  } catch (error) {
    console.log("Database tables do not exist. Bootstrapping schema...");

    // Create Tables
    await db.prepare(`
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
        desiredTracks TEXT, -- JSON array of flags
        submittedAt TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        level TEXT DEFAULT 'Graduate Node',
        points INTEGER DEFAULT 10
      );
    `).run();

    await db.prepare(`
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
    `).run();

    await db.prepare(`
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
    `).run();

    await db.prepare(`
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
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS emails_sent (
        id TEXT PRIMARY KEY,
        toEmail TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        sentAt TEXT NOT NULL
      );
    `).run();

    // Seeding sample users
    const sampleUsers = [
      {
        id: "cf-reg-1",
        fullName: "Alifelix Vance",
        email: "af.vance@waikato.ac.nz",
        password: "af.vance",
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
      await db.prepare(`
        INSERT INTO users (id, fullName, email, password, country, city, neighborhood, profession, professionalTitle, desiredTracks, submittedAt, role, level, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        u.id, u.fullName, u.email, u.password, u.country, u.city, u.neighborhood, u.profession, u.professionalTitle, u.desiredTracks, u.submittedAt, u.role, u.level, u.points
      ).run();
    }

    // Seeding courses
    const staticCourses = [
      {
        id: 'scratchmaths',
        name: 'UCL ScratchMaths',
        nameZh: 'UCL ScratchMaths',
        source: 'UCL Knowledge Lab (University College London)',
        ageGroup: 'Ages 9-11 (Primary Years)',
        duration: '10-12 Weeks Course',
        description: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
        descriptionZh: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
        keyConcepts: JSON.stringify([
          'Geometry & Spatial Directions',
          'Algorithms & Iteration',
          'Variables & Coordinate Systems',
          'Pattern Copying and Scale'
        ]),
        images: JSON.stringify([
          '/src/assets/images/scratch_maths_learning_1780441786319.png',
          '/src/assets/images/scratch_maths_art_1780441801018.png',
          '/src/assets/images/scratch_maths_peer_1780441816378.png',
          '/src/assets/images/scratch_maths_interface_1780441832376.png'
        ]),
        approved: 1
      },
      {
        id: 'drone',
        name: 'Drone Robotics & Autonomous Control',
        nameZh: 'Drone Robotics & Autonomous Control',
        source: 'YVIA Applied STEM Curriculum',
        ageGroup: 'Ages 11-15 (Intermediate & High School)',
        duration: '8-10 Weeks Course',
        description: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
        descriptionZh: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
        keyConcepts: JSON.stringify([
          'Aerodynamics & Physics of Flight',
          'Autonomous Pilot Programming',
          'Coordinates in 3D Space',
          'Sensor Feedback & Telemetry'
        ]),
        images: JSON.stringify([
          '/src/assets/images/drone_assembly_1780442981249.png',
          '/src/assets/images/drone_coding_pure_1780443362735.png',
          '/src/assets/images/drone_flight_1780443008643.png',
          '/src/assets/images/drone_physics_1780443022348.png'
        ]),
        approved: 1
      },
      {
        id: 'zmrobo',
        name: 'Modular Intelligent Robotics (MIR)',
        nameZh: 'Modular Intelligent Robotics',
        source: 'Robotics Education Ecosystem',
        ageGroup: 'Ages 8-13 (Junior STEM)',
        duration: '8-12 Weeks Course',
        description: 'MIR combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
        descriptionZh: 'MIR combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
        keyConcepts: JSON.stringify([
          'Sensory-Motor Control Loops',
          'Structural Engineering & Mechanics',
          'Conditional Logic & Branching',
          'Real-world Problem Solving'
        ]),
        images: JSON.stringify([
          '/src/assets/images/zmrobo_assembly_1780443384038.png',
          '/src/assets/images/zmrobo_sensor_1780443400305.png',
          '/src/assets/images/zmrobo_programming_1780443416555.png',
          '/src/assets/images/zmrobo_mechanics_1780443454422.png'
        ]),
        approved: 1
      },
      {
        id: 'hawgent',
        name: 'Dynamic Visual Mathematics (DVM)',
        nameZh: 'Dynamic Visual Mathematics',
        source: 'Technology & Research Center',
        ageGroup: 'Ages 10-15 (Interactive Visuals)',
        duration: '6-8 Weeks Course',
        description: 'Featuring Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
        descriptionZh: 'Featuring Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
        keyConcepts: JSON.stringify([
          'Dynamic Geometric Models',
          'Visualizing Algebraic Formulae',
          '3D Coordinate Projections',
          'Interactive Functions & Tracing'
        ]),
        images: JSON.stringify([
          '/src/assets/images/hawgent_dynamic_geometry_1780443868827.png',
          '/src/assets/images/hawgent_trigonometry_1780443884256.png',
          '/src/assets/images/hawgent_algebra_blocks_1780443899111.png',
          '/src/assets/images/hawgent_3d_projection_1780443911575.png'
        ]),
        approved: 1
      },
      {
        id: 'secondarymaths',
        name: 'Creative Middle & Secondary Mathematics',
        nameZh: 'Creative Middle & Secondary Mathematics',
        source: 'YVIA Deep Thinking Curriculum',
        ageGroup: 'Ages 12-16 (Middle School Maths)',
        duration: '10 Weeks Course',
        description: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
        descriptionZh: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
        keyConcepts: JSON.stringify([
          'Logical Deduction & Proof Writing',
          'Statistics, Probability & Data Science',
          'Calculus Intuitives & Infinite Series',
          'Cryptographic Functions & Game Theory'
        ]),
        images: JSON.stringify([
          '/src/assets/images/secmaths_chalkboard_1780444627246.png',
          '/src/assets/images/secmaths_precision_1780444643265.png',
          '/src/assets/images/secmaths_academic_1780444658617.png',
          '/src/assets/images/secmaths_homework_1780444674614.png'
        ]),
        approved: 1
      },
      {
        id: 'aico-creation',
        name: 'AI Co-Creation & Playability Workshop',
        nameZh: 'AI Co-Creation & Playability Workshop',
        source: 'YVIA Next-Gen AI Technology',
        ageGroup: 'Ages 10-18 (AI Agency & Play)',
        duration: '8 Weeks Workshop',
        description: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
        descriptionZh: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
        keyConcepts: JSON.stringify([
          'Mastering AI Agency & Ownership',
          'Peer-led Group Collaboration',
          'Enhancing Real-World Playability',
          'Physical-Digital Hybrid Interaction'
        ]),
        images: JSON.stringify([
          '/src/assets/images/aico_collaboration_1780446541477.png',
          '/src/assets/images/aico_prompt_design_1780445344415.png',
          '/src/assets/images/aico_storyboard_1780445362724.png',
          '/src/assets/images/aico_play_physical_1780446864951.png'
        ]),
        approved: 1
      }
    ];

    for (const c of staticCourses) {
      await db.prepare(`
        INSERT INTO courses (id, name, nameZh, source, description, descriptionZh, ageGroup, duration, keyConcepts, images, approved, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')
      `).bind(
        c.id, c.name, c.nameZh, c.source, c.description, c.descriptionZh, c.ageGroup, c.duration, c.keyConcepts, c.images, c.approved
      ).run();
    }

    // Seeding events
    const staticEvents = [
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
        images: JSON.stringify([
          '/src/assets/images/aico_collaboration_1780446541477.png',
          '/src/assets/images/aico_prompt_design_1780445344415.png',
          '/src/assets/images/aico_storyboard_1780445362724.png',
          '/src/assets/images/aico_play_physical_1780446864951.png'
        ]),
        approved: 1,
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
        images: JSON.stringify([
          '/src/assets/images/scratch_maths_learning_1780441786319.png',
          '/src/assets/images/scratch_maths_peer_1780441816378.png',
          '/src/assets/images/scratch_maths_art_1780441801018.png',
          '/src/assets/images/scratch_maths_interface_1780441832376.png'
        ]),
        approved: 1,
        submissionStatus: 'approved'
      }
    ];

    for (const e of staticEvents) {
      await db.prepare(`
        INSERT INTO events (id, title, titleZh, status, location, date, description, descriptionZh, targetAudience, images, approved, notes, creatorId, creatorEmail, submissionStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', NULL, NULL, ?)
      `).bind(
        e.id, e.title, e.titleZh, e.status, e.location, e.date, e.description, e.descriptionZh, e.targetAudience, e.images, e.approved, e.submissionStatus
      ).run();
    }

    console.log("Database initialized successfully with seeded tables inside Cloudflare.");
  }
}

// Mail Notification Sender helper
async function queueEmail(db, toEmail, subject, content) {
  const id = "email-" + Date.now() + Math.floor(Math.random() * 1000);
  const sentAt = new Date().toISOString();
  await db.prepare(
    "INSERT INTO emails_sent (id, toEmail, subject, content, sentAt) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, toEmail, subject, content, sentAt).run();
}

// Handler serving POST/GET matching different router endpoints
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. CORS Preflight Option fallback
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2. Validate D1 binding presence
  const db = env.DB;
  if (!db) {
    return new Response(JSON.stringify({ 
      error: "D1 Database binding missing in Cloudflare.",
      message: "Please ensure you have configured a Cloudflare D1 Database and bound it with the exact name 'DB' to your Cloudflare Pages/Worker project configurations, then rebuild."
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  // 3. Ensure DB initialized and seeded (idempotently)
  try {
    await checkAndInitDatabase(db);
  } catch (e) {
    return new Response(JSON.stringify({ 
      error: "DB bootstrap schema crash on Cloudflare D1.",
      details: e.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  // Helper response builders
  const jsonOk = (data) => new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const jsonCreated = (data) => new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const jsonErr = (message, status = 500) => new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    // ────────── API ROUTES ──────────

    // POST /api/login
    if (pathname === "/api/login" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const { email = "", password = "" } = body;
      
      const user = await dbGet(db, "SELECT * FROM users WHERE email = ? COLLATE NOCASE", [String(email).trim()]);
      if (!user) {
        return jsonErr("Invalid Email Address.", 401);
      }
      if (user.password !== password) {
        return jsonErr("Incorrect Security Passphrase.", 412);
      }

      const resUser = {
        ...user,
        desiredTracks: safeJsonArray(user.desiredTracks),
      };
      return jsonOk(resUser);
    }

    // POST /api/register
    if (pathname === "/api/register" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const {
        fullName = "",
        email = "",
        country = "",
        city = "",
        neighborhood = "",
        profession = "",
        professionalTitle = "",
        desiredTracks = []
      } = body;

      const emailLower = String(email || "").trim().toLowerCase();
      if (!emailLower) {
        return jsonErr("Email is required.", 400);
      }

      const cleanFullName = String(fullName).trim();
      if (!cleanFullName) {
        return jsonErr("Full name is required.", 400);
      }

      const existing = await dbGet(db, "SELECT id FROM users WHERE email = ?", [emailLower]);
      if (existing) {
        return jsonErr("Email already registered in system.", 409);
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
      const level = "Graduate Node Member";

      await dbRun(db, 
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

      const registeredUser = await dbGet(db, "SELECT * FROM users WHERE id = ?", [id]);
      const responseUser = {
        ...registeredUser,
        desiredTracks: safeJsonArray(registeredUser?.desiredTracks),
      };

      await queueEmail(db,
        emailLower,
        "Welcome to YVIA Grid! [Credentials Security Notice]",
        `Hello ${cleanFullName}! Your account has been created. Username: ${emailLower}, Default passphrase: ${defaultPassword}`.trim()
      );

      return jsonCreated(responseUser);
    }

    // POST /api/user/update
    if (pathname === "/api/user/update" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const { id, fullName = "", neighborhood = "", profession = "", professionalTitle = "", password = "" } = body;

      const user = await dbGet(db, "SELECT * FROM users WHERE id = ?", [id]);
      if (!user) {
        return jsonErr("User profile not found.", 404);
      }

      await dbRun(db,
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

      const updatedUser = await dbGet(db, "SELECT * FROM users WHERE id = ?", [id]);
      const resUser = {
        ...updatedUser,
        desiredTracks: safeJsonArray(updatedUser?.desiredTracks),
      };
      return jsonOk(resUser);
    }

    // GET /api/submissions
    if (pathname === "/api/submissions" && request.method === "GET") {
      const users = await dbAll(db, "SELECT * FROM users ORDER BY submittedAt DESC");
      const parsedUsers = users.map(u => ({
        ...u,
        desiredTracks: safeJsonArray(u?.desiredTracks),
      }));
      return jsonOk(parsedUsers);
    }

    // GET /api/courses
    if (pathname === "/api/courses" && request.method === "GET") {
      const courses = await dbAll(db, "SELECT * FROM courses");
      const parsed = courses.map(c => ({
        ...c,
        keyConcepts: safeJsonArray(c.keyConcepts),
        images: safeJsonArray(c.images),
        approved: c.approved === 1
      }));
      return jsonOk(parsed);
    }

    // POST /api/courses/toggle-approve
    if (pathname === "/api/courses/toggle-approve" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const { id, approved } = body;

      await dbRun(db, "UPDATE courses SET approved = ? WHERE id = ?", [approved ? 1 : 0, id]);
      return jsonOk({ success: true, id, approved });
    }

    // GET /api/events
    if (pathname === "/api/events" && request.method === "GET") {
      const query = `
        SELECT e.*, COUNT(r.id) as attendeeCount 
        FROM events e
        LEFT JOIN event_registrations r ON e.id = r.eventId
        GROUP BY e.id
      `;
      const events = await dbAll(db, query);
      const parsed = events.map(e => ({
        ...e,
        images: safeJsonArray(e.images),
        approved: e.approved === 1,
        attendeeCount: e.attendeeCount || 0
      }));
      return jsonOk(parsed);
    }

    // POST /api/events/initiate
    if (pathname === "/api/events/initiate" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const {
        title,
        location,
        date,
        description,
        targetAudience,
        images,
        creatorId,
        creatorEmail
      } = body;

      const user = await dbGet(db, "SELECT level, points FROM users WHERE id = ?", [creatorId]);
      if (!user) {
        return jsonErr("Host User Node not found in registry.", 403);
      }

      const regCountRow = await dbGet(db, "SELECT COUNT(*) as count FROM event_registrations WHERE userId = ?", [creatorId]);
      const regCount = regCountRow ? regCountRow.count : 0;

      const meetsCondition = 
        (user.level && user.level.includes("Silicon")) || 
        (user.level && user.level.includes("Academic")) || 
        (user.level && user.level.includes("Systems")) ||
        (regCount >= 1);

      if (!meetsCondition) {
        return jsonErr("Inadequate Grid Reputation. To host a decentralized playability event, you must either possess a Pioneer level node ('Silicon Expert'/'Academic Leader') OR have actively participated as a registered attendee in at least 1 verified YVIA event.", 403);
      }

      const id = "evt-" + Date.now();
      const imgsJson = JSON.stringify(images && images.length > 0 ? images : ['/src/assets/images/aico_collaboration_1780446541477.png']);

      await dbRun(db,
        `INSERT INTO events (id, title, titleZh, status, location, date, description, descriptionZh, targetAudience, images, approved, notes, creatorId, creatorEmail, submissionStatus)
         VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?, 0, '', ?, ?, 'pending')`,
        [id, title, title, location, date, description, description, targetAudience, imgsJson, creatorId, creatorEmail]
      );

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

      await queueEmail(db, creatorEmail, `Event Proposal Logged: ${title}`, emailContent);
      return jsonCreated({ success: true, message: "Event initiated. Sent for administrator review." });
    }

    // POST /api/events/toggle-approve
    if (pathname === "/api/events/toggle-approve" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const { id, approved, submissionStatus } = body;

      const event = await dbGet(db, "SELECT * FROM events WHERE id = ?", [id]);
      if (!event) {
        return jsonErr("Mesh event not found.", 404);
      }

      const statusVal = submissionStatus || (approved ? 'approved' : 'pending');
      const approvedNum = approved ? 1 : 0;

      await dbRun(db, "UPDATE events SET approved = ?, submissionStatus = ? WHERE id = ?", [approvedNum, statusVal, id]);

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
          await queueEmail(db, event.creatorEmail, subject, mailContent);
        }
      }

      return jsonOk({ success: true, id, approved, submissionStatus: statusVal });
    }

    // POST /api/events/register
    if (pathname === "/api/events/register" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch(e){}
      const { eventId, userId } = body;

      const event = await dbGet(db, "SELECT * FROM events WHERE id = ?", [eventId]);
      if (!event) {
        return jsonErr("Requested event is unavailable.", 404);
      }
      if (event.approved === 0 || event.submissionStatus !== 'approved') {
        return jsonErr("Event is not approved or currently active for registrations.", 400);
      }

      const user = await dbGet(db, "SELECT fullName, email, points FROM users WHERE id = ?", [userId]);
      if (!user) {
        return jsonErr("User credential profile not found.", 404);
      }

      const existing = await dbGet(db, "SELECT id FROM event_registrations WHERE eventId = ? AND userId = ?", [eventId, userId]);
      if (existing) {
        return jsonErr("You are already actively registered for this event.", 409);
      }

      const id = "reg-link-" + Date.now();
      const registeredAt = new Date().toISOString();

      try {
        await dbRun(db,
          `INSERT INTO event_registrations (id, eventId, userId, userEmail, fullName, registeredAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, eventId, userId, user.email, user.fullName, registeredAt]
        );
      } catch (err) {
        if (err.message && err.message.includes("UNIQUE")) {
          return jsonErr("You are already actively registered for this event.", 409);
        }
        throw err;
      }

      const newPoints = (user.points || 0) + 50;
      await dbRun(db, "UPDATE users SET points = ? WHERE id = ?", [newPoints, userId]);

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

      await queueEmail(db, user.email, `Registration Confirmed: ${event.title}`, emailContent);
      return jsonCreated({ success: true, newPoints });
    }

    // GET /api/user/registrations
    if (pathname === "/api/user/registrations" && request.method === "GET") {
      const userId = url.searchParams.get("userId");
      const query = `
        SELECT r.id as registrationId, r.registeredAt, e.*
        FROM event_registrations r
        JOIN events e ON r.eventId = e.id
        WHERE r.userId = ?
        ORDER BY r.registeredAt DESC
      `;
      const list = await dbAll(db, query, [userId]);
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
          images: safeJsonArray(item.images),
          approved: item.approved === 1,
          submissionStatus: item.submissionStatus
        }
      }));
      return jsonOk(parsed);
    }

    // GET /api/emails
    if (pathname === "/api/emails" && request.method === "GET") {
      const logs = await dbAll(db, "SELECT * FROM emails_sent ORDER BY sentAt DESC");
      return jsonOk(logs);
    }

    // GET /api/admin/export
    if (pathname === "/api/admin/export" && request.method === "GET") {
      const users = await dbAll(db, "SELECT * FROM users");
      const courses = await dbAll(db, "SELECT * FROM courses");
      const events = await dbAll(db, "SELECT * FROM events");
      const registrations = await dbAll(db, "SELECT * FROM event_registrations");
      const emails = await dbAll(db, "SELECT * FROM emails_sent");

      return jsonOk({
        exportDate: new Date().toISOString(),
        users,
        courses,
        events,
        registrations,
        emails
      });
    }

    // Not matched path under /api
    return new Response(JSON.stringify({ error: `Route not defined: ${request.method} ${pathname}` }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Exception caught in Cloudflare Pages API routing handling.", message: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
