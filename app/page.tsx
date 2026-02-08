'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { COURSE_CATALOG } from '../data/catalog';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  // Load progress from LocalStorage
  useEffect(() => {
    const newProgress: Record<string, number> = {};

    COURSE_CATALOG.forEach(course => {
      // We save progress as "progress-{courseId}" (files) and "step-{courseId}" (level)
      const savedStep = localStorage.getItem(`step-${course.id}`);
      if (savedStep) {
        const stepIndex = parseInt(savedStep, 10);
        // Calculate percentage: (currentStep / totalSteps) * 100
        // We add 1 to stepIndex because it's 0-indexed, but for progress "Step 1 of 3" is 33% complete?
        // Actually, usually "completed" means finishing the step. 
        // Let's say being ON step 2 of 3 means you finished step 1.
        // So progress = (stepIndex / totalSteps) * 100
        const percent = Math.min(100, Math.round((stepIndex / course.totalSteps) * 100));
        newProgress[course.id] = percent;
      } else {
        // Check if file progress exists (started but maybe step 0)
        const savedFiles = localStorage.getItem(`progress-${course.id}`);
        if (savedFiles) {
          newProgress[course.id] = 10; // 10% for just starting
        }
      }
    });

    setProgress(newProgress);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <header className="mb-12 max-w-5xl mx-auto text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-gray-400 hover:border-gray-700 hover:text-white transition-colors cursor-pointer">
          <a href="https://github.com/codecrafters-io/build-your-own-x" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <span>Based on the famous</span>
            <span className="font-bold text-blue-400">Build Your Own X</span>
            <span>repository</span>
          </a>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Master Engineering<br />by Building from Scratch
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Forget passive tutorials. <span className="text-gray-200 font-semibold">Build real tools</span> like Databases,
          Docker, and Git right in your browser. Experience the "Aha!" moments of engineering.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-16">
          <div className="bg-[#111] p-5 rounded-lg border border-gray-800">
            <div className="text-blue-500 mb-2 font-bold">Interactive Environment</div>
            <p className="text-sm text-gray-500">No setup required. Write code in a real Node.js environment directly in your browser.</p>
          </div>
          <div className="bg-[#111] p-5 rounded-lg border border-gray-800">
            <div className="text-purple-500 mb-2 font-bold">Instant Feedback</div>
            <p className="text-sm text-gray-500">Run your code against real test cases. Get immediate validation on every step.</p>
          </div>
          <div className="bg-[#111] p-5 rounded-lg border border-gray-800">
            <div className="text-pink-500 mb-2 font-bold">Deep Understanding</div>
            <p className="text-sm text-gray-500">Don't just use tools—build them. Understand the magic behind the abstractions.</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-16"></div>

        <h2 className="text-2xl font-bold mb-8 text-left">Available Courses</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {COURSE_CATALOG.map((course) => {
          const Icon = course.icon;
          return (
            <Link
              href={`/course/${course.id}`}
              key={course.id}
              className="group relative bg-[#111] border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] overflow-hidden"
            >
              {/* Icon Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-900 rounded-lg group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors">
                  <Icon size={24} />
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${course.difficulty === 'Beginner' ? 'border-green-900 text-green-400 bg-green-900/10' :
                  course.difficulty === 'Intermediate' ? 'border-yellow-900 text-yellow-400 bg-yellow-900/10' :
                    'border-red-900 text-red-400 bg-red-900/10'
                  }`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Text */}
              <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {course.title}
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Footer / Progress */}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-xs text-gray-500">
                  {course.totalSteps} Lessons
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                  Start Building <ArrowRight size={16} />
                </div>
              </div>

              {/* Progress Bar (Fake for now) */}
              {progress[course.id] > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-600" style={{ width: `${progress[course.id]}%` }}></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

