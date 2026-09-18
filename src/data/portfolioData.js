export const portfolioData = {
  personalInfo: {
    name: "Arun Kumar",
    role: "Java Developer | Full Stack Developer",
    tagline: "Building scalable enterprise backends & high-performance modern web applications.",
    location: "Telangana, India",
    availability: "Available for Full-time Roles & High-Impact Freelance",
    email: "arunkumar.dev@example.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    phone: "+91 98765 43210",
    bio: "Passionate Full Stack Developer with deep expertise in Java, Spring Boot microservices, and modern React frontends. Specializing in architecting high-throughput REST APIs, optimizing relational databases, and delivering clean, responsive user interfaces that drive real business value.",
    shortBio: "Java & Full Stack Engineer with 4+ years of experience crafting robust enterprise backends with Spring Boot and reactive, polished frontends with React.",
    resumeUrl: "#",
  },

  stats: [
    { label: "Years of Experience", value: "4+", description: "In Enterprise & Web Development" },
    { label: "Projects Delivered", value: "15+", description: "Full-Stack & Microservices" },
    { label: "API SLA / Uptime", value: "99.9%", description: "Production Ready Systems" },
    { label: "Clean Code Written", value: "100K+", description: "Lines of Scalable Code" },
  ],

  codeSnippets: {
    java: {
      filename: "PaymentController.java",
      language: "java",
      code: `@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        log.info("Processing transaction for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.executePayment(request);
        return ResponseEntity.ok(response);
    }
}`
    },
    react: {
      filename: "usePaymentStream.js",
      language: "javascript",
      code: `import { useState, useEffect } from 'react';

export const usePaymentStream = (transactionId) => {
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(\`wss://api.arunkumar.dev/stream/\${transactionId}\`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
      setLoading(false);
    };
    return () => ws.close();
  }, [transactionId]);

  return { status, loading };
};`
    }
  },

  skills: [
    {
      category: "Backend Engineering",
      icon: "Server",
      items: [
        { name: "Java (Core & Advanced 17/21)", level: 95, popular: true },
        { name: "Spring Boot", level: 92, popular: true },
        { name: "Spring Microservices & Cloud", level: 88, popular: true },
        { name: "Spring Security & JWT", level: 90 },
        { name: "RESTful APIs & GraphQL", level: 92 },
        { name: "Hibernate / Spring Data JPA", level: 90 },
        { name: "Apache Kafka / RabbitMQ", level: 82 },
        { name: "Maven & Gradle", level: 85 }
      ]
    },
    {
      category: "Frontend Development",
      icon: "Layout",
      items: [
        { name: "React.js", level: 90, popular: true },
        { name: "JavaScript (ES6+)", level: 92, popular: true },
        { name: "TypeScript", level: 85, popular: true },
        { name: "Tailwind CSS", level: 94, popular: true },
        { name: "HTML5 & CSS3", level: 95 },
        { name: "Redux Toolkit & Context API", level: 88 },
        { name: "Next.js", level: 80 }
      ]
    },
    {
      category: "Databases & Caching",
      icon: "Database",
      items: [
        { name: "PostgreSQL", level: 90, popular: true },
        { name: "MySQL", level: 88 },
        { name: "Redis Caching", level: 85, popular: true },
        { name: "MongoDB", level: 80 }
      ]
    },
    {
      category: "DevOps, Cloud & Tools",
      icon: "Cloud",
      items: [
        { name: "Docker & Containerization", level: 88, popular: true },
        { name: "AWS (EC2, S3, RDS)", level: 82, popular: true },
        { name: "Git & GitHub Actions CI/CD", level: 90 },
        { name: "JUnit 5 & Mockito", level: 88 },
        { name: "Postman & Swagger/OpenAPI", level: 92 },
        { name: "Linux / Shell Scripting", level: 85 }
      ]
    }
  ],

  projects: [
    {
      id: "fintech-microservices",
      title: "FinTech Enterprise Payment Gateway",
      subtitle: "High-Throughput Distributed Microservice Architecture",
      category: "Backend & Microservices",
      featured: true,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      description: "A resilient distributed payment processing system designed with Java Spring Boot, Apache Kafka event streaming, Redis caching, and PostgreSQL. Handles concurrent transaction processing with ACID compliance and JWT Spring Security authentication.",
      longDescription: "Engineered a fault-tolerant payment orchestration engine built to scale across multi-region cloud deployments. Implemented the Saga pattern for distributed transaction management, rate limiting with Redis, and Kafka topic partitioning for real-time audit event logging.",
      tech: ["Java 17", "Spring Boot", "Kafka", "PostgreSQL", "Redis", "React", "Docker", "AWS"],
      metrics: [
        { label: "Throughput", value: "5,000+ TPS" },
        { label: "Latency", value: "< 45ms avg" },
        { label: "Security", value: "OAuth2 & JWT" }
      ],
      github: "https://github.com",
      live: "https://example.com",
      highlights: [
        "Implemented Distributed Locking using Redis Redlock algorithm to prevent race conditions during payout execution.",
        "Built dynamic React management dashboard with real-time transaction telemetry via WebSockets.",
        "Integrated resilience patterns using Resilience4j (Circuit Breaker, Retry, RateLimiter)."
      ]
    },
    {
      id: "cloud-erp-suite",
      title: "Cloud ERP & Inventory Management System",
      subtitle: "Full-Stack Enterprise Resource Planning Platform",
      category: "Full Stack",
      featured: true,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      description: "Comprehensive multi-tenant warehouse & inventory tracking solution. Built with Java Spring Data JPA, React 18, Tailwind CSS, and automated PDF report generation.",
      longDescription: "An all-in-one inventory, order processing, and supplier workflow application. Offers real-time stock notifications, role-based access control (RBAC), and automated invoice PDF compilation.",
      tech: ["Java", "Spring Boot", "React", "Tailwind CSS", "MySQL", "Docker"],
      metrics: [
        { label: "Warehouses", value: "10+ Supported" },
        { label: "Sync Speed", value: "Real-time" },
        { label: "PDF Export", value: "Instant" }
      ],
      github: "https://github.com",
      live: "https://example.com",
      highlights: [
        "Designed normalized MySQL schema with optimized indexed queries reducing fetch times by 60%.",
        "Crafted responsive UI using React and Tailwind CSS with custom data tables and CSV export.",
        "Configured Docker Compose multi-container setup for seamless local & cloud deployment."
      ]
    },
    {
      id: "devconnect-hub",
      title: "DevConnect - Developer Community & Code Hub",
      subtitle: "Real-Time Collaboration Platform for Developers",
      category: "Full Stack",
      featured: true,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      description: "Interactive platform where developers can share code snippets, ask technical questions, follow tech tags, and collaborate in real-time chat rooms.",
      longDescription: "Built with React, Spring Boot REST API, WebSockets, and MongoDB. Includes markdown syntax highlighting, code snippet bookmarking, and developer portfolio pages.",
      tech: ["React", "Spring Boot", "WebSocket", "MongoDB", "Tailwind CSS"],
      metrics: [
        { label: "Users", value: "2,000+ Active" },
        { label: "Response", value: "< 100ms" },
        { label: "Realtime", value: "WebSocket" }
      ],
      github: "https://github.com",
      live: "https://example.com",
      highlights: [
        "Implemented real-time bi-directional messaging with WebSockets and Spring Messaging.",
        "Built rich Markdown code editor with syntax highlighting using PrismJS.",
        "Designed JWT authentication flow with refresh token rotation."
      ]
    },
    {
      id: "ai-resume-analyzer",
      title: "AI Resume & Skill Matcher Microservice",
      subtitle: "Intelligent Candidate Screening & Recommendation",
      category: "Backend & Microservices",
      featured: false,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      description: "An automated resume parsing microservice built with Spring Boot, Python text parsing engine, and React frontend interface.",
      longDescription: "Parses PDF/DOCX resumes, extracts key skills, computes match scores against job descriptions using vector embeddings and keyword density algorithms.",
      tech: ["Spring Boot", "Python", "React", "PostgreSQL", "OpenAI API"],
      metrics: [
        { label: "Accuracy", value: "94%" },
        { label: "Parse Time", value: "< 2s per PDF" }
      ],
      github: "https://github.com",
      live: "https://example.com",
      highlights: [
        "Constructed asynchronous processing pipeline using Spring @Async and TaskExecutors.",
        "Created drag-and-drop React interface with live upload progress and score visualization breakdown."
      ]
    }
  ],

  experience: [
    {
      company: "Enterprise Tech Solutions",
      role: "Senior Full Stack Engineer / Java Developer",
      period: "2023 - Present",
      location: "Hyderabad / Telangana, India",
      type: "Full-time",
      description: "Leading the core backend API development and frontend web UI for cloud-native enterprise products.",
      achievements: [
        "Architected and deployed 8+ Spring Boot microservices handling over 2M daily API requests with 99.9% availability.",
        "Refactored legacy monolith SQL queries, achieving a 45% reduction in database execution times.",
        "Built responsive client portals in React and Tailwind CSS, increasing user engagement by 35%.",
        "Mentored junior developers, introduced JUnit/Mockito TDD practices, boosting code coverage to 88%."
      ],
      skills: ["Java 17", "Spring Boot", "Microservices", "React", "PostgreSQL", "Docker", "AWS"]
    },
    {
      company: "Innovate Software Systems",
      role: "Java Backend Developer",
      period: "2021 - 2023",
      location: "Telangana, India",
      type: "Full-time",
      description: "Designed RESTful web services, database schemas, and external third-party API integrations.",
      achievements: [
        "Developed REST APIs using Spring Boot and Hibernate for core business modules.",
        "Implemented Spring Security with JWT tokens for multi-role user access.",
        "Configured Redis cache layers that reduced repetitive database load by 50%.",
        "Integrated Jenkins CI/CD pipelines to automate automated testing and artifact deployment."
      ],
      skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "Redis", "REST APIs", "Git"]
    },
    {
      company: "WebTech Digital",
      role: "Junior Full Stack Developer",
      period: "2020 - 2021",
      location: "Telangana, India",
      type: "Full-time",
      description: "Built responsive frontend user interfaces and supported Java web applications.",
      achievements: [
        "Developed interactive UI components in React and HTML5/CSS3.",
        "Connected React frontend views to Spring Boot REST endpoints.",
        "Participated in Agile sprint planning, daily standups, and code reviews."
      ],
      skills: ["JavaScript", "React", "Java", "HTML/CSS", "Bootstrap"]
    }
  ]
};
