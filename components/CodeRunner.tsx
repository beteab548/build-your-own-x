'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import Split from 'react-split';
import CodeEditor from './Editor';
import ReactMarkdown from 'react-markdown';
import { COURSE } from '../data/course';

type FileMap = Record<string, { code: string }>;

export default function CodeRunner() {
  const [mounted, setMounted] = useState(false);
  const [output, setOutput] = useState("");
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [activeFile, setActiveFile] = useState<string>('index.js');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = COURSE.steps[currentStepIndex];
  const currentProcessRef = useRef<any>(null);
  const hasMountedFS = useRef(false);

  const [files, setFiles] = useState<FileMap>(() =>
    structuredClone(COURSE.steps[0].initialFiles!)
  );

  useEffect(() => setMounted(true), []);

  // Boot Node.js
  useEffect(() => {
    async function boot() {
      try {
        const instance = await WebContainer.boot();
        setWebContainer(instance);
      } catch (err) {
        console.error("Boot failed:", err);
      }
    }
    boot();
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('my-course-progress');
    if (saved) setFiles(JSON.parse(saved));
  }, [mounted]);

  useEffect(() => {
    localStorage.setItem('my-course-progress', JSON.stringify(files));
  }, [files]);

  const handleStepChange = (newIndex: number) => {
    const nextStep = COURSE.steps[newIndex];
    if (nextStep.newFiles) {
      setFiles(prev => ({ ...prev, ...structuredClone(nextStep.newFiles) }));
    }
    setCurrentStepIndex(newIndex);
  };

 const runCode = async () => {
  if (!webContainer) return;

  setOutput(prev => prev + "\n▶ Running...\n");

  try {
    // Merge current files with storage.json contents
    const fileSystem: Record<string, { file: { contents: string } }> = {};

    Object.keys(files).forEach(filename => {
      fileSystem[filename] = { file: { contents: files[filename].code } };
    });

    // Read previous storage.json if exists in container
    let storageContent = '{}';
    try {
      const storageFile = await webContainer.fs.readFile('storage.json', 'utf-8');
      storageContent = storageFile;
    } catch (err) {
      // If it doesn't exist, start empty
      storageContent = '{}';
    }

    fileSystem['storage.json'] = { file: { contents: storageContent } };

    // Mount **fresh** every run to include previous storage.json
    await webContainer.mount(fileSystem);

    // Kill previous process
    if (currentProcessRef.current) {
      try { currentProcessRef.current.kill(); } catch {}
    }

    const process = await webContainer.spawn('node', ['index.js']);
    currentProcessRef.current = process;

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput(prev => prev + data);
        }
      })
    );

    process.exit.then(code => {
      setOutput(prev => prev + `\n[Process exited with code ${code}]`);
    });

  } catch (e) {
    setOutput(prev => prev + `\nSYSTEM ERROR: ${String(e)}`);
  }
};


  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800">
        <h1 className="font-bold text-sm text-gray-300">{COURSE.title}</h1>
        <div className="flex gap-2">
          <button 
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex(i => i - 1)}
            className="text-xs bg-gray-700 px-3 py-1 rounded disabled:opacity-30"
          >← Prev</button>
          <span className="text-xs py-1">Step {currentStepIndex + 1} / {COURSE.steps.length}</span>
          <button 
            disabled={currentStepIndex === COURSE.steps.length - 1}
            onClick={() => setCurrentStepIndex(i => i + 1)}
            className="text-xs bg-blue-600 px-3 py-1 rounded disabled:opacity-30"
          >Next →</button>
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
                className={`px-4 py-2 border-r border-gray-700 ${
                  activeFile === filename ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400'
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
            <pre className="flex-1 overflow-auto whitespace-pre-wrap text-green-400 p-2">
              {output || "Ready..."}
            </pre>
          </div>
        </div>
      </Split>
    </div>
  );
}
