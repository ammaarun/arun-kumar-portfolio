import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { portfolioData } from '../../src/data/portfolioData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Extended initial database schema combining existing portfolioData + new CMS sections
const initialDb = {
  ...portfolioData,
  adminUser: {
    username: 'admin',
    // Default admin credentials: admin / admin123
    password: 'admin123'
  },
  services: [
    {
      id: "srv-1",
      title: "Java Backend Development",
      description: "Architecting high-throughput REST APIs, microservices, and secure server-side applications using Java 17/21 and Spring Boot.",
      icon: "Server",
      pricing: "Custom / Project",
      featured: true
    },
    {
      id: "srv-2",
      title: "Full-Stack Web Applications",
      description: "End-to-end web product development connecting Spring Boot backends with modern, responsive React and Tailwind CSS frontends.",
      icon: "Layout",
      pricing: "Hourly / Contract",
      featured: true
    },
    {
      id: "srv-3",
      title: "Database Design & Query Optimization",
      description: "Relational database modeling with PostgreSQL & MySQL, query indexing, Redis caching integration, and JPA performance tuning.",
      icon: "Database",
      pricing: "Consulting",
      featured: true
    },
    {
      id: "srv-4",
      title: "API Integration & Bug Fixing",
      description: "Diagnosing complex backend bottlenecks, fixing memory leaks, writing unit tests with JUnit/Mockito, and integrating 3rd party APIs.",
      icon: "Code2",
      pricing: "Flexible",
      featured: false
    }
  ],
  blogs: [
    {
      id: "post-1",
      title: "Building Resilient Java Microservices with Spring Boot & Kafka",
      slug: "building-resilient-java-microservices-spring-boot-kafka",
      excerpt: "A deep dive into distributed transaction management, event sourcing, and Kafka topic partitioning in enterprise Java applications.",
      content: "Distributed microservice architectures require careful handling of transactions and event communication. In this article, we explore how Java 17, Spring Cloud, and Apache Kafka work together to maintain ACID consistency across multi-region cloud deployments...",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      tags: ["Java", "Spring Boot", "Kafka", "Microservices"],
      publishedDate: "2026-08-15",
      status: "Published"
    },
    {
      "id": "post-2",
      title: "Optimizing React Performance with Tailwind & Custom Hooks",
      slug: "optimizing-react-performance-tailwind-custom-hooks",
      excerpt: "Key strategies for reducing render cycles, leveraging WebSockets in React custom hooks, and maintaining smooth 60fps animations.",
      content: "Modern full-stack developers need frontend interfaces that respond instantaneously. Here is how we structure custom React hooks for real-time data streaming without causing unnecessary component re-renders...",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      tags: ["React", "JavaScript", "Frontend", "Tailwind CSS"],
      publishedDate: "2026-09-02",
      status: "Published"
    }
  ],
  testimonials: [
    {
      id: "test-1",
      name: "Suresh Reddy",
      role: "Engineering Director",
      company: "Enterprise Tech Solutions",
      content: "Arun is an exceptional Java developer. His expertise in Spring Boot microservices and query optimization reduced our backend response times by over 40%. Highly recommended!",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      visible: true
    },
    {
      id: "test-2",
      name: "Priya Sharma",
      role: "Lead Product Manager",
      company: "Innovate Software",
      content: "Arun delivered our full-stack client portal on time with flawless code quality and a polished React UI. A true professional who understands both business and tech.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      visible: true
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Technology (B.Tech) in Computer Science & Engineering",
      institution: "JNTU Hyderabad / Telangana University",
      period: "2016 - 2020",
      description: "Focused on Software Engineering, Data Structures & Algorithms, Operating Systems, Database Management Systems, and Object-Oriented Programming."
    }
  ],
  messages: [],
  settings: {
    siteTitle: "Arun Kumar — Java Developer & Full Stack Developer",
    metaDescription: "Personal Developer Portfolio & CMS of Arun Kumar based in Telangana, India.",
    accentColor: "emerald",
    themePreference: "dark",
    resumeUrl: "#",
    showHero: true,
    showServices: true,
    showBlog: true,
    showTestimonials: true,
    footerText: "Designed & Engineered by Arun Kumar"
  }
};

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool = null;
let memoryCache = null;

if (connectionString) {
  const sslOptions = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false };

  pool = new pg.Pool({
    connectionString,
    ssl: sslOptions
  });
}

