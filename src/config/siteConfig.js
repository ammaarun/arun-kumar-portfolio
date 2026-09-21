export const siteConfig = {
  brandName: "Arun Kumar",
  title: "Java Developer & Full Stack Developer",
  shortRole: "JAVA & FULL STACK",
  initials: "AK",
  email: "arunkumar.dev@example.com",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  },
  freelanceOfferings: {
    enabled: true,
    title: "Custom Portfolio Creation for Developers & Professionals",
    subtitle: "Stand out to recruiters and clients with a high-performance, full-stack dynamic portfolio and live CMS admin panel.",
    packages: [
      {
        id: "basic",
        name: "Basic Developer Portfolio",
        price: "$99",
        localPrice: "₹8,000",
        period: "one-time",
        badge: "Fast Delivery",
        description: "Perfect for students and job seekers needing a clean, modern responsive portfolio.",
        features: [
          "Custom React & Tailwind Layout",
          "Responsive Mobile & Dark Mode",
          "Projects & Skills Showcase",
          "Contact Form Integration",
          "Free Deployment Setup on Vercel/Render"
        ]
      },
      {
        id: "cms",
        name: "Full Dynamic CMS Portfolio",
        price: "$249",
        localPrice: "₹20,000",
        period: "one-time",
        popular: true,
        badge: "Most Popular",
        description: "Complete full-stack CMS with a protected Admin Dashboard to edit your own content anytime.",
        features: [
          "Everything in Basic Plan",
          "Protected Admin Dashboard (/admin/login)",
          "10 CRUD Views (Projects, Blog, Skills, Messages)",
          "PostgreSQL Cloud Database Integration",
          "Real-time Admin Inbox for Contact Messages",
          "Full Automated Test Suite Included"
        ]
      },
      {
        id: "vip",
        name: "VIP Personal Brand Package",
        price: "$499",
        localPrice: "₹40,000",
        period: "one-time",
        badge: "Complete Solution",
        description: "All-in-one personal branding solution with custom domain, resume design, and SEO.",
        features: [
          "Everything in Full Dynamic CMS",
          "Custom Domain Setup (yourname.com) + SSL",
          "Professional Resume PDF Formatting",
          "SEO & OpenGraph Social Media Previews",
          "1 Year Free Cloud Database Maintenance",
          "Priority 1-on-1 Support & Customization"
        ]
      }
    ]
  }
};
