require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "learnhub-super-secret-key-2026";

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// ==========================================
// In-Memory Database Store (Resilient Fallback)
// Ensures 100% uptime even if MongoDB Atlas credentials are not yet entered
// ==========================================
let isUsingMemoryStore = false;

const memoryStore = {
  users: [],
  courses: [],
  lessons: [],
  enrollments: [],
  quizzes: [],
  certificates: [],
  payments: []
};

// Mongoose Schemas & Models (for real MongoDB)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  avatar: { type: String, default: "" },
  title: { type: String, default: "Learner" },
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "Development" },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "All Levels"], default: "Beginner" },
  price: { type: Number, default: 0 },
  thumbnail: { type: String, default: "" },
  rating: { type: Number, default: 4.8 },
  students: { type: Number, default: 0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  instructorName: { type: String, default: "LearnHub Instructor" },
  outcomes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  duration: { type: String, default: "15 min" },
  order: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  resources: [{ title: String, url: String }],
  createdAt: { type: Date, default: Date.now }
});

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  progress: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  lastLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  enrolledAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  passingScore: { type: Number, default: 70 },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: "" }
  }],
  createdAt: { type: Date, default: Date.now }
});

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  studentName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  certificateId: { type: String, unique: true, required: true },
  grade: { type: String, default: "Honors" },
  issuedAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, default: 0 },
  status: { type: String, default: "paid" },
  paymentMethod: { type: String, default: "Credit Card" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);
const Lesson = mongoose.model("Lesson", lessonSchema);
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const Certificate = mongoose.model("Certificate", certificateSchema);
const Payment = mongoose.model("Payment", paymentSchema);

