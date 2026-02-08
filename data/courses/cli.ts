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
    id: 'build-own-cli',
    title: 'Build Your Own CLI Tool',
    steps: [
        {
            id: 1,
            title: 'Hello World CLI',
            content: `
# 1. Hello World CLI

Command Line Interfaces (CLIs) are just normal programs that you run from the terminal. 
In Node.js, we can make any file executable by adding a "shebang" line at the top.

### Your Task
Create a file named \`bin/index.js\` that prints "Hello, CLI!".

1.  The file must start with \`#!/usr/bin/env node\`.
2.  It should log "Hello, CLI!" to the console.
3.  We have already created the folder \`bin\` for you.
      `,
            initialFiles: {
                'package.json': {
                    code: `{"name": "my-cli", "bin": "./bin/index.js"}`
                },
                'bin/index.js': {
                    code: `// TODO: Add shebang and log message
`
                }
            },
            testCode: `
const fs = require('fs');
const { execSync } = require('child_process');

try {
  // 1. Check file existence
  if (!fs.existsSync('bin/index.js')) {
    throw new Error("FAIL: bin/index.js does not exist.");
  }

  // 2. Check content
  const content = fs.readFileSync('bin/index.js', 'utf-8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    throw new Error("FAIL: Missing shebang line (#!/usr/bin/env node) at the top.");
  }

  // 3. Mock console.log and run
  let output = "";
  const originalLog = console.log;
  console.log = (...args) => { output += args.join(' ') + "\\n"; };
  
  try {
    require('./bin/index.js');
  } catch (e) {
    // ignore runtime errors for now
  } finally {
    console.log = originalLog;
  }

  if (output.includes("Hello, CLI!")) {
    console.log("✅ Output matched!");
    console.log("SUCCESS_TOKEN");
  } else {
    throw new Error("FAIL: Output did not contain 'Hello, CLI!'");
  }

} catch (err) {
  console.log("FAIL: " + err.message);
}
`
        },
        {
            id: 2,
            title: 'Parsing Arguments',
            content: `
# 2. Parsing Arguments

A CLI isn't useful if it can't take input. Node.js provides \`process.argv\` to read command line arguments.

\`process.argv\` is an array where:
- Index 0: Path to Node executable
- Index 1: Path to your script
- Index 2+: The actual arguments provided by the user

### Your Task
Modify \`bin/index.js\` to say hello to a specific user.
If the user runs \`my-cli --name=Alice\`, it should print "Hello, Alice!".
If no name is provided, default to "World".

*Hint: You can just look at the 3rd argument for now, assuming the user types \`node bin/index.js Alice\`.*
Wait, let's keep it simple: **Just print the 3rd argument (index 2) if it exists.**

Example:
\`node bin/index.js Bob\`  -> "Hello, Bob!"
\`node bin/index.js\`      -> "Hello, World!"
      `,
            newFiles: {
                'bin/index.js': {
                    code: `#!/usr/bin/env node

const args = process.argv;
// console.log(args); // Uncomment to see what argv looks like!

// TODO: Get the name from args[2] or default to "World"
const name = "World"; 

console.log(\`Hello, \${name}!\`);
`
                }
            },
            testCode: `
const bgOriginalArgv = process.argv;

try {
  // Test case 1: Default
  process.argv = ['node', 'script'];
  let output1 = "";
  let log1 = console.log;
  console.log = (...args) => { output1 += args.join(' '); };
  
  delete require.cache[require.resolve('./bin/index.js')]; // clear cache
  require('./bin/index.js');
  console.log = log1;

  if (!output1.includes("Hello, World!")) {
    throw new Error("FAIL: Default case failed. Expected 'Hello, World!', got: " + output1);
  }

  // Test case 2: With name
  process.argv = ['node', 'script', 'Universe'];
  let output2 = "";
  let log2 = console.log;
  console.log = (...args) => { output2 += args.join(' '); };
  
  delete require.cache[require.resolve('./bin/index.js')]; // clear cache
  require('./bin/index.js');
  console.log = log2;

  if (output2.includes("Hello, Universe!")) {
     console.log("✅ Passed both test cases!");
     console.log("SUCCESS_TOKEN");
  } else {
    throw new Error("FAIL: Argument case failed. Expected 'Hello, Universe!', got: " + output2);
  }

} catch (e) {
  console.log("FAIL: " + e.message);
} finally {
  process.argv = bgOriginalArgv;
}
`
        },
        {
            id: 3,
            title: 'File Operations (ls)',
            content: `
# 3. Listing Files

Real CLIs interact with the system. Let's make a mini \`ls\` command.

### Your Task
Update \`bin/index.js\` to list all files in the current directory.
Use \`fs.readdirSync(__dirname)\` (or usually \`process.cwd()\`, but let's stick to simple imports).

1.  Import \`fs\`.
2.  Read the current directory.
3.  Loop through files and print them.

We've added some dummy files for you to list.
      `,
            newFiles: {
                'dummy.txt': { code: "I am a dummy file" },
                'notes.md': { code: "# Notes" },
                'bin/index.js': {
                    code: `#!/usr/bin/env node
const fs = require('fs');

// TODO: List files in the current directory (process.cwd())
`
                }
            },
            testCode: `
const fs = require('fs');

try {
  let output = "";
  const originalLog = console.log;
  console.log = (...args) => { output += args.join(' ') + "\\n"; };

  delete require.cache[require.resolve('./bin/index.js')];
  require('./bin/index.js');
  
  console.log = originalLog;

  if (output.includes("dummy.txt") && output.includes("notes.md")) {
    console.log("✅ Listed files correctly!");
    console.log("SUCCESS_TOKEN");
  } else {
    throw new Error("FAIL: Output did not contain expected filenames (dummy.txt, notes.md). Got:\\n" + output);
  }

} catch(e) {
  console.log("FAIL: " + e.message);
}
`
        }
    ]
};
