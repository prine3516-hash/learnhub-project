// Fallback seed data for immediate client rendering and offline reliability
export const fallbackCourses = [
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
    instructorName: "Dr. Sarah Jenkins",
    outcomes: [
      "Build full-stack MERN web applications from scratch",
      "Design scalable RESTful APIs with Node.js and Express",
      "Master state management, hooks, and responsive UI in React",
      "Deploy database-backed apps with JWT authentication and security"
    ],
    lessons: [
      {
        _id: "l_mern_1",
        title: "1. Introduction to the MERN Architecture",
        description: "Overview of how MongoDB, Express, React, and Node.js connect seamlessly.",
        videoUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
        duration: "14 min",
        notes: "The MERN stack is a popular JavaScript stack that facilitates building scalable full-stack applications."
      },
      {
        _id: "l_mern_2",
        title: "2. Building RESTful APIs with Express & Mongoose",
        description: "Creating router endpoints, handling request validations, and querying MongoDB.",
        videoUrl: "https://www.youtube.com/embed/SccSCuHhOw0",
        duration: "22 min",
        notes: "Understand middleware pipelines, async route handlers, and schema validations."
      },
      {
        _id: "l_mern_3",
        title: "3. React Component Design & Modern Hooks",
        description: "State management with useState, useEffect, custom hooks, and component composition.",
        videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
        duration: "28 min",
        notes: "Component-driven design enables modular, reusable UI pieces."
      }
    ],
    quizzes: [
      {
        _id: "q_mern_1",
        title: "MERN Architecture Assessment",
        passingScore: 70,
        questions: [
          {
            question: "What does the 'E' in MERN stand for?",
            options: ["Ember.js", "Express.js", "Electron", "Elasticsearch"],
            correctIndex: 1,
            explanation: "The 'E' in MERN stands for Express.js, the minimalist web framework for Node.js."
          },
          {
            question: "Where should database credentials be kept?",
            options: ["Public git", "package.json", "Environment variables (.env)", "HTML script tag"],
            correctIndex: 2,
            explanation: "Environment variables keep secret credentials out of source control."
          }
        ]
      }
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
    instructorName: "Dr. Sarah Jenkins",
    outcomes: [
      "Write clean, idiomatic Python code for data analysis",
      "Manipulate complex datasets using Pandas and NumPy",
      "Train classification, regression, and clustering ML models"
    ],
    lessons: [
      {
        _id: "l_py_1",
        title: "1. Python Foundations & Virtual Environments",
        description: "Setting up Python, virtual environments, data structures, and list comprehensions.",
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
        duration: "18 min",
        notes: "Learn Python basic syntax, types, slicing, and memory management."
      }
    ],
    quizzes: []
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
    instructorName: "Dr. Sarah Jenkins",
    outcomes: [
      "Create scalable Figma components, autolayouts, and design tokens",
      "Conduct actionable UX user interviews and empathy mapping",
      "Build interactive clickable prototypes with micro-interactions"
    ],
    lessons: [
      {
        _id: "l_des_1",
        title: "1. Design Thinking & User Research Methods",
        description: "Empathy maps, user personas, problem statements, and customer journey mapping.",
        videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
        duration: "16 min",
        notes: "Great software starts with understanding user pain points before writing a single line of code."
      }
    ],
    quizzes: []
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
    instructorName: "Dr. Sarah Jenkins",
    outcomes: [
      "Containerize full-stack apps with multi-stage Docker builds",
      "Deploy and scale microservices with Kubernetes Pods & Services"
    ],
    lessons: [],
    quizzes: []
  }
];
