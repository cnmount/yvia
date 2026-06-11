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
  Users,
  LogIn,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { initialCourses, initialEvents } from './data';
import { Course, EventItem, Registration } from './types';
import { translations } from './locale';
import AboutUsPage from './components/MapComponent';
import CourseCard from './components/CourseCard';
import EventCard from './components/EventCard';

export default function App() {
  // Main Site Core States for Dynamic Sim connected directly to Node.js SQL Backend
  const [courses, setCourses] = useState<Course[]>(() => {
    return initialCourses.map(c => ({ ...c, approved: true }));
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    return initialEvents.map(e => ({ ...e, approved: true }));
  });

  const [submissions, setSubmissions] = useState<Registration[]>([]);
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [currentUserRegistrations, setCurrentUserRegistrations] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [lang, setLang] = useState<'en' | 'zh'>('en'); // Default to English for a user friendly introductory experience, can toggle anytime!
  const t = translations[lang];

  // Dual-pane tabs for user portal
  const [portalActiveTab, setPortalActiveTab] = useState<'profile' | 'registrations' | 'proposed' | 'inbox'>('profile');

  // Event creation form variables
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventFormFields, setEventFormFields] = useState({
    title: '',
    location: '',
    date: '',
    description: '',
    targetAudience: '',
    imagePath: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
  });
  const [eventFormError, setEventFormError] = useState('');
  const [eventFormSuccess, setEventFormSuccess] = useState('');

  const apiBaseUrl = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const localApiFallbackUrl = 'http://localhost:3000';
  const apiUrls = (url: string) => {
    if (/^https?:\/\//i.test(url)) return [url];
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const candidates = [
      apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath,
    ];

    if (
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
      window.location.port !== '3000'
    ) {
      candidates.push(`${localApiFallbackUrl}${normalizedPath}`);
    }

    return [...new Set(candidates)];
  };

  function normalizeArray(value: any) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function normalizeUser(u: any) {
    if (!u) return u;
    return {
      ...u,
      desiredTracks: normalizeArray(u.desiredTracks),
    };
  }

  // Integrated Network & SQLite Sync Diagnostic States
  const [dataSyncError, setDataSyncError] = useState<{
    message: string;
    endpoint: string;
    area: string;
    status?: number;
    preview?: string;
  } | null>(null);

  // Helper for human-readable data area mapping
  const getDataAreaName = (url: string): string => {
    const cleanUrl = url.split("?")[0];
    if (cleanUrl.endsWith("/api/register")) return lang === "zh" ? "用户节点注册 (YVIA Core Registry)" : "User Node Registration (YVIA Core Registry)";
    if (cleanUrl.endsWith("/api/courses") || cleanUrl.includes("/api/courses/")) return lang === "zh" ? "课程库同步 (Course Catalog Synchronization)" : "Course Library Sync (Course Catalog Sync)";
    if (cleanUrl.endsWith("/api/events") || cleanUrl.includes("/api/events/")) return lang === "zh" ? "社区集会活动同步 (Spatial Events Alignment)" : "Community Events Alignment (Spatial Events Offset)";
    if (cleanUrl.endsWith("/api/submissions")) return lang === "zh" ? "注册节点总览 (Registry Submission Ledger)" : "Global Member Submissions Ledger (Registry Outer)";
    if (cleanUrl.endsWith("/api/emails")) return lang === "zh" ? "安全外部信道 (Email System Channel)" : "Email Event Notification channels (Secure Outbound)";
    if (cleanUrl.includes("/api/user/registrations")) return lang === "zh" ? "个人出席资质校验 (Attendance Log Verification)" : "Personal Attendance Certification Grid";
    if (cleanUrl.endsWith("/api/login")) return lang === "zh" ? "网格凭信核验 (Credential Ingress Verification)" : "Secure Credential Login Gateway";
    if (cleanUrl.endsWith("/api/user/update")) return lang === "zh" ? "设置修饰同步 (Profile Attribute Modulation)" : "Profile Synchronizer Channel";
    return lang === "zh" ? "底层数据通道 (Underlying Network Carrier)" : "Underlying Network Data Carrier";
  };

  const safeFetchJson = async (url: string, options?: RequestInit): Promise<any> => {
    const area = getDataAreaName(url);
    const candidates = apiUrls(url);
    let lastError: any;

    for (const requestUrl of candidates) {
      try {
      const res = await fetch(requestUrl, options);
      const contentType = res.headers.get("content-type") || "";
      
      // Handle unsuccessful HTTP status codes gracefully
      if (!res.ok) {
        let bodyText = "";
        try {
          bodyText = await res.text();
        } catch {}

        if (contentType.includes("application/json")) {
          try {
            const parsed = JSON.parse(bodyText);
            const errMsg = parsed.error || `HTTP Status Code ${res.status}`;
            throw { message: errMsg, endpoint: url, area, status: res.status };
          } catch {
            throw { message: `HTTP Status Code ${res.status}`, endpoint: url, area, status: res.status, preview: bodyText.slice(0, 160) };
          }
        } else {
          // Received HTML error page such as 500 error / 502 gateway error
          const cleanPreview = bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
          throw {
            message: `HTTP Status Code ${res.status}: Expected JSON from ${url}, but received HTML. This usually means the API request was handled by a static frontend/SPA fallback instead of the Express backend. Run the fullstack server on http://localhost:3000 or set VITE_API_BASE_URL to the backend origin.`,
            endpoint: url,
            area,
            status: res.status,
            preview: cleanPreview || "HTML Code Snippet starts with: " + bodyText.slice(0, 60),
            retryable: true,
          };
        }
      }

      // Check if response is OK but still contains HTML (Vite middleware template fallback)
      const bodyText = await res.text();
      if (!contentType.includes("application/json") && bodyText.trim().startsWith("<")) {
        const cleanPreview = bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
        throw {
          message: "Single-page-app fallback intercepted the API request. Expected JSON but received the frontend HTML source page. Check that the Express backend is running, or set VITE_API_BASE_URL when deploying the frontend separately.",
          endpoint: url,
          area,
          status: res.status,
          preview: cleanPreview || "HTML Document",
          retryable: true,
        };
      }

      try {
        return JSON.parse(bodyText);
      } catch (err: any) {
        throw {
          message: `JSON Decoding Mismatch: ${err?.message || "Failed to parse body text"}`,
          endpoint: url,
          area,
          status: res.status,
          preview: bodyText.slice(0, 160)
        };
      }
      } catch (error: any) {
        lastError = error && error.endpoint ? error : {
          message: error?.message || String(error),
          endpoint: url,
          area,
          status: undefined,
          preview: undefined,
          retryable: true,
        };
        if (!lastError.retryable) {
          throw lastError;
        }
      }
    }

    try {
      throw lastError;
    } catch (error: any) {
      if (error && error.endpoint) {
        throw error;
      }
      throw {
        message: error?.message || String(error),
        endpoint: url,
        area,
        status: undefined,
        preview: undefined
      };
    }
  };

  // Sync data dynamically on mount & whenever updates occur
  const fetchData = async () => {
    try {
      const dataCourses = await safeFetchJson("/api/courses");
      setCourses(dataCourses);

      const dataEvents = await safeFetchJson("/api/events");
      setEvents(dataEvents);

      const dataSubs = await safeFetchJson("/api/submissions");
      setSubmissions(dataSubs.map((u: any) => normalizeUser(u)));

      const dataEmails = await safeFetchJson("/api/emails");
      setAdminEmails(dataEmails);

      // Successfully synced everything, clear errors
      setDataSyncError(null);
    } catch (err: any) {
      console.error("fetchData failed:", err);
      if (err?.retryable) {
        setDataSyncError(null);
        setCaptchaError('');
        return;
      }
      const structuredErr = err.endpoint ? err : {
        message: err.message || String(err),
        endpoint: "Multiple Dashboard Endpoints",
        area: lang === "zh" ? "控制台网格同步" : "Dashboard Metrics Sync",
        status: err.status
      };
      setDataSyncError(structuredErr);
      setCaptchaError(`Data refresh failed: ${structuredErr.message}`);
    }
  };

  const fetchUserRegistrations = async (userId: string) => {
    try {
      const data = await safeFetchJson(`/api/user/registrations?userId=${encodeURIComponent(userId)}`);
      setCurrentUserRegistrations(data);
      setDataSyncError(null);
    } catch (err: any) {
      console.error("Failed to load user registrations", err);
      const structuredErr = err.endpoint ? err : {
        message: err.message || String(err),
        endpoint: "/api/user/registrations",
        area: lang === "zh" ? "个人参与网格核算" : "Personal Registered Spatial Pods",
        status: err.status
      };
      setDataSyncError(structuredErr);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // UI Navigation states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('yvia_admin_auth') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState<'submissions' | 'catalog' | 'emails' | 'cloudflare'>('submissions');
  
  // Tab-based navigation state replacing bilingual switcher
  const [currentTab, setCurrentTab] = useState<'home' | 'courses' | 'events' | 'about'>('home');

  // Check admin security secondary link on mount
  useEffect(() => {
    if (window.location.pathname === '/yvia_admin' || window.location.hash === '#yvia_admin') {
      setIsAdminOpen(true);
    }
  }, []);

  // --- MODULE 2.5: User Authentication & Personal Profile Portal ---
  const [currentUser, setCurrentUser] = useState<Registration | null>(() => {
    const saved = localStorage.getItem('yvia_v2_current_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserRegistrations(currentUser.id);
    } else {
      setCurrentUserRegistrations([]);
    }
  }, [currentUser]);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [portalFields, setPortalFields] = useState({
    fullName: '',
    neighborhood: '',
    profession: '',
    professionalTitle: '',
    country: 'New Zealand',
    city: 'Hamilton'
  });
  const [portalDesires, setPortalDesires] = useState<string[]>([]);
  const [portalPassword, setPortalPassword] = useState('');
  const [portalSuccessMsg, setPortalSuccessMsg] = useState('');
  const [portalErrors, setPortalErrors] = useState<Record<string, string>>({});

  // CAPTCHA Challenge generator
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  const [captchaChallenge, setCaptchaChallenge] = useState(() => generateCaptcha());
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const found = await safeFetchJson('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const normalized = normalizeUser(found);
      localStorage.setItem('yvia_v2_current_user', JSON.stringify(normalized));
      setCurrentUser(normalized);
      setIsLoginOpen(false);
      setDataSyncError(null);
      
      // Auto populate the portal settings and open portal
      setPortalFields({
        fullName: found.fullName,
        neighborhood: found.neighborhood,
        profession: found.profession,
        professionalTitle: found.professionalTitle || '',
        country: found.country,
        city: found.city
      });
      setPortalDesires(found.desiredTracks || []);
      setPortalPassword(found.password);
      setPortalSuccessMsg('');
      setPortalErrors({});
      setIsPortalOpen(true);
      setLoginEmail('');
      setLoginPassword('');
      setToastMessage(`Welcome back, ${found.fullName}! Connected.`);
      
      // Load user registrations
      fetchUserRegistrations(found.id);
    } catch (err: any) {
      console.error("Login failure:", err);
      const structuredErr = err.endpoint ? err : {
        message: err.message || String(err),
        endpoint: "/api/login",
        area: lang === "zh" ? "用户登录鉴权口" : "Secure Credential Login Gateway",
        status: err.status
      };
      setDataSyncError(structuredErr);
      setLoginError(structuredErr.message || 'Identity authentication failed.');
    }
  };

  const handleOpenPortal = () => {
    if (!currentUser) return;
    setPortalFields({
      fullName: currentUser.fullName,
      neighborhood: currentUser.neighborhood,
      profession: currentUser.profession,
      professionalTitle: currentUser.professionalTitle || '',
      country: currentUser.country,
      city: currentUser.city
    });
    setPortalDesires(currentUser.desiredTracks || []);
    setPortalPassword(currentUser.password || currentUser.email.split('@')[0]);
    setPortalSuccessMsg('');
    setPortalErrors({});
    setIsPortalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalSuccessMsg('');
    const tempErrors: Record<string, string> = {};
    let hasError = false;

    if (!portalFields.fullName.trim()) {
      tempErrors.fullName = "Name is required";
      hasError = true;
    }
    if (!portalFields.neighborhood.trim()) {
      tempErrors.neighborhood = "Neighborhood address is required";
      hasError = true;
    }
    if (!portalFields.profession.trim()) {
      tempErrors.profession = "Profession is required";
      hasError = true;
    }
    if (!portalPassword.trim()) {
      tempErrors.password = "Password cannot be empty";
      hasError = true;
    }

    setPortalErrors(tempErrors);
    if (hasError) return;

    if (!currentUser) return;

    try {
      const updatedData = await safeFetchJson('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          fullName: portalFields.fullName,
          neighborhood: portalFields.neighborhood,
          profession: portalFields.profession,
          professionalTitle: portalFields.professionalTitle,
          password: portalPassword,
          desiredTracks: portalDesires,
          country: portalFields.country,
          city: portalFields.city
        })
      });

      const updatedUser = normalizeUser(updatedData);
      localStorage.setItem('yvia_v2_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setPortalSuccessMsg('Profile and password updated successfully in SQLite database!');
      setToastMessage("Profile synced with Cloudflare D1.");
      setDataSyncError(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      const structuredErr = err.endpoint ? err : {
        message: err.message || String(err),
        endpoint: "/api/user/update",
        area: lang === "zh" ? "用户设置设置同步" : "Profile Settings Synchronizer",
        status: err.status
      };
      setDataSyncError(structuredErr);
      setPortalSuccessMsg('');
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const output = await safeFetchJson('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          eventId
        })
      });

      setToastMessage(output.message || "Enrolled successfully in grid event! Confirmation email logged.");
      
      // Reload states & registrations
      fetchData();
      fetchUserRegistrations(currentUser.id);
    } catch (e) {
      console.error("Failed registering for event:", e);
    }
  };

  const handleInitiateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventFormError('');
    setEventFormSuccess('');

    if (!currentUser) return;

    if (!eventFormFields.title.trim() || !eventFormFields.location.trim() || !eventFormFields.date.trim() || !eventFormFields.description.trim()) {
      setEventFormError("Please fill out all required event details.");
      return;
    }

    try {
      await safeFetchJson('/api/events/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventFormFields.title,
          location: eventFormFields.location,
          date: eventFormFields.date,
          description: eventFormFields.description,
          targetAudience: eventFormFields.targetAudience || 'Cooperative Youth (Ages 8-15) & Peer Mentors',
          images: [eventFormFields.imagePath],
          creatorId: currentUser.id,
          creatorEmail: currentUser.email
        })
      });

      setEventFormSuccess("Cooperative event proposal successfully compiled! Queued with state: pending. System mail log dispatched!");
      setToastMessage("Event proposal created! Simulated confirmation email sent.");
      setEventFormFields({
        title: '',
        location: '',
        date: '',
        description: '',
        targetAudience: '',
        imagePath: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
      });
      fetchData();
      fetchUserRegistrations(currentUser.id);
    } catch (err) {
      setEventFormError("Gateway timeout. Connect with node operator.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yvia_v2_current_user');
    setCurrentUser(null);
    setIsPortalOpen(false);
  };

  const handleToggleCourseApprove = async (id: string) => {
    try {
      await safeFetchJson('/api/courses/toggle-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setCourses(prev => prev.map(c => c.id === id ? { ...c, approved: !c.approved } : c));
      setToastMessage("Course approval toggled in SQLite database.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEventApprove = async (id: string) => {
    try {
      await safeFetchJson('/api/events/toggle-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, approved: !e.approved } : e));
      setToastMessage("Event approval toggled in SQLite database.");
    } catch (e) {
      console.error(e);
    }
  };

  // --- MODULE 2: Pop-up form states ---
  const [showCtaPaths, setShowCtaPaths] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1); // Step 1: Base, Step 2: Track details, Step 3: Vector Card
  
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
  const [selectedSurplus, setSelectedSurplus] = useState<string[]>([]);
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
      flag: "Mentor",
      text: lang === 'zh' 
        ? "青年导师 Target Mentor - 接受顶级工程专家培训指导，带领弟弟妹妹快乐自主拆拆装装" 
        : "Join as a Mentor - Coached directly by industry partners, lead local youth computing groups"
    },
    {
      flag: "Mentee",
      text: lang === 'zh' 
        ? "学员 Target Mentee  - 在导师或行业专家倾心带领下，体验有趣的科学探究、少儿编程与智能系统闭环" 
        : "Join as a Mentee - Build robotics, coordinate logic paths and hands-on algorithms under friendly peer guides"
    },
    {
      flag: "Expert",
      text: lang === 'zh' 
        ? "行业顾问与技术专家 Expert / Advisor - 携手学者与名企大咖，共同开辟前沿开源探索套件，守护中学生备课 review" 
        : "Join as an Expert/Advisor (IT & Academics) - Share industry insights, train high-school mentors, validate kit specifications"
    },
    {
      flag: "Pod",
      text: lang === 'zh' 
        ? "社区微节点 / 筹办人 Learning POD - 协助提供公共图书室、居委客厅或校舍场地，贡献家庭微循环力量" 
        : "Start a Learning Pod / Host Venue - Facilitate spatial setup in local libraries or living rooms, assist physical material flow"
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

  const handleToggleSurplus = (flag: string) => {
    setSelectedSurplus(prev => 
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
      neighborhood: "Flagstaff West Section B",
      profession: "Mechatronics Research Fellow",
      professionalTitle: "Lead Systems Engineer"
    });
    setSelectedDesires(["Mentor", "Growth"]);
    setSelectedSurplus(["Outputs_Mentoring"]);
    setFormStep(1);
    setErrors({});
  };

  // Popup progress validate step 1
  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};
    if (!formFields.fullName.trim()) tempErrors.fullName = "Name is required";

    const emailLower = formFields.email.trim().toLowerCase();
    if (!formFields.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formFields.email)) {
      tempErrors.email = "Enter a valid email address";
    } else {
      const emailExists = submissions.some(s => s.email.toLowerCase() === emailLower);
      if (emailExists) {
        tempErrors.email = "This email is already registered! Please sign in to modify your submitted details.";
        setErrors(tempErrors);
        return;
      }
    }
    if (!formFields.neighborhood.trim()) tempErrors.neighborhood = "Neighborhood mesh coordinate required for matching";
    if (!formFields.profession.trim()) tempErrors.profession = "Profession is required";
    
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length === 0) {
      setFormStep(2);
    }
  };

  // Handle final submission + trigger workflows
  const handleFinalSubmit = async () => {
    // Check CAPTCHA Code
    if (userCaptchaInput.trim().toUpperCase() !== captchaChallenge) {
      setCaptchaError("Invalid CAPTCHA security code. Please check and try again.");
      return;
    }

    try {
      const registrationData = await safeFetchJson('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formFields.fullName,
          email: formFields.email,
          country: formFields.country,
          city: formFields.city,
          neighborhood: formFields.neighborhood,
          profession: formFields.profession,
          professionalTitle: formFields.professionalTitle || "STEAM Participant",
          desiredTracks: selectedDesires
        })
      });

      const registration = normalizeUser(registrationData);
      setLastSubmission(registration);
      
      // Auto-login the user
      localStorage.setItem('yvia_v2_current_user', JSON.stringify(registration));
      setCurrentUser(registration);

      // Reset captcha and error states
      setUserCaptchaInput('');
      setCaptchaError('');
      setDataSyncError(null); // Clear any active database sync errors
      setCaptchaChallenge(generateCaptcha());
      setToastMessage(`Welcome to YVIA ${registration.fullName}! Default credentials dispatched to your mail outbox.`);
      setFormStep(3); // Move straight to dynamic card presentation (Module 3)
      fetchData();
    } catch (err: any) {
      console.error("Connection failure with dynamic SQL database mesh:", err);
      const structuredErr = err.endpoint ? err : {
        message: err.message || String(err),
        endpoint: "/api/register",
        area: lang === "zh" ? "用户数字网格注册" : "User Member Registration Gateway",
        status: err.status
      };
      setDataSyncError(structuredErr);
      setCaptchaError(`Registration Sync failed: ${structuredErr.message}`);
    }
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
    
    const isMentor = reg.desiredTracks.includes("Mentor");
    //const isProfessional = reg.surplusSkills.includes("Outputs_Professional");
    //const isSpaces = reg.surplusSkills.includes("Outputs_Space");
    //const isMentoringWork = reg.surplusSkills.includes("Outputs_Mentoring");

    /*if (isProfessional && reg.professionalTitle) {
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
    } else {*/
      return {
        level: "L1 Academic STEAM Scholar",
        sub: "Interactive Systems Maker",
        color: "from-sky-500 to-blue-600",
        tag: "Youth Scholar",
        playbook: true,
        coCreation: false
      };
    //}
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
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-[#2563eb]/8 py-3.5 md:py-4 px-4 sm:px-6 md:px-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between transition-all">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2 select-none">
            {/* Logo Brand Frame using original YVIA custom icon */}
            <svg viewBox="0 0 105 105" className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
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
              <span className="font-display font-extrabold text-base md:text-xl tracking-tight text-[#0f1f4e]">YVIA</span>
            </div>
          </div>

          {/* Mobile visible layout for action buttons and language toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-sans font-extrabold text-[9px] text-slate-500 hover:text-blue-600 active:bg-blue-50 cursor-pointer"
            >
              {lang === 'en' ? '中文' : 'ENG'}
            </button>
            <a
              href="mailto:info@yvia.uk?subject=Message%20to%20YVIA"
              className="px-2.5 py-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-xl font-bold text-[9px] tracking-wider shadow-lg shadow-blue-500/10 active:translate-y-0.5 transition-all outline-none"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Floating Interactive Page Nav Switchers */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-slate-100 border border-[#2563eb]/12 p-1 rounded-full shadow-inner font-sans font-bold text-[10px] md:text-xs max-w-full overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setCurrentTab('home')} 
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              currentTab === 'home' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            {lang === 'zh' ? '首页' : 'Home'}
          </button>
          <button 
            onClick={() => setCurrentTab('courses')} 
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              currentTab === 'courses' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            {lang === 'zh' ? 'STEAM 课程' : 'Courses'}
          </button>
          <button 
            onClick={() => setCurrentTab('events')} 
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              currentTab === 'events' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            {lang === 'zh' ? '社区活动' : 'Events'}
          </button>
          <button 
            onClick={() => setCurrentTab('about')} 
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              currentTab === 'about' 
                ? 'bg-[#2563eb] text-white shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-[#2563eb]'
            }`}
          >
            {lang === 'zh' ? '关于我们' : 'About Us'}
          </button>
        </div>

        {/* Desktop friction-free action button & Language capsule */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Selector Capsule */}
          <div className="flex bg-slate-150 p-1 rounded-xl border border-slate-200/50 font-sans select-none">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                lang === 'zh'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              中文
            </button>
          </div>

          <a
            href="mailto:info@yvia.uk?subject=Message%20to%20YVIA"
            className="px-5 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-xl font-bold text-xs tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all outline-none cursor-pointer"
          >
            {lang === 'zh' ? '联系我们' : 'Contact Us'}
          </a>
        </div>
      </nav>

      {/* Dynamic Network / Database Mesh Sync Diagnostics Warning HUD */}
      {dataSyncError && (
        <div id="mesh-connectivity-diagnostics-card" className="bg-rose-50 border-y border-rose-200 text-rose-950 px-4 py-4 md:px-12 flex flex-col gap-4 animate-fade-in relative z-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs shadow-md shadow-rose-600/10">
                {dataSyncError.status || "ERR"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-rose-250 text-rose-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-350/30">
                    {dataSyncError.area}
                  </span>
                  <span className="text-[9.5px] font-mono bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md font-bold select-all leading-none border border-slate-350/20">
                    {dataSyncError.endpoint}
                  </span>
                </div>
                <h4 className="text-sm font-sans font-bold leading-normal text-rose-950">
                  {lang === 'zh' ? 'SQLite 数据库连接与同步校验异常' : 'SQLite Database Mesh Link Verification Anomaly'}
                </h4>
                <p className="text-xs font-sans text-rose-900 leading-relaxed font-normal">
                  {dataSyncError.message}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => {
                  setDataSyncError(null);
                  setCaptchaError('');
                }}
                className="px-3.5 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 font-sans font-bold text-[11px] rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                {lang === 'zh' ? '忽略提示' : 'Dismiss'}
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-[11px] rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/10"
                onClick={() => {
                  fetchData();
                }}
              >
                {lang === 'zh' ? '触发二次安全同步' : 'Retry Safe Sync'}
              </button>
            </div>
          </div>
          
          {dataSyncError.preview && (
            <div className="bg-slate-900 text-[#38bdf8] border border-slate-800 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto selection:bg-[#38bdf8] selection:text-slate-900 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 font-bold uppercase text-[9px] tracking-widest leading-none">
                <span>📟 RAW SYSTEM ERROR LOG ENTRY</span>
                <span className="text-rose-400">STATUS: INTERRUPT</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono font-medium max-h-40 overflow-y-auto scoller-thin">{dataSyncError.preview}</pre>
            </div>
          )}
        </div>
      )}

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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full font-mono text-xs uppercase tracking-widest font-semibold animate-pulse">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
              <span>{t.heroBadge}</span>
            </div>

            {/* Original Branding preserved */}
            <div className="space-y-3">
              <h1 className="font-display font-black text-6xl md:text-8xl text-white tracking-tighter leading-none select-none">
                YVIA
              </h1>
              <p className="font-sans font-light italic text-xl md:text-2xl text-blue-200">
                {t.yviaSubtitle}
              </p>
            </div>

            {/* ========================================================
                MODULE 1: RECONSTRUCTED HERO/CTA REGION (Pristine High-Tech Card Frame)
                ======================================================== */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 py-1.5 px-3 bg-blue-500 text-white font-mono text-[9px] uppercase tracking-wider rounded-bl-xl font-bold">
                {lang === 'zh' ? '协同运行网格' : 'Cooperative Framework'}
              </div>

              <div className="space-y-3">
                {/* Section Title (H2 as requested by PRD) */}
                <h2 className="font-display font-black text-2xl md:text-3.5xl text-white uppercase tracking-tight">
                  {t.heroTitle}
                </h2>
                
                {/* Sub-text Paragraph (as requested by PRD) */}
                <p className="font-sans text-sm md:text-base text-slate-100 leading-relaxed font-light">
                  {t.heroDesc}
                </p>
              </div>

              {/* Crisp High-Contrast Action Trigger Button "[ Go ]" (Module 1 Target) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="text-xs text-blue-100/70 font-mono space-y-1 py-1">
                  <div className="flex items-center gap-1.5 text-amber-200 font-bold">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t.deepMatchingTitle}</span>
                  </div>
                  <p className="text-blue-100/80 leading-relaxed">{t.deepMatchingDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Original Stats Layout perfectly balanced */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white/7 backdrop-blur-md border border-white/12 rounded-2xl p-6 transition-all hover:bg-white/12 hover:-translate-y-1">
              <div className="font-display font-black text-4xl md:text-5xl text-amber-300">10+</div>
              <div className="text-xs text-blue-100/60 uppercase tracking-widest font-bold font-mono mt-2">{t.yearsLabel}</div>
              <p className="text-slate-200 text-xs mt-2 leading-relaxed font-light">{t.yearsDesc}</p>
            </div>

            <div className="bg-white/7 backdrop-blur-md border border-white/12 rounded-2xl p-6 transition-all hover:bg-white/12 hover:-translate-y-1">
              <div className="font-display font-black text-4xl md:text-5xl text-amber-300">2-in-1</div>
              <div className="text-xs text-blue-100/60 uppercase tracking-widest font-bold font-mono mt-2">{t.dualLabel}</div>
              <p className="text-slate-200 text-xs mt-2 leading-relaxed font-light">{t.dualDesc}</p>
            </div>

            <div className="sm:col-span-2 bg-gradient-to-tr from-[#1e4fc7]/50 to-[#2563eb]/20 backdrop-blur-md border border-white/12 rounded-2xl p-6">
              <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">{t.designPrinciples}</div>
              <h3 className="font-display font-extrabold text-xl text-white">{t.designSub}</h3>
              <p className="text-slate-200 text-xs mt-3 leading-relaxed font-light">
                {t.designDesc}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2 animate-pulse">
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">
                  {lang === 'zh' ? '智能物理硬件' : 'Physical Hardware'}
                </span>
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">
                  {lang === 'zh' ? '交互式算法' : 'Interactive Algorithms'}
                </span>
                <span className="bg-white/10 text-white rounded-md px-2.5 py-1 text-[10px] font-mono border border-white/5">
                  {lang === 'zh' ? '系统应用实践' : 'Applied Core STEAM'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </header>
          </>
        )}

    {/* ========================================================
        RECONSTRUCTED HOME VIEW: 6 PROGRESSIVE PLAN-BASED MODULES
        ======================================================== */}
    {currentTab === 'home' && (
      <>
        {/* Module 1: What is YVIA (Value Proposition & Core Concept) */}
        <section id="what-is-yvia" className="py-16 px-6 max-w-7xl mx-auto w-full border-b border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>{t.whatIsYviaHeader}</span>
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight leading-none text-left">
                {t.whatIsYviaTitle}
              </h2>
              <p className="font-sans text-slate-600 leading-relaxed text-sm md:text-base font-light">
                {t.whatIsYviaDesc}
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs text-blue-800 leading-relaxed italic">
                  &ldquo;{lang === 'zh' ? '同伴引领的 STEAM 学习极大地提升了参与感、建立了自信心，并在一同协作中帮助学生学得更快、走得更远。' : 'Peer-led STEAM learning increases engagement, builds confidence, and helps students learn faster through real collaboration.'}&rdquo;
                </p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full bg-slate-50/70 rounded-[2.5rem] p-8 border border-blue-100/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <h3 className="font-display font-black text-[#0f1f4e] text-xl uppercase tracking-tight mb-6">
                {lang === 'zh' ? '三大核心价值优势' : 'Value Proposition Highlights'}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs shrink-0 text-blue-600 animate-pulse">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t.bullet1}</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">{lang === 'zh' ? '动手制作实体硬件与传动结构，让逻辑走下屏幕。' : 'Direct interaction with physical devices and rotors instead of static syntax screens.'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs shrink-0 text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t.bullet2}</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">{lang === 'zh' ? '中学生导师作为年轻榜样带领小班，激发极客成长自循环。' : 'Experienced teenagers guide younger classes, creating peer-incentivized growth.'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs shrink-0 text-blue-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t.bullet3}</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">{lang === 'zh' ? '由社区自治网络承载，砍掉中间高昂品牌费，支持家庭自组织。' : 'Hosted by local library groups, cutting training overhead and ensuring quality kits.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module 2: Why YVIA Matters (Painpoints & Solutions) */}
        <section id="why-yvia-matters" className="py-16 px-6 border-b border-slate-100" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #fef9f0 50%, #f0fdf4 100%)'}}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {t.whyTitle}
              </span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight">
                {t.whySubtitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500"></div>
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 shrink-0 font-bold font-mono text-xs">
                  01
                </div>
                <h3 className="font-display font-extrabold text-[#0f1f4e] text-base mb-2">{t.why1Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.why1Desc}</p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shrink-0 font-bold font-mono text-xs">
                  02
                </div>
                <h3 className="font-display font-extrabold text-[#0f1f4e] text-base mb-2">{t.why2Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.why2Desc}</p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 shrink-0 font-bold font-mono text-xs">
                  03
                </div>
                <h3 className="font-display font-extrabold text-[#0f1f4e] text-base mb-2">{t.why3Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.why3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Module 3: How It Works (Progressive Steps) */}
        <section id="how-it-works-3step" className="py-16 px-6 border-b border-slate-100" style={{background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)'}}>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
              {t.howTitle}
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight">
              {t.howSubtitle}
            </h2>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-3xl p-6 border border-blue-700/30 shadow-lg shadow-blue-500/10 group">
              <div className="font-display font-black text-6xl text-white/20 mb-4">01</div>
              <h3 className="font-display font-extrabold text-white text-base mb-2">{t.how1Title}</h3>
              <p className="text-xs text-blue-100 leading-normal font-light">{t.how1Desc}</p>
              <div className="mt-4 w-8 h-0.5 bg-amber-400 rounded-full"></div>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-[#92400e] to-[#d97706] rounded-3xl p-6 border border-amber-600/30 shadow-lg shadow-amber-500/10 group">
              <div className="font-display font-black text-6xl text-white/20 mb-4">02</div>
              <h3 className="font-display font-extrabold text-white text-base mb-2">{t.how2Title}</h3>
              <p className="text-xs text-amber-100 leading-normal font-light">{t.how2Desc}</p>
              <div className="mt-4 w-8 h-0.5 bg-white/40 rounded-full"></div>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-[#065f46] to-[#059669] rounded-3xl p-6 border border-emerald-600/30 shadow-lg shadow-emerald-500/10 group">
              <div className="font-display font-black text-6xl text-white/20 mb-4">03</div>
              <h3 className="font-display font-extrabold text-white text-base mb-2">{t.how3Title}</h3>
              <p className="text-xs text-emerald-100 leading-normal font-light">{t.how3Desc}</p>
              <div className="mt-4 w-8 h-0.5 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Module 4: What Students Build (Real Projects) */}
        <section id="what-students-build" className="py-16 px-6 border-b border-slate-100" style={{background: 'linear-gradient(135deg, #fafafa 0%, #f0f9ff 60%, #fef3c7 100%)'}}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {t.buildTitle}
              </span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight">
                {t.buildSubtitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Project 1 */}
              <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f1f4e] text-base">{t.build1Title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light mt-2">{t.build1Desc}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-blue-50">
                  <span className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 text-blue-700 text-[10px] font-mono">
                    {lang === 'zh' ? '三维空间算法' : 'Spatial Navigation & Logic'}
                  </span>
                  <span className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 text-blue-700 text-[10px] font-mono">
                    {lang === 'zh' ? '数字化应用物理' : 'Applied Physics'}
                  </span>
                </div>
              </div>

              {/* Project 2 */}
              <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f1f4e] text-base">{t.build2Title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light mt-2">{t.build2Desc}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-amber-50">
                  <span className="bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 text-amber-700 text-[10px] font-mono">
                    {lang === 'zh' ? '传感器反馈闭环' : 'Sensor Feedback Loop'}
                  </span>
                  <span className="bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 text-amber-700 text-[10px] font-mono">
                    {lang === 'zh' ? '智能自主寻路' : 'Autonomous Avoidance'}
                  </span>
                </div>
              </div>

              {/* Project 3 */}
              <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f1f4e] text-base">{t.build3Title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light mt-2">{t.build3Desc}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-emerald-50">
                  <span className="bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 text-emerald-700 text-[10px] font-mono">
                    {lang === 'zh' ? '微控制器物理IO' : 'Electrical Signal IO'}
                  </span>
                  <span className="bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 text-emerald-700 text-[10px] font-mono">
                    {lang === 'zh' ? '实体原型拼插' : 'Tactile Prototyping'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module 5: Who Can Join (Role mapping) */}
        <section id="who-can-join" className="py-16 px-6 max-w-7xl mx-auto w-full border-b border-slate-100">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.rolesTitle}
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-[#0f1f4e] uppercase tracking-tight">
              {t.rolesSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rolle 1: Mentees */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/10 rounded-3xl p-6 border border-blue-100 flex flex-col justify-between h-full hover:shadow-xs transition-all">
              <div className="space-y-4">
                <span className="bg-blue-100 text-blue-800 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Mentees</span>
                <h3 className="font-display font-black text-[#0f1f4e] text-base">{t.rolesMenteeTitle}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.rolesMenteeDesc}</p>
              </div>
              <ul className="text-[10px] text-slate-600 font-mono space-y-1.5 pt-4 mt-4 border-t border-blue-100/50 list-inside list-disc">
                <li>{lang === 'zh' ? '在同伴导师指导下在小组内学习' : 'Learn in supportive small peer teams'}</li>
                <li>{lang === 'zh' ? '拼装简易智能设备与控制系统' : 'Assemble smart physical control devices'}</li>
                <li>{lang === 'zh' ? '无需任何基础，快乐解锁空间探究' : 'Unlock tactile coordinate computing'}</li>
              </ul>
            </div>

            {/* Rolle 2: Mentors */}
            <div className="bg-gradient-to-br from-amber-50/35 to-orange-50/10 rounded-3xl p-6 border border-amber-100 flex flex-col justify-between h-full hover:shadow-xs transition-all">
              <div className="space-y-4">
                <span className="bg-amber-100 text-amber-800 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Mentors</span>
                <h3 className="font-display font-black text-[#0f1f4e] text-base">{t.rolesMentorTitle}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.rolesMentorDesc}</p>
              </div>
              <ul className="text-[10px] text-slate-600 font-mono space-y-1.5 pt-4 mt-4 border-t border-amber-100/50 list-inside list-disc">
                <li>{lang === 'zh' ? '接受行业专家组的技术培训与认证' : 'Coached directly by senior IT mentors'}</li>
                <li>{lang === 'zh' ? '备课并领导本街区集会，引领弟弟妹妹' : 'Lead fun local weekly workshops'}</li>
                <li>{lang === 'zh' ? '积累受行业导师背书的志愿者证书' : 'Acquire certified leadership and credits'}</li>
              </ul>
            </div>

            {/* Rolle 3: Experts */}
            <div className="bg-gradient-to-br from-purple-50/35 to-fuchsia-50/10 rounded-3xl p-6 border border-purple-100 flex flex-col justify-between h-full hover:shadow-xs transition-all">
              <div className="space-y-4">
                <span className="bg-purple-100 text-purple-800 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Experts</span>
                <h3 className="font-display font-black text-[#0f1f4e] text-base">{t.rolesExpertTitle}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.rolesExpertDesc}</p>
              </div>
              <ul className="text-[10px] text-slate-600 font-mono space-y-1.5 pt-4 mt-4 border-t border-purple-100/50 list-inside list-disc">
                <li>{lang === 'zh' ? '开设技术分享并提供青年导师代码Review' : 'Review youth labs or host tech talks'}</li>
                <li>{lang === 'zh' ? '为本社区开源硬件探索套件质量把关' : 'Vet standardized hardware kit quality'}</li>
                <li>{lang === 'zh' ? '指导孵化有天赋的少年创客物理项目' : 'Inspire independent young maker builds'}</li>
              </ul>
            </div>

            {/* Rolle 4: Parents & Families */}
            <div className="bg-gradient-to-br from-emerald-50/35 to-teal-50/10 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between h-full hover:shadow-xs transition-all">
              <div className="space-y-4">
                <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Families</span>
                <h3 className="font-display font-black text-[#0f1f4e] text-lg">{t.rolesParentTitle}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{t.rolesParentDesc}</p>
              </div>
              <ul className="text-[10px] text-slate-600 font-mono space-y-1.5 pt-4 mt-4 border-t border-emerald-100/50 list-inside list-disc">
                <li>{lang === 'zh' ? '分享授课微客厅或提供图书室等场所支持' : 'Offer library space or living rooms'}</li>
                <li>{lang === 'zh' ? '协助集会运营、教具签收与社群沟通' : 'Support operations or material flow'}</li>
                <li>{lang === 'zh' ? '获得奉献积分，换取进阶硬件或学费支持' : 'Exchange credits to claim advanced kits'}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Module 6: Call To Action Panel */}
        <section id="cta-actions-panel" className="py-16 px-6 max-w-4xl mx-auto w-full text-center">
          <div className="bg-[#0f1f4e] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '携手共建 · 创新未来' : 'Immediate Neighborhood Network'}</span>
                </div>
                <h2 className="font-display font-black text-2xl md:text-4.5xl text-white uppercase tracking-tight leading-none">
                  {lang === 'zh' ? '欢迎联系我们，了解更多关于 YVIA 的信息' : 'Interested in YVIA? Get in touch with our team'}
                </h2>
              </div>

              {/* Single main button that opens email client directly */}
              <div className="max-w-md mx-auto pt-4">
                <a
                  href="mailto:info@yvia.uk?subject=Message%20to%20YVIA"
                  className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer text-center flex items-center justify-center gap-3 border border-blue-400/25 transform hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  <Mail className="w-5 h-5" />
                  <span>{lang === 'zh' ? '联系YVIA' : 'Contact YVIA'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
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
              Active Peer STEAM Curriculums
            </h2>
          </div>
        </div>

        {/* Course Card Matrix connected to options logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.filter(c => c.approved).length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-display font-extrabold text-xl text-slate-700">No STEAM Syllabus Approved for Display</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                Admins have unapproved all items. Open the " Mesh Admin" panel at the top-right and toggle "Approved" checkmarks under the "Direct SQL Sync" subpanel to reload!
              </p>
            </div>
          ) : (
            courses.filter(c => c.approved).map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onOpenRegistration={handleOpenRegistration} 
                lang={lang}
              />
            ))
          )}
        </div>
      </section>
    )}

    {/* Event List integrated with same approval mechanics */}
    {currentTab === 'events' && (() => {
      const systemEvents = events.filter(e => e.approved && !e.creatorId);
      const peerEvents = events.filter(e => e.approved && e.creatorId);
      
      const registeredCount = currentUserRegistrations.length;
      // Criteria: Participated in at least 1 verified event OR has specialized professional title/profession
      const isEligibleToHost = currentUser && (
        registeredCount >= 1 || 
        (currentUser.professionalTitle && (
          currentUser.professionalTitle.toLowerCase().includes('director') || 
          currentUser.professionalTitle.toLowerCase().includes('lead') || 
          currentUser.professionalTitle.toLowerCase().includes('expert') || 
          currentUser.professionalTitle.toLowerCase().includes('academic') || 
          currentUser.professionalTitle.toLowerCase().includes('systems')
        )) ||
        (currentUser.profession && (
          currentUser.profession.toLowerCase().includes('engineer') || 
          currentUser.profession.toLowerCase().includes('lecturer') || 
          currentUser.profession.toLowerCase().includes('pioneer') ||
          currentUser.profession.toLowerCase().includes('teacher')
        ))
      );

      return (
        <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">

          {/* Form to submit proposals (Eligible users) */}
          {currentUser && isEligibleToHost && isEventFormOpen && (
            <div className="bg-slate-50 border-2 border-dashed border-indigo-200/60 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-indigo-800">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <h4 className="font-display font-bold text-lg">PROPOSE DYNAMIC NETWORK EVENT ELEMENT</h4>
              </div>
              <p className="text-xs text-slate-500 leading-normal font-light">
                As a verified active peer lead, you have permission to seed custom hardware design tasks or learning pods. Proposals will route to YVIA Admin approval queues.
              </p>

              {eventFormError && <div className="text-xs font-mono text-rose-600 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-100">{eventFormError}</div>}
              {eventFormSuccess && <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100">{eventFormSuccess}</div>}

              <form onSubmit={handleInitiateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Event Node Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Autonomous Rotor Micro-Flight Workshop"
                    value={eventFormFields.title}
                    onChange={e => setEventFormFields({ ...eventFormFields, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-505"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Calendar Timestamp *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Saturday June 20 at 14:00 NZST"
                    value={eventFormFields.date}
                    onChange={e => setEventFormFields({ ...eventFormFields, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-100 border-slate-200 rounded-xl outline-none focus:border-indigo-505"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Physical Coordinates / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rototuna Community Center (Block B)"
                    value={eventFormFields.location}
                    onChange={e => setEventFormFields({ ...eventFormFields, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-505"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Target Audience Demographics</label>
                  <input
                    type="text"
                    placeholder="e.g., Ages 10-16 / Prior drone assembly experience helpful"
                    value={eventFormFields.targetAudience}
                    onChange={e => setEventFormFields({ ...eventFormFields, targetAudience: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-505"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Cover Display URL</label>
                  <input
                    type="text"
                    placeholder="Link directly to an image"
                    value={eventFormFields.imagePath}
                    onChange={e => setEventFormFields({ ...eventFormFields, imagePath: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-505 font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Cooperative Node Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain key innovation targets, physical deliverables, and learning outcomes..."
                    value={eventFormFields.description}
                    onChange={e => setEventFormFields({ ...eventFormFields, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-505 resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEventFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Compile & Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 1. SYSTEM-PUBLISHED EVENTS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 animate-pulse"></div>
              <h4 className="font-display font-extrabold text-base text-[#0f1f4e] uppercase tracking-tight">System Verified Channels</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {systemEvents.length === 0 ? (
                <div className="border border-dashed border-slate-200 text-center rounded-3xl py-12 bg-slate-50 text-xs text-slate-400 font-mono">
                  No verified system channels loaded.
                </div>
              ) : (
                systemEvents.map((evt) => (
                  <EventCard 
                    key={evt.id} 
                    evt={evt} 
                    currentUser={currentUser}
                    userRegistrations={currentUserRegistrations}
                    onRegister={handleRegisterEvent}
                    lang={lang}
                  />
                ))
              )}
            </div>
          </div>

          {/* TRANSITION DIVIDER */}
          {peerEvents.length > 0 && (
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-dashed border-indigo-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#F8FAFF] px-4 font-mono text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 border border-indigo-150 rounded-full py-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Autonomous Peer Mesh Contributions</span>
                </span>
              </div>
            </div>
          )}

          {/* 2. PEER-INITIATED EVENTS SECTION */}
          {peerEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-purple-150 animate-bounce"></div>
                <h4 className="font-display font-extrabold text-base text-[#0f1f4e] uppercase tracking-tight">Grid-Initiated Autonomous Events</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {peerEvents.map((evt) => (
                  <EventCard 
                    key={evt.id} 
                    evt={evt} 
                    currentUser={currentUser}
                    userRegistrations={currentUserRegistrations}
                    onRegister={handleRegisterEvent}
                    lang={lang}
                  />
                ))}
              </div>
            </div> 
          )}
        </section>
      );
    })()}



    {/* ========================================================
        OUR VISION (About Page Tab Content)
        ======================================================== */}
    {currentTab === 'about' && (
      <div className="space-y-12 py-8 px-6 max-w-7xl mx-auto w-full">
        <section id="vision" className="max-w-4xl mx-auto w-full">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-widest block">[ Decentralized Futures ]</span>
              <h3 className="font-display font-black text-3xl md:text-5.5xl text-white uppercase tracking-tight leading-none">
                Our Vision
              </h3>
              <p className="text-sm md:text-base text-blue-100 leading-relaxed font-light">
                Leveraging over 10 years of experience within global innovation ecosystems—including STEAM education initiatives, international robotics leagues, and grassroots technical networks—YVIA is more than a standard curriculum provider.
              </p>
              <p className="text-sm md:text-base text-blue-100 leading-relaxed font-light">
                We aim to serve as a resource hub and a critical catalyst for community-driven innovation, equipping the next generation with the internal computational intuition and self-reliance to navigate an exponentially complex technology landscape.
              </p>
            </div>
          </div>
        </section>

        {/* Community Map Integration
        <AboutUsPage submissions={submissions} /> */}
      </div>
    )}


  </main>

      {/* ========================================================
          STANDARD PUBLIC FOOTER
          ======================================================== */}
      <footer className="bg-[#0f172a] text-slate-500 py-12 px-6 border-t border-slate-900 select-none text-xs font-mono font-medium">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Compiled Download Hub Section (Admin Diagnostics Mode ONLY) */}
          {isAdminAuthenticated && (
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="text-slate-200 font-bold text-sm tracking-tight flex items-center justify-center md:justify-start gap-2 uppercase">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Compiled Production Build Download Hub (dist)
                </h4>
                <p className="text-[11px] text-slate-400 font-sans max-w-xl leading-relaxed">
                  Directly retrieve the freshly built static application files via your browser! Save them locally to form your completed dist bundle: place <code>index.html</code> in the root and both JS/CSS inside an <code>assets/</code> subfolder.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a 
                  href="/compiled_build/index.html" 
                  download="index.html"
                  className="bg-[#2563eb] hover:bg-blue-600 text-white font-sans font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider text-[11px] leading-none flex items-center gap-2 border border-blue-400/20 cursor-pointer"
                >
                  <span>Download index.html</span>
                </a>
                <a 
                  href="/compiled_build/assets/index.js" 
                  download="index.js"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider text-[11px] leading-none flex items-center gap-2 border border-white/5 cursor-pointer"
                >
                  <span>Download index.js</span>
                </a>
                <a 
                  href="/compiled_build/assets/index.css" 
                  download="index.css"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider text-[11px] leading-none flex items-center gap-2 border border-white/5 cursor-pointer"
                >
                  <span>Download index.css</span>
                </a>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-900/60">
            <div className="text-center md:text-left space-y-1">
              <p>&copy; 2026 Youth Volunteer Innovation Academy (YVIA). All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>



      {/* =========================================================================================
          MODULE 4: USER GATEWAY / DECENTRALIZED SIGN IN LIGHTBOX
          ========================================================================================= */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-sm w-full relative z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#0f1f4e] to-[#1a3580] p-5 text-white flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                    <LogIn className="w-3 h-3" />
                    <span>Member Core Ingress</span>
                  </div>
                  <h3 className="font-display font-bold text-base uppercase tracking-tight">Access Your YVIA Profile</h3>
                </div>
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUserLogin} className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-[#0f1f4e] leading-normal font-light">
                  <strong>First login?</strong> Your username is your email, and your default password is the characters before the &apos;@&apos; symbol in your email.
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Username / Email</label>
                  <input 
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. alistair@work.org"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Password</label>
                  <input 
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none font-sans"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-[11px] font-mono font-bold text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                    ⚠️ {loginError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsLoginOpen(false)}
                    className="px-3.5 py-1.5 text-slate-500 text-xs font-bold uppercase hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.5 bg-[#0f1f4e] hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Authenticate Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================================
          MODULE 5: SECURE USER PROFILE PROFILE & PASSWORD ADJUSTMENT
          ========================================================================================= */}
      <AnimatePresence>
        {isPortalOpen && currentUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPortalOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-xl w-full relative z-10 overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div className="bg-gradient-to-r from-emerald-900 to-[#0f1f4e] p-5 text-white flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                    <User className="w-3 h-3" />
                    <span>Secure Hub • {currentUser.email}</span>
                  </div>
                  <h3 className="font-display font-bold text-base uppercase tracking-tight">Grid Member Portal</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleLogout}
                    className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/35 hover:border-rose-400 text-rose-100 hover:text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                  <button 
                    onClick={() => setIsPortalOpen(false)}
                    className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Secure Sub-navigation Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 bg-[#f8fafc] shrink-0 text-[10px] font-bold font-mono">
                <button
                  type="button"
                  onClick={() => setPortalActiveTab('profile')}
                  className={`py-2.5 text-center border-b-2 transition-all ${
                    portalActiveTab === 'profile' 
                      ? 'border-emerald-600 text-emerald-950 bg-white shadow-sm' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  ⚙️ PROFILE
                </button>
                <button
                  type="button"
                  onClick={() => setPortalActiveTab('registrations')}
                  className={`py-2.5 text-center border-b-2 transition-all ${
                    portalActiveTab === 'registrations' 
                      ? 'border-emerald-600 text-emerald-950 bg-white shadow-sm' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  📅 ENROLLMENTS
                </button>
                <button
                  type="button"
                  onClick={() => setPortalActiveTab('proposed')}
                  className={`py-2.5 text-center border-b-2 transition-all ${
                    portalActiveTab === 'proposed' 
                      ? 'border-indigo-600 text-indigo-950 bg-white shadow-sm' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  💡 PROPOSALS
                </button>
                <button
                  type="button"
                  onClick={() => setPortalActiveTab('inbox')}
                  className={`py-2.5 text-center border-b-2 transition-all ${
                    portalActiveTab === 'inbox' 
                      ? 'border-blue-600 text-blue-950 bg-white shadow-sm' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  📬 INBOX
                </button>
              </div>

              {portalActiveTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4">
                  {portalSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{portalSuccessMsg}</span>
                    </div>
                  )}

                  {/* 1. Identity Grid (Blocked Email change) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={portalFields.fullName}
                        onChange={e => setPortalFields({ ...portalFields, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none font-sans"
                      />
                      {portalErrors.fullName && <p className="text-[10px] font-mono font-bold text-rose-500">{portalErrors.fullName}</p>}
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase flex justify-between items-center">
                        <span>Unique ID (Email)</span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded uppercase">Immutable</span>
                      </label>
                      <input 
                        type="text" 
                        value={currentUser.email}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed text-xs p-3 rounded-xl outline-none font-sans"
                        title="Username/Email cannot be changed once vector index is saved."
                      />
                    </div>
                  </div>

                  {/* 2. Credentials (Secure Password modification) */}
                  <div className="bg-amber-500/5 border border-amber-300/20 rounded-xl p-3.5 space-y-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-mono font-bold text-amber-800 uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Security Password Credentials</span>
                      </h4>
                      <p className="text-[10px] text-amber-700 font-light leading-normal">
                        Customize your authentication password below. Username is set to your email.
                      </p>
                    </div>
                    <input 
                      type="text" 
                      value={portalPassword}
                      onChange={e => setPortalPassword(e.target.value)}
                      placeholder="Enter your customized strong password"
                      className="w-full bg-white border border-amber-300/40 focus:border-amber-500 text-xs p-2.5 rounded-lg transition-all outline-none font-mono"
                    />
                    {portalErrors.password && <p className="text-[10px] font-mono font-bold text-rose-500">{portalErrors.password}</p>}
                  </div>

                  {/* 3. Local Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">Country</label>
                      <select 
                        value={portalFields.country}
                        onChange={e => setPortalFields({ ...portalFields, country: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none h-11"
                      >
                        {countriesList.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">City</label>
                      <input 
                        type="text" 
                        value={portalFields.city}
                        onChange={e => setPortalFields({ ...portalFields, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 col-span-full">
                    <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">Neighborhood Mesh Address</label>
                    <input 
                      type="text" 
                      value={portalFields.neighborhood}
                      onChange={e => setPortalFields({ ...portalFields, neighborhood: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none font-sans"
                    />
                    {portalErrors.neighborhood && <p className="text-[10px] font-mono font-bold text-rose-500">{portalErrors.neighborhood}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">Profession</label>
                      <input 
                        type="text" 
                        value={portalFields.profession}
                        onChange={e => setPortalFields({ ...portalFields, profession: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none"
                      />
                      {portalErrors.profession && <p className="text-[10px] font-mono font-bold text-rose-500">{portalErrors.profession}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-700 block uppercase">Academic Title</label>
                      <input 
                        type="text" 
                        value={portalFields.professionalTitle}
                        onChange={e => setPortalFields({ ...portalFields, professionalTitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Interactive Track/Surplus Toggles for modifications */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700 uppercase block">Modify Desire Tracks</span>
                      <div className="flex flex-wrap gap-1.5">
                        {desiresOptions.map((opt, i) => {
                          const active = portalDesires.includes(opt.flag);
                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                if (active) setPortalDesires(portalDesires.filter(d => d !== opt.flag));
                                else setPortalDesires([...portalDesires, opt.flag]);
                              }}
                              className={`px-2.5 py-1 border rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                                active ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {opt.flag.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsPortalOpen(false)}
                      className="px-3.5 py-1.5 text-slate-500 text-xs font-bold uppercase hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                    <button 
                      type="submit"
                      className="px-4.5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {portalActiveTab === 'registrations' && (() => {
                const registeredEventsList = events.filter(e => currentUserRegistrations.includes(e.id));
                return (
                  <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#0f1f4e] font-bold uppercase font-mono mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>My Registered Event Enrollments ({registeredEventsList.length})</span>
                    </div>
                    <div className="space-y-4">
                      {registeredEventsList.length === 0 ? (
                        <div className="border border-dashed border-slate-200 text-center rounded-2xl py-8 bg-slate-50 text-xs text-slate-400 font-mono">
                          You have not registered for any upcoming events. Go to Events to sign up!
                        </div>
                      ) : (
                        registeredEventsList.map(evt => (
                          <div key={evt.id} className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl flex justify-between items-center gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-display font-semibold text-xs text-[#0f1f4e] truncate uppercase">{evt.title}</h4>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{evt.date}</span>
                              </p>
                            </div>
                            <span className="bg-emerald-600 text-white font-mono font-bold text-[9px] px-2.5 py-1 rounded-full uppercase shrink-0">ENROLLED</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {portalActiveTab === 'proposed' && (() => {
                const myInitiatedEvents = events.filter(e => e.creatorId === currentUser.id);
                return (
                  <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#0f1f4e] font-bold uppercase font-mono mb-2">
                      <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>My Proposed Event Nodes ({myInitiatedEvents.length})</span>
                    </div>
                    <div className="space-y-4">
                      {myInitiatedEvents.length === 0 ? (
                        <div className="border border-dashed border-slate-200 text-center rounded-2xl py-8 bg-slate-50 text-xs text-slate-400 font-mono">
                          You have not initiated any event proposals yet.
                        </div>
                      ) : (
                        myInitiatedEvents.map(evt => {
                          const statusStyles = 
                            evt.approved 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : evt.status === 'past' 
                                ? 'bg-rose-500 text-white border-rose-500' 
                                : 'bg-amber-500 text-slate-900 border-amber-300';
                          const statusLabel = 
                            evt.approved 
                              ? 'Verified & Live' 
                              : evt.status === 'past' 
                                ? 'Rejected' 
                                : 'Awaiting Approval';

                          return (
                            <div key={evt.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-0.5 min-w-0">
                                  <h5 className="font-display font-semibold text-xs text-slate-800 truncate uppercase">{evt.title}</h5>
                                  <p className="text-[10px] text-slate-400 font-mono">{evt.date}</p>
                                </div>
                                <span className={`font-mono font-bold text-[8px] px-2 py-0.5 rounded-md uppercase border shrink-0 ${statusStyles}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-relaxed font-sans font-light bg-white border border-slate-100 p-2 rounded-xl">
                                {evt.description}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}

              {portalActiveTab === 'inbox' && (
                <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#0f1f4e] font-bold uppercase font-mono mb-2">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>My Grid Inbox & Logs</span>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-indigo-100/80 rounded-2xl p-4 bg-indigo-50/20 space-y-1">
                      <span className="font-mono text-[9px] text-indigo-500 font-bold block">SYSTEM NOTIFICATION • DEPLOYMENT BROADCAST</span>
                      <strong className="text-slate-800 block text-xs uppercase font-display">Sandbox Cloudflare D1 Active Vector</strong>
                      <p className="text-[11px] text-slate-500 font-sans font-light leading-normal">
                        Welcome to your YVIA secure member hub! Your profile registries, course catalogs, and event credentials are synchronized safely across real SQLite database tables. Change your password, register for courses, or host localized learning nodes anytime!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


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
                    <span>Step {formStep} of 3 • Vector Profiling Node</span>
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
                  style={{ width: `${(formStep / 3) * 100}%` }}
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
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-light font-sans">Already signed up on the Grid?</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setIsLoginOpen(true);
                          }}
                          className="text-[#2563eb] hover:underline font-extrabold cursor-pointer outline-none transition-all"
                        >
                          Sign In
                        </button>
                      </div>

                      <button 
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-[#0f1f4e] text-white hover:bg-blue-700 transition-all font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
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
                      <div className="font-mono text-[10px] text-amber-600 font-bold uppercase tracking-widest block">[ Track Q1 • Participation Matrix ]</div>
                      <h4 className="font-display font-semibold text-[#0f1f4e] text-lg uppercase leading-tight">
                        {lang === 'zh' ? "请选择您感兴趣的社区参与路径" : "Select Your Desired Participation Track(s)"}
                      </h4>
                      <p className="text-xs text-slate-400 font-light font-sans font-semibold">
                        {lang === 'zh' ? "支持多选。系统将据此为您匹配并在个人中心建立相应的共建网格节点：" : "Multiple choices allowed. Our system will map your custom roles within our mutual cooperative mesh:"}
                      </p>
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

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="font-mono text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">[ Track Q2 - Contribution Signals ]</div>
                        <p className="text-xs text-slate-400 font-light font-sans font-semibold">
                          Select practical ways you can support the YVIA local learning network.
                        </p>
                      </div>
                      {surplusOptions.map((opt, i) => {
                        const active = selectedSurplus.includes(opt.flag);
                        return (
                          <div 
                            key={i}
                            onClick={() => handleToggleSurplus(opt.flag)}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                              active 
                                ? 'bg-emerald-50/60 border-emerald-600 shadow-sm' 
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-slate-50'
                            }`}>
                              {active && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-mono font-bold text-slate-700 block uppercase">
                                {opt.flag.replace('Outputs_', '').replace('_', ' ')}
                              </span>
                              <p className="text-[12.5px] font-sans text-slate-600 leading-normal font-light">
                                {opt.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CAPTCHA Security Verification block */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <label className="text-xs font-mono font-bold text-slate-700 block uppercase">
                        �️ CAPTCHA Security Check (Required)
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-950 to-slate-950 text-amber-300 font-mono font-bold text-lg px-4 py-2 rounded-lg select-none tracking-widest border border-indigo-700/50 shadow-inner flex items-center justify-between gap-3 min-w-[130px]">
                          <span className="italic line-through decoration-amber-500/50">{captchaChallenge}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCaptchaChallenge(generateCaptcha());
                              setUserCaptchaInput('');
                              setCaptchaError('');
                            }} 
                            className="bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white p-1 rounded transition-colors text-xs"
                            title="Generate New CAPTCHA Code"
                          >
                            �
                          </button>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text"
                            value={userCaptchaInput}
                            onChange={e => {
                              setUserCaptchaInput(e.target.value);
                              setCaptchaError('');
                            }}
                            placeholder="Enter the 4-char security CAPTCHA..."
                            className="w-full bg-white border border-slate-300 hover:border-[#2563eb]/45 focus:border-[#2563eb] font-sans text-xs p-3 rounded-xl transition-all outline-none"
                          />
                        </div>
                      </div>
                      {captchaError && <p className="text-[11px] font-mono font-bold text-rose-500 mt-1">{captchaError}</p>}
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
                        onClick={handleFinalSubmit}
                        className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-98 transition-all font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                      >
                        Submit <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: ECOSYSTEM IDENTITY INTEGRATION & AUTOMATED WORKFLOW OVERVIEW (Module 3 Result Page) ─── */}
                {formStep === 3 && lastSubmission && (() => {
                  const vector = computeVectorIdentity(lastSubmission);
                  return (
                    <div className="space-y-6 text-center py-4">
                      
                      {/* Visual Celebratory Animation Header */}
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/10 animate-scaleUp">
                        <Check className="w-8 h-8 stroke-[4]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-black text-2xl text-[#0f1f4e] uppercase tracking-tight">
                          Calculations!
                        </h4>
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
                          Close
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
                    <h3 className="font-display font-medium text-sm tracking-tight text-white uppercase">YVIA Cloud Control Hub</h3>
                    <p className="text-[10px] font-mono text-slate-300 mt-0.5">Admin Security Verification Required</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdminAuthenticated && (
                    <button 
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        sessionStorage.removeItem('yvia_admin_auth');
                      }}
                      className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-500/20 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                      title="Lock the console"
                    >
                      Lock Console
                    </button>
                  )}
                  <button 
                    onClick={() => setIsAdminOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!isAdminAuthenticated ? (
                /* Admin Security Lock Screen Form */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAdminAuthError('');
                    const usernameLower = adminUsername.trim().toLowerCase();
                    if (usernameLower === 'yvia_admin_2026' && adminPassword === 'yvia_admin_2026') {
                      setIsAdminAuthenticated(true);
                      sessionStorage.setItem('yvia_admin_auth', 'true');
                      setAdminUsername('');
                      setAdminPassword('');
                    } else {
                      setAdminAuthError('Invalid administrator credentials.');
                    }
                  }} 
                  className="p-6 flex-1 flex flex-col justify-center space-y-4 max-w-xs mx-auto w-full"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-2">
                      <Lock className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="font-display font-bold text-white text-md uppercase tracking-tight">Protected Area</h4>
                    <p className="text-xs text-slate-400 font-light leading-normal">Authenticate using secure administrator credentials to enter the control hub.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Admin ID (Username)</label>
                    <input 
                      type="text"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="e.g. #Identifier202"
                      className="w-full bg-[#1e293b]/50 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-amber-500 hover:border-slate-700 text-xs p-3 rounded-xl transition-all outline-none font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Security Passphrase</label>
                    <input 
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1e293b]/50 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-amber-500 hover:border-slate-700 text-xs p-3 rounded-xl transition-all outline-none font-mono"
                      required
                    />
                  </div>

                  {adminAuthError && (
                    <p className="text-xs font-mono font-bold text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-xl">
                      ❌ {adminAuthError}
                    </p>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/15 cursor-pointer mt-2"
                  >
                    Authenticate Security Gate
                  </button>
                </form>
              ) : (
                <>
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
                                onChange={() => handleToggleCourseApprove(course.id)}
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
                                onChange={() => handleToggleEventApprove(evt.id)}
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
                Syncing Hamilton Node B 
              </div>
            </>
          )}

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
    setSelectedSurplus([]);
    setErrors({});
    setLastSubmission(null);
  }
}