// Helper to ensure database structure includes multi-client schema
const ensureMultiClientStructure = (db) => {
  if (!db.clients || !Array.isArray(db.clients) || db.clients.length === 0) {
    const defaultClient = {
      id: 'client-1',
      name: db.personalInfo?.name || 'Arun Kumar',
      email: db.personalInfo?.email || 'arunkumar.dev@example.com',
      role: db.personalInfo?.role || 'Java Developer | Full Stack Developer',
      profileImage: db.personalInfo?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      slug: 'arun-kumar',
      status: 'PUBLISHED',
      createdDate: new Date('2026-09-01').toISOString(),
      lastUpdated: new Date().toISOString(),
      lastPublishedAt: new Date().toISOString(),
      isDefault: true,
      portfolioData: {
        personalInfo: db.personalInfo || { ...initialDb.personalInfo },
        stats: db.stats || [ ...initialDb.stats ],
        codeSnippets: db.codeSnippets || { ...initialDb.codeSnippets },
        skills: db.skills || [ ...initialDb.skills ],
        projects: db.projects || [ ...initialDb.projects ],
        experience: db.experience || [ ...initialDb.experience ],
        education: db.education || [ ...initialDb.education ],
        services: db.services || [ ...initialDb.services ],
        blogs: db.blogs || [ ...initialDb.blogs ],
        testimonials: db.testimonials || [ ...initialDb.testimonials ],
        settings: db.settings || { ...initialDb.settings }
      }
    };

    db.clients = [defaultClient];
    db.activeClientId = 'client-1';
  }

  if (!db.activeClientId) {
    db.activeClientId = db.clients[0].id;
  }

  // Sync current root fields with the active client's portfolioData for backward compatibility
  const activeClient = db.clients.find(c => c.id === db.activeClientId) || db.clients[0];
  if (activeClient && activeClient.portfolioData) {
    const p = activeClient.portfolioData;
    db.personalInfo = p.personalInfo;
    db.stats = p.stats;
    db.codeSnippets = p.codeSnippets;
    db.skills = p.skills;
    db.projects = p.projects;
    db.experience = p.experience;
    db.education = p.education;
    db.services = p.services;
    db.blogs = p.blogs;
    db.testimonials = p.testimonials;
    db.settings = p.settings;
  }

  return db;
};

export const dbEngine = {
  async init() {
    if (!pool) {
      memoryCache = this.getFromFile();
      memoryCache = ensureMultiClientStructure(memoryCache);
      return memoryCache;
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS portfolio_cms (
          id INT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query('SELECT data FROM portfolio_cms WHERE id = 1');
      if (res.rows.length === 0) {
        console.log('🌱 Seeding initial portfolio dataset into PostgreSQL...');
        const seeded = ensureMultiClientStructure({ ...initialDb });
        await pool.query(
          'INSERT INTO portfolio_cms (id, data) VALUES (1, $1)',
          [JSON.stringify(seeded)]
        );
        memoryCache = seeded;
      } else {
        memoryCache = ensureMultiClientStructure(res.rows[0].data);
        console.log('✅ Loaded portfolio dataset from PostgreSQL cloud database.');
      }
    } catch (err) {
      console.error('❌ Error initializing PostgreSQL connection:', err.message);
      console.log('⚠️ Falling back to local db.json file mode.');
      pool = null;
      memoryCache = this.getFromFile();
      memoryCache = ensureMultiClientStructure(memoryCache);
    }
    return memoryCache;
  },

  getFromFile() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const seeded = ensureMultiClientStructure({ ...initialDb });
        this.saveToFile(seeded);
        return seeded;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return ensureMultiClientStructure(data);
    } catch (err) {
      console.error('Error reading database file:', err);
      const seeded = ensureMultiClientStructure({ ...initialDb });
      return seeded;
    }
  },

  saveToFile(data) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  },

  get() {
    if (!memoryCache) {
      memoryCache = this.getFromFile();
    }
    memoryCache = ensureMultiClientStructure(memoryCache);
    return memoryCache;
  },

  switchActiveClient(clientId) {
    const db = this.get();
    const targetClient = (db.clients || []).find(c => c.id === clientId);
    if (!targetClient) return null;

    db.activeClientId = clientId;

    if (targetClient.portfolioData) {
      const p = targetClient.portfolioData;
      db.personalInfo = p.personalInfo || db.personalInfo;
      db.stats = p.stats || db.stats;
      db.codeSnippets = p.codeSnippets || db.codeSnippets;
      db.skills = p.skills || db.skills;
      db.projects = p.projects || db.projects;
      db.experience = p.experience || db.experience;
      db.education = p.education || db.education;
      db.services = p.services || db.services;
      db.blogs = p.blogs || db.blogs;
      db.testimonials = p.testimonials || db.testimonials;
      db.settings = p.settings || db.settings;
    }

    this.save(db);
    return targetClient;
  },

  save(data) {
    // Before saving, ensure the active client's portfolioData is synchronized with root fields
    if (data.clients && data.activeClientId) {
      const activeClient = data.clients.find(c => c.id === data.activeClientId);
      if (activeClient) {
        activeClient.lastUpdated = new Date().toISOString();
        activeClient.portfolioData = {
          personalInfo: data.personalInfo,
          stats: data.stats,
          codeSnippets: data.codeSnippets,
          skills: data.skills,
          projects: data.projects,
          experience: data.experience,
          education: data.education,
          services: data.services,
          blogs: data.blogs,
          testimonials: data.testimonials,
          settings: data.settings
        };
      }
    }

    memoryCache = ensureMultiClientStructure(data);
    this.saveToFile(memoryCache);

    if (pool) {
      pool.query(
        'INSERT INTO portfolio_cms (id, data, updated_at) VALUES (1, $1, NOW()) ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()',
        [JSON.stringify(memoryCache)]
      ).catch(err => {
        console.error('❌ Error persisting update to PostgreSQL:', err.message);
      });
    }
  }
};
