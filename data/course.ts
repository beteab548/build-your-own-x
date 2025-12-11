export const COURSE = {
  id: 'build-own-db',
  title: 'Build Your Own Database',
  steps: [
    {
      id: 1,
      title: 'The File System',
      content: `
# Welcome to Database Engineering

In this course, we will build a simple Key-Value store (like Redis) from scratch.

### Step 1: Understanding Storage
A database ultimately has to save data to a file. In Node.js, we use the \`fs\` (File System) module.

**Task:**
1. Import the \`fs\` module in \`index.js\`.
2. Write a function called \`saveData\`.
3. Use \`writeFileSync\` to create a file named \`database.json\`.
      `,
      initialFiles: {
        'index.js': { code: "// Write your code here..." },
        'package.json': { code: '{"name": "my-db"}' }
      }
    },
    {
      id: 2,
      title: 'Reading Data',
      content: `
# Reading from Disk

Great! Now that we can save data, we need to read it back.

**Task:**
1. Create a function \`readData\`.
2. Use \`readFileSync\` to get the content.
3. Parse the JSON string back into an object.
      `,
      initialFiles: {
        'index.js': { code: "const fs = require('fs');\n\nfunction saveData() {}\n// Now implement readData..." },
        'package.json': { code: '{"name": "my-db"}' }
      }
    }
  ]
};