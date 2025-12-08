'use client'; // This tells Next.js to run this on the client side

import React, { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';

export default function CodeRunner() {
  const [output, setOutput] = useState("");
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Boot up the browser-based Node.js engine
  useEffect(() => {
    async function boot() {
      try {
        const instance = await WebContainer.boot();
        setWebContainer(instance);
        setLoading(false);
      } catch (error) {
        console.error("Boot failed:", error);
        setOutput("Error: Your browser does not support WebContainers. Try Chrome or Edge.");
      }
    }
    boot();
  }, []);

  // 2. The function that runs when you click the button
  const runCode = async () => {
    if (!webContainer) return;
    
    setOutput("Running...\n");

    // A. Create a file called 'index.js' with some code
    // (Later, we will get this code from a text editor input)
    await webContainer.mount({
      'index.js': {
        file: {
          contents: `
            const os = require('os');
            console.log('--- SYSTEM INFO ---');
            console.log('Operating System: ' + os.platform());
            console.log('Architecture: ' + os.arch());
            console.log('Free Memory: ' + os.freemem());
            console.log('-------------------');
            console.log('Hello! I am running entirely inside your browser!');
          `,
        },
      },
    });

    // B. Run 'node index.js'
    const process = await webContainer.spawn('node', ['index.js']);

    // C. Read the output and show it on screen
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput((prev) => prev + data);
        },
      })
    );
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-bold mb-4">Build Your Own X - Engine Test</h1>
      
      {/* Status Indicator */}
      <div className="mb-4">
        Status: 
        {loading ? (
          <span className="text-yellow-500 font-bold"> Booting Node.js...</span>
        ) : (
          <span className="text-green-500 font-bold"> Ready</span>
        )}
      </div>

      <button
        onClick={runCode}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Run Test Code
      </button>

      {/* Output Box */}
      <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded h-64 overflow-auto whitespace-pre-wrap">
        {output || "// Output will appear here..."}
      </div>
    </div>
  );
}