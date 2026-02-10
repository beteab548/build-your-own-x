'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getWebContainer } from '../lib/webcontainer';
import { WebContainer } from '@webcontainer/api';
import Split from 'react-split';
import CodeEditor from './Editor';
import ReactMarkdown from 'react-markdown';
import { Step } from '../data/courses/database';
import ExportButton from './ExportButton';
import { findHints, getCourseHints } from '../lib/hints';
import CompletionCertificate from './CompletionCertificate';

type FileMap = Record<string, { code: string }>;

interface CodeRunnerProps {
  course: {
    id: string;
    title: string;
    steps: Step[];
  };
}

export default function CodeRunner({ course }: CodeRunnerProps) {
  const [mounted, setMounted] = useState(false);
  const [output, setOutput] = useState("");
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [activeFile, setActiveFile] = useState<string>('index.js');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = course.steps[currentStepIndex];
  const currentProcessRef = useRef<any>(null);
  const hasMountedFS = useRef(false);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);

  // Initialize files state - conditionally to avoid hydration mismatch, 
  // but simpler to use useEffect for load.
  // Actually, for SSR safety, better to initialize with default then effect load.
  // But to stick to the plan:
  const [files, setFiles] = useState<FileMap>(() =>
    structuredClone(course.steps[0].initialFiles!)
  );

  useEffect(() => setMounted(true), []);

  // Boot Node.js
  useEffect(() => {
    async function boot() {
      setIsBooting(true);
      try {
        const instance = await getWebContainer();
        setWebContainer(instance);
      } catch (err) {
        console.error("Boot failed:", err);
      } finally {
        setBootProgress(100);
        setTimeout(() => {
          setIsBooting(false);
        }, 500);
      }
    }
    boot();
  }, []);

  // Simulate progress
  useEffect(() => {
    if (!isBooting) return;

    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev < 40) return prev + Math.random() * 8 + 2; // Fast start
        if (prev < 85) return prev + Math.random() * 4 + 1; // Steady climb
        if (prev < 98) return prev + 0.2; // Final crawl
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isBooting]);

  const getLoadingMessage = (progress: number) => {
    if (progress < 20) return "Initializing WebContainer engine...";
    if (progress < 50) return "Downloading sandboxed Node.js environment...";
    if (progress < 80) return "Mounting virtual file system...";
    return "Finalizing secure connection...";
  };

  // Load progress from localStorage
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem(`progress-${course.id}`);
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    } else {
      // If no save found, ensure we are reset to initial (useful if switching courses without reload if that were possible, or just fresh start)
      // But useState initial value handles fresh start.
    }
  }, [mounted, course.id]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`progress-${course.id}`, JSON.stringify(files));
    }
  }, [files, course.id, mounted]);

  // Persist current step index
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`step-${course.id}`, String(currentStepIndex));
    }
  }, [currentStepIndex, course.id, mounted]);

  // Load step index
  useEffect(() => {
    if (!mounted) return;
    const savedStep = localStorage.getItem(`step-${course.id}`);
    if (savedStep) {
      setCurrentStepIndex(parseInt(savedStep, 10));
    }
  }, [mounted, course.id]);

  const handleStepChange = (newIndex: number) => {
    // If we are finishing the course, newIndex will be equal to steps.length (out of bounds for steps array)
    if (newIndex < course.steps.length) {
      const nextStep = course.steps[newIndex];
      if (nextStep.newFiles) {
        setFiles(prev => ({ ...prev, ...structuredClone(nextStep.newFiles) }));
      }
    }
    setIsStepComplete(false);
    setCurrentStepIndex(newIndex);
  };

  const runCode = async () => {
    if (!webContainer) return;

    setOutput(prev => prev + "\n▶ Running...\n");

    try {
      const currentStep = course.steps[currentStepIndex];

      // 1️⃣ Prepare file system for mounting
      const fileSystem: Record<string, any> = {};

      // Helper to ensure nested directories exist in the mount object
      const addFileToMount = (path: string, content: string) => {
        const parts = path.split('/');
        let current = fileSystem;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = { directory: {} };
          }
          current = current[part].directory;
        }
        const fileName = parts[parts.length - 1];
        current[fileName] = { file: { contents: content } };
      };

      // Include all user files
      Object.keys(files).forEach(filename => {
        addFileToMount(filename, files[filename].code);
      });

      // 2️⃣ Ensure storage.json exists and is loaded
      let storageContent = '{}';
      try {
        storageContent = await webContainer.fs.readFile('storage.json', 'utf-8');
      } catch {
        // File didn't exist, create it
        await webContainer.fs.writeFile('storage.json', '{}');
        storageContent = '{}';
      }

      // Always mount the latest storage content
      // Always mount the latest storage content
      addFileToMount('storage.json', storageContent);

      // 6️⃣ If there is test code, inject it (must be added BEFORE mount)
      if (currentStep.testCode) {
        addFileToMount('__test__.js', currentStep.testCode);
      }

      // 3️⃣ Mount the file system
      await webContainer.mount(fileSystem);

      // 4️⃣ Kill previous process if any
      if (currentProcessRef.current) {
        try { currentProcessRef.current.kill(); } catch { }
      }

      // 5️⃣ Decide script to run: test code or index.js
      const scriptToRun = currentStep.testCode ? '__test__.js' : 'index.js';

      // 7️⃣ Spawn Node process
      const process = await webContainer.spawn('node', [scriptToRun]);
      currentProcessRef.current = process;

      // 8️⃣ Stream output to terminal
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            // Handle success token for unlocking next step
            if (data.includes("SUCCESS_TOKEN")) {
              setIsStepComplete(true); // Unlock next step
              setHints([]); // Clear hints on success
              const cleanMsg = data.replace("SUCCESS_TOKEN", "\n✨ SUCCESS: Test Passed! Next level unlocked.");
              setOutput(prev => prev + cleanMsg);
            } else {
              setOutput(prev => prev + data);

              // Check for errors and provide hints
              if (data.includes("FAIL") || data.includes("ERROR")) {
                const matchedHints = findHints(data);
                if (matchedHints.length > 0) {
                  setHints(matchedHints.map(h => h.hint));
                }
              }
            }
          }
        })
      );

      // 9️⃣ Append exit code if failed
      process.exit.then(code => {
        if (code !== 0) {
          setOutput(prev => prev + `\n[Process exited with code ${code}]`);
        }
      });

    } catch (e) {
      setOutput(prev => prev + `\nSYSTEM ERROR: ${String(e)}`);
    }
  };








  const [showResetModal, setShowResetModal] = useState(false);

  const resetProgress = () => {
    localStorage.removeItem(`progress-${course.id}`);
    localStorage.removeItem(`step-${course.id}`);
    window.location.reload();
  };

  if (!mounted) return null;

  // 10. Check if course is completed
  if (currentStepIndex === course.steps.length) {
    return (
      <>
        {showCertificate && (
          <CompletionCertificate
            courseName={course.title}
            courseId={course.id}
            onClose={() => setShowCertificate(false)}
          />
        )}

        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-400">🎉 Course Completed!</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
            Congratulations! You've successfully built your own <strong>{course.title}</strong>.
            You've mastered the core concepts and constructed a working implementation from scratch.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowCertificate(true)}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors font-bold shadow-lg shadow-yellow-500/30"
            >
              🏆 Get Certificate
            </button>
            <button
              onClick={() => setCurrentStepIndex(0)} // Reset to review
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Review Code
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold shadow-lg shadow-blue-500/30"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-[#030406] text-white relative font-sans">
      {/* Loading Overlay */}
      {isBooting && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#030406]/90 backdrop-blur-xl px-6">
          <div className="relative mb-12">
            <div className="w-24 h-24 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
              <span className="text-xs font-mono font-bold text-blue-400">{Math.round(bootProgress)}%</span>
            </div>
          </div>

          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold hero-gradient mb-3 tracking-tight">Preparing Environment</h2>
            <p className="text-gray-400 font-light text-sm mb-8 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {getLoadingMessage(bootProgress)}
            </p>

            {/* Progress Bar Container */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2 relative">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-600">
              <span>Readying Engine</span>
              <span>Fully Booted</span>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-700 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Reset Progress?</h3>
            <p className="text-gray-400 mb-6 text-sm">
              This will delete all your code and reset you to the beginning of this course. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={resetProgress}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-medium"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-sm text-gray-300">{course.title}</h1>
          <button
            onClick={() => setShowResetModal(true)}
            className="text-xs text-red-500 hover:text-red-400 underline transition-colors"
          >
            Reset Progress
          </button>
          <ExportButton
            files={files}
            courseName={course.title}
            courseId={course.id}
          />
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex(i => i - 1)}
            className="text-xs bg-gray-700 px-3 py-1 rounded disabled:opacity-30"
          >← Prev</button>
          <span className="text-xs py-1">Step {currentStepIndex + 1} / {course.steps.length}</span>
          <button
            disabled={!isStepComplete}
            onClick={() => handleStepChange(currentStepIndex + 1)}
            className={`px-3 py-1 rounded text-xs transition-all ${isStepComplete
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]'
              : 'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
              }`}
          >
            {currentStepIndex === course.steps.length - 1 ? 'Finish Course 🎉' : 'Next Level →'}
          </button>
        </div>
      </div>

      <Split className="flex-1 flex flex-row overflow-hidden" sizes={[30, 70]} minSize={200} gutterSize={8}>
        {/* LEFT PANEL: Instructions */}
        <div className="h-full bg-[#111] overflow-y-auto p-6 prose prose-invert max-w-none">
          <h2 className="text-xl font-bold mb-4 text-blue-400">{currentStep.title}</h2>
          <ReactMarkdown>{currentStep.content}</ReactMarkdown>
        </div>

        {/* RIGHT PANEL: Editor + Terminal */}
        <div className="h-full flex flex-col">
          {/* File Tabs */}
          <div className="bg-[#1e1e1e] flex text-sm">
            {Object.keys(files).sort().map(filename => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`px-4 py-2 border-r border-gray-700 ${activeFile === filename ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400'
                  }`}
              >
                {filename}
              </button>
            ))}
            <div className="flex-1 bg-[#2d2d2d] border-b border-gray-700"></div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={activeFile && files[activeFile]?.code ? files[activeFile].code : ""}
              onChange={(val) => {
                if (!activeFile) return;
                setFiles(prev => ({ ...prev, [activeFile]: { code: val || "" } }));
              }}
            />
          </div>

          {/* TERMINAL – STICKY, OUTSIDE SPLIT */}
          <div
            className="bg-black border-t border-gray-700 font-mono text-sm flex flex-col"
            style={{ height: '30vh', minHeight: '180px', maxHeight: '40vh' }}
          >
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-gray-500 text-xs">TERMINAL</span>
              <button
                onClick={runCode}
                className="text-xs bg-green-700 px-3 py-1 rounded hover:bg-green-600"
              >▶ Run Code</button>
            </div>

            {/* Hints Section */}
            {hints.length > 0 && (
              <div className="bg-yellow-900/20 border-b border-yellow-700/30 px-2 py-2 text-yellow-300 text-xs">
                <div className="font-bold mb-1">💡 Hints:</div>
                {hints.map((hint, i) => (
                  <div key={i} className="ml-4 mb-1">• {hint}</div>
                ))}
              </div>
            )}

            <pre className="flex-1 overflow-auto whitespace-pre-wrap text-green-400 p-2">
              {output || "Ready..."}
            </pre>
          </div>
        </div>
      </Split>
    </div>
  );
}

