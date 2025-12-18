
'use client';

import React, { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
import Split from 'react-split'; // The draggable splitter
import CodeEditor from './Editor'; // The file you just made
import ReactMarkdown from 'react-markdown';
import { COURSE } from '../data/course';

type FileMap = Record<string, { code: string }>;
// Initial boilerplate code for the user
const INITIAL_CODE = `const fs = require('fs');

// 1. Let's create a simple database file
fs.writeFileSync('db.json', JSON.stringify({ users: [] }));

console.log('Database created!');

// 2. Read it back to prove it exists
const content = fs.readFileSync('db.json', 'utf-8');
console.log('File contents:', content);
`;
const FILES = {
  'index.js': {
    code: `const db = require('./db.js');
console.log('Starting App...');
db.save('user_1', { name: 'Alice' });
console.log(db.read('user_1'));`
  },
  'db.js': {
    code: `const fs = require('fs');
module.exports = {
  save: (id, data) => fs.writeFileSync(id + '.json', JSON.stringify(data)),
  read: (id) => fs.readFileSync(id + '.json', 'utf-8')
};`
  },
  'package.json': {
    code: `{"name": "my-database", "type": "commonjs"}`
  }
};
export default function CodeRunner() {
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

const [code, setCode] = useState(INITIAL_CODE);
const [output, setOutput] = useState("");
const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
const [activeFile, setActiveFile] = useState<string>('index.js');
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const currentStep = COURSE.steps[currentStepIndex];
const [loading, setLoading] = useState(true);
const [files, setFiles] = useState<FileMap>(() =>
  structuredClone(COURSE.steps[0].initialFiles!)
);

  // Boot Node.js on load
  useEffect(() => {
    async function boot() {
      try {
        const instance = await WebContainer.boot();
        setWebContainer(instance);
        setLoading(false);
      } catch (error) {
        console.error("Boot failed:", error);
      }
    }
    boot();
  }, []);
  useEffect(() => {
  if (!mounted) return;

  const saved = localStorage.getItem('my-course-progress');
  if (saved) {
    setFiles(JSON.parse(saved));
  }
}, [mounted]);

useEffect(() => {
    localStorage.setItem('my-course-progress', JSON.stringify(files));
  }, [files]);

  // ---------------------------------------------------------
  // 2. SMART MERGING: Handle Step Changes
  // ---------------------------------------------------------
  const handleStepChange = (newIndex: number) => {
    const nextStep = COURSE.steps[newIndex];
    
    // If the next step has "newFiles", add them to our file system
   
    if (nextStep.newFiles) {
  setFiles((prev:any) => ({
    ...prev,
    ...structuredClone(nextStep.newFiles)
  }));
}

    // Actually change the step
    setCurrentStepIndex(newIndex);
  };
  const runCode = async () => {
    if (!webContainer) return;
    
    setOutput("Running...\n");

    try {
// ... inside runCode function ...

// Prepare the files for WebContainer
const fileSystem: Record<string, { file: { contents: string } }> = {};
Object.keys(files).forEach(filename => {
  fileSystem[filename] = {
    file: {
      contents: files[filename].code
    }
  };
});
// Mount the entire system
await webContainer.mount(fileSystem);

// Run index.js (Entry point)
const process = await webContainer.spawn('node', ['index.js']);

      // 1. Mount the code from the EDITOR into the virtual file system
   

      // 2. Run the file

      // 3. Stream output
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            setOutput((prev) => prev + data);
          },
        })
      );
      
      // 4. Catch errors (stderr)
      // If the user writes bad code, we want to show the error!
      process.exit.then((code) => {
        if (code !== 0) {
           setOutput(prev => prev + `\n[Process exited with code ${code}]`);
        }
      });

    } catch (e) {
      setOutput(`System Error: ${e}`);
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
        >
          ← Prev
        </button>
        <span className="text-xs py-1">Step {currentStepIndex + 1} / {COURSE.steps.length}</span>
        <button 
          disabled={currentStepIndex === COURSE.steps.length - 1}
          onClick={() => setCurrentStepIndex(i => i + 1)}
          className="text-xs bg-blue-600 px-3 py-1 rounded disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>

    {/* Main Content Area */}
    <Split 
      className="flex-1 flex flex-row overflow-hidden" 
      sizes={[30, 70]} // 30% Instructions, 70% Code
      minSize={200} 
      gutterSize={8}
    >
      {/* 1. LEFT PANEL: INSTRUCTIONS */}
      <div className="h-full bg-[#111] overflow-y-auto p-6 prose prose-invert max-w-none">
        <h2 className="text-xl font-bold mb-4 text-blue-400">{currentStep.title}</h2>
        {/* This renders the Markdown text safely */}
        <ReactMarkdown>{currentStep.content}</ReactMarkdown>
      </div>

      {/* 2. RIGHT PANEL: WORKSPACE (Editor + Terminal) */}
      <div className="h-full flex flex-col">
        {/* File Tabs */}
        <div className="bg-[#1e1e1e] flex text-sm">
        
          {Object.keys(files)
  .sort()
  .map((filename) => (
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

          <div className="flex-1 bg-[#2d2d2d] border-b border-gray-700"></div> {/* Spacer */}
        </div>

        {/* Inner Split: Editor & Terminal */}
        <Split 
          className="flex-1 flex flex-col" 
          sizes={[70, 30]} // 70% Editor, 30% Terminal
          direction="vertical"
        >
          {/* EDITOR */}
          <div className="relative h-full">
             <CodeEditor 
                code={files[activeFile]?.code || ""} 
                onChange={(val) => setFiles({...files, [activeFile]: { code: val || "" }})} 
             />
          </div>

          {/* TERMINAL */}
          <div className="bg-black p-2 font-mono text-sm overflow-auto flex flex-col h-full border-t border-gray-700">
             <div className="flex justify-between items-center mb-2 px-2">
               <span className="text-gray-500 text-xs">TERMINAL</span>
               <button onClick={runCode} className="text-xs bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600">
                 ▶ Run Code
               </button>
             </div>
             <pre className="flex-1 whitespace-pre-wrap text-green-400 p-2">
               {output || "Ready..."}
             </pre>
          </div>
        </Split>
      </div>
    </Split>
  </div>
);
}