// ==========================================
// Seed Data Function
// ==========================================
async function seedInitialData() {
  const hash = await bcrypt.hash("LearnHub@123", 10);

  const initialUsers = [
    {
      _id: "u_admin",
      name: "LearnHub Admin",
      email: "admin@learnhub.com",
      password: hash,
      role: "admin",
      title: "System Administrator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Oversees LearnHub learning platform operations."
    },
    {
      _id: "u_teacher",
      name: "Dr. Sarah Jenkins",
      email: "teacher@learnhub.com",
      password: hash,
      role: "teacher",
      title: "Senior Full-Stack Architect & Educator",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "12+ years building web applications and mentoring 50,000+ engineers worldwide."
    },
    {
      _id: "u_student",
      name: "Alex Rivera",
      email: "student@learnhub.com",
      password: hash,
      role: "student",
      title: "Full-Stack Web Enthusiast",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      bio: "Lifelong learner passionate about React, Node.js and Modern Web Development."
    }
  ];

  const initialCourses = [
    {
      _id: "c_mern",
      title: "Full-Stack Web Development with MERN",
      description: "Master MongoDB, Express, React, and Node.js from scratch. Build and deploy production-ready full-stack applications with modern authentication and clean architecture.",
      category: "Development",
      level: "Intermediate",
      price: 49,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
      rating: 4.9,
      students: 1420,
      instructor: "u_teacher",
      instructorName: "Dr. Sarah Jenkins",
      outcomes: [
        "Build full-stack MERN web applications from scratch",
        "Design scalable RESTful APIs with Node.js and Express",
        "Master state management, hooks, and responsive UI in React",
        "Deploy database-backed apps with JWT authentication and security"
      ]
    },
    {
      _id: "c_python",
      title: "Python for AI & Machine Learning Masterclass",
      description: "From Python fundamentals to deep learning algorithms. Work with NumPy, Pandas, Scikit-Learn, and build real-world AI predictive models.",
      category: "Data Science",
      level: "Beginner",
      price: 59,
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      rating: 4.8,
      students: 2150,
      instructor: "u_teacher",
      instructorName: "Dr. Sarah Jenkins",
      outcomes: [
        "Write clean, idiomatic Python code for data analysis",
        "Manipulate complex datasets using Pandas and NumPy",
        "Train classification, regression, and clustering ML models",
        "Evaluate machine learning pipelines with real-world metrics"
      ]
    },
    {
      _id: "c_design",
      title: "UI/UX Design Systems & Figma Prototyping",
      description: "Learn user research, wireframing, high-fidelity UI design, and interactive design systems in Figma that engineering teams love.",
      category: "Design",
      level: "All Levels",
      price: 39,
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      rating: 4.9,
      students: 980,
      instructor: "u_teacher",
      instructorName: "Dr. Sarah Jenkins",
      outcomes: [
        "Create scalable Figma components, autolayouts, and design tokens",
        "Conduct actionable UX user interviews and empathy mapping",
        "Build interactive clickable prototypes with micro-interactions",
        "Prepare design specifications ready for developer handoff"
      ]
    },
    {
      _id: "c_cloud",
      title: "Cloud DevOps, Docker & Kubernetes Bootcamp",
      description: "Containerize applications, orchestrate microservices, configure CI/CD pipelines, and deploy on modern cloud platforms with confidence.",
      category: "DevOps",
      level: "Advanced",
      price: 69,
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
      rating: 4.7,
      students: 840,
      instructor: "u_teacher",
      instructorName: "Dr. Sarah Jenkins",
      outcomes: [
        "Containerize full-stack apps with multi-stage Docker builds",
        "Deploy and scale microservices with Kubernetes Pods & Services",
        "Set up automated CI/CD workflows with GitHub Actions",
        "Implement production logging, metrics, and security hardening"
      ]
    }
  ];

  const initialLessons = [
    // Course 1 Lessons
    {
      _id: "l_mern_1",
      course: "c_mern",
      title: "1. Introduction to the MERN Architecture",
      description: "Overview of how MongoDB, Express, React, and Node.js connect seamlessly.",
      videoUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
      duration: "14 min",
      order: 1,
      notes: "The MERN stack is a popular JavaScript stack that facilitates building scalable full-stack applications with JSON data passing naturally between all layers.",
      resources: [{ title: "MERN Architecture Diagram", url: "#" }]
    },
    {
      _id: "l_mern_2",
      course: "c_mern",
      title: "2. Building RESTful APIs with Express & Mongoose",
      description: "Creating router endpoints, handling request validations, and querying MongoDB.",
      videoUrl: "https://www.youtube.com/embed/SccSCuHhOw0",
      duration: "22 min",
      order: 2,
      notes: "Understand middleware pipelines, async route handlers, error wrappers, and schema validations.",
      resources: [{ title: "Express Route Cheatsheet", url: "#" }]
    },
    {
      _id: "l_mern_3",
      course: "c_mern",
      title: "3. React Component Design & Modern Hooks",
      description: "State management with useState, useEffect, custom hooks, and component composition.",
      videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
      duration: "28 min",
      order: 3,
      notes: "Component-driven design enables modular, reusable UI pieces that scale cleanly across large codebases.",
      resources: [{ title: "React Hooks Guide", url: "#" }]
    },
    {
      _id: "l_mern_4",
      course: "c_mern",
      title: "4. Secure Authentication with JWT & Bcrypt",
      description: "Hashing passwords, generating signed JWT tokens, and protecting API endpoints.",
      videoUrl: "https://www.youtube.com/embed/mbsmsi7l3r4",
      duration: "25 min",
      order: 4,
      notes: "Never store plaintext passwords. Use bcrypt with salt rounds >= 10, and send tokens in Bearer headers.",
      resources: [{ title: "JWT Auth Checklist", url: "#" }]
    },
    // Course 2 Lessons
    {
      _id: "l_py_1",
      course: "c_python",
      title: "1. Python Foundations & Virtual Environments",
      description: "Setting up Python, virtual environments, data structures, and list comprehensions.",
      videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      duration: "18 min",
      order: 1,
      notes: "Learn Python basic syntax, types, slicing, and memory management.",
      resources: []
    },
    {
      _id: "l_py_2",
      course: "c_python",
      title: "2. Data Analysis with NumPy & Pandas DataFrames",
      description: "Vectorized operations, data cleaning, filtering, and grouping datasets.",
      videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
      duration: "30 min",
      order: 2,
      notes: "Pandas DataFrames provide high-performance tabular data manipulation.",
      resources: []
    },
    // Course 3 Lessons
    {
      _id: "l_des_1",
      course: "c_design",
      title: "1. Design Thinking & User Research Methods",
      description: "Empathy maps, user personas, problem statements, and customer journey mapping.",
      videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
      duration: "16 min",
      order: 1,
      notes: "Great software starts with understanding user pain points before writing a single line of code.",
      resources: []
    }
  ];

  const initialQuizzes = [
    {
      _id: "q_mern_1",
      course: "c_mern",
      title: "MERN Architecture & API Assessment",
      passingScore: 70,
      questions: [
        {
          question: "What does the 'E' in MERN stand for?",
          options: ["Ember.js", "Express.js", "Electron", "Elasticsearch"],
          correctIndex: 1,
          explanation: "The 'E' in MERN stands for Express.js, the minimalist web framework for Node.js."
        },
        {
          question: "Where should sensitive database credentials be kept in a Node.js project?",
          options: ["In public Git repositories", "In package.json", "In environment variables (.env)", "Inside client HTML"],
          correctIndex: 2,
          explanation: "Sensitive credentials such as database passwords and API keys must always be stored in environment variables."
        },
        {
          question: "Which hook is used in React to manage component side effects like data fetching?",
          options: ["useState", "useMemo", "useEffect", "useCallback"],
          correctIndex: 2,
          explanation: "useEffect is specifically designed for side effects, network subscriptions, and DOM updates."
        },
        {
          question: "What standard is recommended for securing REST APIs with stateless tokens?",
          options: ["JSON Web Tokens (JWT)", "Plain Cookies", "Basic Auth over HTTP", "URL Parameters"],
          correctIndex: 0,
          explanation: "JWT provides digitally signed, tamper-evident tokens suitable for stateless authentication."
        }
      ]
    },
    {
      _id: "q_py_1",
      course: "c_python",
      title: "Python & Machine Learning Foundations",
      passingScore: 70,
      questions: [
        {
          question: "Which Python library is primary for fast n-dimensional array mathematics?",
          options: ["Flask", "NumPy", "Django", "BeautifulSoup"],
          correctIndex: 1,
          explanation: "NumPy provides high-performance multidimensional arrays and math routines."
        },
        {
          question: "What type of machine learning predicts continuous numeric quantities?",
          options: ["Classification", "Regression", "Clustering", "Reinforcement"],
          correctIndex: 1,
          explanation: "Regression predicts continuous numbers (e.g. house prices, temperatures)."
        }
      ]
    }
  ];

  const initialEnrollments = [
    {
      _id: "e_student_mern",
      student: "u_student",
      course: "c_mern",
      progress: 50,
      completedLessons: ["l_mern_1", "l_mern_2"],
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  const initialCertificates = [
    {
      _id: "cert_sample",
      student: "u_student",
      course: "c_design",
      studentName: "Alex Rivera",
      courseTitle: "UI/UX Design Systems & Figma Prototyping",
      certificateId: "LH-2026-DES-9812",
      grade: "High Distinction",
      issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  if (isUsingMemoryStore) {
    memoryStore.users = initialUsers;
    memoryStore.courses = initialCourses;
    memoryStore.lessons = initialLessons;
    memoryStore.quizzes = initialQuizzes;
    memoryStore.enrollments = initialEnrollments;
    memoryStore.certificates = initialCertificates;
    memoryStore.payments = [
      { _id: "pay_1", student: "u_student", course: "c_mern", amount: 49, status: "paid", createdAt: new Date() }
    ];
  } else {
    // Seed in real MongoDB
    for (const u of initialUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
      }
    }
    const countCourses = await Course.countDocuments();
    if (countCourses === 0) {
      const teacher = await User.findOne({ email: "teacher@learnhub.com" });
      const teacherId = teacher ? teacher._id : null;

      for (const c of initialCourses) {
        const { _id, ...rest } = c;
        const createdCourse = await Course.create({ ...rest, instructor: teacherId });
        
        // Add lessons for this course
        const lessonsForCourse = initialLessons.filter(l => l.course === _id);
        for (const l of lessonsForCourse) {
          const { _id: lId, course, ...lRest } = l;
          await Lesson.create({ ...lRest, course: createdCourse._id });
        }

        // Add quiz for this course
        const quizForCourse = initialQuizzes.find(q => q.course === _id);
        if (quizForCourse) {
          const { _id: qId, course, ...qRest } = quizForCourse;
          await Quiz.create({ ...qRest, course: createdCourse._id });
        }
      }
    }
  }
  console.log(">> Seed data initialized successfully.");
}

// ==========================================
// Authentication Helpers & Middleware
// ==========================================
const generateToken = (user) => {
  return jwt.sign(
    { id: String(user._id), role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "7d" }
  );
};

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const decoded = jwt.verify(token, SECRET);

    if (isUsingMemoryStore) {
      const user = memoryStore.users.find(u => String(u._id) === String(decoded.id));
      if (!user) return res.status(401).json({ message: "User not found" });
      const { password, ...safeUser } = user;
      req.user = safeUser;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(", ")}` });
  }
  next();
};

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    storage: isUsingMemoryStore ? "In-Memory Engine (Resilient Mode)" : "MongoDB Atlas / Database",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

// 1. Auth: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "student", title, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isUsingMemoryStore) {
      const exists = memoryStore.users.find(u => u.email === normalizedEmail);
      if (exists) return res.status(409).json({ message: "An account with this email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: "u_" + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: ["teacher", "admin"].includes(role) ? role : "student",
        title: title || (role === "teacher" ? "Instructor" : "Student"),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        bio: bio || "",
        createdAt: new Date()
      };
      memoryStore.users.push(newUser);
      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({
        message: "Registration successful",
        token: generateToken(newUser),
        user: safeUser
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: ["teacher", "admin"].includes(role) ? role : "student",
      title: title || "Learner",
      bio: bio || ""
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isUsingMemoryStore) {
      const user = memoryStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const { password: _, ...safeUser } = user;
      return res.json({
        token: generateToken(user),
        user: safeUser
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      token: generateToken(user),
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Auth: Quick Demo Login (Student, Teacher, or Admin)
app.post("/api/auth/demo", async (req, res) => {
  const { role = "student" } = req.body;
  const demoEmailMap = {
    student: "student@learnhub.com",
    teacher: "teacher@learnhub.com",
    admin: "admin@learnhub.com"
  };
  const targetEmail = demoEmailMap[role] || "student@learnhub.com";

  if (isUsingMemoryStore) {
    const user = memoryStore.users.find(u => u.email === targetEmail);
    if (!user) return res.status(404).json({ message: "Demo user not found" });
    const { password: _, ...safeUser } = user;
    return res.json({
      token: generateToken(user),
      user: safeUser
    });
  }

  const user = await User.findOne({ email: targetEmail });
  if (!user) return res.status(404).json({ message: "Demo user not found" });

  const safeUser = user.toObject();
  delete safeUser.password;

  res.json({
    token: generateToken(user),
    user: safeUser
  });
});

// 4. Users: Current User Profile
app.get("/api/users/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

app.put("/api/users/me", authenticate, async (req, res) => {
  try {
    const { name, title, bio, avatar } = req.body;

    if (isUsingMemoryStore) {
      const idx = memoryStore.users.findIndex(u => String(u._id) === String(req.user._id));
      if (idx === -1) return res.status(404).json({ message: "User not found" });
      if (name) memoryStore.users[idx].name = name;
      if (title !== undefined) memoryStore.users[idx].title = title;
      if (bio !== undefined) memoryStore.users[idx].bio = bio;
      if (avatar !== undefined) memoryStore.users[idx].avatar = avatar;

      const { password: _, ...updated } = memoryStore.users[idx];
      return res.json({ user: updated });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, title, bio, avatar } },
      { new: true }
    ).select("-password");

    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Courses: List all courses (with filtering & search)
app.get("/api/courses", async (req, res) => {
  try {
    const { search = "", category = "All", level = "All", price = "All", sort = "popular" } = req.query;

    if (isUsingMemoryStore) {
      let result = [...memoryStore.courses];

      if (category && category !== "All") {
        result = result.filter(c => c.category.toLowerCase() === category.toLowerCase());
      }
      if (level && level !== "All") {
        result = result.filter(c => c.level.toLowerCase() === level.toLowerCase());
      }
      if (price === "free") {
        result = result.filter(c => c.price === 0);
      } else if (price === "paid") {
        result = result.filter(c => c.price > 0);
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.instructorName && c.instructorName.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
        );
      }

      // Attach lessons count and lessons
      const enriched = result.map(c => {
        const lessons = memoryStore.lessons.filter(l => String(l.course) === String(c._id));
        return {
          ...c,
          lessons,
          lessonCount: lessons.length
        };
      });

      if (sort === "rating") enriched.sort((a, b) => b.rating - a.rating);
      else if (sort === "price-low") enriched.sort((a, b) => a.price - b.price);
      else if (sort === "price-high") enriched.sort((a, b) => b.price - a.price);
      else enriched.sort((a, b) => (b.students || 0) - (a.students || 0));

      return res.json(enriched);
    }

    const query = {};
    if (category && category !== "All") query.category = category;
    if (level && level !== "All") query.level = level;
    if (price === "free") query.price = 0;
    else if (price === "paid") query.price = { $gt: 0 };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    let sortOptions = { students: -1 };
    if (sort === "rating") sortOptions = { rating: -1 };
    if (sort === "price-low") sortOptions = { price: 1 };
    if (sort === "price-high") sortOptions = { price: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };

    const courses = await Course.find(query).populate("instructor", "name email avatar title").sort(sortOptions).lean();

    // Populate lessons for each course
    for (const c of courses) {
      c.lessons = await Lesson.find({ course: c._id }).sort({ order: 1 }).lean();
      c.lessonCount = c.lessons.length;
    }

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Courses: Get single course with full syllabus & quiz
app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    if (isUsingMemoryStore) {
      const course = memoryStore.courses.find(c => String(c._id) === String(courseId));
      if (!course) return res.status(404).json({ message: "Course not found" });

      const lessons = memoryStore.lessons
        .filter(l => String(l.course) === String(courseId))
        .sort((a, b) => a.order - b.order);
      const quizzes = memoryStore.quizzes.filter(q => String(q.course) === String(courseId));

      return res.json({
        ...course,
        lessons,
        quizzes
      });
    }

    const course = await Course.findById(courseId).populate("instructor", "name email avatar title bio").lean();
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).lean();
    const quizzes = await Quiz.find({ course: course._id }).lean();

    res.json({
      ...course,
      lessons,
      quizzes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Courses: Create Course (Teacher & Admin)
app.post("/api/courses", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { title, description, category, level, price, thumbnail, outcomes } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Course title and description are required" });
    }

    if (isUsingMemoryStore) {
      const newCourse = {
        _id: "c_" + Date.now(),
        title,
        description,
        category: category || "Development",
        level: level || "Beginner",
        price: Number(price) || 0,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        rating: 5.0,
        students: 0,
        instructor: req.user._id,
        instructorName: req.user.name,
        outcomes: Array.isArray(outcomes) ? outcomes : (outcomes ? outcomes.split("\n").filter(Boolean) : ["Understand core concepts"]),
        lessons: [],
        createdAt: new Date()
      };
      memoryStore.courses.unshift(newCourse);
      return res.status(201).json(newCourse);
    }

    const course = await Course.create({
      title,
      description,
      category,
      level,
      price: Number(price) || 0,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      instructor: req.user._id,
      instructorName: req.user.name,
      outcomes: Array.isArray(outcomes) ? outcomes : (outcomes ? outcomes.split("\n").filter(Boolean) : [])
    });

    const populated = await course.populate("instructor", "name email avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 8. Courses: Update Course
app.put("/api/courses/:id", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const courseId = req.params.id;

    if (isUsingMemoryStore) {
      const idx = memoryStore.courses.findIndex(c => String(c._id) === String(courseId));
      if (idx === -1) return res.status(404).json({ message: "Course not found" });

      if (req.user.role === "teacher" && String(memoryStore.courses[idx].instructor) !== String(req.user._id)) {
        return res.status(403).json({ message: "You can only edit your own courses" });
      }

      memoryStore.courses[idx] = { ...memoryStore.courses[idx], ...req.body, _id: courseId };
      return res.json(memoryStore.courses[idx]);
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role === "teacher" && String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own courses" });
    }

    Object.assign(course, req.body);
    await course.save();

    const populated = await course.populate("instructor", "name email");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 9. Courses: Delete Course
app.delete("/api/courses/:id", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const courseId = req.params.id;

    if (isUsingMemoryStore) {
      const course = memoryStore.courses.find(c => String(c._id) === String(courseId));
      if (!course) return res.status(404).json({ message: "Course not found" });

      if (req.user.role === "teacher" && String(course.instructor) !== String(req.user._id)) {
        return res.status(403).json({ message: "You can only delete your own courses" });
      }

      memoryStore.courses = memoryStore.courses.filter(c => String(c._id) !== String(courseId));
      memoryStore.lessons = memoryStore.lessons.filter(l => String(l.course) !== String(courseId));
      memoryStore.quizzes = memoryStore.quizzes.filter(q => String(q.course) !== String(courseId));
      memoryStore.enrollments = memoryStore.enrollments.filter(e => String(e.course) !== String(courseId));

      return res.json({ message: "Course and associated materials removed" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role === "teacher" && String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own courses" });
    }

    await Promise.all([
      Lesson.deleteMany({ course: course._id }),
      Quiz.deleteMany({ course: course._id }),
      Enrollment.deleteMany({ course: course._id }),
      Course.deleteOne({ _id: course._id })
    ]);

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. Lessons: Add Lesson to Course
app.post("/api/courses/:id/lessons", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, videoUrl, duration, notes } = req.body;
    if (!title) return res.status(400).json({ message: "Lesson title is required" });

    if (isUsingMemoryStore) {
      const course = memoryStore.courses.find(c => String(c._id) === String(courseId));
      if (!course) return res.status(404).json({ message: "Course not found" });

      const existingLessons = memoryStore.lessons.filter(l => String(l.course) === String(courseId));
      const newLesson = {
        _id: "l_" + Date.now(),
        course: courseId,
        title,
        description: description || "",
        videoUrl: videoUrl || "https://www.youtube.com/embed/7CqJlxBYj-M",
        duration: duration || "15 min",
        order: existingLessons.length + 1,
        notes: notes || "",
        resources: [],
        createdAt: new Date()
      };
      memoryStore.lessons.push(newLesson);
      return res.status(201).json(newLesson);
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const orderCount = await Lesson.countDocuments({ course: course._id });
    const lesson = await Lesson.create({
      course: course._id,
      title,
      description,
      videoUrl: videoUrl || "https://www.youtube.com/embed/7CqJlxBYj-M",
      duration: duration || "15 min",
      order: orderCount + 1,
      notes: notes || ""
    });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 11. Lessons: Delete Lesson
app.delete("/api/lessons/:id", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const lessonId = req.params.id;

    if (isUsingMemoryStore) {
      memoryStore.lessons = memoryStore.lessons.filter(l => String(l._id) !== String(lessonId));
      return res.json({ message: "Lesson removed" });
    }

    await Lesson.findByIdAndDelete(lessonId);
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 12. Enrollments: Enroll in a course (Student)
app.post("/api/enrollments", authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    if (isUsingMemoryStore) {
      const course = memoryStore.courses.find(c => String(c._id) === String(courseId));
      if (!course) return res.status(404).json({ message: "Course not found" });

      const alreadyEnrolled = memoryStore.enrollments.find(
        e => String(e.student) === String(req.user._id) && String(e.course) === String(courseId)
      );
      if (alreadyEnrolled) {
        return res.status(409).json({ message: "You are already enrolled in this course" });
      }

      const newEnrollment = {
        _id: "e_" + Date.now(),
        student: req.user._id,
        course: courseId,
        progress: 0,
        completedLessons: [],
        enrolledAt: new Date()
      };
      memoryStore.enrollments.push(newEnrollment);
      course.students = (course.students || 0) + 1;

      memoryStore.payments.push({
        _id: "pay_" + Date.now(),
        student: req.user._id,
        course: courseId,
        amount: course.price || 0,
        status: "paid",
        createdAt: new Date()
      });

      const enriched = {
        ...newEnrollment,
        course: {
          ...course,
          lessons: memoryStore.lessons.filter(l => String(l.course) === String(courseId))
        }
      };

      return res.status(201).json(enriched);
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (existing) {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      progress: 0,
      completedLessons: []
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { students: 1 } });
    await Payment.create({
      student: req.user._id,
      course: course._id,
      amount: course.price,
      status: "paid"
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name title avatar" }
      });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 13. Enrollments: My Enrolled Courses (Student)
app.get("/api/enrollments/me", authenticate, async (req, res) => {
  try {
    if (isUsingMemoryStore) {
      const userEnrollments = memoryStore.enrollments
        .filter(e => String(e.student) === String(req.user._id))
        .map(e => {
          const course = memoryStore.courses.find(c => String(c._id) === String(e.course));
          const lessons = memoryStore.lessons.filter(l => String(l.course) === String(e.course));
          const quizzes = memoryStore.quizzes.filter(q => String(q.course) === String(e.course));
          return {
            ...e,
            course: course ? { ...course, lessons, quizzes } : null
          };
        })
        .filter(e => e.course !== null);

      return res.json({ enrollments: userEnrollments });
    }

    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name title avatar" }
      })
      .sort({ enrolledAt: -1 })
      .lean();

    for (const e of enrollments) {
      if (e.course) {
        e.course.lessons = await Lesson.find({ course: e.course._id }).sort({ order: 1 }).lean();
        e.course.quizzes = await Quiz.find({ course: e.course._id }).lean();
      }
    }

    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 14. Progress: Toggle Lesson Completion & Generate Certificate upon 100%
app.put("/api/progress/:enrollmentId", authenticate, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, completed } = req.body;

    if (isUsingMemoryStore) {
      const enrollment = memoryStore.enrollments.find(
        e => String(e._id) === String(enrollmentId) && String(e.student) === String(req.user._id)
      );
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

      let completedSet = new Set((enrollment.completedLessons || []).map(String));
      if (completed) {
        completedSet.add(String(lessonId));
      } else {
        completedSet.delete(String(lessonId));
      }
      enrollment.completedLessons = Array.from(completedSet);

      const totalLessons = memoryStore.lessons.filter(l => String(l.course) === String(enrollment.course)).length;
      enrollment.progress = totalLessons > 0 ? Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100)) : 0;

      let newCert = null;
      if (enrollment.progress === 100) {
        const hasCert = memoryStore.certificates.find(
          c => String(c.student) === String(req.user._id) && String(c.course) === String(enrollment.course)
        );
        if (!hasCert) {
          const course = memoryStore.courses.find(c => String(c._id) === String(enrollment.course));
          newCert = {
            _id: "cert_" + Date.now(),
            student: req.user._id,
            course: enrollment.course,
            studentName: req.user.name,
            courseTitle: course ? course.title : "Mastery Course",
            certificateId: "LH-" + Date.now().toString(36).toUpperCase(),
            grade: "Excellence with Honors",
            issuedAt: new Date()
          };
          memoryStore.certificates.push(newCert);
        }
      }

      return res.json({
        enrollment,
        certificate: newCert,
        message: enrollment.progress === 100 ? "Congratulations! Course completed! Certificate unlocked!" : "Progress updated"
      });
    }

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: req.user._id });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    const totalLessons = await Lesson.countDocuments({ course: enrollment.course });

    if (completed) {
      if (!enrollment.completedLessons.some(id => String(id) === String(lessonId))) {
        enrollment.completedLessons.push(lessonId);
      }
    } else {
      enrollment.completedLessons = enrollment.completedLessons.filter(id => String(id) !== String(lessonId));
    }

    enrollment.progress = totalLessons > 0
      ? Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100))
      : 0;

    await enrollment.save();

    let cert = null;
    if (enrollment.progress === 100) {
      const existingCert = await Certificate.findOne({ student: req.user._id, course: enrollment.course });
      if (!existingCert) {
        const course = await Course.findById(enrollment.course);
        cert = await Certificate.create({
          student: req.user._id,
          course: enrollment.course,
          studentName: req.user.name,
          courseTitle: course ? course.title : "Course Completion",
          certificateId: "LH-" + Date.now().toString(36).toUpperCase(),
          grade: "Excellence with Honors"
        });
      } else {
        cert = existingCert;
      }
    }

    res.json({
      enrollment,
      certificate: cert,
      message: enrollment.progress === 100 ? "Congratulations! Course completed! Certificate unlocked!" : "Progress updated"
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 15. Quizzes: Get quizzes for a course
app.get("/api/quizzes/course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    if (isUsingMemoryStore) {
      const quizzes = memoryStore.quizzes.filter(q => String(q.course) === String(courseId));
      return res.json(quizzes);
    }

    const quizzes = await Quiz.find({ course: courseId }).lean();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 16. Quizzes: Submit Quiz Answers & Grade
app.post("/api/quizzes/:id/submit", authenticate, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body; // array of selected indices or { questionIndex: selectedIndex }

    let quiz = null;
    if (isUsingMemoryStore) {
      quiz = memoryStore.quizzes.find(q => String(q._id) === String(quizId));
    } else {
      quiz = await Quiz.findById(quizId).lean();
    }

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let correctCount = 0;
    const feedback = (quiz.questions || []).map((q, idx) => {
      const selected = answers ? answers[idx] : -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        selectedIndex: selected,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = quiz.questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= (quiz.passingScore || 70);

    res.json({
      score,
      passed,
      passingScore: quiz.passingScore || 70,
      totalQuestions,
      correctCount,
      feedback
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 17. Quizzes: Create Quiz (Teacher/Admin)
app.post("/api/quizzes", authenticate, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { courseId, title, passingScore = 70, questions } = req.body;
    if (!courseId || !title || !questions || !questions.length) {
      return res.status(400).json({ message: "Course ID, title, and at least one question are required" });
    }

    if (isUsingMemoryStore) {
      const newQuiz = {
        _id: "q_" + Date.now(),
        course: courseId,
        title,
        passingScore,
        questions,
        createdAt: new Date()
      };
      memoryStore.quizzes.push(newQuiz);
      return res.status(201).json(newQuiz);
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      passingScore,
      questions
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 18. Certificates: List My Certificates
app.get("/api/certificates/me", authenticate, async (req, res) => {
  try {
    if (isUsingMemoryStore) {
      const certs = memoryStore.certificates.filter(c => String(c.student) === String(req.user._id));
      return res.json({ certificates: certs });
    }

    const certs = await Certificate.find({ student: req.user._id }).sort({ issuedAt: -1 }).lean();
    res.json({ certificates: certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 19. Admin: List All Users
app.get("/api/admin/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (isUsingMemoryStore) {
      const safe = memoryStore.users.map(({ password, ...rest }) => rest);
      return res.json({ users: safe });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 20. Admin: Change User Role
app.put("/api/admin/users/:id/role", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Choose student, teacher, or admin" });
    }

    if (isUsingMemoryStore) {
      const user = memoryStore.users.find(u => String(u._id) === String(req.params.id));
      if (!user) return res.status(404).json({ message: "User not found" });
      user.role = role;
      const { password: _, ...safe } = user;
      return res.json({ user: safe, message: `Role changed to ${role}` });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true }).select("-password");
    res.json({ user, message: `Role changed to ${role}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 21. Admin: Platform Stats
app.get("/api/admin/stats", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (isUsingMemoryStore) {
      const students = memoryStore.users.filter(u => u.role === "student").length;
      const teachers = memoryStore.users.filter(u => u.role === "teacher").length;
      const courses = memoryStore.courses.length;
      const enrollments = memoryStore.enrollments.length;
      const revenue = memoryStore.payments.reduce((acc, p) => acc + (p.amount || 0), 0);

      return res.json({
        students,
        teachers,
        courses,
        enrollments,
        revenue
      });
    }

    const [students, teachers, courses, enrollments, revAgg] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      students,
      teachers,
      courses,
      enrollments,
      revenue: revAgg[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Server Initialization with Graceful Dual-Mode
// ==========================================
async function startServer() {
  const mongoUri = process.env.MONGO_URI || "";
  const isPlaceholder = !mongoUri || mongoUri.includes("YOUR_USERNAME") || mongoUri.includes("YOUR_CLUSTER");

  if (isPlaceholder) {
    console.log("--------------------------------------------------");
    console.log(">> NOTICE: MongoDB URI is unconfigured or placeholder.");
    console.log(">> Booting LearnHub in Resilient In-Memory Mode with Seed Data.");
    console.log(">> (All LMS features, authentication, courses, classroom & certificates work out of the box!)");
    console.log("--------------------------------------------------");
    isUsingMemoryStore = true;
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`🚀 LearnHub LMS Server running at http://localhost:${PORT}`);
    });
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log("✅ Successfully connected to MongoDB Database.");
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`🚀 LearnHub LMS Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed:", err.message);
    console.log(">> Falling back to Resilient In-Memory Store so your LMS never crashes!");
    isUsingMemoryStore = true;
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`🚀 LearnHub LMS Server running in Fallback Mode at http://localhost:${PORT}`);
    });
  }
}

startServer();
