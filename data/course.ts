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
  id: 'build-own-db',
  title: 'Build Your Own Database',
  steps: [
    {
      id: 1,
      title: 'The Write Engine',
      content: `
# 1. The Write Engine

Every database needs to store data somewhere. We will use a simple JSON file as our hard drive.

### Your Task
Implement the \`set\` function in \`database.js\`.

1.  It should take a \`key\` and a \`value\`.
2.  It should read the existing data from \`storage.json\`.
3.  It should update the key with the new value.
4.  It should save the data back to \`storage.json\`.

*Hint: Use \`JSON.parse()\` and \`JSON.stringify()\`.*
      `,
      initialFiles: {
        'index.js': {
          code: `const db = require('./database.js');

// 1. Let's try to save a user
console.log("Saving user...");
db.set('user_1', { name: 'Alice', age: 25 });

// 2. Check the file manually
const fs = require('fs');
console.log("File content:", fs.readFileSync('storage.json', 'utf-8'));
`
        },
        'database.js': {
          code: `const fs = require('fs');
const FILE = 'storage.json';
// Initialize the file if it doesn't exist
function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, '{}');
  }
}



function set(key, value) {
  ensureFile();
  // TODO:
  // 1. Read 'storage.json'
  // 2. Parse it into an object
  // 3. Add the key/value
  // 4. Write it back to the file
}

function get(key) {
  ensureFile();
  // We will build this later!
  return null;
}

module.exports = { set, get };
`
        },
        'package.json': {
          code: `{"name": "mini-db", "type": "commonjs"}`
        }
      },
      testCode: `
  const fs = require('fs');
  const db = require('./database.js');

  try {
    // REMOVED THE LINE THAT DELETES YOUR FILE
    // if (fs.existsSync('storage.json')) fs.unlinkSync('storage.json'); <--- GONE

    // 2. Run the User's Code
    console.log("🧪 Testing database...");
    db.set('test_user', { id: 1 });

    // 3. Verify the file was created
    if (!fs.existsSync('storage.json')) {
      throw new Error("FAIL: 'storage.json' was not created.");
    }

    // 4. Verify the content
    const content = fs.readFileSync('storage.json', 'utf-8');
    const data = JSON.parse(content);
    
    // Check for the test user
    if (data['test_user'] && data['test_user'].id === 1) {
      console.log("✅ SUCCESS_TOKEN");
    } else {
      throw new Error("FAIL: Saved data does not match what was expected.");
    }

  } catch (err) {
    console.error(err.message);
  }
`
    },
    {
      id: 2,
      title: 'The Read Engine',
      content: `
# 2. The Read Engine

Great! We can save data. But a write-only database is called a "Black Hole." We need to get data back out.

### Your Task
Implement the \`get\` function in \`database.js\`.

1.  It should take a \`key\`.
2.  Read and parse \`storage.json\`.
3.  Return the value associated with that key.
4.  If the key doesn't exist, return \`null\`.
      `,
      // We do NOT overwrite database.js here because the user is working on it.
      // We update index.js to test the new feature.
      newFiles: {
        'index.js': {
          code: `const db = require('./database.js');
console.log("Seeding database...");
db.set('user_1', { name: 'Alice', age: 25 });
// Let's see if our previous data is still there
console.log("Reading user_1...");
const user = db.get('user_1');
console.log("Result:", user);

if (user && user.name === 'Alice') {
  console.log("SUCCESS: Data retrieved!");
} else {
  console.log("FAIL: Could not read data.");
}
`
        }
      }
    },
    {
      id: 3,
      title: 'Data Integrity (Hashing)',
      content: `
# 3. Data Integrity

Real databases ensure data isn't corrupted. We will add a simple Hash check.

### Your Task
We have added a new utility file \`hash.js\`.
Modify your \`set\` function to log a hash of the data every time you save it.

1.  Require the generic \`hash.js\` helper.
2.  Call \`createHash(data)\` before saving.
3.  Console log the hash.
      `,
      newFiles: {
        'hash.js': {
          code: `const crypto = require('crypto');

function createHash(data) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

module.exports = { createHash };
`
        },
        'index.js': {
          code: `const db = require('./database.js');

console.log("Updating user...");
db.set('user_1', { name: 'Alice', age: 26 });
// Check your terminal output for the hash!
`
        }
      }
    }
  ]
};