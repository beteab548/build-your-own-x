'use client';

import React, { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
import Split from 'react-split'; // The draggable splitter
import CodeEditor from './Editor'; // The file you just made

// Initial boilerplate code for the user
const INITIAL_CODE = `const fs = require('fs');

// 1. Let's create a simple database file
fs.writeFileSync('db.json', JSON.stringify({ users: [] }));

console.log('Database created!');

// 2. Read it back to prove it exists
const content = fs.readFileSync('db.json', 'utf-8');
console.log('File contents:', content);
`;

export default function CodeRunner() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);

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

  const runCode = async () => {
    if (!webContainer) return;
    
    setOutput("Running...\n");

    try {
      // 1. Mount the code from the EDITOR into the virtual file system
      await webContainer.mount({
        'index.js': {
          file: {
            contents: code, // <--- This uses the state from the editor
          },
        },
      });

      // 2. Run the file
      const process = await webContainer.spawn('node', ['index.js']);

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

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="font-bold text-xl">Build Your Own Database</h1>
        <div className="flex gap-4 items-center">
           <span className={`text-sm ${loading ? 'text-yellow-500' : 'text-green-500'}`}>
             {loading ? 'Booting Node...' : '● System Ready'}
           </span>
           <button
            onClick={runCode}
            disabled={loading}
            className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 font-bold transition-colors"
          >
            ▶ Run Code
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <Split 
        className="flex-1 flex flex-row overflow-hidden" 
        sizes={[50, 50]} 
        minSize={200} 
        gutterSize={10}
        gutterAlign="center"
        direction="horizontal"
      >
        {/* Left: Editor */}
        <div className="h-full bg-[#1e1e1e]">
          <CodeEditor code={code} onChange={(val) => setCode(val || "")} />
        </div>

        {/* Right: Output Terminal */}
        <div className="h-full bg-black p-4 font-mono text-sm overflow-auto border-l border-gray-800">
          <div className="text-gray-500 mb-2 uppercase text-xs tracking-wider">Terminal Output</div>
          <pre className="whitespace-pre-wrap text-green-400">
            {output || "// Click Run to execute..."}
          </pre>
        </div>
      </Split>
    </div>
  );
}