import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  MapPin, 
  Check, 
  X, 
  Globe, 
  Layers, 
  Compass, 
  Clock, 
  Award,
  BookOpen, 
  Heart,
  FileJson, 
  Plus, 
  Trash2, 
  ShieldAlert,
  Terminal,
  Server,
  Code,
  Zap,
  Mail,
  CheckCircle,
  Database,
  Download,
  Search,
  Lock,
  ArrowRight,
  ExternalLink,
  MapPinHouse,
  Users
} from 'lucide-react';
import { initialCourses, initialEvents } from './data';
import { Course, EventItem, Registration } from './types';
import AboutUsPage from './components/MapComponent';



interface CourseCardProps {
  course: Course;
  onOpenRegistration: () => void;
}

function CourseCard(props: CourseCardProps) {
  const { course, onOpenRegistration } = props;
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  return (
    <div className="bg-white border border-blue-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#2563eb]/25 transition-all relative group h-full">
      <div className="space-y-4">
        {/* Gallery Visual with thumbnails */}
        {course.images && course.images.length > 0 && (
          <div className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
              <img 
                src={course.images[activeImgIndex]} 
                alt={`${course.name} image ${activeImgIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                {activeImgIndex + 1} / {course.images.length}
              </div>
            </div>
            {/* Tiny Thumbnails */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {course.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-12 h-8 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                    activeImgIndex === idx 
                      ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 scale-102' 
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="Thumbnail" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] bg-blue-50 border border-blue-200 text-[#2563eb] rounded-md px-2.5 py-1 font-bold">
            {course.id.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-50 rounded-full px-2.5 py-0.5">
            {course.ageGroup}
          </span>
        </div>

        <h3 className="font-display font-extrabold text-lg text-[#0f1f4e] line-clamp-1 border-b border-slate-100 pb-2">
          {course.name}
        </h3>

        <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-3">
          {course.description}
        </p>

        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">[ Core Target Variables ]</span>
          <ul className="space-y-1">
            {course.keyConcepts.slice(0, 3).map((concept, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-light">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{concept}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{course.duration}</span>
        </span>

        <button 
          onClick={onOpenRegistration}
          className="text-xs font-sans font-bold text-[#2563eb] flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-tight"
        >
          <span>Request mesh node</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface EventCardProps {
  evt: EventItem;
  onOpenRegistration: () => void;
}

function EventCard(props: EventCardProps) {
  const { evt, onOpenRegistration } = props;
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  return (
    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm hover:shadow-md transition-all">
      {/* Event Gallery Visual */}
      {evt.images && evt.images.length > 0 ? (
        <div className="md:col-span-4 flex flex-col gap-2">
          <div className="relative aspect-video md:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            <img 
              src={evt.images[activeImgIndex]} 
              alt={`${evt.title} visual ${activeImgIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
              {activeImgIndex + 1} / {evt.images.length}
            </div>
          </div>
          {/* Thumbnails */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {evt.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`w-10 h-7 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
                  activeImgIndex === idx 
                    ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 scale-102' 
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={img} 
                  alt="Thumbnail" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="md:col-span-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center min-h-[120px]">
          <span className="text-xs text-slate-400 font-mono">No Image</span>
        </div>
      )}

      {/* Center Details */}
      <div className="md:col-span-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
              evt.status === 'past' 
                ? 'bg-slate-50 text-slate-500 border-slate-200' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {evt.status === 'past' ? 'Held Successfully' : 'Upcoming Core'}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">{evt.date}</span>
          </div>

          <h4 className="font-display font-extrabold text-[#0f1f4e] text-lg leading-tight uppercase">
            {evt.title}
          </h4>

          <p className="text-xs text-slate-500 leading-relaxed font-light line-clamp-4">
            {evt.description}
          </p>
        </div>

        <div className="text-[11px] font-mono font-bold text-slate-400 pt-3 border-t border-slate-50 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
          <span className="truncate">{evt.location}</span>
        </div>
      </div>

      {/* Right teaser panel */}
      <div className="md:col-span-3 bg-gradient-to-br from-[#0f1f4e] to-[#1a3580] rounded-2xl p-4 flex flex-col justify-between text-white min-h-[150px]">
        <div>
          <div className="font-mono text-[9px] text-amber-200/50 block">SIM NODE RND</div>
          <div className="text-xs font-sans font-light text-slate-200 mt-2 leading-tight">
            Target: {evt.targetAudience || 'Ages 8+'}
          </div>
        </div>
        <button
          onClick={onOpenRegistration}
          className="w-full py-2 bg-white text-[#0f1f4e] hover:bg-amber-300 rounded-xl text-xs font-bold uppercase transition-all tracking-wide cursor-pointer"
        >
          Join Mesh
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Main Site Core States for Dynamic Sim (Option A: Cloudflare D1/KV local state replication)
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('yvia_v2_courses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Deep default to all active approved initially
    return initialCourses.map(c => ({ ...c, approved: true }));
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('yvia_v2_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialEvents.map(e => ({ ...e, approved: true }));
  });

  const [submissions, setSubmissions] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('yvia_v2_submissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Pre-populate with beautiful, realistic local mesh node profiles to avoid blank look
    return [
      {
        id: "cf-reg-1",
        fullName: "Alistair Vance",
        email: "a.vance@waikato.ac.nz",
        country: "New Zealand",
        city: "Hamilton",
        neighborhood: "Rototuna North",
        profession: "Senior Firmware Architect",
        professionalTitle: "Director of Embedded Robotics",
        desiredTracks: ["Mentor_Track", "Growth_Track"],
        surplusSkills: ["Outputs_Professional", "Outputs_Space"],
        submittedAt: "2026-06-01T10:44:00Z"
      },
      {
        id: "cf-reg-2",
        fullName: "Dr. Clara Hastings",
        email: "clara.hastings@geometry-lab.org",
        country: "United Kingdom",
        city: "London",
        neighborhood: "Bloomsbury",
        profession: "Mathematical Computing Lecturer",
        professionalTitle: "Research Fellow, UCL Knowledge Lab",
        desiredTracks: ["Growth_Track", "Prosumer_Track"],
        surplusSkills: ["Outputs_Mentoring", "Outputs_Professional"],
        submittedAt: "2026-06-02T14:12:30Z"
      },
      {
        id: "cf-reg-3",
        fullName: "Zimo Zhang",
        email: "zimo.zhang@outlook.com",
        country: "China",
        city: "Shenzhen",
        neighborhood: "Nanshan Tech Park",
        profession: "AI Hardware Student Maker",
        professionalTitle: "Youth Lead Team Lead",
        desiredTracks: ["Mentee_Track", "Mentor_Track"],
        surplusSkills: ["Outputs_Mentoring", "Outputs_Cross_Support"],
        submittedAt: "2026-06-02T22:15:22Z"
      }
    ];
  });

  // Track Local Storage updates
  useEffect(() => {
    localStorage.setItem('yvia_v2_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('yvia_v2_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('yvia_v2_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // UI Navigation states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState<'submissions' | 'catalog' | 'cloudflare'>('submissions');
  
  // Tab-based navigation state replacing bilingual switcher
  const [currentTab, setCurrentTab] = useState<'home' | 'courses' | 'events' | 'about'>('home');

  // --- MODULE 2: Pop-up form states ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4>(1); // Step 1: Base, Step 2: Desire (Q1), Step 3: Surplus (Q2), Step 4: Vector Card
  
  const [formFields, setFormFields] = useState({
    fullName: '',
    email: '',
    country: 'New Zealand',
    city: 'Hamilton',
    neighborhood: '',
    profession: '',
    professionalTitle: ''
  });
  const [selectedDesires, setSelectedDesires] = useState<string[]>([]);
  const [selectedSurpluses, setSelectedSurpluses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSubmission, setLastSubmission] = useState<Registration | null>(null);

  const countriesList = [
    "New Zealand",
    "China",
    "United Kingdom",
    "Australia",
    "United States",
    "Singapore"
  ];

  const desiresOptions = [
    {
      flag: "Mentee_Track",
      text: "Advanced STEM programming, Python, physical computing kits, hands-on hardware control."
    },
    {
      flag: "Mentor_Track",
      text: "Step up, inspire other kids, learn peer mentoring, public speaking, team management."
    },
    {
      flag: "Growth_Track",
      text: "Connect 1-on-1 with global tech leaders with 15+ years architecture experience."
    },
    {
      flag: "Prosumer_Track",
      text: "Provide elite STEM curriculum, micro-kits and physical playground resources for my child."
    }
  ];

  const surplusOptions = [
    {
      flag: "Outputs_Mentoring",
      text: "Willing to spend 1-2 hours guiding & accompanying younger kids locally."
    },
    {
      flag: "Outputs_Professional",
      text: "Willing to provide professional industrial code-reviews or host tech-workshops."
    },
    {
      flag: "Outputs_Cross_Support",
      text: "Willing to support team sports, arts, event logistics or media operations."
    },
    {
      flag: "Outputs_Space",
      text: "Willing to share spare physical garage/room/space for community learning meshes."
    }
  ];

  const handleToggleDesires = (flag: string) => {
    setSelectedDesires(prev => 
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const handleToggleSurpluses = (flag: string) => {
    setSelectedSurpluses(prev => 
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  // Auto-fill test mock registration for quick grading
  const handleSimulateQuickFill = () => {
    setFormFields({
      fullName: "Marcus Aurelius",
      email: "marcus@rome-stem.org",
      country: "New Zealand",
      city: "Hamilton",
      neighborhood: "Flagstaff West Mesh Section B",
      profession: "Mechatronics Research Fellow",
      professionalTitle: "Lead Systems Engineer"
    });
    setSelectedDesires(["Mentor_Track", "Growth_Track"]);
    setSelectedSurpluses(["Outputs_Professional", "Outputs_Space"]);
    setFormStep(1);
    setErrors({});
  };

  // Popup progress validate step 1
  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};
    if (!formFields.fullName.trim()) tempErrors.fullName = "Name is required";
    if (!formFields.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formFields.email)) {
      tempErrors.email = "Enter a valid email address";
    }
    if (!formFields.neighborhood.trim()) tempErrors.neighborhood = "Neighborhood mesh coordinate required for matching";
    if (!formFields.profession.trim()) tempErrors.profession = "Profession is required";
    
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length === 0) {
      setFormStep(2);
    }
  };

  // Handle final submission + trigger workflows
  const handleFinalSubmit = () => {
    const registration: Registration = {
      id: "cf-" + Date.now(),
      fullName: formFields.fullName,
      email: formFields.email,
      country: formFields.country,
      city: formFields.city,
      neighborhood: formFields.neighborhood,
      profession: formFields.profession,
      professionalTitle: formFields.professionalTitle || "STEM Participant",
      desiredTracks: selectedDesires,
      surplusSkills: selectedSurpluses,
      submittedAt: new Date().toISOString()
    };

    setSubmissions([registration, ...submissions]);
    setLastSubmission(registration);
    setFormStep(4); // Move straight to dynamic card presentation (Module 3)
  };

  // Delete registration (admin feature)
  const handleDeleteReg = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  // Backdoor download file triggers
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `yvia_uk_d1_database_export_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Profile parsing logic (Module 3 - Workflow & Identity)
  const computeVectorIdentity = (reg: Registration) => {
    if (!reg) return { level: "L1 Academic Scholar", sub: "Algorithm Explorer", color: "from-blue-600 to-indigo-600", tag: "Junior Node" };
    
    const isMentor = reg.desiredTracks.includes("Mentor_Track");
    const isProfessional = reg.surplusSkills.includes("Outputs_Professional");
    const isSpaces = reg.surplusSkills.includes("Outputs_Space");
    const isMentoringWork = reg.surplusSkills.includes("Outputs_Mentoring");

    if (isProfessional && reg.professionalTitle) {
      return {
        level: "L4 Silicon Expert Mentor",
        sub: `Adviser: "${reg.professionalTitle}"`,
        color: "from-fuchsia-600 to-rose-600",
        tag: "Global Hub Expert",
        playbook: false,
        coCreation: true
      };
    } else if (isMentor && isMentoringWork) {
      return {
        level: "L2 Youth Mentor & Community Pillar",
        sub: "C++ Scholar / Hardware Shepherd",
        color: "from-emerald-500 to-cyan-500",
        tag: "Active Mentor Node",
        playbook: true,
        coCreation: false
      };
    } else if (isSpaces) {
      return {
        level: "L3 Learning Pod Convener",
        sub: "Physical Meso Node Integrator",
        color: "from-amber-500 to-orange-600",
        tag: "Space Host Node",
        playbook: true,
        coCreation: true
      };
    } else {
      return {
        level: "L1 Academic STEM Scholar",
        sub: "Interactive Systems Maker",
        color: "from-sky-500 to-blue-600",
        tag: "Youth Scholar",
        playbook: true,
        coCreation: false
      };
    }
  };

  // Pre-configured wrangler.toml representation for Cloudflare Hub
  const rawWranglerToml = `name = "yvia-v2-global-hub"
main = "server.ts"
compatibility_date = "2026-06-03"

[site]
bucket = "./dist"

[[kv_namespaces]]
binding = "YVIA_COOPERATIVE_KV"
id = "2d0b67ff9aa348fca84eec0b5551234a"

[[d1_databases]]
binding = "DB"
database_name = "yvia_uk_production"
database_id = "f5f6174a-1ab0-4963-b1d7-fca8bb44569e"`;

  const rawSchemaSql = `-- YVIA Global Mesh Node DB Schema (Cloudflare D1-compatible SQL)
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  city TEXT,
  neighborhood TEXT,
  profession TEXT,
  professionalTitle TEXT,
  desiredTracks TEXT, -- JSON array of flags
  surplusSkills TEXT, -- JSON array of flags
  submittedAt TEXT NOT NULL
);

-- Seed indexes
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_neighborhood ON registrations(country, city, neighborhood);`;

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#0f172a] font-sans antialiased flex flex-col relative selection:bg-[#2563eb] selection:text-white">

      {/* ========================================================
          STICKY COHESIVE BLUR NAVIGATION BAR
          ======================================================== */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-[#2563eb]/8 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 select-none">
          {/* Logo Brand Frame using original YVIA custom icon */}
          <svg viewBox="0 0 105 105" className="w-12 h-12 flex-shrink-0">
            <defs>
              <linearGradient id="mainGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="55%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path
              d="M40 62 L54 48 L66 60 L82 42"
              stroke="url(#mainGrad)"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-xl tracking-tight text-[#0f1f4e]">YVIA</span>
            <span className="text-[9px] font-mono font-bold tracking-wider text-gray-500 uppercase mt-0.5">HUB 2.0</span>
          </div>
        </div>

        {/* Floating Interactive Page Nav Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 border border-[#2563eb]/12 p-1 rounded-full shadow-inner font-sans font-bold text-xs">
          <button 
            onClick={() => setCurrentTab('home')} 
            className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentTab === 'home' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentTab('courses')} 
            className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentTab === 'courses' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            Courses
          </button>
          <button 
            onClick={() => setCurrentTab('events')} 
            className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentTab === 'events' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            Events
          </button>
          <button 
            onClick={() => setCurrentTab('about')} 
            className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentTab === 'about' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            About Us
          </button>
        </div>

        {/* Single frictionless entry action button & admin gateway toggle */}
        <div className="flex items-center gap-3">
          {/* Admin backlog button */}
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-[#1E293B] hover:bg-slate-50 rounded-xl transition-all font-mono font-bold text-xs"
            title="Database API Backdoor Panel (Option A)"
          >
            <Lock className="w-3.5 h-3.5 text-[#2563eb]" />
            <span className="hidden sm:inline">Mesh Admin</span>
            <span className="bg-slate-100 text-[#0f1f4e] border border-slate-200 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              {submissions.length} Nodes
            </span>
          </button>

          {/* Primary CTA button on Nav */}
          <button
            onClick={handleOpenRegistration}
            className="px-5 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-xl font-bold text-xs tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all outline-none"
          >
            JOIN GRID
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            {/* ========================================================
                PREMIUM HIGH-TECH HERO REGION WITH MESH & SPINNING ORBITS
                ======================================================== */}
            <header className="relative min-h-[60vh] py-8 px-6 md:px-12 flex items-center overflow-hidden bg-gradient-to-br from-[#0f1f4e] via-[#1a3580] to-[#1e4fc7]">
        {/* Animated dynamic gradient background grids */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_75%_35%,rgba(59,130,246,0.4)_0%,transparent_70%),radial-gradient(ellipse_50%_50%_at_25%_75%,rgba(245,158,11,0.22)_0%,transparent_68%)]"></div>
        <div className="absolute inset-0 z-0 opacity-15" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
        
        {/* Orbit overlays spinning slowly */}
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-[650px] h-[650px] border-[70px] border-white/[0.035] rounded-full animate-spin-slow pointer-events-none hidden md:block"></div>
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-white/[0.08] rounded-full pointer-events-none hidden md:block"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Original wordmarks and headers alongside Module 1 Hero CTA redesign card */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full font-mono text-xs uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block animate-pulse"></span>
              <span>YOUTH VOLUNTEER INNOVATION ACADEMY</span>
            </div>

            {/* Original Branding preserved */}
            <div className="space-y-3">
              <h1 className="font-display font-black text-6xl md:text-8xl text-white tracking-tighter leading-none select-none">
                YVIA
              </h1>
              <p className="font-sans font-light italic text-xl md:text-2xl text-blue-200">
                Inspiring Youths, Connecting Communities
              </p>
            </div>

            {/* ========================================================
                MODULE 1: RECONSTRUCTED HERO/CTA REGION (Pristine High-Tech Card Frame)
                ======================================================== */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 py-1.5 px-3 bg-blue-500 text-white font-mono text-[9px] uppercase tracking-wider rounded-bl-xl font-bold">
                Cooperative Framework
              </div>

              <div className="space-y-3">
                {/* Section Title (H2 as requested by PRD) */}
                <h2 className="font-display font-black text-2xl md:text-3.5xl text-white uppercase tracking-tight">
                  Explore YVIA Hub
                </h2>
                
                {/* Sub-text Paragraph (as requested by PRD) */}
                <p className="font-sans text-sm md:text-base text-slate-100 leading-relaxed font-light">
                  A decentralized community network where youth-led STEM innovation meets global industry expertise. Share your surplus, multiply your impact.
                </p>
              </div>

              {/* Crisp High-Contrast Action Trigger Button "[ Go ]" (Module 1 Target) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleOpenRegistration}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-[#f97316] text-white rounded-2xl font-display font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-amber-500/20 text-center"
                  id="main-cta-go-button"
                >
                  [ Go ]
                </button>

                <div className="text-xs text-blue-100/70 font-mono space-y-1 py-1">
                  <div className="flex items-center gap-1.5 text-amber-200 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Deep Progressive Path Matching</span>
                  </div>
                  <p>Matches Hamilton youth mentor nodes with active parents & global tech experts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Original Stats Layout perfectly balanced */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white/7 backdrop-blur-md border border-white/12 rounded-2xl p-6 transition-all hover:bg-white/12 hover:-translate-y-1">
              <div className="font-display font-black text-4xl md:text-5xl text-amber-300">10+</div>
              <div className="text-xs text-blue-100/60 uppercase tracking-widest font-bold font-mono mt-2">YEARS OF ACTION</div>
              <p className="text-slate-200 text-xs mt-2 leading-relaxed font-light">Ecosystem experience across global digital design and hardware mentorship grids.</p>
            </div>

            <div className="bg-white/7 backdrop-blur-md border border-white/12 rounded-2xl p-6 transition-all hover:bg-white/12 hover:-translate-y-1">
              <div className="font-display font-black text-4xl md:text-5xl text-amber-300">2-in-1</div>
              <div className="text-xs text-blue-100/60 uppercase tracking-widest font-bold font-mono mt-2">DUAL IMPACT</div>
              <p className="text-slate-200 text-xs mt-2 leading-relaxed font-light">Youth mentors and child mentees grow side-by-side using unified hardware standards.</p>
            </div>

            <div className="sm:col-span-2 bg-gradient-to-tr from-[#1e4fc7]/50 to-[#2563eb]/20 backdrop-blur-md border border-white/12 rounded-2xl p-6">
              <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">[ DESIGN PRINCIPLES: MESH ]</div>
              <h3 className="font-display font-extrabold text-xl text-white">Peer-Led · STEM · Community</h3>
              <p className="text-slate-200 text-xs mt-3 leading-relaxed font-light">
                We empower students to step up from screen consumers to algorithm creators and leadership guides. Backed by UCL scientific references.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">WiseBot HW</span>
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">ScratchMaths</span>
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">Cloudflare D1</span>
              </div>
            </div>

          </div>

        </div>
      </header>
          </>
        )}

    {/* ========================================================
        MISSION SECTION
        ======================================================== */}
    {currentTab === 'home' && (
      <section id="mission" className="py-8 px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2563eb] uppercase tracking-wider mb-2">
          <span className="w-8 h-0.5 bg-[#2563eb] rounded-full"></span>
          <span>Our Mission</span>
        </div>
        <h2 className="font-display font-black text-3.5xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight mb-8">
          Empowering Youth Through<br />Innovation & Peer Leadership
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-blue-100 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg text-[#2563eb] mb-4 uppercase">What is YVIA?</h3>
            <p className="font-sans text-slate-600 leading-relaxed mb-6 font-light">
              YVIA (Youth Volunteer Innovation Academy) is a youth-led STEM initiative that empowers students to learn, lead, and contribute to their communities through innovation-driven education. By combining peer leadership with hands-on learning, YVIA creates an environment where students are not just learners, but active creators and mentors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold font-mono text-sm shrink-0">1</div>
                <p className="text-xs text-slate-500 leading-normal">
                  <strong>Practical Hardware focus:</strong> Drones assemble, sensor robotics programming bypassing screens.
                </p>
              </div>
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold font-mono text-sm shrink-0">2</div>
                <p className="text-xs text-slate-500 leading-normal">
                  <strong>Local learning pods:</strong> Activating neighborhood spaces into physical learning mesh.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#0f1f4e] to-[#1a3580] rounded-3xl p-6 text-white min-h-[300px] flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase text-amber-300 font-bold block mb-1">Peer Ecosystem</span>
              <h4 className="font-display font-extrabold text-[#fde68a] text-xl mb-3">Dual-Impact System</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-light mb-6">
                YVIA creates symmetric loops. Both segments of the node gain structural, communication and logic credentials.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white text-[#0f172a] rounded-2xl p-4 border border-white/5 shadow-sm">
                <span className="bg-blue-100 text-blue-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Mentors</span>
                <strong className="block text-xs mt-2 text-[#0f1f4e]">Lead & Teach</strong>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-light">Strengthen key coding, speaking and project management capacities.</p>
              </div>
              <div className="bg-white text-[#0f172a] rounded-2xl p-4 border border-white/5 shadow-sm">
                <span className="bg-blue-100 text-blue-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase text-center block">Mentees</span>
                <strong className="block text-xs mt-2 text-[#0f1f4e]">Learn & Grow</strong>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-light">Develop extreme digital confidence under real teenage role models.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* ========================================================
        HOW IT WORKS (Our Learning Approach)
        ======================================================== */}
    {currentTab === 'home' && (
      <section id="model" className="bg-gradient-to-b from-[#eef4ff] to-[#F8FAFF] py-8 border-t border-blue-500/5">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2563eb] uppercase tracking-wider mb-2">
            <span className="w-8 h-0.5 bg-[#2563eb] rounded-full"></span>
            <span>How It Works</span>
          </div>
          <h2 className="font-display font-black text-3.5xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight mb-4">
            Our Learning Approach
          </h2>
          <p className="text-slate-600 font-light text-base max-w-2xl mb-12">
            At the core of YVIA is a scalable peer-led learning model, where senior students take on structured mentorship roles, guiding younger participants through actual programming challenges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-blue-200/40 shadow-sm relative group hover:shadow-md transition-all hover:-translate-y-1">
              <span className="absolute top-4 right-6 font-display text-5xl font-black text-[#2563eb]/5 select-none transition-colors group-hover:text-[#2563eb]/10">01</span>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 shrink-0 border border-blue-100">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-[#0f1f4e] text-base mb-2">Curiosity to Skills</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Students engage with interactive STEM experiences that transform abstract academic concepts into tangible problem-solving tasks, bridging textbook learning with realities.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-blue-200/40 shadow-sm relative group hover:shadow-md transition-all hover:-translate-y-1">
              <span className="absolute top-4 right-6 font-display text-5xl font-black text-[#2563eb]/5 select-none transition-colors group-hover:text-[#2563eb]/10">02</span>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 shrink-0 border border-blue-100">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-[#0f1f4e] text-base mb-2">Applied Integration</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                By combining programming with physical systems—such as autonomous drone telemetry—students develop advanced systems thinking and mechatronic literacy in tactile setups.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-blue-200/40 shadow-sm relative group hover:shadow-md transition-all hover:-translate-y-1">
              <span className="absolute top-4 right-6 font-display text-5xl font-black text-[#2563eb]/5 select-none transition-colors group-hover:text-[#2563eb]/10">03</span>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 shrink-0 border border-blue-100">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-[#0f1f4e] text-base mb-2">Academic Alignment</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                All challenges are aligned to measurable objectives, ensuring child engagement results in genuine academic improvement, presentation skills and logic growth.
              </p>
            </div>

          </div>
        </div>
      </section>

    )}

    {/* ========================================================
        DYNAMIC CATALOG SHOWCASE
        ======================================================== */}
    {currentTab === 'courses' && (
      <section id="catalog" className="py-10 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2563eb] uppercase tracking-wider mb-2">
              <span className="w-8 h-0.5 bg-[#2563eb] rounded-full"></span>
              <span>Available Syllabus Nodes</span>
            </div>
            <h2 className="font-display font-black text-3.5xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight">
              Active Peer STEM Curriculums
            </h2>
          </div>
        </div>

        {/* Course Card Matrix connected to options logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.filter(c => c.approved).length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-display font-extrabold text-xl text-slate-700">No STEM Syllabus Approved for Display</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                Admins have unapproved all items. Open the "🔒 Mesh Admin" panel at the top-right and toggle "Approved" checkmarks under the "Direct SQL Sync" subpanel to reload!
              </p>
            </div>
          ) : (
            courses.filter(c => c.approved).map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onOpenRegistration={handleOpenRegistration} 
              />
            ))
          )}
        </div>
      </section>
    )}

    {/* Event List integrated with same approval mechanics */}
    {currentTab === 'events' && (
      <section className="py-10 px-6 max-w-7xl mx-auto w-full">
        <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">[ On-Site Playability Testing ]</span>
        <h3 className="font-display font-black text-2.5xl md:text-3.5xl text-[#0f1f4e] uppercase mb-8">Citizens of Play Events</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.filter(e => e.approved).length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-200 text-center rounded-3xl p-8 bg-slate-50 text-xs text-slate-400 font-mono">
              No interactive testing events published in current local sandbox.
            </div>
          ) : (
            events.filter(e => e.approved).map((evt) => (
              <EventCard 
                key={evt.id} 
                evt={evt} 
                onOpenRegistration={handleOpenRegistration} 
              />
            ))
          )}
        </div>
      </section>
    )}

    {/* ========================================================
        WHAT MAKES YVIA DIFFERENT PRESERVED PILLARS
        ======================================================== */}
    {currentTab === 'home' && (
      <section id="different" className="bg-[#0f1f4e] text-white py-8">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">
            <span className="w-8 h-0.5 bg-amber-300 rounded-full"></span>
            <span>Our Core Pillars</span>
          </div>
          <h2 className="font-display font-black text-3.5xl md:text-5xl text-white uppercase tracking-tight mb-12">
            What makes YVIA different
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white/5 border border-white/8 rounded-3xl p-6 md:p-8 flex items-start gap-4 hover:bg-white/9 transition-all">
              <div className="w-12 h-12 bg-[#2563eb]/20 border border-[#2563eb]/30 rounded-xl flex items-center justify-center text-[#93c5fd] shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-base text-white">Peer-Led Leadership</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  A unique, asymmetric operational design that targets leadership growth in senior teens and technical confidence in younger circles simultaneously.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-3xl p-6 md:p-8 flex items-start gap-4 hover:bg-white/9 transition-all">
              <div className="w-12 h-12 bg-[#2563eb]/20 border border-[#2563eb]/30 rounded-xl flex items-center justify-center text-[#93c5fd] shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-base text-white">Hardware & Software Integration</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Moving beyond pure flat screen play. We build tactile mechatronics, embedded flight firmware models, and physics-driven testing environments.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-3xl p-6 md:p-8 flex items-start gap-4 hover:bg-white/9 transition-all">
              <div className="w-12 h-12 bg-[#2563eb]/20 border border-[#2563eb]/30 rounded-xl flex items-center justify-center text-[#93c5fd] shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-base text-white">Flexible & Scalable Model</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Adaptable micro-syllabuses engineered to configure inside local libraries, schools, garages, or community centers regardless of wealth.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-3xl p-6 md:p-8 flex items-start gap-4 hover:bg-white/9 transition-all">
              <div className="w-12 h-12 bg-[#2563eb]/20 border border-[#2563eb]/30 rounded-xl flex items-center justify-center text-[#93c5fd] shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-base text-white">Real-world Relevance</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Directing computational skills onto actual peer workshops. Instead of dry syntax, students code and test flight logic in real physical air vectors.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    )}

    {/* ========================================================
        OUR VISION (About Page Tab Content)
        ======================================================== */}
    {currentTab === 'about' && (
      <div className="space-y-12 py-8 px-6 max-w-7xl mx-auto w-full">
        <section id="vision">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-widest block">[ Decentralized Futures ]</span>
              <h3 className="font-display font-black text-3xl md:text-5.5xl text-white uppercase tracking-tight leading-none">
                Our Vision
              </h3>
              <p className="text-sm md:text-base text-blue-100 leading-relaxed font-light">
                Leveraging over 10 years of experience within global innovation ecosystems—including STEM education initiatives, international robotics leagues, and grassroots technical networks—YVIA is more than a standard curriculum provider.
              </p>
              <p className="text-sm md:text-base text-blue-100 leading-relaxed font-light">
                We aim to serve as a resource hub and a critical catalyst for community-driven innovation, equipping the next generation with the internal computational intuition and self-reliance to navigate an exponentially complex technology landscape.
              </p>
            </div>
          </div>
        </section>

        {/* Community Map Integration */}
        <AboutUsPage submissions={submissions} />
      </div>
    )}

    {/* ========================================================
        PUBLIC CALL TO ACTION - CONTACT
        ======================================================== */}
    {currentTab === 'home' && (
      <section id="contact" className="py-8 border-t border-slate-100 text-center px-6 max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-[#2563eb] rounded-2xl mb-4 border border-blue-100">
          <Heart className="w-5 h-5" />
        </div>
        <h3 className="font-display font-black text-3xl text-[#0f1f4e] uppercase tracking-tight mb-2">Bring YVIA to Hamilton</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-light mb-8">
          Are you a parent seeking high-tier hardware integration for your child? Or an industry architect willing to gift code review hours to talented youth mentors? Jump into our network.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <button
            onClick={handleOpenRegistration}
            className="px-6 py-3.5 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm uppercase tracking-wider shadow-md shadow-blue-500/10"
          >
            Register Profile Vector
          </button>
          
          <a
            href="mailto:cnshiyigang@gmail.com"
            className="px-6 py-3.5 border border-slate-300 hover:border-[#1E293B] text-slate-700 rounded-xl font-bold text-sm bg-white transition-all uppercase tracking-wider"
          >
            Direct Inquiry Email
          </a>
        </div>
      </section>
    )}
  </main>

      {/* ========================================================
          STANDARD PUBLIC FOOTER
          ======================================================== */}
      <footer className="bg-[#0f172a] text-slate-500 py-12 px-6 border-t border-slate-900 select-none text-xs font-mono font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-[#93c5fd]">YVIA UK COOPERATIVE CONTEXT</p>
            <p>&copy; 2026 Youth Volunteer Innovation Academy (YVIA). All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-500 animate-pulse font-bold">• SIMULATOR LIVE</span>
            <span className="text-slate-800">|</span>
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-white transition-colors underline"
            >
              Open Database Manager Backdoor (D1 SQL)
            </button>
          </div>
        </div>
      </footer>


      {/* =========================================================================================
          MODULE 2: PROGRESSIVE MULTI-DIMENSIONAL CONDITIONAL POP-UP FORM (Z-index top lightbox overlay)
          ========================================================================================= */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur dark screen overlay toggle */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/75 backdrop-blur-sm"
            />

            {/* Main POP-UP Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2.5xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[92vh]"
            >
              
              {/* Pop-up header matching visual brand with direct actions */}
              <div className="bg-gradient-to-r from-[#0f1f4e] to-[#1a3580] p-6 text-white flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Step {formStep} of 4 • Vector Profiling Node</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg uppercase tracking-tight">YVIA Member Registry</h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Simulate quick-fill key trigger */}
                  {formStep === 1 && (
                    <button 
                      onClick={handleSimulateQuickFill}
                      className="px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/10 rounded-lg text-[10px] font-mono font-bold tracking-tight text-amber-300 uppercase transition-all"
                    >
                      ⚡ Quick Fill Sim
                    </button>
                  )}
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 px-1.5 text-white/50 hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar slider matching pop-up indices */}
              <div className="h-1.5 w-full bg-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-300"
                  style={{ width: `${(formStep / 4) * 100}%` }}
                />
              </div>

              {/* Popup Core Content Panels */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                
                {/* ─── STEP 1: GENERAL CREDENTIALS ─── */}
                {formStep === 1 && (
                  <form onSubmit={handleValidateStep1} className="space-y-5">
                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs font-light text-slate-500 leading-normal">
                      We support multiple nested ecosystem profiles (Mentees, mentors, parents & industry experts). Please fill out details below to let our branch pathways match correctly.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">1. Full name</label>
                        <input 
                          type="text" 
                          value={formFields.fullName}
                          onChange={e => setFormFields({ ...formFields, fullName: e.target.value })}
                          className={`w-full bg-slate-50 border ${errors.fullName ? 'border-rose-500 ring-rose-200' : 'border-slate-300'} hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none`}
                          placeholder="e.g. Alistair Vance"
                        />
                        {errors.fullName && <p className="text-[11px] font-mono font-bold text-rose-500">{errors.fullName}</p>}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">2. Email Address</label>
                        <input 
                          type="email" 
                          value={formFields.email}
                          onChange={e => setFormFields({ ...formFields, email: e.target.value })}
                          className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-300'} hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none`}
                          placeholder="e.g. alistair@work.org"
                        />
                        {errors.email && <p className="text-[11px] font-mono font-bold text-rose-500">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Geographic mesh fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Country dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">3. Country</label>
                        <select 
                          value={formFields.country}
                          onChange={e => setFormFields({ ...formFields, country: e.target.value })}
                          className="w-full bg-[#FAF8F2] border border-slate-300 hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white text-sm p-3 rounded-xl transition-all font-sans font-medium h-12 outline-none"
                        >
                          {countriesList.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">4. City</label>
                        <input 
                          type="text" 
                          value={formFields.city}
                          onChange={e => setFormFields({ ...formFields, city: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none"
                          placeholder="e.g. Hamilton"
                        />
                      </div>
                    </div>

                    {/* Neighborhood mesh coordinates */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">
                          5. Neighborhood / Address
                        </label>
                        <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase">Core Mesh Variable</span>
                      </div>
                      <input 
                        type="text" 
                        value={formFields.neighborhood}
                        onChange={e => setFormFields({ ...formFields, neighborhood: e.target.value })}
                        className={`w-full bg-slate-50 border ${errors.neighborhood ? 'border-rose-500' : 'border-slate-300'} hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none`}
                        placeholder="e.g. Rototuna North Link A, Hamilton / Road B Bloomsbury"
                      />
                      <p className="text-[10px] text-slate-400 font-light leading-normal">
                        Neighborhood address coordinates are calculated of local mesh matching to establish physical <strong>Learning Pod hubs</strong> within immediate spatial clusters.
                      </p>
                      {errors.neighborhood && <p className="text-[11px] font-mono font-bold text-rose-500">{errors.neighborhood}</p>}
                    </div>

                    {/* Professional fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Profession */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">6. Profession</label>
                        <input 
                          type="text" 
                          value={formFields.profession}
                          onChange={e => setFormFields({ ...formFields, profession: e.target.value })}
                          className={`w-full bg-slate-50 border ${errors.profession ? 'border-rose-500' : 'border-slate-300'} hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none`}
                          placeholder="e.g. Firmware Engineer / Parent"
                        />
                        {errors.profession && <p className="text-[11px] font-mono font-bold text-rose-500">{errors.profession}</p>}
                      </div>

                      {/* Official Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-700 block uppercase">7. Professional Title / Educational Qualification</label>
                        <input 
                          type="text" 
                          value={formFields.professionalTitle}
                          onChange={e => setFormFields({ ...formFields, professionalTitle: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 hover:border-[#2563eb]/45 focus:border-[#2563eb] focus:bg-white font-sans text-sm p-3 rounded-xl transition-all outline-none"
                          placeholder="e.g. Tech Director / Middle School Teacher / Mother of Two"
                        />
                      </div>
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-[#0f1f4e] text-white hover:bg-blue-700 transition-all font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
                      >
                        Next Step <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </form>
                )}

                {/* ─── STEP 2: BRANCH QUESTION 1 (DESIRES) ─── */}
                {formStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-amber-600 font-bold uppercase tracking-widest block">[ Track Q1 • Desires Matrix ]</div>
                      <h4 className="font-display font-semibold text-[#0f1f4e] text-lg uppercase leading-tight">
                        What do you (or your child) desire most from the YVIA network?
                      </h4>
                      <p className="text-xs text-slate-400 font-light font-sans font-semibold">Select all that apply. (Multiple choices allowed, our system computes the optimal vector match)</p>
                    </div>

                    <div className="space-y-3">
                      {desiresOptions.map((opt, i) => {
                        const active = selectedDesires.includes(opt.flag);
                        return (
                          <div 
                            key={i}
                            onClick={() => handleToggleDesires(opt.flag)}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                              active 
                                ? 'bg-blue-50/50 border-[#2563eb] shadow-sm' 
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              active ? 'bg-[#2563eb] border-[#2563eb] text-white' : 'border-slate-300 bg-slate-50'
                            }`}>
                              {active && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-mono font-bold text-slate-700 block uppercase">
                                {opt.flag.replace('_', ' ')}
                              </span>
                              <p className="text-[12.5px] font-sans text-slate-600 leading-normal font-light">
                                {opt.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 2 Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => setFormStep(1)}
                        className="px-4 py-2 border border-slate-300 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setFormStep(3)}
                        className="px-6 py-3 bg-[#0f1f4e] text-white hover:bg-blue-700 transition-all font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
                      >
                        Next <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: BRANCH QUESTION 2 (SURPLUS / RESOURCES) ─── */}
                {formStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-amber-600 font-bold uppercase tracking-widest block">[ Track Q2 • Capacity Matrix ]</div>
                      <h4 className="font-display font-semibold text-[#0f1f4e] text-lg uppercase leading-tight">
                        What surplus skills, resources, or passions are you willing to share with the community?
                      </h4>
                      <p className="text-xs text-slate-400 font-light font-semibold">Select all that apply. (Multiple choices allowed, sharing surplus/talents helps foster local mesh synergy)</p>
                    </div>

                    <div className="space-y-3">
                      {surplusOptions.map((opt, i) => {
                        const active = selectedSurpluses.includes(opt.flag);
                        return (
                          <div 
                            key={i}
                            onClick={() => handleToggleSurpluses(opt.flag)}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                              active 
                                ? 'bg-blue-50/50 border-[#2563eb] shadow-sm' 
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              active ? 'bg-[#2563eb] border-[#2563eb] text-white' : 'border-slate-300 bg-slate-50'
                            }`}>
                              {active && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-mono font-bold text-slate-700 block uppercase">
                                {opt.flag.replace('Outputs_', ' ').trim()}
                              </span>
                              <p className="text-[12.5px] font-sans text-slate-600 leading-normal font-light">
                                {opt.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 3 Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => setFormStep(2)}
                        className="px-4 py-2 border border-slate-300 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleFinalSubmit}
                        className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-98 transition-all font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                      >
                        Submit Vector Registry <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 4: ECOSYSTEM IDENTITY INTEGRATION & AUTOMATED WORKFLOW OVERVIEW (Module 3 Result Page) ─── */}
                {formStep === 4 && lastSubmission && (() => {
                  const vector = computeVectorIdentity(lastSubmission);
                  return (
                    <div className="space-y-6 text-center py-4">
                      
                      {/* Visual Celebratory Animation Header */}
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/10 animate-scaleUp">
                        <Check className="w-8 h-8 stroke-[4]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-black text-2xl text-[#0f1f4e] uppercase tracking-tight">
                          Vector Calculations Complete!
                        </h4>
                        <p className="text-slate-500 text-xs">
                          Registration synced into Option A Simulated Cloudflare D1 Node Table. Here is your calculated ecosystem placement.
                        </p>
                      </div>

                      {/* ========================================================
                          MODULE 3.1: DYNAMIC ECOSYSTEM IDENTITY CARD
                          ======================================================== */}
                      <div className="border border-slate-200 rounded-[2rem] p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-sm border border-[#2563eb]/10 text-left relative overflow-hidden max-w-md mx-auto">
                        <div className="absolute top-0 right-0 py-1 px-3 bg-black text-white font-mono text-[8px] uppercase tracking-wider font-semibold rounded-bl-xl">
                          Vector Status Core
                        </div>
                        
                        <span className="font-mono text-[9px] text-[#2563eb] uppercase tracking-widest font-bold block mb-1">
                          Calculated Vector Placement
                        </span>
                        
                        <div className={`inline-block py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r ${vector.color} text-white mb-4 shadow-sm`}>
                          {vector.level}
                        </div>

                        {/* Summary Block */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">NODE MEMBER ID</span>
                            <span className="text-xs font-mono font-bold text-slate-800">{lastSubmission.id}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block uppercase">FULL NAME</span>
                              <span className="text-xs font-sans font-bold text-[#0f1f4e]">{lastSubmission.fullName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block uppercase">EMAIL LOCATION</span>
                              <span className="text-xs font-sans text-slate-600 truncate block">{lastSubmission.email}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block uppercase">NEIGHBORHOOD</span>
                              <span className="text-xs font-sans font-bold text-[#0f1f4e] truncate block">{lastSubmission.neighborhood}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block uppercase">PROFESSION COORD</span>
                              <span className="text-xs font-sans text-slate-600 truncate block">{lastSubmission.profession}</span>
                            </div>
                          </div>
                        </div>

                        {/* Mesh coordinate match check line */}
                        <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-[#2563eb]" /> Hamilton Mesh Matching Node Ready
                          </span>
                          <span className="text-[#0f1f4e] font-bold uppercase">SECURE SYNC v2</span>
                        </div>
                      </div>

                      {/* ========================================================
                          MODULE 3.2: AUTOMATED WORKFLOW ACTIONS (MOCKUP TRIGGERED DETAILED LOGS)
                          ======================================================== */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3.5 max-w-md mx-auto">
                        <span className="font-mono text-[9px] text-[#2563eb] uppercase tracking-widest font-bold block">[ Simulated Server-Side Action Loop ]</span>
                        
                        {/* Option 1 workflow trigger: Tech Playbook */}
                        {((lastSubmission.desiredTracks.includes('Mentor_Track') && lastSubmission.surplusSkills.includes('Outputs_Mentoring')) || vector.level.includes("Academic")) ? (
                          <div className="flex gap-2.5 items-start bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs leading-normal">
                            <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-emerald-800 text-xs block uppercase">Playbook Workflow Triggered:</strong>
                              <p className="text-slate-600 mt-1">
                                System matched [Mentor Track + Youth Mentoring]. Dispatched email campaign: <strong>"YVIA Tech Playbook v1.0" containing WiseBot to Smart Pi local hardware guidelines</strong> to: <span className="font-mono font-bold text-slate-800">{lastSubmission.email}</span>.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* Option 2 workflow trigger: Co-creation invite */}
                        {(lastSubmission.surplusSkills.includes('Outputs_Professional') || vector.level.includes("Silicon Expert")) ? (
                          <div className="flex gap-2.5 items-start bg-fuchsia-100/60 border border-fuchsia-200/50 rounded-xl p-3 text-xs leading-normal">
                            <Mail className="w-5 h-5 text-fuchsia-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-fuchsia-800 text-xs block uppercase">Co-Creation Workflow Triggered:</strong>
                              <p className="text-slate-600 mt-1">
                                System matched professional assets. Dispatched <strong>Co-creation Invitation</strong> containing secure Discord entry codes and local Alpha testing coordinates to: <span className="font-mono font-bold text-slate-800">{lastSubmission.email}</span>.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* Standard automated Welcome mesh sync */}
                        <div className="flex gap-2.5 items-start bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs leading-normal">
                          <Database className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[#0f1f4e] text-xs block uppercase">Cloudflare Persistent Store:</strong>
                            <p className="text-slate-600 mt-1">
                              Neighborhood cluster localized. Added to Hamilton Mesh node network. Auto-synced peer group parameters.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Close button */}
                      <div className="pt-4 max-w-md mx-auto">
                        <button 
                          onClick={() => {
                            setIsFormOpen(false);
                            setFormStep(1);
                          }}
                          className="w-full py-3 bg-[#0f1f4e] hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          Close Card & Continue Browse
                        </button>
                      </div>

                    </div>
                  );
                })()}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* =========================================================================================
          SLIDEOVER RIGHT DRAWER: ADMIN MESH MANAGEMENT & CLOUDFLARE NODE CENTER (Backdoor console)
          ========================================================================================= */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Dark glass screen backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-xs"
            />

            {/* Sidebar content panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="relative w-full max-w-lg bg-[#0f172a] text-slate-300 h-full shadow-2xl flex flex-col z-10 border-l border-slate-800"
            >
              
              {/* Header */}
              <div className="p-6 bg-[#0f1f4e] text-white border-b border-slate-800 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-display font-medium text-sm tracking-tight text-white uppercase uppercase">YVIA Cloud Control Hub</h3>
                    <p className="text-[10px] font-mono text-slate-300 mt-0.5">Admin Database Backdoor (Option A Preview)</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAdminOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin navigation tabs inside backdoor */}
              <div className="flex border-b border-slate-800 text-xs font-mono font-bold select-none">
                <button 
                  onClick={() => setAdminActiveTab('submissions')}
                  className={`flex-1 py-3 text-center border-b-2 uppercase ${adminActiveTab === 'submissions' ? 'border-[#2563eb] text-[#93c5fd] bg-slate-900/40' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Submissions ({submissions.length})
                </button>
                <button 
                  onClick={() => setAdminActiveTab('catalog')}
                  className={`flex-1 py-3 text-center border-b-2 uppercase ${adminActiveTab === 'catalog' ? 'border-[#2563eb] text-[#93c5fd] bg-slate-900/40' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Option A Sync
                </button>
                <button 
                  onClick={() => setAdminActiveTab('cloudflare')}
                  className={`flex-1 py-3 text-center border-b-2 uppercase ${adminActiveTab === 'cloudflare' ? 'border-[#2563eb] text-[#93c5fd] bg-slate-900/40' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Cloudflare Bundle
                </button>
              </div>

              {/* Drawer Body Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                
                {/* ─── TAP 1: REGISTRY SUBMISSIONS (Includes requested JSON backdoor export!) ─── */}
                {adminActiveTab === 'submissions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold block">Registrations Index</span>
                      
                      {/* JSON BACKDOOR EXPORT TRIGGER */}
                      <button 
                        onClick={handleDownloadJSON}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                        id="export-backdoor-json-btn"
                        title="Export database record as local JSON file"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        <span>Export database to JSON</span>
                      </button>
                    </div>

                    {/* Search block */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={adminSearch}
                        onChange={e => setAdminSearch(e.target.value)}
                        placeholder="Search by name, email or neighborhood..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-sans text-slate-100 placeholder-slate-500 outline-none focus:border-[#2563eb]"
                      />
                    </div>

                    {/* Submissions checklist card renderer */}
                    <div className="space-y-3">
                      {submissions.filter(sub => {
                        const target = `${sub.fullName} ${sub.email} ${sub.neighborhood} ${sub.city}`.toLowerCase();
                        return target.includes(adminSearch.toLowerCase());
                      }).length === 0 ? (
                        <p className="text-xs text-slate-500 font-mono text-center py-6 border border-dashed border-slate-800 rounded-2xl">
                          No database registries matching search coordinates.
                        </p>
                      ) : (
                        submissions.filter(sub => {
                          const target = `${sub.fullName} ${sub.email} ${sub.neighborhood} ${sub.city}`.toLowerCase();
                          return target.includes(adminSearch.toLowerCase());
                        }).map((sub) => {
                          const calculatedInfo = computeVectorIdentity(sub);
                          return (
                            <div 
                              key={sub.id} 
                              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-sans relative group"
                            >
                              <button 
                                onClick={() => handleDeleteReg(sub.id)}
                                className="absolute top-4 right-4 p-1 rounded-md text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete node row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#2563eb] font-bold uppercase">
                                  <span>{sub.id}</span>
                                  <span>•</span>
                                  <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-extrabold text-sm text-white font-sans">{sub.fullName}</h4>
                                <p className="text-xs text-slate-400 font-mono font-medium">{sub.email}</p>
                              </div>

                              {/* Calculated Vector placement badge */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="bg-slate-800 text-[#93c5fd] font-mono text-[8px] font-bold uppercase rounded-md px-2 py-0.5 border border-slate-700 select-none">
                                  {calculatedInfo.level}
                                </span>
                                <span className="bg-slate-800 text-amber-300 font-mono text-[8px] font-bold uppercase rounded-md px-2 py-0.5 border border-slate-700 select-none">
                                  {sub.city}, {sub.neighborhood}
                                </span>
                              </div>

                              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/50 leading-normal flex items-start gap-1">
                                <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-slate-400 block mb-0.5">Automated Workflows:</span>
                                  {calculatedInfo.playbook && <span className="block text-emerald-400 font-mono">• Playbook PDF dispatched successfully</span>}
                                  {calculatedInfo.coCreation && <span className="block text-fuchsia-400 font-mono">• CoCreation invitation dispatched successfully</span>}
                                  <span className="block text-blue-400 font-mono">• Hamiton local learning pod match checked</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAP 2: DYNAMIC DATABASE PERSISTENCE CONTROLLER (APPROVE SYNC) ─── */}
                {adminActiveTab === 'catalog' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold block">Option A Layout Simulator</span>
                      <h4 className="font-display font-medium text-sm text-white uppercase tracking-tight">Direct SQL Sync Controller</h4>
                      <p className="text-xs text-slate-400 leading-normal font-light">
                        This simulates the direct query sync with Cloudflare D1. Toggle each course or event below. Items checked "Approved" instantly render in the dynamic catalog on the landing page!
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Courses Toggle List */}
                      <div className="space-y-2">
                        <span className="font-mono text-[9px] text-[#2563eb] font-bold uppercase tracking-widest block">Courses Tables Approval States</span>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-850 overflow-hidden text-xs">
                          {courses.map(course => (
                            <div key={course.id} className="p-3 flex items-center justify-between gap-4 font-sans hover:bg-slate-850">
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-mono text-[8px] text-slate-500 block uppercase">{course.id}</span>
                                <strong className="text-white block truncate">{course.name}</strong>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={course.approved}
                                onChange={() => {
                                  setCourses(prev => prev.map(c => c.id === course.id ? { ...c, approved: !c.approved } : c));
                                }}
                                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-[#2563eb] focus:ring-[#2563eb] transition-all cursor-pointer pointer-events-auto"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Events Toggle List */}
                      <div className="space-y-2">
                        <span className="font-mono text-[9px] text-amber-400 font-bold uppercase tracking-widest block">Events Tables Approval States</span>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-850 overflow-hidden text-xs">
                          {events.map(evt => (
                            <div key={evt.id} className="p-3 flex items-center justify-between gap-4 font-sans hover:bg-slate-850">
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-mono text-[8px] text-slate-500 block uppercase">{evt.id}</span>
                                <strong className="text-white block truncate">{evt.title}</strong>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={evt.approved}
                                onChange={() => {
                                  setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, approved: !e.approved } : e));
                                }}
                                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-[#2563eb] focus:ring-[#2563eb] transition-all cursor-pointer pointer-events-auto"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAP 3: CLOUDFLARE WRANGLER CONFIGURATION & SCHEMA BLUEPRINT ─── */}
                {adminActiveTab === 'cloudflare' && (
                  <div className="space-y-6">
                    <div className="space-y-1 select-none">
                      <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold block">Production Deployment Assets</span>
                      <h4 className="font-display font-medium text-sm text-white uppercase tracking-tight">Cloudflare Integration Kit</h4>
                      <p className="text-xs text-slate-400 leading-normal font-light">
                        We provide authentic configuration schemas to deploy to Cloudflare Pages & D1 database instantly. Copy these blueprints directly.
                      </p>
                    </div>

                    {/* Codes block: wrangler.toml */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 font-bold uppercase select-none">
                        <span>1. wrangler.toml</span>
                        <span className="text-[#2563eb]">Ready to deploy</span>
                      </div>
                      <pre className="bg-black/80 font-mono text-[11px] text-amber-200/90 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-normal whitespace-pre">
                        {rawWranglerToml}
                      </pre>
                    </div>

                    {/* Codes block: schema.sql */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 font-bold uppercase select-none">
                        <span>2. schema.sql (D1 SQL tables)</span>
                        <span className="text-[#2563eb]">Initialise Query</span>
                      </div>
                      <pre className="bg-black/80 font-mono text-[11px] text-emerald-400/90 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-normal whitespace-pre">
                        {rawSchemaSql}
                      </pre>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-sans font-light leading-normal">
                      <strong className="text-white block uppercase text-[10px] font-mono tracking-wider text-amber-300">How to deploy yvia.uk D1 db:</strong>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                        <li>Initialize Wrangler: <code className="font-mono text-white text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">npx wrangler login</code></li>
                        <li>Create D1 Db: <code className="font-mono text-white text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">npx wrangler d1 create yvia_uk_production</code></li>
                        <li>Initialize Schema: <code className="font-mono text-white text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">npx wrangler d1 execute yvia_uk_production --local --file=schema.sql</code></li>
                        <li>Deploy project: <code className="font-mono text-white text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">npx wrangler deploy</code></li>
                      </ol>
                    </div>
                  </div>
                )}

              </div>

              {/* Backdoor panel footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-900 text-center text-[10px] font-mono text-slate-500 font-medium">
                Syncing Hamilton Node B (v2-OptionA-Simulator)
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  // Helper trigger to handle clicking open pop-up sequence
  function handleOpenRegistration() {
    // Reset credentials and load step 1
    setIsFormOpen(true);
    setFormStep(1);
    setFormDataDefault();
  }

  function setFormDataDefault() {
    setFormFields({
      fullName: '',
      email: '',
      country: 'New Zealand',
      city: 'Hamilton',
      neighborhood: '',
      profession: '',
      professionalTitle: ''
    });
    setSelectedDesires([]);
    setSelectedSurpluses([]);
    setErrors({});
    setLastSubmission(null);
  }
}
