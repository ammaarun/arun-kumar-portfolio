import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { portfolioData } from '../../src/data/portfolioData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Extended initial database schema combining existing portfolioData + new CMS sections
const initialDb = {
  ...portfolioData,
  adminUser: {
    username: 'admin',
    // Hash or plain string for simplicity; default admin credentials: admin / admin123
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
      id: "post-2",
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

export const dbEngine = {
  get() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.save(initialDb);
        return initialDb;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file:', err);
      return initialDb;
    }
  },

  save(data) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }
};
