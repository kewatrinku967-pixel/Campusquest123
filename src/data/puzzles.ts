import { PuzzleStage, Suspect, Expense, LeaderboardEntry } from '../types';

export const SUSPECTS: Suspect[] = [
  {
    id: 'mira',
    name: 'Mira Sharma',
    role: 'Media Club Lead',
    badge: 'M-04',
    avatarColor: 'from-pink-500 to-rose-600',
    imagePlaceholder: '📷',
    alibi: 'Claims she was editing video reels in the media suite from 14:00 to 14:45. However, terminal logs show activity under MIRA-02.',
    suspicionScore: 85
  },
  {
    id: 'kabir',
    name: 'Kabir Patel',
    role: 'Technical Club Member',
    badge: 'K-17',
    avatarColor: 'from-amber-500 to-orange-600',
    imagePlaceholder: '💻',
    alibi: 'Attending the Cloud Architecture seminar in Lecture Hall B from 14:00 to 15:00. Lost his access card earlier that afternoon.',
    suspicionScore: 40
  },
  {
    id: 'dev',
    name: 'Dev Malhotra',
    role: 'Event Coordinator',
    badge: 'D-22',
    avatarColor: 'from-blue-500 to-cyan-600',
    imagePlaceholder: '📋',
    alibi: 'In the campus cafeteria reviewing vendor invoices for the upcoming technical symposium.',
    suspicionScore: 25
  },
  {
    id: 'sana',
    name: 'Sana Farooqui',
    role: 'Student Council Rep',
    badge: 'S-09',
    avatarColor: 'from-emerald-500 to-teal-600',
    imagePlaceholder: '⚖️',
    alibi: 'Organizing stationery in the Council Office with two junior volunteers until 14:30.',
    suspicionScore: 20
  }
];

