
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Define schemas locally to avoid import issues with Next.js specific aliases if tsconfig paths aren't picked up by simple runners
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
}, { timestamps: true });

const pathSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    steps: [{
        title: String,
        description: String,
        estimatedDuration: String,
        order: Number,
    }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    cloneCount: { type: Number, default: 0 },
    tags: [String],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Path = mongoose.models.Path || mongoose.model('Path', pathSchema);

const samplePaths = [
    {
        title: "Full Stack Web Development 2026",
        description: "A comprehensive roadmap to becoming a modern full stack developer. detailed steps covering frontend, backend, DevOps, and deployment.",
        category: "Web Development",
        difficulty: "Beginner",
        tags: ["javascript", "react", "nodejs", "web"],
        steps: [
            { order: 0, title: "HTML & CSS Foundation", description: "Learn semantic HTML5 and modern CSS3 (Flexbox, Grid).", estimatedDuration: "2 weeks" },
            { order: 1, title: "JavaScript Basics", description: "Master ES6+ syntax, DOM manipulation, and async programming.", estimatedDuration: "3 weeks" },
            { order: 2, title: "React Fundamentals", description: "Components, hooks, state management, and routing.", estimatedDuration: "4 weeks" },
            { order: 3, title: "Node.js & Express", description: "Build RESTful APIs and handle database connections.", estimatedDuration: "3 weeks" },
            { order: 4, title: "Database Design", description: "SQL vs NoSQL, schema design, and ORMs (Prisma/Mongoose).", estimatedDuration: "2 weeks" },
        ]
    },
    {
        title: "Machine Learning with Python",
        description: "Start your journey into AI and Machine Learning. From Python basics to Deep Learning neural networks.",
        category: "Data Science",
        difficulty: "Intermediate",
        tags: ["python", "ai", "ml", "data"],
        steps: [
            { order: 0, title: "Python Proficiency", description: "Advanced Python concepts, virtual environments, and package management.", estimatedDuration: "2 weeks" },
            { order: 1, title: "Data Analysis Libraries", description: "NumPy, Pandas, and Matplotlib for data manipulation.", estimatedDuration: "3 weeks" },
            { order: 2, title: "Classic ML Algorithms", description: "Scikit-Learn: Regression, Classification, Clustering.", estimatedDuration: "4 weeks" },
            { order: 3, title: "Deep Learning Foundations", description: "Neural Networks basics with PyTorch or TensorFlow.", estimatedDuration: "5 weeks" },
        ]
    },
    {
        title: "DevOps Engineering",
        description: "Master the art of deployment, CI/CD, and cloud infrastructure.",
        category: "DevOps",
        difficulty: "Advanced",
        tags: ["devops", "cloud", "docker", "kubernetes"],
        steps: [
            { order: 0, title: "Linux & Bash Scripting", description: "Command line mastery and automation scripts.", estimatedDuration: "2 weeks" },
            { order: 1, title: "Containerization (Docker)", description: "Building, shipping, and running containers.", estimatedDuration: "2 weeks" },
            { order: 2, title: "Orchestration (Kubernetes)", description: "Managing containerized applications at scale.", estimatedDuration: "4 weeks" },
            { order: 3, title: "CI/CD Pipelines", description: "GitHub Actions or Jenkins for automated deployment.", estimatedDuration: "2 weeks" },
            { order: 4, title: "Infrastructure as Code", description: "Terraform or Ansible for managing infrastructure.", estimatedDuration: "3 weeks" },
        ]
    },
    {
        title: "UI/UX Design Principles",
        description: "Learn to design beautiful, user-friendly interfaces.",
        category: "Design",
        difficulty: "Beginner",
        tags: ["design", "ui", "ux", "figma"],
        steps: [
            { order: 0, title: "Design Fundamentals", description: "Typography, Color Theory, and Layout.", estimatedDuration: "1 week" },
            { order: 1, title: "User Research", description: "Personas, User Journeys, and Wireframing.", estimatedDuration: "2 weeks" },
            { order: 2, title: "Figma Mastery", description: "Auto-layout, components, and prototyping.", estimatedDuration: "3 weeks" },
        ]
    }
];

async function seed() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // 1. Clear existing data (Optional: comment out if you want to verify appending)
        // console.log('🧹 Clearing existing data...');
        // await User.deleteMany({ email: 'community@pathcraft.com' }); // Only delete our seed user
        // await Path.deleteMany({ tags: { $in: samplePaths.flatMap(p => p.tags) } }); // Rough way to clean specifically seeded paths if re-running

        // 2. Create Community User
        console.log('👤 Creating/Finding Community User...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('community123', salt);

        let communityUser = await User.findOne({ email: 'community@pathcraft.com' });

        if (!communityUser) {
            communityUser = await User.create({
                email: 'community@pathcraft.com',
                password: hashedPassword,
                name: 'PathCraft Community',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PathCraft'
            });
            console.log('✅ Created user: PathCraft Community');
        } else {
            console.log('ℹ️ User already exists.');
        }

        // 3. Create Paths
        console.log('📚 Seeding Paths...');

        for (const pathData of samplePaths) {
            const exists = await Path.findOne({ title: pathData.title });
            if (!exists) {
                await Path.create({
                    ...pathData,
                    author: communityUser!._id,
                    cloneCount: Math.floor(Math.random() * 50) + 5
                });
                console.log(`   + Created: ${pathData.title}`);
            } else {
                console.log(`   . Skipped: ${pathData.title} (already exists)`);
            }
        }

        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
