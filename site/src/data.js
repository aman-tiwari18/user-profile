export const profile = {
  name: 'Aman Tiwari',
  role: 'Software Engineer',
  org: 'CDIS · IIT Kanpur',
  location: 'Kanpur, India',
  email: 'amantiwariald18@gmail.com',
  phone: '+91-7737102386',
  github: 'https://github.com/aman-tiwari18',
  linkedin: 'https://linkedin.com/in/amantiwari18',
  resume: './Resume_Aman_Tiwari.pdf',
  roles: [
    'Backend Engineer',
    'Full-Stack Developer',
    'Real-time Vision Pipelines',
    'Search & Analytics at Scale',
  ],
  tagline:
    'I build backends, real-time AI video pipelines, search systems and the dashboards that make sense of millions of records.',
}

export const stats = [
  { value: 100000, suffix: '+', label: 'concurrent camera streams the exam-surveillance fleet is architected to scale to' },
  { value: 5, suffix: 'M', prefix: '~', label: 'consumer grievances (2016–2025) searchable by meaning, not just keywords' },
  { value: 3, label: 'production repos I work across: React dashboard, Node.js API, Python GPU worker' },
  { value: 2, suffix: '+ yrs', label: 'shipping production software across healthcare SaaS and government platforms' },
]

export const experience = [
  {
    version: 'v3.0.0',
    codename: 'intelligent-systems',
    current: true,
    company: 'Center for Developing Intelligent Systems, IIT Kanpur',
    role: 'Software Engineer',
    period: 'Oct 2025 — Present',
    location: 'Kanpur, India',
    summary: 'Two production systems for government: an AI exam-surveillance platform for national recruitment exams, and a consumer-grievance intelligence platform over ~5M complaints.',
    changes: [
      { type: 'perf', scope: 'streams', text: 'Re-architected camera ingestion from round-robin open/grab/close (each camera seen once every 13–65 min) to kept-open substreams with per-camera time slots, on a horizontally scaling GPU worker fleet architected for 1,00,000+ concurrent streams.' },
      { type: 'feat', scope: 'sessions', text: 'One shift session per exam · shift · day, so a camera opens once even when 8 detection scripts use it. Later scripts merge into the running session.' },
      { type: 'ml', scope: 'vision', text: 'Detector processes for fine-tuned YOLO person, phone and RF-DETR monitor models behind crowd, invigilator, proximity, phone and tampering analytics, with vLLM scene classification deciding each camera’s type and accessibility.' },
      { type: 'perf', scope: 'backpressure', text: '2-hit confirmation, per-analytic cooldowns, adaptive interval stretching when detector queues pass 75% and jittered reconnects for dropped streams.' },
      { type: 'feat', scope: 'realtime', text: 'Node.js/Express + socket.io detection feed to a React operator dashboard; operators push verified alerts to a client portal, with SMS for serious events.' },
      { type: 'infra', scope: 'fleet', text: 'Worker fleet with one-time-token join, heartbeats, work leases that split cameras across GPUs, Prometheus GPU monitoring and Docker CI to GHCR.' },
      { type: 'feat', scope: 'grievance', text: 'FastAPI platform over ~5M complaints: Elasticsearch keyword, semantic (768-dim vectors) and hybrid search with state/district spatial analysis.' },
      { type: 'ml', scope: 'insights', text: 'BERTopic root-cause analysis with a precomputed RCA cache, LLM-generated sub-categories, and week-over-baseline category alerts for rising complaint trends.' },
      { type: 'feat', scope: 'ui', text: 'React + Redux Toolkit dashboard with treemap drill-down, Leaflet state and district choropleths, ApexCharts and JWT-secured APIs.' },
    ],
    tags: ['Python', 'FastAPI', 'Node.js', 'socket.io', 'React', 'Elasticsearch', 'MySQL', 'YOLO', 'vLLM', 'Docker', 'Prometheus'],
  },
  {
    version: 'v2.0.0',
    codename: 'healthcare-at-scale',
    company: 'Cappsule',
    role: 'Full Stack Developer',
    period: 'Jun 2024 — Jul 2025',
    location: 'Remote',
    summary: 'Backend and dashboards for healthcare and pharmacy workflows.',
    changes: [
      { type: 'feat', scope: 'api', text: 'RESTful APIs in Node.js + Express.js for healthcare and pharmacy workflow systems.' },
      { type: 'security', scope: 'auth', text: 'Role-Based Access Control (RBAC) securing backend services and enforcing access policies.' },
      { type: 'feat', scope: 'ui', text: 'React.js dashboards and forms wired to backend APIs for operational data management.' },
      { type: 'infra', scope: 'ci', text: 'CI/CD automation with Docker and GitHub Actions for streamlined deployments.' },
    ],
    tags: ['Node.js', 'Express', 'RBAC', 'React', 'Docker', 'GitHub Actions'],
  },
  {
    version: 'v1.0.0',
    codename: 'first-production',
    company: 'Linsible Technologies',
    role: 'Full Stack Developer Intern',
    period: 'Feb 2024 — May 2024',
    location: 'Remote',
    summary: 'First production backend work, on healthcare applications.',
    changes: [
      { type: 'feat', scope: 'api', text: 'Backend APIs with Node.js, Express.js and PostgreSQL for healthcare applications.' },
      { type: 'perf', scope: 'search', text: 'Redis caching plus Elasticsearch/OpenSearch search to speed up data retrieval.' },
    ],
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'OpenSearch'],
  },
]

