
export type FileMap = {
    [filename: string]: { code: string; hidden?: boolean };
};

export type Step = {
    id: number;
    title: string;
    content: string; // Markdown
    initialFiles?: FileMap; // Only for the first step
    newFiles?: FileMap; // Files to inject when reaching this step
    testCode?: string; // We will use this in the next phase
};

export const COURSE: { id: string; title: string; steps: Step[] } = {
    id: 'build-own-redis',
    title: 'Build Your Own Redis',
    steps: [
        {
            id: 1,
            title: 'The TCP Server',
            content: `
# 1. The TCP Server

Redis isn't a file; it's a server. It listens for connections on a specific port (default 6379).
We will use Node.js's \`net\` module to create a raw TCP server.

### Your Task
Create a file \`server.js\` that:
1.  Imports \`net\`.
2.  Creates a server using \`net.createServer()\`.
3.  Listens on port \`6379\`.
4.  Logs "Client connected" when a new connection is established.

The code structure should look like this:
\`\`\`javascript
const net = require('net');
const server = net.createServer((socket) => {
    console.log('Client connected');
});
server.listen(6379, '127.0.0.1');
\`\`\`
      `,
            initialFiles: {
                'package.json': {
                    code: `{"name": "my-redis", "main": "server.js"}`
                },
                'server.js': {
                    code: `const net = require('net');

// TODO: Create a TCP server that listens on port 6379
`
                }
            },
            testCode: `
const net = require('net');

try {
  // Start user server (in background ideally, but here we require it)
  // We need to mock console.log to capture "Client connected"
  let logs = "";
  const originalLog = console.log;
  console.log = (...args) => { 
      const msg = args.join(' ');
      logs += msg + "\\n";
      // originalLog(...args); 
  };

  require('./server.js');

  // Give server time to bind
  setTimeout(() => {
    const client = net.createConnection({ port: 6379 }, () => {
       // connected
       client.end();
    });

    client.on('error', (err) => {
        console.log = originalLog;
        console.log("FAIL: Could not connect to port 6379. Is the server listening?");
    });
    
    // Check logs after a short delay
    setTimeout(() => {
        console.log = originalLog;
        if (logs.includes("Client connected")) {
            console.log("✅ Server accepted connection!");
            console.log("SUCCESS_TOKEN");
        } else {
            console.log("FAIL: Did not see 'Client connected' in logs. Got: " + logs);
        }
         // Clean up - sadly we can't easily kill the server started by require()
         // but WebContainer might handle process references
    }, 500);

  }, 200);

} catch (e) {
  console.log("FAIL: " + e.message);
}
`
        },
        {
            id: 2,
            title: 'Responding to PING',
            content: `
# 2. Responding to PING

Redis uses a protocol called **RESP** (Redis Serialization Protocol).
- Clients send commands as Arrays.
- Servers reply with Simple Strings, Errors, Integers, or Bulk Strings.

The simplest command is \`PING\`. The server should reply with \`+PONG\\r\\n\`.

### Your Task
Update \`server.js\` to handle data.
1.  Listen for the \`'data'\` event on the socket.
2.  Check if the data string includes "PING".
3.  If yes, write back \`+PONG\\r\\n\`.

*Note: In a real Redis, PING is sent as an array \`*1\\r\\n$4\\r\\nPING\\r\\n\`, but for now just check if the string contains "PING".*
      `,
            newFiles: {
                'server.js': {
                    code: `const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected');
  
  socket.on('data', (data) => {
    const str = data.toString();
    // TODO: If str contains 'PING', write '+PONG\\r\\n'
  });
});

server.listen(6379, '127.0.0.1');
`
                }
            },
            testCode: `
const net = require('net');

try {
  // We assume server is running from previous step or re-required (cached)
  // But strictly we should probably restart it or handling requires carefully
  // For simplicity in this env, let's assume the user code is hot-reloaded or we are in a fresh process space for the run
  
  // Actually, CodeRunner spawns a NEW process for each run. So we are good.
  
  require('./server.js');

  setTimeout(() => {
    const client = net.createConnection({ port: 6379 }, () => {
       client.write('PING');
    });

    client.on('data', (data) => {
        const response = data.toString();
        if (response === '+PONG\\r\\n') {
            console.log("✅ Received PONG!");
            console.log("SUCCESS_TOKEN");
        } else {
            console.log(\`FAIL: Expected '+PONG\\r\\n', got '\${JSON.stringify(response)}'\`);
        }
        client.end();
    });

    client.on('error', (err) => {
        console.log("FAIL: Connection error: " + err.message);
    });

  }, 200);

} catch (e) {
  console.log("FAIL: " + e.message);
}
`
        },
        {
            id: 3,
            title: 'Command Parsing (ECHO)',
            content: `
# 3. Command Parsing

Real Redis commands are sent as **RESP Arrays**.
Example: \`ECHO hello\` is sent as:
\`\`\`
*2\\r\\n      (Array of length 2)
$4\\r\\n      (String of length 4)
ECHO\\r\\n    (Content)
$5\\r\\n      (String of length 5)
hello\\r\\n   (Content)
\`\`\`

### Your Task
Implement a parser that extracts the **command** and the **value**.
1.  Parse the input to find the command ("ECHO") and the argument ("hello").
2.  If the command is \`ECHO\`, reply with the argument formatted as a Simple String (e.g., \`+hello\\r\\n\`) or Bulk String.
    Let's stick to Simple String \`+\` for now to be easy.

*Hint: You can split the string by \`\\r\\n\` to get parts.*
      `,
            newFiles: {
                'server.js': {
                    code: `const net = require('net');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const str = data.toString();
    const parts = str.split('\\r\\n');
    
    // Naive parsing:
    // If str starts with '*2', it's an array of 2.
    // parts[2] should be 'ECHO'
    // parts[4] should be the message
    
    // TODO: Implement ECHO
  });
});

server.listen(6379, '127.0.0.1');
`
                }
            },
            testCode: `
const net = require('net');

try {
  require('./server.js');
  
  setTimeout(() => {
    const client = net.createConnection({ port: 6379 }, () => {
        // Send: ECHO world
        // *2\r\n$4\r\nECHO\r\n$5\r\nworld\r\n
        client.write('*2\\r\\n$4\\r\\nECHO\\r\\n$5\\r\\nworld\\r\\n');
    });
    
    client.on('data', (data) => {
       const res = data.toString();
       if (res.includes('world')) {
           console.log("✅ ECHOed correctly!");
           console.log("SUCCESS_TOKEN");
       } else {
           console.log(\`FAIL: Expected response to include 'world', got: \${JSON.stringify(res)}\`);
       }
       client.end();
    });

  }, 200);
} catch(e) { console.log(e.message); }
`
        }
    ]
};
