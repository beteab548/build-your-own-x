import { LucideIcon, Database, Terminal, Cpu } from 'lucide-react';
import { COURSE as DB_COURSE } from './courses/database';

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
        totalSteps: 5, // Placeholder
    },
    {
        id: 'build-own-ml',
        title: 'Build Your Own ML Model',
        description: 'Understand neurons, weights, and biases by building a neural network in Python.',
        icon: Cpu,
        difficulty: 'Advanced',
        totalSteps: 8, // Placeholder
    }
];

// Helper to get full content (we will use this later)
export function getCourseContent(id: string) {
    if (id === 'build-own-db') return DB_COURSE;
    // if (id === 'build-own-cli') return CLI_COURSE;
    return null;
}