export const education = {
  school: 'Bundelkhand Institute of Engineering and Technology',
  degree: 'B.Tech, Electronics and Communication Engineering',
  period: '2019 — 2023',
  location: 'Jhansi, India',
  focus: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'C++'],
}

export const skills = {
  Languages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'],
  Backend: ['FastAPI', 'Node.js', 'Express.js', 'Sequelize', 'SQLAlchemy', 'socket.io', 'JWT / OAuth2', 'RBAC'],
  Frontend: ['React', 'Redux Toolkit', 'MUI', 'ApexCharts', 'D3', 'Leaflet', 'Tailwind CSS'],
  'Data & Search': ['Elasticsearch (BM25 + kNN)', 'MySQL', 'PostgreSQL', 'Redis'],
  'AI & Vision': ['YOLO', 'RF-DETR', 'vLLM', 'BERTopic', 'Sentence embeddings', 'Ollama / Llama'],
  'Video': ['RTSP', 'HLS', 'Multiprocessing pipelines'],
  'DevOps': ['Docker', 'GitHub Actions', 'GHCR', 'pm2', 'Prometheus', 'Linux', 'Apache'],
}

export const sphereWords = [
  'Python', 'FastAPI', 'Node.js', 'React', 'TypeScript', 'socket.io', 'Elasticsearch',
  'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'YOLO', 'RF-DETR', 'vLLM', 'BERTopic',
  'Prometheus', 'Express', 'Redux', 'MUI', 'D3', 'Leaflet', 'RTSP', 'HLS', 'kNN',
  'JWT', 'Linux', 'GitHub Actions', 'Sequelize', 'C++',
]

/* ---------- case studies ---------- */

