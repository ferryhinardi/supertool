/**
 * Sample Resume Personas
 * Different professional profiles to showcase template designs
 */

import type { ResumeData } from './types'

export type PersonaType =
  | 'software-engineer'
  | 'marketing-manager'
  | 'product-designer'
  | 'data-scientist'
  | 'sales-executive'
  | 'registered-nurse'
  | 'financial-analyst'
  | 'high-school-teacher'

export interface Persona {
  id: PersonaType
  name: string
  description: string
  data: Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'>
}

// Software Engineer Persona
const SOFTWARE_ENGINEER: Persona = {
  id: 'software-engineer',
  name: 'Software Engineer',
  description: 'Senior developer with full-stack experience',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Alex Johnson',
      professionalTitle: 'Senior Software Engineer',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
      website: 'alexjohnson.dev',
      summary:
        'Results-driven Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Passionate about clean code, performance optimization, and mentoring junior developers.',
    },
    experience: [
      {
        id: '1',
        company: 'Tech Innovation Corp',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        achievements: [
          'Led development of microservices architecture serving 5M+ daily active users, improving system reliability by 40%',
          'Architected and implemented real-time data pipeline processing 2TB+ daily, reducing latency by 60%',
          'Mentored team of 5 junior engineers, establishing code review practices that reduced bugs by 35%',
          'Optimized database queries and caching strategies, decreasing API response time from 800ms to 120ms',
        ],
        technologies: [
          'React',
          'Node.js',
          'TypeScript',
          'PostgreSQL',
          'AWS',
          'Docker',
          'Kubernetes',
        ],
      },
      {
        id: '2',
        company: 'Digital Solutions Inc',
        position: 'Software Engineer',
        location: 'Austin, TX',
        startDate: '2018-06',
        endDate: '2021-02',
        current: false,
        achievements: [
          'Developed and shipped 15+ customer-facing features using React and Redux, increasing user engagement by 25%',
          'Built RESTful APIs serving 100K+ requests per day with 99.9% uptime',
          'Implemented comprehensive test coverage (85%+) using Jest and React Testing Library',
          'Collaborated with design team to create responsive UI components used across 20+ product pages',
        ],
        technologies: ['React', 'Redux', 'Node.js', 'MongoDB', 'Express', 'Jest'],
      },
      {
        id: '3',
        company: 'StartupXYZ',
        position: 'Junior Developer',
        location: 'Remote',
        startDate: '2016-08',
        endDate: '2018-05',
        current: false,
        achievements: [
          'Built customer dashboard from scratch using React and Material-UI, onboarding 500+ users in first month',
          'Integrated third-party payment APIs (Stripe, PayPal) processing $2M+ in transactions',
          'Automated deployment pipeline using GitHub Actions, reducing deployment time by 70%',
        ],
        technologies: ['JavaScript', 'React', 'Python', 'Django', 'MySQL'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2012-09',
        endDate: '2016-05',
        current: false,
        gpa: '3.8',
        honors: "Dean's List (4 semesters)",
        achievements: [
          'President of Computer Science Club',
          'Published research paper on machine learning algorithms',
        ],
      },
    ],
    skills: [
      {
        category: 'Frontend Development',
        skills: [
          'React',
          'TypeScript',
          'Next.js',
          'Redux',
          'Vue.js',
          'HTML5',
          'CSS3',
          'Tailwind CSS',
        ],
      },
      {
        category: 'Backend Development',
        skills: [
          'Node.js',
          'Python',
          'Django',
          'Express.js',
          'GraphQL',
          'REST APIs',
          'Microservices',
        ],
      },
      {
        category: 'Database & Tools',
        skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD'],
      },
      {
        category: 'Soft Skills',
        skills: ['Team Leadership', 'Code Review', 'Agile/Scrum', 'Technical Writing', 'Mentoring'],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'DevTools Pro',
        description:
          'Open-source developer productivity suite with 30+ tools for everyday tasks. Built with Next.js and TypeScript.',
        role: 'Creator & Maintainer',
        startDate: '2023-01',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
        url: 'devtools.pro',
        github: 'github.com/alexj/devtools-pro',
        highlights: [
          '10K+ GitHub stars and 500+ contributors',
          'Featured on Product Hunt (Top 5 Product of the Day)',
          'Used by developers at Google, Amazon, and Microsoft',
        ],
      },
      {
        id: '2',
        name: 'Real-Time Analytics Dashboard',
        description:
          'Enterprise analytics platform processing millions of events per second with sub-100ms latency.',
        role: 'Lead Engineer',
        startDate: '2022-06',
        endDate: '2023-12',
        technologies: ['React', 'Node.js', 'Kafka', 'TimescaleDB', 'WebSockets'],
        highlights: [
          'Handles 10M+ events per day with 99.99% uptime',
          'Reduced infrastructure costs by 45% through optimization',
        ],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#2563eb',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Marketing Manager Persona
const MARKETING_MANAGER: Persona = {
  id: 'marketing-manager',
  name: 'Marketing Manager',
  description: 'Strategic marketer with digital campaign expertise',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Sarah Martinez',
      professionalTitle: 'Senior Marketing Manager',
      email: 'sarah.martinez@email.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/sarahmartinez',
      website: 'sarahmartinez.com',
      summary:
        'Creative and data-driven Marketing Manager with 7+ years of experience leading digital campaigns that drive brand awareness and revenue growth. Expert in content strategy, SEO, and marketing automation. Proven track record of increasing engagement by 200%+ and ROI by 150%.',
    },
    experience: [
      {
        id: '1',
        company: 'Global Brands Inc',
        position: 'Senior Marketing Manager',
        location: 'New York, NY',
        startDate: '2020-06',
        endDate: 'Present',
        current: true,
        achievements: [
          'Led multi-channel marketing campaigns generating $5M+ in annual revenue, exceeding targets by 35%',
          'Grew social media following from 50K to 500K+ across platforms, increasing engagement rate by 250%',
          'Implemented marketing automation platform, reducing campaign launch time by 60% and costs by 40%',
          'Managed $2M annual marketing budget across 15+ campaigns, achieving average ROI of 180%',
        ],
        technologies: [
          'HubSpot',
          'Google Analytics',
          'SEMrush',
          'Adobe Creative Suite',
          'Mailchimp',
        ],
      },
      {
        id: '2',
        company: 'Creative Agency XYZ',
        position: 'Marketing Manager',
        location: 'Los Angeles, CA',
        startDate: '2018-03',
        endDate: '2020-05',
        current: false,
        achievements: [
          'Developed and executed content strategy resulting in 300% increase in organic website traffic',
          'Launched influencer marketing program with 50+ partnerships, generating 10M+ impressions monthly',
          'Optimized email campaigns achieving 35% open rate and 8% CTR (2x industry average)',
          'Coordinated product launches for 20+ clients, consistently meeting deadlines and budget constraints',
        ],
        technologies: ['WordPress', 'Hootsuite', 'Google Ads', 'Salesforce', 'Canva'],
      },
      {
        id: '3',
        company: 'Tech Startup Co',
        position: 'Digital Marketing Specialist',
        location: 'San Diego, CA',
        startDate: '2017-01',
        endDate: '2018-02',
        current: false,
        achievements: [
          'Built SEO strategy from ground up, ranking for 100+ keywords and increasing organic traffic by 400%',
          'Created and managed PPC campaigns with $500K budget, achieving CPA 30% below industry benchmark',
          'Produced 50+ blog posts and case studies, establishing company as thought leader in the industry',
        ],
        technologies: ['Google Ads', 'Facebook Ads', 'Ahrefs', 'Hotjar', 'Unbounce'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'New York University',
        degree: 'Bachelor of Arts in Marketing',
        field: 'Marketing',
        location: 'New York, NY',
        startDate: '2013-09',
        endDate: '2017-05',
        current: false,
        gpa: '3.7',
        honors: 'Magna Cum Laude',
        achievements: ['Marketing Club Vice President', "Recipient of Dean's Scholarship"],
      },
    ],
    skills: [
      {
        category: 'Digital Marketing',
        skills: [
          'SEO/SEM',
          'Content Marketing',
          'Social Media Marketing',
          'Email Marketing',
          'PPC',
          'Marketing Automation',
        ],
      },
      {
        category: 'Tools & Platforms',
        skills: [
          'HubSpot',
          'Google Analytics',
          'Salesforce',
          'Adobe Creative Suite',
          'Mailchimp',
          'Hootsuite',
        ],
      },
      {
        category: 'Analytics & Strategy',
        skills: [
          'Data Analysis',
          'A/B Testing',
          'Campaign Management',
          'Budget Planning',
          'ROI Optimization',
        ],
      },
      {
        category: 'Soft Skills',
        skills: [
          'Team Leadership',
          'Creative Strategy',
          'Project Management',
          'Copywriting',
          'Presentation',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Brand Relaunch Campaign',
        description:
          'Complete brand refresh including new visual identity, messaging, and go-to-market strategy.',
        role: 'Campaign Lead',
        startDate: '2023-01',
        endDate: '2023-06',
        technologies: ['Brand Strategy', 'Content Marketing', 'Social Media'],
        highlights: [
          'Increased brand awareness by 85% in target demographic',
          'Generated 50K+ new leads in first quarter post-launch',
          'Featured in Forbes and TechCrunch',
        ],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#ec4899',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Product Designer Persona
const PRODUCT_DESIGNER: Persona = {
  id: 'product-designer',
  name: 'Product Designer',
  description: 'UX/UI designer focused on user-centered design',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Jordan Lee',
      professionalTitle: 'Senior Product Designer',
      email: 'jordan.lee@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/jordanlee',
      website: 'jordanlee.design',
      portfolio: 'behance.net/jordanlee',
      summary:
        'User-centered Product Designer with 6+ years of experience creating intuitive and beautiful digital experiences. Expert in UX research, interaction design, and design systems. Passionate about solving complex problems through thoughtful design and iterative processes.',
    },
    experience: [
      {
        id: '1',
        company: 'Enterprise Software Corp',
        position: 'Senior Product Designer',
        location: 'Seattle, WA',
        startDate: '2021-09',
        endDate: 'Present',
        current: true,
        achievements: [
          'Led end-to-end design for enterprise dashboard serving 100K+ users, increasing user satisfaction score from 3.2 to 4.7/5',
          'Established and maintained design system adopted by 20+ teams, reducing design-to-dev handoff time by 50%',
          'Conducted 50+ user interviews and usability tests, directly informing product roadmap and feature prioritization',
          'Collaborated with engineering and PM teams to ship 15+ major features in an agile environment',
        ],
        technologies: ['Figma', 'Adobe XD', 'Miro', 'UserTesting', 'Hotjar', 'Jira'],
      },
      {
        id: '2',
        company: 'Design Studio Creative',
        position: 'Product Designer',
        location: 'Portland, OR',
        startDate: '2019-06',
        endDate: '2021-08',
        current: false,
        achievements: [
          'Designed mobile apps for 10+ clients achieving 4.5+ star ratings across iOS and Android platforms',
          'Created wireframes, prototypes, and high-fidelity mockups for B2B and B2C products',
          'Facilitated design workshops with stakeholders to align on vision, goals, and success metrics',
          'Improved conversion rates by 45% through iterative A/B testing and UX optimization',
        ],
        technologies: ['Sketch', 'InVision', 'Principle', 'Zeplin', 'Abstract'],
      },
      {
        id: '3',
        company: 'Tech Startup Hub',
        position: 'UX/UI Designer',
        location: 'San Francisco, CA',
        startDate: '2018-03',
        endDate: '2019-05',
        current: false,
        achievements: [
          'Designed responsive web application from 0 to 1, onboarding 5,000+ users in first 3 months',
          'Created user personas, journey maps, and information architecture for MVP launch',
          'Collaborated with developers using agile methodology, delivering designs in 2-week sprints',
        ],
        technologies: ['Figma', 'Adobe Creative Suite', 'HTML/CSS', 'Framer'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Rhode Island School of Design',
        degree: 'Bachelor of Fine Arts in Graphic Design',
        field: 'Graphic Design',
        location: 'Providence, RI',
        startDate: '2014-09',
        endDate: '2018-05',
        current: false,
        honors: 'Graduated with Honors',
        achievements: [
          'President of AIGA Student Chapter',
          'Winner of Annual Design Competition 2017',
        ],
      },
    ],
    skills: [
      {
        category: 'Design Tools',
        skills: [
          'Figma',
          'Sketch',
          'Adobe XD',
          'Photoshop',
          'Illustrator',
          'InVision',
          'Principle',
          'Framer',
        ],
      },
      {
        category: 'UX Methods',
        skills: [
          'User Research',
          'Usability Testing',
          'Wireframing',
          'Prototyping',
          'Information Architecture',
          'A/B Testing',
        ],
      },
      {
        category: 'Technical Skills',
        skills: [
          'HTML/CSS',
          'Design Systems',
          'Responsive Design',
          'Accessibility (WCAG)',
          'Animation',
          'Typography',
        ],
      },
      {
        category: 'Soft Skills',
        skills: [
          'Collaboration',
          'Presentation',
          'Workshop Facilitation',
          'Problem Solving',
          'Creative Thinking',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Health & Wellness Mobile App',
        description:
          'End-to-end design of a fitness tracking and nutrition planning app with personalized recommendations.',
        role: 'Lead Designer',
        startDate: '2022-03',
        endDate: '2023-01',
        technologies: ['Figma', 'Prototyping', 'User Research'],
        highlights: [
          'Featured on App Store homepage in 15+ countries',
          '4.8 star rating with 50K+ downloads in first month',
          'Nominated for Apple Design Award 2023',
        ],
      },
      {
        id: '2',
        name: 'Enterprise Design System',
        description:
          'Comprehensive design system with 100+ components, documentation, and Figma library for scalable product development.',
        role: 'Design System Lead',
        startDate: '2021-09',
        technologies: ['Figma', 'Storybook', 'Design Tokens'],
        highlights: [
          'Adopted by 20+ product teams across organization',
          'Reduced design inconsistencies by 80%',
          'Improved designer-developer collaboration efficiency',
        ],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#8b5cf6',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Data Scientist Persona
const DATA_SCIENTIST: Persona = {
  id: 'data-scientist',
  name: 'Data Scientist',
  description: 'ML engineer specializing in predictive analytics',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Dr. Maya Patel',
      professionalTitle: 'Senior Data Scientist',
      email: 'maya.patel@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Boston, MA',
      linkedin: 'linkedin.com/in/mayapatel',
      github: 'github.com/mayapatel',
      website: 'mayapatel.ai',
      summary:
        'Innovative Data Scientist with 8+ years of experience developing machine learning models and scalable data pipelines. Ph.D. in Statistics with expertise in predictive analytics, NLP, and computer vision. Proven track record of delivering data-driven solutions that generate $10M+ in business value.',
    },
    experience: [
      {
        id: '1',
        company: 'AI Research Labs',
        position: 'Senior Data Scientist',
        location: 'Boston, MA',
        startDate: '2020-08',
        endDate: 'Present',
        current: true,
        achievements: [
          'Built recommendation engine serving 5M+ users, increasing revenue by $12M annually through 35% uplift in conversion',
          'Developed NLP models for sentiment analysis achieving 94% accuracy, processing 1M+ customer reviews daily',
          'Led team of 4 data scientists in productionizing ML models, reducing deployment time from weeks to days',
          'Published 3 papers in top-tier conferences (NeurIPS, ICML) on novel deep learning architectures',
        ],
        technologies: [
          'Python',
          'TensorFlow',
          'PyTorch',
          'Scikit-learn',
          'AWS SageMaker',
          'Spark',
          'SQL',
        ],
      },
      {
        id: '2',
        company: 'FinTech Innovations',
        position: 'Data Scientist',
        location: 'New York, NY',
        startDate: '2018-06',
        endDate: '2020-07',
        current: false,
        achievements: [
          'Designed fraud detection system reducing false positives by 60% and saving $5M annually',
          'Built predictive models for credit risk assessment with 89% accuracy, improving loan approval efficiency by 40%',
          'Created automated data pipelines processing 10TB+ daily using Spark and Airflow',
          'Collaborated with product team to A/B test ML features, increasing user engagement by 28%',
        ],
        technologies: ['Python', 'R', 'XGBoost', 'Pandas', 'Docker', 'Airflow', 'PostgreSQL'],
      },
      {
        id: '3',
        company: 'Research Institute',
        position: 'Data Analyst',
        location: 'Cambridge, MA',
        startDate: '2016-09',
        endDate: '2018-05',
        current: false,
        achievements: [
          'Conducted statistical analysis on clinical trial data for 5 FDA-approved studies',
          'Developed data visualization dashboards using Tableau, enabling real-time insights for researchers',
          'Automated reporting processes reducing manual work by 80% and improving data accuracy',
        ],
        technologies: ['Python', 'R', 'SQL', 'Tableau', 'Excel', 'SPSS'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Massachusetts Institute of Technology',
        degree: 'Ph.D. in Statistics',
        field: 'Statistics & Machine Learning',
        location: 'Cambridge, MA',
        startDate: '2012-09',
        endDate: '2016-05',
        current: false,
        achievements: [
          'Dissertation: "Deep Learning Approaches for Time Series Forecasting"',
          'Published 8 peer-reviewed papers in top ML conferences',
          'NSF Graduate Research Fellowship recipient',
        ],
      },
      {
        id: '2',
        institution: 'Stanford University',
        degree: 'Bachelor of Science in Mathematics',
        field: 'Mathematics',
        location: 'Stanford, CA',
        startDate: '2008-09',
        endDate: '2012-06',
        current: false,
        gpa: '3.9',
        honors: 'Summa Cum Laude',
      },
    ],
    skills: [
      {
        category: 'Programming Languages',
        skills: ['Python', 'R', 'SQL', 'Scala', 'Java', 'C++'],
      },
      {
        category: 'ML & Deep Learning',
        skills: [
          'TensorFlow',
          'PyTorch',
          'Scikit-learn',
          'XGBoost',
          'Keras',
          'Hugging Face',
          'LangChain',
        ],
      },
      {
        category: 'Big Data & Cloud',
        skills: ['Spark', 'Hadoop', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Airflow'],
      },
      {
        category: 'Data Science',
        skills: [
          'Statistical Modeling',
          'NLP',
          'Computer Vision',
          'A/B Testing',
          'Feature Engineering',
          'MLOps',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Real-Time Fraud Detection System',
        description:
          'End-to-end ML pipeline for detecting fraudulent transactions in milliseconds using ensemble methods.',
        role: 'Lead Data Scientist',
        startDate: '2022-01',
        endDate: '2023-06',
        technologies: ['Python', 'TensorFlow', 'AWS', 'Kafka', 'Redis'],
        highlights: [
          'Processes 100K+ transactions per second with <50ms latency',
          'Achieved 97% precision and 92% recall on fraud detection',
          'Reduced financial losses by $8M annually',
        ],
      },
      {
        id: '2',
        name: 'Open-Source NLP Library',
        description:
          'Python library for text preprocessing and feature extraction with 5K+ GitHub stars.',
        role: 'Creator & Maintainer',
        technologies: ['Python', 'spaCy', 'NLTK', 'PyPI'],
        github: 'github.com/mayapatel/nlp-toolkit',
        highlights: [
          '5K+ stars and 200+ contributors on GitHub',
          'Downloaded 50K+ times monthly via PyPI',
          'Used by Fortune 500 companies',
        ],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#10b981',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Sales Executive Persona
const SALES_EXECUTIVE: Persona = {
  id: 'sales-executive',
  name: 'Sales Executive',
  description: 'Enterprise B2B sales leader',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Michael Chen',
      professionalTitle: 'Senior Sales Executive',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/michaelchen',
      website: '',
      summary:
        'Results-driven Senior Sales Executive with 9+ years in enterprise B2B sales. Consistently exceeded quotas by 150%+. Expert in consultative selling, relationship management, and closing multi-million dollar SaaS deals.',
    },
    experience: [
      {
        id: '1',
        company: 'TechSolutions Enterprise',
        position: 'Senior Sales Executive',
        location: 'Chicago, IL',
        startDate: '2020-01',
        endDate: 'Present',
        current: true,
        achievements: [
          'Exceeded annual quota by 175%, generating $12.5M in new ARR across enterprise accounts',
          'Closed largest deal in company history ($2.8M contract) with Fortune 100 client',
          'Achieved 92% customer retention rate through strategic account management',
        ],
        technologies: ['Salesforce', 'HubSpot', 'Gong', 'Outreach'],
      },
      {
        id: '2',
        company: 'CloudCorp Inc',
        position: 'Account Executive',
        location: 'Chicago, IL',
        startDate: '2017-03',
        endDate: '2019-12',
        current: false,
        achievements: [
          'Ranked in top 5% of sales team, exceeding quota by average of 160%',
          'Generated $8.2M in revenue over 3 years across 40+ mid-market accounts',
          "Won President's Club award 3 consecutive years",
        ],
        technologies: ['Salesforce', 'ZoomInfo', 'DocuSign'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'University of Illinois',
        degree: 'Bachelor of Science',
        field: 'Business Administration',
        location: 'Champaign, IL',
        startDate: '2011-08',
        endDate: '2015-05',
        current: false,
        gpa: '3.6',
        honors: "Dean's List",
      },
    ],
    skills: [
      {
        category: 'Sales Skills',
        skills: [
          'Enterprise B2B Sales',
          'Account Management',
          'Contract Negotiation',
          'Pipeline Management',
        ],
      },
      {
        category: 'Sales Tools',
        skills: ['Salesforce CRM', 'HubSpot', 'LinkedIn Sales Navigator', 'Gong', 'Outreach'],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Enterprise Sales Playbook',
        description: 'Comprehensive sales methodology adopted company-wide.',
        role: 'Lead Author',
        technologies: ['MEDDIC', 'Challenger Sale'],
        highlights: ['Increased win rate from 22% to 38%', 'Reduced sales cycle by 25%'],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#f59e0b',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Registered Nurse Persona
const REGISTERED_NURSE: Persona = {
  id: 'registered-nurse',
  name: 'Registered Nurse',
  description: 'Critical care nurse with leadership experience',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Jennifer Rodriguez, RN, BSN',
      professionalTitle: 'Registered Nurse - Critical Care',
      email: 'jennifer.rodriguez@email.com',
      phone: '+1 (555) 234-8901',
      location: 'Houston, TX',
      linkedin: 'linkedin.com/in/jenniferrodriguez',
      website: '',
      summary:
        'Compassionate RN with 7+ years in critical care and emergency medicine. Expert in patient assessment, care planning, and interdisciplinary collaboration. BLS, ACLS, and PALS certified. Committed to exceptional patient outcomes.',
    },
    experience: [
      {
        id: '1',
        company: 'Memorial Hospital - Level I Trauma Center',
        position: 'Senior Critical Care Nurse',
        location: 'Houston, TX',
        startDate: '2019-06',
        endDate: 'Present',
        current: true,
        achievements: [
          'Provide advanced nursing care to 4-6 critically ill patients in 24-bed ICU',
          'Achieved 98% patient satisfaction score (target: 90%)',
          'Mentor 8 new graduate nurses through preceptorship program',
          'Led initiative reducing central line infections by 40%',
        ],
        technologies: ['Epic EMR', 'Ventilator Management', 'CRRT'],
      },
      {
        id: '2',
        company: 'City General Hospital',
        position: 'Emergency Department Nurse',
        location: 'Houston, TX',
        startDate: '2017-05',
        endDate: '2019-05',
        current: false,
        achievements: [
          'Triaged 30+ patients per shift in high-volume Level II ED',
          '100% compliance with trauma documentation and JCAHO standards',
          'Nurse of the Quarter award (Q3 2018)',
        ],
        technologies: ['Meditech', 'Trauma Protocols'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'UT Health Science Center',
        degree: 'Bachelor of Science in Nursing',
        field: 'Nursing (BSN)',
        location: 'Houston, TX',
        startDate: '2012-08',
        endDate: '2016-05',
        current: false,
        gpa: '3.7',
        honors: 'Cum Laude',
      },
    ],
    skills: [
      {
        category: 'Clinical Skills',
        skills: ['Critical Care', 'Patient Assessment', 'Ventilator Management', 'IV Therapy'],
      },
      {
        category: 'Certifications',
        skills: ['RN License (TX)', 'BLS', 'ACLS', 'PALS', 'TNCC'],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'CLABSI Prevention Initiative',
        description: 'Quality improvement project reducing central line infections.',
        role: 'Project Lead',
        technologies: ['Quality Improvement', 'Evidence-Based Practice'],
        highlights: ['Reduced CLABSI rate by 40%', 'Trained 45 ICU nurses'],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#06b6d4',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Financial Analyst Persona
const FINANCIAL_ANALYST: Persona = {
  id: 'financial-analyst',
  name: 'Financial Analyst',
  description: 'CFA with investment analysis expertise',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'David Kim, CFA',
      professionalTitle: 'Senior Financial Analyst',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/davidkim',
      website: '',
      summary:
        'CFA Charterholder with 6+ years in financial modeling, investment analysis, and strategic planning. Expert in valuation, forecasting, and data-driven decision making. Strong track record delivering insights that drive growth.',
    },
    experience: [
      {
        id: '1',
        company: 'Global Investment Partners',
        position: 'Senior Financial Analyst',
        location: 'New York, NY',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        achievements: [
          'Built models for $500M+ portfolio, achieving 18% returns (vs 12% benchmark)',
          'Led due diligence on 15+ acquisition targets supporting $200M investments',
          'Developed automated dashboard reducing monthly close by 40%',
        ],
        technologies: ['Excel', 'Bloomberg', 'Python', 'SQL', 'Tableau'],
      },
      {
        id: '2',
        company: 'TechVenture Capital',
        position: 'Investment Analyst',
        location: 'New York, NY',
        startDate: '2019-03',
        endDate: '2020-12',
        current: false,
        achievements: [
          'Analyzed 100+ early-stage tech companies for investment',
          'Built DCF and comparable company models for valuations',
          'Supported 8 successful investments totaling $75M',
        ],
        technologies: ['Excel', 'PitchBook', 'CapIQ', 'Python'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Columbia University',
        degree: 'Master of Business Administration',
        field: 'Finance',
        location: 'New York, NY',
        startDate: '2015-08',
        endDate: '2017-05',
        current: false,
        gpa: '3.8',
        honors: 'Beta Gamma Sigma',
      },
    ],
    skills: [
      {
        category: 'Financial Analysis',
        skills: [
          'Financial Modeling',
          'Valuation (DCF, Comps)',
          'Investment Analysis',
          'Forecasting',
        ],
      },
      {
        category: 'Technical Skills',
        skills: ['Excel & VBA', 'Python', 'SQL', 'Tableau', 'Bloomberg Terminal'],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Automated Financial Dashboard',
        description: 'Python dashboard automating monthly reporting.',
        role: 'Lead Developer',
        technologies: ['Python', 'Pandas', 'Tableau', 'SQL'],
        highlights: ['Reduced close from 10 to 6 days', 'Automated 50+ hours/month'],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#0ea5e9',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// High School Teacher Persona
const HIGH_SCHOOL_TEACHER: Persona = {
  id: 'high-school-teacher',
  name: 'High School Teacher',
  description: 'English teacher with curriculum expertise',
  data: {
    name: 'Sample Resume',
    personal: {
      fullName: 'Emily Thompson, M.Ed.',
      professionalTitle: 'High School English Teacher',
      email: 'emily.thompson@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Portland, OR',
      linkedin: 'linkedin.com/in/emilythompson',
      website: 'emilythompsonteaching.com',
      summary:
        'Passionate English Teacher with 8+ years inspiring students through literature and writing. M.Ed. with expertise in curriculum design, differentiated instruction, and technology integration. Committed to fostering critical thinking and academic excellence.',
    },
    experience: [
      {
        id: '1',
        company: 'Lincoln High School',
        position: 'Senior English Teacher & Dept Chair',
        location: 'Portland, OR',
        startDate: '2019-08',
        endDate: 'Present',
        current: true,
        achievements: [
          'Teach AP English Literature and Creative Writing to 125+ students',
          'Increased AP exam pass rate from 68% to 87%',
          'Lead 12-member English department coordinating curriculum',
          'Implemented project-based learning improving engagement 30%',
        ],
        technologies: ['Google Classroom', 'Canvas LMS', 'Turnitin'],
      },
      {
        id: '2',
        company: 'Roosevelt Middle School',
        position: 'English Language Arts Teacher',
        location: 'Portland, OR',
        startDate: '2016-08',
        endDate: '2019-06',
        current: false,
        achievements: [
          'Taught 6th-8th grade ELA to diverse learners including 15% ELL',
          'Developed differentiated curriculum for multiple reading levels',
          'Achieved 92% student growth vs 78% district average',
        ],
        technologies: ['Google Suite', 'Schoology', 'Newsela'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Portland State University',
        degree: 'Master of Education',
        field: 'Curriculum & Instruction',
        location: 'Portland, OR',
        startDate: '2017-08',
        endDate: '2019-06',
        current: false,
        gpa: '4.0',
        honors: 'Outstanding Graduate Student',
      },
    ],
    skills: [
      {
        category: 'Teaching Skills',
        skills: [
          'Lesson Planning',
          'Differentiated Instruction',
          'Classroom Management',
          'Assessment',
        ],
      },
      {
        category: 'Technology',
        skills: ['Google Classroom', 'Canvas LMS', 'Turnitin', 'CommonLit', 'Nearpod'],
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Community Writing Project',
        description: 'Students interviewed community members and published anthology.',
        role: 'Project Director',
        technologies: ['Project-Based Learning', 'Community Engagement'],
        highlights: [
          '85 students interviewed 60+ community members',
          'Published 200-page anthology',
        ],
      },
    ],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
    template: 'modern',
    theme: {
      primaryColor: '#a855f7',
      textColor: '#1f2937',
      headingColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Calibri',
      fontSize: 11,
      lineHeight: 1.5,
      spacing: 'normal',
    },
  },
}

// Export all personas
export const SAMPLE_PERSONAS: Record<PersonaType, Persona> = {
  'software-engineer': SOFTWARE_ENGINEER,
  'marketing-manager': MARKETING_MANAGER,
  'product-designer': PRODUCT_DESIGNER,
  'data-scientist': DATA_SCIENTIST,
  'sales-executive': SALES_EXECUTIVE,
  'registered-nurse': REGISTERED_NURSE,
  'financial-analyst': FINANCIAL_ANALYST,
  'high-school-teacher': HIGH_SCHOOL_TEACHER,
}

// Default persona
export const DEFAULT_PERSONA: PersonaType = 'software-engineer'
