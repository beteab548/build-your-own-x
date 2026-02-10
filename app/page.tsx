'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { COURSE_CATALOG } from '../data/catalog';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const newProgress: Record<string, number> = {};
    COURSE_CATALOG.forEach(course => {
      const savedStep = localStorage.getItem(`step-${course.id}`);
      if (savedStep) {
        const stepIndex = parseInt(savedStep, 10);
        const percent = Math.min(100, Math.round((stepIndex / course.totalSteps) * 100));
        newProgress[course.id] = percent;
      } else {
        const savedFiles = localStorage.getItem(`progress-${course.id}`);
        if (savedFiles) {
          newProgress[course.id] = 10;
        }
      }
    });
    setProgress(newProgress);
  }, []);

  return (
    <div className="min-h-screen bg-[#030406] text-white font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
        <header className="mb-20 pt-10 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full glass glass-hover text-sm text-gray-400 cursor-pointer">
            <a href="https://github.com/codecrafters-io/build-your-own-x" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Inspired by</span>
              <span className="font-semibold text-white">Build Your Own X</span>
            </a>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
            Master Engineering <br />
            <span className="hero-gradient">from the Ground Up</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Skip the boilerplate. <span className="text-white font-medium">Build industry-standard tools</span> like
            Databases, Git, and Docker. Master the fundamentals by recreating them yourself.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-24 max-w-5xl mx-auto">
            {[
              { title: "Interactive Labs", desc: "Write and run code in a sandboxed Node.js environment directly in your browser.", color: "text-blue-400" },
              { title: "Real-world Tests", desc: "Validate your implementation against industry-standard test cases for instant feedback.", color: "text-indigo-400" },
              { title: "Zero Dependencies", desc: "Build everything from scratch using standard libraries to truly understand the 'how'.", color: "text-purple-400" }
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-2xl border-white/5 hover:border-white/10 transition-colors">
                <div className={`${feature.color} mb-3 font-semibold tracking-wide uppercase text-xs`}>{feature.title}</div>
                <p className="text-sm text-gray-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Available Path</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSE_CATALOG.map((course) => {
            const Icon = course.icon;
            const percentage = progress[course.id] || 0;
            const isCompleted = percentage >= 100;

            return (
              <Link
                href={`/course/${course.id}`}
                key={course.id}
                className="group glass relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden flex flex-col"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                    <span className="text-green-400 text-xs font-bold">✓ COMPLETED</span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${course.difficulty === 'Beginner' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                    course.difficulty === 'Intermediate' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                      'border-rose-500/30 text-rose-400 bg-rose-500/5'
                    }`}>
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-blue-400 transition-colors duration-500 relative z-10">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed font-light flex-grow relative z-10">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                    {course.totalSteps} Lessons
                  </span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    Join Path <ArrowRight size={18} />
                  </div>
                </div>

                {/* Progress Indicator */}
                {percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

