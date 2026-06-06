import fs from "fs";
import path from "path";

export interface DatabaseSim {
  filename: string;
  data: {
    users: any[];
    courses: any[];
    events: any[];
    event_registrations: any[];
    emails_sent: any[];
  };
}

export class DatabaseSimClass implements DatabaseSim {
  filename: string;
  data: {
    users: any[];
    courses: any[];
    events: any[];
    event_registrations: any[];
    emails_sent: any[];
  } = {
    users: [],
    courses: [],
    events: [],
    event_registrations: [],
    emails_sent: []
  };

  private jsonPath: string;

  constructor(filename: string) {
    this.filename = filename;
    // Map .db to .json file for persistence
    const baseName = filename.endsWith(".db") ? filename.slice(0, -3) : filename;
    this.jsonPath = path.resolve(process.cwd(), `${baseName}.json`);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.jsonPath)) {
        const fileContent = fs.readFileSync(this.jsonPath, "utf-8");
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          courses: parsed.courses || [],
          events: parsed.events || [],
          event_registrations: parsed.event_registrations || [],
          emails_sent: parsed.emails_sent || []
        };
        console.log(`[DB SIM] Loaded persisted records smoothly from: ${this.jsonPath}`);
      } else {
        console.log(`[DB SIM] Persistent file not found. Starting with fresh memory structure.`);
      }
    } catch (e) {
      console.error("[DB SIM] Load error. Starting empty:", e);
    }
  }

  private async save() {
    try {
      fs.writeFileSync(this.jsonPath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[DB SIM] Save error:", e);
    }
  }

  async exec(sql: string): Promise<void> {
    // Schema queries, safe to ignore since memory schemas are predefined
    return;
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const trimmedSql = sql.trim().replace(/\s+/g, " ");

    // 1. SELECT COUNT(*) as count FROM tableName
    const countMatch = trimmedSql.match(/SELECT COUNT\(\*\) as count FROM (\w+)/i);
    if (countMatch) {
      const tableName = countMatch[1].toLowerCase();
      const list = (this.data as any)[tableName] || [];
      return { count: list.length };
    }

    // 2. WHERE email COUNT or similar check
    if (trimmedSql.includes("FROM event_registrations WHERE userId = ?")) {
      const userId = params[0];
      const count = this.data.event_registrations.filter(r => r.userId === userId).length;
      return { count };
    }

    // 3. User by ID Check
    if (trimmedSql.includes("FROM users WHERE id = ?")) {
      const id = params[0];
      const u = this.data.users.find(user => user.id === id);
      return u ? { ...u } : undefined;
    }

    // 4. User login email collate nocase
    if (trimmedSql.includes("FROM users WHERE email = ? COLLATE NOCASE") || trimmedSql.includes("FROM users WHERE email = ?")) {
      const email = params[0]?.trim().toLowerCase();
      const u = this.data.users.find(user => user.email.toLowerCase() === email);
      return u ? { ...u } : undefined;
    }

    // 5. Duplicate enrollment check
    if (trimmedSql.includes("FROM event_registrations WHERE eventId = ? AND userId = ?")) {
      const [eventId, userId] = params;
      const reg = this.data.event_registrations.find(r => r.eventId === eventId && r.userId === userId);
      return reg ? { ...reg } : undefined;
    }

    // 6. Generic ID checks for secondary lists
    if (trimmedSql.includes("FROM events WHERE id = ?")) {
      const id = params[0];
      const e = this.data.events.find(evt => evt.id === id);
      return e ? { ...e } : undefined;
    }

    return undefined;
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const trimmedSql = sql.trim().replace(/\s+/g, " ");

    // 1. INSERT INTO
    const insertMatch = trimmedSql.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1].toLowerCase();
      const fields = insertMatch[2].split(",").map(str => str.trim());
      
      const row: any = {};
      fields.forEach((field, index) => {
        row[field] = params[index];
      });

      if (!(this.data as any)[tableName]) {
        (this.data as any)[tableName] = [];
      }
      (this.data as any)[tableName].push(row);
      await this.save();
      return { lastID: row.id || Date.now().toString(), changes: 1 };
    }

    // 2. UPDATE users points
    if (trimmedSql.includes("UPDATE users SET points = ? WHERE id = ?")) {
      const [points, id] = params;
      const user = this.data.users.find(u => u.id === id);
      if (user) {
        user.points = points;
        await this.save();
      }
      return { changes: 1 };
    }

    // 3. UPDATE users full profile (Update profile setting form)
    if (trimmedSql.includes("UPDATE users") && trimmedSql.includes("fullName = ?")) {
      const [fullName, neighborhood, profession, professionalTitle, password, id] = params;
      const user = this.data.users.find(u => u.id === id);
      if (user) {
        user.fullName = fullName;
        user.neighborhood = neighborhood;
        user.profession = profession;
        user.professionalTitle = professionalTitle;
        user.password = password;
        await this.save();
      }
      return { changes: 1 };
    }

    // 4. UPDATE courses approval
    if (trimmedSql.includes("UPDATE courses SET approved = ? WHERE id = ?")) {
      const [approved, id] = params;
      const course = this.data.courses.find(c => c.id === id);
      if (course) {
        course.approved = approved;
        await this.save();
      }
      return { changes: 1 };
    }

    // 5. UPDATE events approval status
    if (trimmedSql.includes("UPDATE events SET approved = ?")) {
      const [approved, submissionStatus, id] = params;
      const event = this.data.events.find(e => e.id === id);
      if (event) {
        event.approved = approved;
        event.submissionStatus = submissionStatus;
        await this.save();
      }
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const trimmedSql = sql.trim().replace(/\s+/g, " ");

    // 1. SELECT * FROM table queries
    if (trimmedSql.slice(0, 15).toUpperCase().includes("SELECT * FROM")) {
      const match = trimmedSql.match(/FROM\s+(\w+)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        let list = [...((this.data as any)[tableName] || [])];

        // Handles sorting
        if (trimmedSql.toUpperCase().includes("ORDER BY SUBMITTEDAT DESC")) {
          list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        } else if (trimmedSql.toUpperCase().includes("ORDER BY SENTAT DESC")) {
          list.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
        }

        return list;
      }
    }

    // 2. Events list with joined registration count
    if (trimmedSql.includes("COUNT(r.id) as attendeeCount") && trimmedSql.includes("FROM events")) {
      return this.data.events.map(e => {
        const attendeeCount = this.data.event_registrations.filter(r => r.eventId === e.id).length;
        return {
          ...e,
          attendeeCount
        };
      });
    }

    // 3. User registrated list details JOIN events
    if (trimmedSql.includes("FROM event_registrations r JOIN events e")) {
      const userId = params[0];
      const userRegs = this.data.event_registrations
        .filter(r => r.userId === userId)
        .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

      return userRegs.map(r => {
        const matchedEvent = this.data.events.find(evt => evt.id === r.eventId) || {};
        return {
          registrationId: r.id,
          registeredAt: r.registeredAt,
          id: matchedEvent.id,
          title: matchedEvent.title,
          titleZh: matchedEvent.titleZh,
          status: matchedEvent.status,
          location: matchedEvent.location,
          date: matchedEvent.date,
          description: matchedEvent.description,
          descriptionZh: matchedEvent.descriptionZh,
          targetAudience: matchedEvent.targetAudience,
          images: matchedEvent.images,
          approved: matchedEvent.approved,
          submissionStatus: matchedEvent.submissionStatus
        };
      });
    }

    return [];
  }
}

export async function open(options: { filename: string; driver?: any }) {
  const db = new DatabaseSimClass(options.filename);
  return db;
}