export const PUZZLE_STAGES: PuzzleStage[] = [
  {
    id: 1,
    stageNumber: 1,
    title: 'THE ENCRYPTED MESSAGE',
    subtitle: 'Decipher the deleted terminal memo',
    difficulty: 'Easy',
    points: 10,
    evidenceTitle: 'EVIDENCE 01: SCRAP OF A CIPHER NOTE',
    evidenceSnippet: 'DIFDL UIF UJNFTUBNQ',
    storyDescription: 'Investigators discovered a fragmented message discarded in the archive terminal drafts. A scribbled note beside the terminal screen states: "Every letter has moved one step forward (+1 shift). Reverse the movement to reveal the original directive."',
    evidenceType: 'cipher',
    evidenceDetails: {
      cipherText: 'DIFDL UIF UJNFTUBNQ',
      note: 'Every letter has moved one step forward. Reverse the movement to reveal the message.'
    },
    question: 'What crucial element should investigators examine first?',
    inputType: 'options',
    options: ['PASSWORD', 'TIMESTAMP', 'LOCATION', 'USERNAME'],
    correctAnswer: 'TIMESTAMP',
    hint: 'Each letter is shifted by +1 in the alphabet (D→C, I→H, F→E...). Shift each letter backward by 1 character.',
    hintPenaltyMinutes: 2,
    explanation: 'By shifting each character one step back in the English alphabet, "DIFDL UIF UJNFTUBNQ" decodes cleanly into "CHECK THE TIMESTAMP".'
  },
  {
    id: 2,
    stageNumber: 2,
    title: 'THE DIGITAL FOOTPRINT',
    subtitle: 'Audit the archive system event logs',
    difficulty: 'Easy–Medium',
    points: 15,
    evidenceTitle: 'EVIDENCE 02: SERVER ACCESS AUDIT TRAIL',
    evidenceSnippet: 'Log Entry #8841-B — Archive Vault Central Hub',
    storyDescription: 'The central file server recorded high-privilege operations between 14:00 and 14:30. The security monitor logs confirm Project Aster was modified and removed from the active directory at a precise timestamp.',
    evidenceType: 'logs',
    evidenceDetails: [
      { time: '14:03', event: 'Archive terminal session initiated', user: 'MIRA-02', ip: '192.168.1.104' },
      { time: '14:11', event: 'File opened: /confidential/PROJECT_ASTER.docx', user: 'SYSTEM_AUTORUN', ip: '192.168.1.104' },
      { time: '14:15', event: 'Action: FILE DELETED — Project Aster removed', user: 'ROOT_ANON', ip: '192.168.1.104' },
      { time: '14:19', event: 'Action: Recycle Bin purge request executed', user: 'ROOT_ANON', ip: '192.168.1.104' }
    ],
    question: 'What was the exact deletion time recorded in the audit log? (Enter 4 digits, e.g., 1415)',
    inputType: 'text',
    correctAnswer: '1415',
    hint: 'Look closely at the event row describing "Action: FILE DELETED — Project Aster removed". Enter the four-digit military time without colons.',
    hintPenaltyMinutes: 2,
    explanation: 'The server audit log records the exact deletion of Project Aster at 14:15 (four-digit code: 1415).'
  },
  {
    id: 3,
    stageNumber: 3,
    title: 'THE ACCESS CARD',
    subtitle: 'Cross-reference physical RFID door records',
    difficulty: 'Medium',
    points: 20,
    evidenceTitle: 'EVIDENCE 03: RFID VAULT TURNSTILE SCANNER',
    evidenceSnippet: 'Sensor #02-North Vault Door — Time Stamp 14:15:02',
    storyDescription: 'While the digital deletion was executed at 14:15, the magnetic archive vault door recorded a physical badge badge-tap at the exact same minute. Whose registered badge credential was recorded by the card reader?',
    evidenceType: 'badge_scanner',
    evidenceDetails: {
      scanTime: '14:15:02',
      badgeId: 'K-17',
      scannerUnit: 'North Vault RFID Door Turnstile',
      badgeRegister: [
        { name: 'Mira Sharma', role: 'Media Club', badge: 'M-04' },
        { name: 'Kabir Patel', role: 'Technical Club', badge: 'K-17' },
        { name: 'Dev Malhotra', role: 'Event Coordinator', badge: 'D-22' },
        { name: 'Sana Farooqui', role: 'Student Council', badge: 'S-09' }
      ]
    },
    question: 'Whose registered badge was logged at the archive turnstile at 14:15?',
    inputType: 'options',
    options: ['MIRA', 'KABIR', 'DEV', 'SANA'],
    correctAnswer: 'KABIR',
    hint: 'Check the badge code scanned (K-17) and match it to the official suspect badge directory.',
    hintPenaltyMinutes: 2,
    explanation: 'Badge K-17 belongs to Kabir Patel according to the registry. Note: In real forensic detective work, a badge scan only proves the card was present, not necessarily its owner!'
  },
  {
    id: 4,
    stageNumber: 4,
    title: 'THE LOST BADGE',
    subtitle: 'Investigate the campus security incident dispatch',
    difficulty: 'Medium–Hard',
    points: 25,
    evidenceTitle: 'EVIDENCE 04: CAMPUS SECURITY DESK DISPATCH REPORT',
    evidenceSnippet: 'Security Incident Log Ref #IR-0922',
    storyDescription: 'Before jumping to conclusions regarding Kabir, detectives recovered official campus security incident logs filed earlier that afternoon. A critical report turns the case upside down.',
    evidenceType: 'police_report',
    evidenceDetails: {
      reportId: 'IR-0922',
      reporterName: 'Kabir Patel (ID #2024-ENG-089)',
      badgeReported: 'K-17 (Student NFC RFID)',
      submissionTime: '13:50:18 (25 mins before archive incident)',
      officerNotes: 'Student Kabir reported dropping his badge near the canteen coffee kiosk around 13:30. Badge marked Missing/Unrecovered.',
      additionalWitness: 'Seminar Attendance Biometrics: Kabir clocked into Lecture Hall B Seminar at 14:10.'
    },
    question: 'What was the official recorded status of badge K-17 before Project Aster disappeared?',
    inputType: 'options',
    options: ['ACTIVE', 'MISSING', 'BLOCKED', 'REPLACED'],
    correctAnswer: 'MISSING',
    hint: 'Read the security incident submission timestamp and the officer notes regarding the card condition at 13:50.',
    hintPenaltyMinutes: 2,
    explanation: 'Kabir submitted a lost property report at 13:50—a full 25 minutes prior to the 14:15 incident. The badge status was officially MISSING. Furthermore, Kabir was documented attending a seminar in Lecture Hall B at 14:10, exonerating him and proving someone weaponized his lost badge as a decoy!'
  },
  {
    id: 5,
    stageNumber: 5,
    title: 'THE FINAL VERDICT',
    subtitle: 'Unmask the culprit and locate the stolen file',
    difficulty: 'Final Challenge',
    points: 30,
    evidenceTitle: 'EVIDENCE 05: TWO-FACTOR NETWORK FORENSICS & RECOVERY AUDIT',
    evidenceSnippet: 'Forensic Packet Capture & Push Notification Token Trace',
    storyDescription: 'Forensic investigators analyzed the encrypted network payload during the file deletion. The archive terminal required a biometric 2-Factor Authentication prompt sent directly to the account holder\'s registered mobile device. Only one suspect approved that prompt!',
    evidenceType: 'two_factor_audit',
    evidenceDetails: {
      accountActivity: [
        { time: '14:12', user: 'MIRA-02', terminal: 'Lab Terminal 4', action: 'Remote Login Initiated' },
        { time: '14:13', user: 'MIRA-02', device: 'iPhone 15 Pro (Mira)', action: '2FA Push Approved via FaceID' },
        { time: '14:14', user: 'MIRA-02', action: 'Project Aster opened & renamed' },
        { time: '14:16', user: 'MIRA-02', action: 'Transfer payload rerouted to directory: ARCHIVE_DRAFTS' }
      ],
      forensicConclusion: 'The door scan with Kabir\'s lost badge was a staged decoy. The true digital theft and transfer was authorized directly from Mira Sharma\'s personal device.'
    },
    question: 'PART 1: Identify the true perpetrator behind the disappearance:',
    question2: 'PART 2: Identify the secret destination folder where Project Aster was hidden:',
    inputType: 'two_part',
    options: ['MIRA', 'KABIR', 'DEV', 'SANA'],
    options2: ['RECYCLE_BIN', 'ARCHIVE_DRAFTS', 'SHARED_FILES', 'DOWNLOADS'],
    correctAnswer: 'MIRA',
    correctAnswer2: 'ARCHIVE_DRAFTS',
    hint: 'Check which user authorized the 2FA push on their personal mobile device at 14:13, and examine the directory path in the 14:16 transfer log.',
    hintPenaltyMinutes: 2,
    explanation: 'Mira Sharma found Kabir\'s misplaced card and used it at the door to frame him. But the system\'s mandatory 2FA required authorization on her personal phone at 14:13! The file was not deleted, but covertly stashed away in ARCHIVE_DRAFTS to protect an unreleased project draft. CASE CLOSED!'
  }
];

