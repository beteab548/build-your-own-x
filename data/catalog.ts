import { LucideIcon, Database, Terminal, Cpu, GitBranch, Server } from 'lucide-react';
import { COURSE as DB_COURSE } from './courses/database';
import { COURSE as CLI_COURSE } from './courses/cli';
import { COURSE as GIT_COURSE } from './courses/git';
import { COURSE as REDIS_COURSE } from './courses/redis';
import { COURSE as ML_COURSE } from './courses/ml';

export type CourseSummary = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    totalSteps: number;
};

export const COURSE_CATALOG: CourseSummary[] = [
    {
        id: 'build-own-db',
        title: 'Build Your Own Database',
        description: 'Learn file systems, data persistence, and hashing by building a key-value store from scratch.',
        icon: Database,
        difficulty: 'Intermediate',
        totalSteps: DB_COURSE.steps.length,
    },
    {
        id: 'build-own-cli',
        title: 'Build Your Own CLI Tool',
        description: 'Create a command-line interface like "git" or "npm" using Node.js and argument parsing.',
        icon: Terminal,
        difficulty: 'Beginner',
        totalSteps: CLI_COURSE.steps.length,
    },
    {
        id: 'build-own-git',
        title: 'Build Your Own Git',
        description: 'Master binary data, hashing (SHA-1), and zlib compression by building Git from scratch.',
        icon: GitBranch,
        difficulty: 'Advanced',
        totalSteps: GIT_COURSE.steps.length,
    },
    {
        id: 'build-own-redis',
        title: 'Build Your Own Redis',
        description: 'Understand networking (TCP), protocols (RESP), and in-memory storage.',
        icon: Server,
        difficulty: 'Intermediate',
        totalSteps: REDIS_COURSE.steps.length,
    },
    {
        id: 'build-own-ml',
        title: 'Build Your Own ML Model',
        description: 'Understand neurons, weights, and biases by building a neural network from scratch.',
        icon: Cpu,
        difficulty: 'Advanced',
        totalSteps: ML_COURSE.steps.length,
    }
];

// Helper to get full content (we will use this later)
export function getCourseContent(id: string) {
    if (id === 'build-own-db') return DB_COURSE;
    if (id === 'build-own-cli') return CLI_COURSE;
    if (id === 'build-own-git') return GIT_COURSE;
    if (id === 'build-own-redis') return REDIS_COURSE;
    if (id === 'build-own-ml') return ML_COURSE;
    return null;
}
