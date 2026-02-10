/**
 * Hint system for providing helpful feedback when tests fail
 */

export type Hint = {
    pattern: RegExp;
    hint: string;
    severity: 'error' | 'warning' | 'info';
};

// Common error patterns and their hints
export const COMMON_HINTS: Hint[] = [
    {
        pattern: /FAIL.*does not exist/i,
        hint: "💡 Make sure you've created the file in the correct location. Check the file name and path carefully.",
        severity: 'error'
    },
    {
        pattern: /FAIL.*Missing shebang/i,
        hint: "💡 Add #!/usr/bin/env node as the very first line of your file (no spaces before it).",
        severity: 'error'
    },
    {
        pattern: /FAIL.*not created/i,
        hint: "💡 The file wasn't created. Make sure your code actually writes to the file system.",
        severity: 'error'
    },
    {
        pattern: /FAIL.*does not match/i,
        hint: "💡 Your output is close but not quite right. Check for typos, extra spaces, or missing punctuation.",
        severity: 'warning'
    },
    {
        pattern: /FAIL.*undefined/i,
        hint: "💡 Something is undefined. Did you forget to return a value from your function?",
        severity: 'error'
    },
    {
        pattern: /FAIL.*null/i,
        hint: "💡 You're returning null. Make sure your function returns the expected value.",
        severity: 'error'
    },
    {
        pattern: /FAIL.*NaN/i,
        hint: "💡 You're getting NaN (Not a Number). Check your math operations and make sure you're working with numbers.",
        severity: 'error'
    },
    {
        pattern: /FAIL.*Expected.*got/i,
        hint: "💡 The test shows what was expected vs what you returned. Compare them carefully to spot the difference.",
        severity: 'info'
    },
    {
        pattern: /ReferenceError/i,
        hint: "💡 You're using a variable or function that doesn't exist. Check your spelling and make sure it's defined.",
        severity: 'error'
    },
    {
        pattern: /SyntaxError/i,
        hint: "💡 There's a syntax error in your code. Check for missing brackets, quotes, or semicolons.",
        severity: 'error'
    },
    {
        pattern: /TypeError.*is not a function/i,
        hint: "💡 You're trying to call something that isn't a function. Check your function names and how you're calling them.",
        severity: 'error'
    },
    {
        pattern: /FAIL.*hash/i,
        hint: "💡 Make sure you're calling the hash function and logging the result. SHA-256 hashes are 64 characters long.",
        severity: 'info'
    },
    {
        pattern: /FAIL.*sigmoid/i,
        hint: "💡 The sigmoid function should return 1 / (1 + Math.exp(-x)). Don't forget the negative sign!",
        severity: 'info'
    },
    {
        pattern: /FAIL.*Loss calculation/i,
        hint: "💡 Remember: loss = average of (prediction - target)². Square each error, sum them, then divide by count.",
        severity: 'info'
    },
    {
        pattern: /FAIL.*Training should reduce loss/i,
        hint: "💡 Your training loop isn't improving the model. Make sure you're keeping weight changes that reduce loss and reverting changes that increase it.",
        severity: 'warning'
    }
];

/**
 * Find hints for a given error message
 */
export function findHints(errorMessage: string): Hint[] {
    return COMMON_HINTS.filter(hint => hint.pattern.test(errorMessage));
}

/**
 * Format output with hints and color coding
 */
export function formatOutputWithHints(output: string): {
    formatted: string;
    hints: string[];
} {
    const hints: string[] = [];

    // Find all applicable hints
    const matchedHints = findHints(output);
    matchedHints.forEach(hint => {
        hints.push(hint.hint);
    });

    // Color code different message types
    let formatted = output;

    // Success messages in green
    formatted = formatted.replace(/(✅|SUCCESS|PASS)/g, '✅ $1');

    // Error messages in red
    formatted = formatted.replace(/(❌|FAIL|ERROR)/g, '❌ $1');

    // Warning messages in yellow
    formatted = formatted.replace(/(⚠️|WARNING|WARN)/g, '⚠️ $1');

    return { formatted, hints };
}

/**
 * Get course-specific hints
 */
export function getCourseHints(courseId: string): Record<string, string> {
    const courseHints: Record<string, Record<string, string>> = {
        'build-own-db': {
            'step-1': 'Remember to use fs.readFileSync() and fs.writeFileSync(). Parse JSON with JSON.parse() and stringify with JSON.stringify().',
            'step-2': 'The get function should read the file, parse it, and return the value for the given key.',
            'step-3': 'Import the hash module and call createHash() before saving. Log the result to the console.'
        },
        'build-own-cli': {
            'step-1': 'The shebang line must be the very first line: #!/usr/bin/env node',
            'step-2': 'process.argv[2] contains the first user argument. Use it or default to "World".',
            'step-3': 'Use fs.readdirSync(process.cwd()) to list files in the current directory.'
        },
        'build-own-git': {
            'step-1': 'Git stores objects in .git/objects/. Create the directory structure first.',
            'step-2': 'Use zlib.deflateSync() to compress data before writing.',
            'step-3': 'SHA-1 hash: crypto.createHash("sha1").update(data).digest("hex")'
        },
        'build-own-redis': {
            'step-1': 'Create a TCP server with net.createServer(). Listen on port 6379.',
            'step-2': 'RESP format: +OK\\r\\n for simple strings, $5\\r\\nhello\\r\\n for bulk strings.',
            'step-3': 'Store key-value pairs in a Map or plain object.',
            'step-4': 'Store expiry time with Date.now() + milliseconds. Check if expired before returning.'
        },
        'build-own-ml': {
            'step-1': 'Sigmoid: 1 / (1 + Math.exp(-x)). Multiply inputs by weights, sum, add bias, then sigmoid.',
            'step-2': 'Loop through each set of weights and call neuron() for each one.',
            'step-3': 'Pass outputs from one layer as inputs to the next layer.',
            'step-4': 'MSE: sum of (prediction - target)² divided by number of examples.',
            'step-5': 'Try random weight changes. Keep them if loss decreases, revert if it increases.',
            'step-6': 'XOR needs more iterations (10000+) and a small learning rate (0.1 or less).',
            'step-7': 'Print the weights arrays and test with intermediate values like [0.5, 0.5].',
            'step-8': 'Save: JSON.stringify() the weights/biases object. Load: JSON.parse() and restore.'
        }
    };

    return courseHints[courseId] || {};
}