// Clean initial state for real launch: zero demo expenses and zero demo leaderboard records
export const INITIAL_EXPENSES: Expense[] = [];

export const SEED_LEADERBOARD: LeaderboardEntry[] = [];

// Optional sample catalog retained strictly for development reference or test fixtures
export const DEMO_SAMPLE_EXPENSES: Expense[] = [
  { id: 'exp-demo-1', title: 'Winner Prize (1st Place)', category: 'Prizes' as const, amount: 150, date: '2026-11-15' },
  { id: 'exp-demo-2', title: 'Runner-Up Prize (2nd Place)', category: 'Prizes' as const, amount: 100, date: '2026-11-15' },
  { id: 'exp-demo-3', title: 'Posters & QR Code Printing', category: 'Print & Media' as const, amount: 50, date: '2026-11-16' },
  { id: 'exp-demo-4', title: 'Internet & Data Hotspot', category: 'Internet & Ops' as const, amount: 100, date: '2026-11-16' },
  { id: 'exp-demo-5', title: 'Campus Marketing & WhatsApp Promo', category: 'Marketing' as const, amount: 50, date: '2026-11-16' },
  { id: 'exp-demo-6', title: 'Operational Contingency Reserve', category: 'Contingency' as const, amount: 150, date: '2026-11-16' }
];

export const DEMO_SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, teamId: 'CQ-8812', teamName: 'Cipher Detectives', score: 100, durationSeconds: 1122, durationFormatted: '18:42', stagesCompleted: 5, finishedAt: '10:45 AM' },
  { rank: 2, teamId: 'CQ-7204', teamName: 'Mystery Squad', score: 85, durationSeconds: 1275, durationFormatted: '21:15', stagesCompleted: 4, finishedAt: '10:52 AM' },
  { rank: 3, teamId: 'CQ-9301', teamName: 'Shadow Bureau', score: 70, durationSeconds: 1470, durationFormatted: '24:30', stagesCompleted: 3, finishedAt: '11:05 AM' },
  { rank: 4, teamId: 'CQ-6150', teamName: 'Quantum Enigma', score: 70, durationSeconds: 1580, durationFormatted: '26:20', stagesCompleted: 3, finishedAt: '11:12 AM' },
  { rank: 5, teamId: 'CQ-4419', teamName: 'The Baker Street Boys', score: 45, durationSeconds: 1710, durationFormatted: '28:30', stagesCompleted: 2, finishedAt: '11:20 AM' }
];
