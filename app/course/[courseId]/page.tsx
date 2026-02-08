'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseContent } from '@/data/catalog';
import CodeRunner from '@/components/CodeRunner';

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();

    // 1. Get the course ID from the URL (e.g., 'build-own-db')
    const courseId = params.courseId as string;
    const courseData = getCourseContent(courseId);

    // 2. Handle 404
    if (!courseData) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                <button onClick={() => router.push('/')} className="text-blue-400 hover:underline">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // 3. Render the Workspace
    // We pass the courseData into the Runner so it knows what to teach
    return <CodeRunner course={courseData} />;
}