export const caseStudies = [
  {
    id: 'cctv',
    kicker: 'CDIS · IIT Kanpur · production',
    title: 'Exam CCTV Intelligence',
    oneLiner: 'Watches every exam-centre camera during each exam shift, runs AI detections on live video, and routes verified alerts from operators to the client and over SMS.',
    accent: '#ff4b3e',
    metrics: [
      { v: '1,00,000+', l: 'concurrent streams the fleet is architected for' },
      { v: '2 s', l: 'detection → operator dashboard' },
      { v: '10 s', l: '2-hit confirmation window' },
      { v: '3', l: 'repos: GPU worker · API · dashboard' },
    ],
    sections: [
      {
        h: 'The problem',
        p: 'Recruitment exams run in shifts across hundreds of centres, each with DVR-backed CCTV. The old pipeline opened a stream, grabbed two frames and closed it. One process covered about 22 cameras a minute, so on big runs each camera was looked at once every 13 to 65 minutes. That is too slow to catch anything that matters.',
      },
      {
        h: 'What I built',
        list: [
          'Shift sessions: one per exam · shift · day. Every detection script in that shift shares the session, so a camera opens once even when 8 scripts need it, and late scripts merge in.',
          'Kept-open substreams: one producer process per camera reads every frame to keep the stream warm but decodes only the frames it hands on. Streams open 3 min before a camera is needed and close 2 min after its last window.',
          'Slot scheduling: each camera gets a fixed slot in each interval, so frames reach the GPUs as an even trickle instead of bursts. Analytics with the same interval share one frame and one model run.',
          'Detector processes: person model ×2, phone ×1, monitor ×2, so a slow model never blocks the others. Low-res 352×288 frames are upscaled because every rule was tuned on 1280 px.',
          'Reliability: 2 hits in a row to confirm (the second frame 10 s later), per-analytic cooldowns, intervals that stretch up to ×4 when queues pass 75%, frames older than 20 s dropped, and jittered reconnects with backoff.',
          'A shared login-token service so hundreds of streams on a server reuse one relay login instead of each logging in.',
        ],
      },
      {
        h: 'From pixel to alert',
        p: 'Detections land in MySQL with the alert image. The Node.js backend reads new rows every 2 s and pushes them over socket.io to the React operator dashboard. Operators push, skip or remove each alert (with undo). Pushed alerts reach the client portal and client API, and serious types (invigilator absence, phones, server-room overcrowding, intruders, proximity) also go out by SMS.',
      },
      {
        h: 'Built to scale out',
        p: 'Capacity grows by adding GPU workers, not by rewriting anything. Workers join the fleet with a one-time token, download models, register and send heartbeats; the backend marks silent workers dead, hands out work leases that split cameras fairly across live workers, and stays the single authority for stopping scripts. The design target is 1,00,000+ concurrent camera streams. CI builds the worker image, pushes it to GHCR and restarts containers, and Prometheus tracks GPU and system health across the fleet.',
      },
    ],
    analytics: ['Crowd (entry / biometric)', 'Crowd < 5', 'Zero person', 'Invigilator absent / static', 'Close proximity', 'Mobile phone', 'Monitor tampering', 'Camera tampering', 'Camera inversion', 'Blind spot', 'Server-room threshold', 'Intruder', 'Strong-room movement', 'QP box', 'Improper furniture', 'Entry / exit', 'Scene classification (vLLM)'],
    stack: ['Python', 'multiprocessing', 'YOLO', 'RF-DETR', 'vLLM', 'Node.js', 'Express', 'Sequelize', 'socket.io', 'React', 'Vite', 'MUI', 'MySQL', 'Redis', 'Docker', 'Prometheus'],
  },
  {
    id: 'grievance',
    kicker: 'CDIS · IIT Kanpur · production',
    title: 'Consumer Grievance Intelligence',
    oneLiner: 'Search, root-cause analysis and early-warning alerts over ~5M consumer complaints (2016–2025), built so analysts can ask what people complain about, where, and what is spiking.',
    accent: '#ffb000',
    metrics: [
      { v: '~5M', l: 'complaints, 2016–2025' },
      { v: '768-d', l: 'embedding per complaint' },
      { v: '3', l: 'search modes: keyword · semantic · hybrid' },
      { v: '15', l: 'top-level categories with drill-down' },
    ],
    sections: [
      {
        h: 'The problem',
        p: 'Millions of free-text complaints in many styles and languages. Keyword search misses most of what matters, and analysts need answers like "what is driving complaints in this sector this quarter" and "which category spiked last week", not a list of rows.',
      },
      {
        h: 'What I built',
        list: [
          'Ingestion: complaints come from MySQL into Elasticsearch with a 768-dim sentence embedding per complaint, indexed for cosine kNN.',
          'Search in three modes: field-weighted BM25 keyword, semantic vector search, and hybrid. A relevance slider lets analysts trade recall for precision, and they can search within a cluster.',
          'Spatial analysis: any query can be broken down by state and district for choropleth maps.',
          'Root-cause analysis: BERTopic over the stored embeddings clusters complaints into themes. A precomputed RCA cache, keyed by ministry and date range, matches the nearest cached window and merges similar topics level by level, so RCA comes back almost instantly instead of re-fitting models.',
          'AI categories: an LLM (Llama via Ollama) proposes sub-categories for each top-level category from sampled complaints, which feeds the treemap explorer.',
          'Category alerts: each category’s last-week daily rate against its 12-week baseline, labelled HIGH, MEDIUM or NORMAL.',
        ],
      },
      {
        h: 'The dashboard',
        p: 'React 19 + Redux Toolkit + MUI: a category explorer (treemap drill-down → complaint table), a semantic search page with a Leaflet state and district choropleth, category-alert charts in ApexCharts, D3 views, CSV export and search history. All APIs sit behind JWT/OAuth2 with hashed credentials, and run in Docker behind an Apache reverse proxy.',
      },
    ],
    stack: ['FastAPI', 'Python', 'Elasticsearch', 'MySQL', 'SQLAlchemy', 'sentence-transformers', 'BERTopic', 'Ollama / Llama', 'JWT', 'React 19', 'Redux Toolkit', 'MUI', 'Leaflet', 'D3', 'ApexCharts', 'Docker'],
  },
]

// Illustrative values only: shows the shape of the category-alert view, not real figures.
export const categoryAlertDemo = [
  { cat: 'Housing', base: 12, week: 33 },
  { cat: 'Financial services', base: 18, week: 41 },
  { cat: 'E-commerce', base: 20, week: 38 },
  { cat: 'Telecom', base: 15, week: 24 },
  { cat: 'Consumer goods', base: 14, week: 19 },
  { cat: 'Public utilities', base: 7, week: 9 },
  { cat: 'Healthcare', base: 6, week: 6.4 },
  { cat: 'Education', base: 4, week: 3.8 },
]
