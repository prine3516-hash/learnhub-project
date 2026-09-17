require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  title: String,
  avatar: String,
  bio: String
}));

const Course = mongoose.model("Course", new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  level: String,
  price: Number,
  thumbnail: String,
  rating: Number,
  students: Number,
  instructor: mongoose.Schema.Types.ObjectId,
  instructorName: String,
  outcomes: [String]
}));

const Lesson = mongoose.model("Lesson", new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  duration: String,
  order: Number,
  notes: String
}));

const Quiz = mongoose.model("Quiz", new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId,
  title: String,
  passingScore: Number,
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String
  }]
}));

(async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/learnhub";
    console.log("Connecting to MongoDB for seeding:", mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const passwordHash = await bcrypt.hash("LearnHub@123", 10);

    // Create users
    const usersData = [
      {
        name: "LearnHub Admin",
        email: "admin@learnhub.com",
        password: passwordHash,
        role: "admin",
        title: "Platform Admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      },
      {
        name: "Dr. Sarah Jenkins",
        email: "teacher@learnhub.com",
        password: passwordHash,
        role: "teacher",
        title: "Senior Full-Stack Architect",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      },
      {
        name: "Alex Rivera",
        email: "student@learnhub.com",
        password: passwordHash,
        role: "student",
        title: "Web Developer",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
      }
    ];

    for (const u of usersData) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    }

    const teacher = await User.findOne({ email: "teacher@learnhub.com" });

    // Seed Courses
    const coursesData = [
      {
        title: "Full-Stack Web Development with MERN",
        description: "Master MongoDB, Express, React, and Node.js from scratch. Build and deploy production-ready full-stack applications with modern authentication and clean architecture.",
        category: "Development",
        level: "Intermediate",
        price: 49,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
        rating: 4.9,
        students: 1420,
        instructor: teacher._id,
        instructorName: teacher.name,
        outcomes: [
          "Build full-stack MERN web applications from scratch",
          "Design scalable RESTful APIs with Node.js and Express",
          "Master state management, hooks, and responsive UI in React"
        ]
      },
      {
        title: "Python for AI & Machine Learning Masterclass",
        description: "From Python fundamentals to deep learning algorithms. Work with NumPy, Pandas, Scikit-Learn, and build real-world AI predictive models.",
        category: "Data Science",
        level: "Beginner",
        price: 59,
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        rating: 4.8,
        students: 2150,
        instructor: teacher._id,
        instructorName: teacher.name,
        outcomes: [
          "Write clean, idiomatic Python code for data analysis",
          "Manipulate complex datasets using Pandas and NumPy",
          "Train classification, regression, and clustering ML models"
        ]
      }
    ];

    for (const c of coursesData) {
      const existing = await Course.findOne({ title: c.title });
      if (!existing) {
        const created = await Course.create(c);
        // Add sample lesson
        await Lesson.create({
          course: created._id,
          title: "Introduction & Environment Setup",
          description: "Setting up tools and project structure",
          videoUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
          duration: "15 min",
          order: 1
        });
        // Add sample quiz
        await Quiz.create({
          course: created._id,
          title: "Course Assessment",
          passingScore: 70,
          questions: [{
            question: "Is MERN suitable for single-page applications?",
            options: ["Yes, absolutely", "No, never", "Only with PHP", "Only with C++"],
            correctIndex: 0,
            explanation: "React provides client-side SPA rendering while Express/Node handles the API."
          }]
        });
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Seeding error:", e.message);
    process.exit(1);
  }
})();