import { z } from 'zod';
import { ParticipationCategory, TimerPresetKey } from '../types';

export const TIMER_PRESETS: Record<TimerPresetKey, {
  id: TimerPresetKey;
  name: string;
  badge: string;
  description: string;
  durations: { single: number; duo: number; tribe: number }; // minutes
}> = {
  option_a: {
    id: 'option_a',
    name: 'Option A — Fast Challenge',
    badge: '⚡ FAST',
    description: 'High-intensity sprint for fast solvers',
    durations: { single: 15, duo: 25, tribe: 40 }
  },
  option_b: {
    id: 'option_b',
    name: 'Option B — Standard Challenge',
    badge: '🎯 STANDARD',
    description: 'Balanced collegiate fest tournament time limit',
    durations: { single: 20, duo: 30, tribe: 45 }
  },
  option_c: {
    id: 'option_c',
    name: 'Option C — Extended Challenge',
    badge: '🧩 EXTENDED',
    description: 'Deep-thinking puzzle & riddle marathon',
    durations: { single: 25, duo: 40, tribe: 60 }
  }
};

export const SURPRISE_PRIZE_MESSAGE = 'Exciting Surprise Prizes Await! Complete the challenge and discover your reward at the event.';

export const CATEGORY_SPECS = {
  single: {
    category: 'single' as ParticipationCategory,
    title: 'SINGLE ENTRY',
    badge: '1 DETECTIVE',
    minPlayers: 1,
    maxPlayers: 1,
    questionCount: 10,
    difficultyLabel: 'Moderate Difficulty',
    feeRupees: 70,
    feePaise: 7000,
    feeStructure: '₹70 Flat Entry Fee',
    maxScore: 100, // 10 * 10
    pointsPerQuestion: 10
  },
  duo: {
    category: 'duo' as ParticipationCategory,
    title: 'DUO CO-OP',
    badge: '2 DETECTIVES',
    minPlayers: 2,
    maxPlayers: 2,
    questionCount: 20,
    difficultyLabel: 'Little-Hard Difficulty',
    feeRupees: 70, // Exactly ₹70 for the team, NOT per person!
    feePaise: 7000,
    feeStructure: '₹70 For Entire Duo Team',
    maxScore: 100, // 20 * 5
    pointsPerQuestion: 5
  },
  tribe: {
    category: 'tribe' as ParticipationCategory,
    title: 'TRIBE SQUAD',
    badge: '3–5 DETECTIVES',
    minPlayers: 3,
    maxPlayers: 5,
    questionCount: 30,
    difficultyLabel: 'Hard Difficulty',
    feePerPersonRupees: 50,
    feePerPersonPaise: 5000,
    feeStructure: '₹50 Per Person (₹150 to ₹250)',
    maxScore: 300, // 30 * 10
    pointsPerQuestion: 10
  }
};

/**
 * Server-side & validator pricing calculation.
 * Never trust amount sent by frontend.
 */
export function calculateCategoryPrice(category: ParticipationCategory, playerCount: number): {
  amountRupees: number;
  amountPaise: number;
  error?: string;
} {
  if (category === 'single') {
    if (playerCount !== 1) {
      return { amountRupees: 0, amountPaise: 0, error: 'Single category must have exactly 1 participant.' };
    }
    return { amountRupees: 70, amountPaise: 7000 };
  }

  if (category === 'duo') {
    if (playerCount !== 2) {
      return { amountRupees: 0, amountPaise: 0, error: 'Duo category must have exactly 2 participants.' };
    }
    return { amountRupees: 70, amountPaise: 7000 };
  }

  if (category === 'tribe') {
    if (playerCount < 3 || playerCount > 5) {
      return { amountRupees: 0, amountPaise: 0, error: 'Tribe category must have between 3 and 5 participants.' };
    }
    const rupees = playerCount * 50;
    return { amountRupees: rupees, amountPaise: rupees * 100 };
  }

  return { amountRupees: 0, amountPaise: 0, error: 'Invalid participation category.' };
}

// Zod Schema for Registration Form validation
export const teamRegistrationSchema = z.object({
  teamName: z.string().min(2, 'Team name must be at least 2 characters').max(60, 'Team name too long'),
  category: z.enum(['single', 'duo', 'tribe'], {
    message: 'Please select a participation category'
  }),
  leaderName: z.string().min(2, 'Leader full name is required'),
  leaderEmail: z.string().email('Valid email address is required'),
  leaderPhone: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  college: z.string().min(2, 'College/Institution name is required'),
  department: z.string().optional().default('General'),
  members: z.array(z.string()).min(1, 'At least 1 member is required'),
  paymentRef: z.string().min(8, 'Valid UPI Transaction Reference / UTR ID is required').max(30),
  paymentScreenshot: z.string().optional()
}).superRefine((data, ctx) => {
  const memberCount = data.members.filter(m => m.trim().length > 0).length;

  if (data.category === 'single' && memberCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Single entry must have exactly 1 participant.',
      path: ['members']
    });
  }

  if (data.category === 'duo' && memberCount !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Duo entry must have exactly 2 participants.',
      path: ['members']
    });
  }

  if (data.category === 'tribe' && (memberCount < 3 || memberCount > 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tribe squad must have between 3 and 5 participants.',
      path: ['members']
    });
  }
});
