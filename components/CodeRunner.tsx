
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
const [code, setCode] = useState(INITIAL_CODE);
const [output, setOutput] = useState("");
const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
const [files, setFiles] = useState<Record<string, { code: string }>>(FILES);
const [activeFile, setActiveFile] = useState<string>('index.js');
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
{/* File Explorer Toolbar */}
<div className="bg-gray-800 border-b border-gray-700 flex gap-1 overflow-x-auto">
  {Object.keys(files).map((filename) => (
    <button
      key={filename}
      onClick={() => setActiveFile(filename)}
      className={`px-4 py-2 text-sm border-r border-gray-700 hover:bg-gray-700 transition-colors ${
        activeFile === filename ? 'bg-[#1e1e1e] text-white font-bold border-t-2 border-t-blue-500' : 'text-gray-400'
      }`}
    >
      {filename}
    </button>
  ))}
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
  <CodeEditor 
    code={files[activeFile].code} 
    onChange={(newContent) => {
      // Update the specific file in our state object
      setFiles({
        ...files,
        [activeFile]: { code: newContent || "" }
      });
    }} 
  />
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