
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
    id: 'build-own-git',
    title: 'Build Your Own Git',
    steps: [
        {
            id: 1,
            title: 'Git Init',
            content: `
# 1. Initialize Reop (.git folder)

Every Git repository starts with \`git init\`. But what does it actually do?
It creates a hidden directory \`.git\` where all the magic happens.

### Your Task
Implement the \`git init\` functionality in \`git.js\`.

1.  Use \`fs.mkdirSync\` to create the \`.git\` directory.
2.  Inside it, create two subdirectories: \`objects\` and \`refs\`.
3.  Create a file \`HEAD\` pointing to \`ref: refs/heads/main\`.

The directory structure should look like this:
\`\`\`
.git/
  objects/
  refs/
  HEAD
\`\`\`
      `,
            initialFiles: {
                'package.json': {
                    code: `{"name": "my-git", "main": "git.js"}`
                },
                'git.js': {
                    code: `const fs = require('fs');
const path = require('path');

function init() {
  // TODO: Create the .git directory structure
  console.log("Initialized empty Git repository");
}

init();
`
                }
            },
            testCode: `
const fs = require('fs');
const path = require('path');

try {
  // Run the user code
  delete require.cache[require.resolve('./git.js')];
  require('./git.js');

  // Verify
  if (!fs.existsSync('.git')) throw new Error("FAIL: .git directory not found");
  if (!fs.existsSync('.git/objects')) throw new Error("FAIL: .git/objects directory not found");
  if (!fs.existsSync('.git/refs')) throw new Error("FAIL: .git/refs directory not found");
  if (!fs.existsSync('.git/HEAD')) throw new Error("FAIL: .git/HEAD file not found");

  const headContent = fs.readFileSync('.git/HEAD', 'utf-8').trim();
  if (headContent !== 'ref: refs/heads/main') {
    throw new Error("FAIL: HEAD file content incorrect. Expected 'ref: refs/heads/main'");
  }

  console.log("✅ Git repository initialized correctly!");
  console.log("SUCCESS_TOKEN");

} catch (e) {
  console.log("FAIL: " + e.message);
}
`
        },
        {
            id: 2,
            title: 'Hash Object (Blob)',
            content: `
# 2. Hash Object (The Blob)

Git stores content addressably. This means the filename is determined by the content itself (its SHA-1 hash).

### How Git stores a file:
1.  **Header**: \`blob <size>\\0\` (e.g., \`blob 12\\0Hello World!\`)
2.  **Hash**: SHA-1 hash of (Header + Content).
3.  **Compress**: Deflate the (Header + Content) using Zlib.
4.  **Save**: Store it at \`.git/objects/<first-2-chars-of-hash>/<rest-of-hash>\`.

### Your Task
Implement the \`hashObject\` function in \`git.js\`.
It should take a string content, hash it, compress it, and write it to the \`.git/objects\` folder.

We've provided \`zlib\` and \`crypto\` imports for you.
      `,
            newFiles: {
                'git.js': {
                    code: `const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

function init() {
  fs.mkdirSync('.git/objects', { recursive: true });
  fs.mkdirSync('.git/refs', { recursive: true });
  fs.writeFileSync('.git/HEAD', 'ref: refs/heads/main');
}

function hashObject(content) {
  // TODO:
  // 1. Create header: "blob <length>\\0"
  // 2. Concatenate header + content
  // 3. Compute SHA-1 hash 
  // 4. Compress content (zlib.deflateSync)
  // 5. Write file to .git/objects/ab/cd...
  
  return ""; // Return the full hash
}

// Ensure repo is cleared for testing
if (fs.existsSync('.git')) fs.rmSync('.git', { recursive: true });
init();

const hash = hashObject("hello world");
console.log("Hash:", hash);
`
                }
            },
            testCode: `
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

// Expected hash for "hello world"
// header = "blob 11\\0"
// content = "hello world"
// total = "blob 11\\0hello world"
// sha1 = 95d09f2b10159347eece71399a7e2e907ea3df4f

const EXPECTED_HASH = "95d09f2b10159347eece71399a7e2e907ea3df4f";

try {
  let userHash = "";
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args.join(' ');
    if (msg.startsWith("Hash:")) userHash = msg.split(":")[1].trim();
  };

  delete require.cache[require.resolve('./git.js')];
  require('./git.js');
  console.log = originalLog;

  if (userHash !== EXPECTED_HASH) {
    throw new Error(\`FAIL: Incorrect hash. Expected \${EXPECTED_HASH}, got \${userHash || 'empty'}\`);
  }

  // Verify file existence
  const objectPath = \`.git/objects/\${EXPECTED_HASH.slice(0, 2)}/\${EXPECTED_HASH.slice(2)}\`;
  if (!fs.existsSync(objectPath)) {
    throw new Error(\`FAIL: Object file not found at \${objectPath}\`);
  }

  // Verify compression
  const fileContent = fs.readFileSync(objectPath);
  try {
     const unzipped = zlib.inflateSync(fileContent);
     const str = unzipped.toString();
     if (str !== "blob 11\\0hello world") {
        throw new Error("FAIL: Decompressed content incorrect. Got: " + str);
     }
  } catch (e) {
     throw new Error("FAIL: Could not unzip file. Did you use zlib.deflateSync?");
  }

  console.log("✅ Hash object implemented perfectly!");
  console.log("SUCCESS_TOKEN");

} catch (e) {
  console.log("FAIL: " + e.message);
}
`
        },
        {
            id: 3,
            title: 'Cat File (Reading Blobs)',
            content: `
# 3. Cat File (Reading Blobs)

We can write data, but it's useless if we can't read it back.
The command \`git cat-file -p <hash>\` prints the content of an object.

### Your Task
Implement \`catFile(hash)\` in \`git.js\`.

1.  Locate the file in \`.git/objects/...\`.
2.  If it doesn't exist, throw an error.
3.  Read and decompress (\`zlib.inflateSync\`).
4.  Parse the header to find where the content starts (after the null byte \`\\0\`).
5.  Print the content.
      `,
            newFiles: {
                'git.js': {
                    code: `const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

function init() {
  if (!fs.existsSync('.git')) {
    fs.mkdirSync('.git/objects', { recursive: true });
    fs.mkdirSync('.git/refs', { recursive: true });
    fs.writeFileSync('.git/HEAD', 'ref: refs/heads/main');
  }
}

function hashObject(content) {
  const header = \`blob \${content.length}\\0\`;
  const store = header + content;
  const hash = crypto.createHash('sha1').update(store).digest('hex');
  const zipped = zlib.deflateSync(store);
  const folder = \`.git/objects/\${hash.slice(0, 2)}\`;
  const file = \`\${folder}/\${hash.slice(2)}\`;
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(file, zipped);
  return hash;
}

function catFile(hash) {
  // TODO:
  // 1. Read file from .git/objects/..
  // 2. Decompress (zlib.inflateSync)
  // 3. Find the null byte \0
  // 4. Return the content after the null byte
}

init();
// Create a file to read back
const myHash = hashObject("secret message");
console.log("Created object:", myHash);

const content = catFile(myHash);
console.log("Read back:", content);
`
                }
            },
            testCode: `
const fs = require('fs');
const zlib = require('zlib');

try {
  let readContent = "";
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args.join(' ');
    if (msg.startsWith("Read back:")) readContent = msg.replace("Read back:", "").trim();
  };

  delete require.cache[require.resolve('./git.js')];
  require('./git.js');
  console.log = originalLog;

  if (readContent === "secret message") {
    console.log("✅ Cat file worked!");
    console.log("SUCCESS_TOKEN");
  } else {
    throw new Error(\`FAIL: Expected "secret message", got "\${readContent}"\`);
  }

} catch (e) {
  console.log("FAIL: " + e.message);
}
`
        }
    ]
};
