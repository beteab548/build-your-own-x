"use client";

import React, { useState, useEffect } from 'react';

export default function CodeRunner() {
  const [output, setOutput] = useState("");
  const [WebContainer, setWebContainer] = useState<any>(null);
  const [wcInstance, setWcInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // dynamically load WebContainer ONLY in browser
  useEffect(() => {
    async function boot() {
      try {
        const { WebContainer: WC } = await import("@webcontainer/api");
        setWebContainer(() => WC);

        const instance = await WC.boot();
        setWcInstance(instance);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setOutput("Your browser does not support WebContainers.");
      }
    }

    boot();
  }, []);

  const runCode = async () => {
    if (!wcInstance) return;

    setOutput("Running...\n");

    await wcInstance.mount({
      "index.js": {
        file: {
          contents: `
            console.log("Hello from the browser Node.js!");
          `,
        },
      },
    });

    const process = await wcInstance.spawn("node", ["index.js"]);

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput((prev) => prev + data);
        },
      })
    );
  };

  return (
    <div>
      <button onClick={runCode} disabled={loading}>
        Run code
      </button>

      <pre>{output}</pre>
    </div>
  );
}
