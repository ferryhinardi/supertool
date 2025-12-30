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

// Export all personas
export const SAMPLE_PERSONAS: Record<PersonaType, Persona> = {
  'software-engineer': SOFTWARE_ENGINEER,
  'marketing-manager': MARKETING_MANAGER,
  'product-designer': PRODUCT_DESIGNER,
  'data-scientist': DATA_SCIENTIST,
}

// Default persona
export const DEFAULT_PERSONA: PersonaType = 'software-engineer'
