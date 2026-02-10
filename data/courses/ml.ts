export type FileMap = {
    [filename: string]: { code: string; hidden?: boolean };
};

export type Step = {
    id: number;
    title: string;
    content: string; // Markdown
    initialFiles?: FileMap; // Only for the first step
    newFiles?: FileMap; // Files to inject when reaching this step
    testCode?: string;
};

export const COURSE: { id: string; title: string; steps: Step[] } = {
    id: 'build-own-ml',
    title: 'Build Your Own ML Model',
    steps: [
        {
            id: 1,
            title: 'Understanding Neurons',
            content: `
# 1. Understanding Neurons

A neuron is the basic building block of a neural network. It takes inputs, multiplies them by weights, adds a bias, and applies an activation function.

### The Math
\`\`\`
output = activate(sum(inputs * weights) + bias)
\`\`\`

### Your Task
Implement a single neuron in \`neuron.js\`.

1. Create a function \`neuron(inputs, weights, bias)\`
2. Multiply each input by its corresponding weight
3. Sum all the results and add the bias
4. Apply the sigmoid activation function: \`1 / (1 + e^(-x))\`
5. Return the output

*Hint: Use \`Math.exp()\` for the exponential function.*
            `,
            initialFiles: {
                'neuron.js': {
                    code: `// Sigmoid activation function
function sigmoid(x) {
  // TODO: Implement sigmoid: 1 / (1 + e^(-x))
  return 0;
}

function neuron(inputs, weights, bias) {
  // TODO:
  // 1. Multiply each input by its weight
  // 2. Sum all weighted inputs
  // 3. Add bias
  // 4. Apply sigmoid activation
  return 0;
}

module.exports = { neuron, sigmoid };
`
                },
                'index.js': {
                    code: `const { neuron } = require('./neuron.js');

// Test a simple neuron
const inputs = [1.0, 0.5];
const weights = [0.7, 0.3];
const bias = 0.1;

const output = neuron(inputs, weights, bias);
console.log('Neuron output:', output);
`
                },
                'package.json': {
                    code: `{"name": "neural-network", "type": "commonjs"}`
                }
            },
            testCode: `
const { neuron, sigmoid } = require('./neuron.js');

try {
  // Test sigmoid function
  const sig0 = sigmoid(0);
  if (Math.abs(sig0 - 0.5) > 0.01) {
    throw new Error("FAIL: sigmoid(0) should be ~0.5, got " + sig0);
  }

  const sig1 = sigmoid(1);
  if (Math.abs(sig1 - 0.731) > 0.01) {
    throw new Error("FAIL: sigmoid(1) should be ~0.731, got " + sig1);
  }

  // Test neuron
  const output = neuron([1, 0], [0.5, 0.5], 0);
  if (Math.abs(output - 0.622) > 0.01) {
    throw new Error("FAIL: neuron([1,0], [0.5,0.5], 0) should be ~0.622, got " + output);
  }

  console.log("✅ Neuron working correctly!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 2,
            title: 'Building a Layer',
            content: `
# 2. Building a Layer

A neural network layer is just multiple neurons working together. Each neuron in the layer processes the same inputs but has different weights.

### Your Task
Create a \`layer\` function that processes inputs through multiple neurons.

1. Take inputs, an array of weight arrays, and an array of biases
2. For each neuron (each set of weights), compute its output
3. Return an array of all neuron outputs

Example:
\`\`\`javascript
layer([1, 0], [[0.5, 0.3], [0.2, 0.8]], [0.1, -0.1])
// Returns outputs from 2 neurons
\`\`\`
            `,
            newFiles: {
                'neuron.js': {
                    code: `function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function neuron(inputs, weights, bias) {
  let sum = bias;
  for (let i = 0; i < inputs.length; i++) {
    sum += inputs[i] * weights[i];
  }
  return sigmoid(sum);
}

function layer(inputs, weightsArray, biases) {
  // TODO: 
  // For each set of weights (each neuron in the layer)
  // Call neuron() and collect the outputs
  return [];
}

module.exports = { neuron, sigmoid, layer };
`
                },
                'index.js': {
                    code: `const { layer } = require('./neuron.js');

// Test a layer with 3 neurons
const inputs = [1.0, 0.5, 0.2];
const weights = [
  [0.2, 0.8, -0.5],  // Neuron 1
  [0.5, -0.91, 0.26], // Neuron 2
  [-0.26, -0.27, 0.17] // Neuron 3
];
const biases = [0.1, -0.2, 0.0];

const outputs = layer(inputs, weights, biases);
console.log('Layer outputs:', outputs);
`
                }
            },
            testCode: `
const { layer } = require('./neuron.js');

try {
  const outputs = layer([1, 0], [[0.5, 0.3], [0.2, 0.8]], [0, 0]);
  
  if (!Array.isArray(outputs)) {
    throw new Error("FAIL: layer() should return an array");
  }
  
  if (outputs.length !== 2) {
    throw new Error("FAIL: Expected 2 outputs, got " + outputs.length);
  }
  
  // Check first neuron output
  if (Math.abs(outputs[0] - 0.622) > 0.01) {
    throw new Error("FAIL: First neuron output incorrect. Expected ~0.622, got " + outputs[0]);
  }

  console.log("✅ Layer working correctly!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 3,
            title: 'Forward Propagation',
            content: `
# 3. Forward Propagation

Now let's build a complete neural network! Forward propagation means passing data through multiple layers.

### Network Structure
\`\`\`
Input Layer (2 neurons) 
  ↓
Hidden Layer (3 neurons)
  ↓
Output Layer (1 neuron)
\`\`\`

### Your Task
Create a \`Network\` class with a \`forward()\` method.

1. Store layers (weights and biases for each layer)
2. Implement \`forward(inputs)\` that passes data through all layers
3. Each layer's output becomes the next layer's input
            `,
            newFiles: {
                'network.js': {
                    code: `const { layer } = require('./neuron.js');

class Network {
  constructor() {
    // Layer 1: 2 inputs -> 3 neurons
    this.layer1Weights = [
      [0.5, 0.3],
      [0.2, 0.8],
      [-0.3, 0.4]
    ];
    this.layer1Biases = [0.1, -0.1, 0.2];
    
    // Layer 2: 3 inputs -> 1 neuron
    this.layer2Weights = [[0.6, -0.4, 0.3]];
    this.layer2Biases = [0.0];
  }
  
  forward(inputs) {
    // TODO:
    // 1. Pass inputs through layer 1
    // 2. Pass layer 1 outputs through layer 2
    // 3. Return final output
    return 0;
  }
}

module.exports = { Network };
`
                },
                'index.js': {
                    code: `const { Network } = require('./network.js');

const net = new Network();
const prediction = net.forward([1.0, 0.0]);
console.log('Network prediction:', prediction);
`
                }
            },
            testCode: `
const { Network } = require('./network.js');

try {
  const net = new Network();
  const output = net.forward([1, 0]);
  
  if (typeof output !== 'number') {
    throw new Error("FAIL: forward() should return a number, got " + typeof output);
  }
  
  if (output < 0 || output > 1) {
    throw new Error("FAIL: Output should be between 0 and 1 (sigmoid), got " + output);
  }
  
  // Test with different input
  const output2 = net.forward([0, 1]);
  if (output === output2) {
    throw new Error("FAIL: Different inputs should produce different outputs");
  }

  console.log("✅ Forward propagation working!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 4,
            title: 'Loss Function',
            content: `
# 4. Measuring Error

To train a network, we need to measure how wrong our predictions are. This is called the **loss** or **error**.

### Mean Squared Error (MSE)
\`\`\`
loss = (prediction - actual)²
\`\`\`

For multiple examples:
\`\`\`
MSE = average of all (prediction - actual)²
\`\`\`

### Your Task
Implement a loss function.

1. Add a \`calculateLoss(predictions, targets)\` function
2. For each prediction/target pair, calculate squared error
3. Return the average (mean) of all errors
            `,
            newFiles: {
                'network.js': {
                    code: `const { layer } = require('./neuron.js');

class Network {
  constructor() {
    this.layer1Weights = [
      [0.5, 0.3],
      [0.2, 0.8],
      [-0.3, 0.4]
    ];
    this.layer1Biases = [0.1, -0.1, 0.2];
    
    this.layer2Weights = [[0.6, -0.4, 0.3]];
    this.layer2Biases = [0.0];
  }
  
  forward(inputs) {
    const hidden = layer(inputs, this.layer1Weights, this.layer1Biases);
    const output = layer(hidden, this.layer2Weights, this.layer2Biases);
    return output[0];
  }
  
  calculateLoss(predictions, targets) {
    // TODO:
    // 1. For each prediction/target pair, calculate (prediction - target)²
    // 2. Sum all squared errors
    // 3. Divide by number of examples (average)
    return 0;
  }
}

module.exports = { Network };
`
                },
                'index.js': {
                    code: `const { Network } = require('./network.js');

const net = new Network();

// Training data: XOR problem
const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [0, 1, 1, 0];

// Get predictions
const predictions = inputs.map(input => net.forward(input));
console.log('Predictions:', predictions);
console.log('Targets:', targets);

const loss = net.calculateLoss(predictions, targets);
console.log('Loss (error):', loss);
`
                }
            },
            testCode: `
const { Network } = require('./network.js');

try {
  const net = new Network();
  
  // Test loss calculation
  const predictions = [0.8, 0.2, 0.6];
  const targets = [1, 0, 0.5];
  
  const loss = net.calculateLoss(predictions, targets);
  
  // Expected: ((0.8-1)² + (0.2-0)² + (0.6-0.5)²) / 3
  // = (0.04 + 0.04 + 0.01) / 3 = 0.03
  const expected = 0.03;
  
  if (Math.abs(loss - expected) > 0.01) {
    throw new Error("FAIL: Loss calculation incorrect. Expected ~" + expected + ", got " + loss);
  }

  console.log("✅ Loss function working!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 5,
            title: 'Gradient Descent',
            content: `
# 5. Training the Network

Now for the magic: **backpropagation** and **gradient descent**. We'll use a simplified approach with random weight adjustments.

### The Idea
1. Make a prediction
2. Calculate the error
3. Adjust weights slightly in a random direction
4. If error decreases, keep the change
5. Repeat!

This is a simplified version. Real backpropagation calculates exact gradients, but this teaches the concept.

### Your Task
Implement a \`train()\` method that improves the network.

1. Try small random changes to weights
2. Keep changes that reduce loss
3. Repeat for multiple iterations
            `,
            newFiles: {
                'network.js': {
                    code: `const { layer } = require('./neuron.js');

class Network {
  constructor() {
    this.layer1Weights = [
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5]
    ];
    this.layer1Biases = [0, 0, 0];
    
    this.layer2Weights = [[Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]];
    this.layer2Biases = [0];
  }
  
  forward(inputs) {
    const hidden = layer(inputs, this.layer1Weights, this.layer1Biases);
    const output = layer(hidden, this.layer2Weights, this.layer2Biases);
    return output[0];
  }
  
  calculateLoss(predictions, targets) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i];
      sum += error * error;
    }
    return sum / predictions.length;
  }
  
  train(inputs, targets, iterations = 1000) {
    // TODO:
    // 1. Calculate current loss
    // 2. For each iteration:
    //    - Try small random change to a random weight
    //    - If loss improves, keep it
    //    - Otherwise, revert
    // 3. Log progress every 100 iterations
    
    console.log('Training started...');
    // Your code here
    console.log('Training complete!');
  }
}

module.exports = { Network };
`
                },
                'index.js': {
                    code: `const { Network } = require('./network.js');

const net = new Network();

// XOR problem
const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [0, 1, 1, 0];

// Train the network
net.train(inputs, targets, 5000);

// Test predictions
console.log('\\nFinal predictions:');
inputs.forEach((input, i) => {
  const pred = net.forward(input);
  console.log(\`Input: [\${input}] -> Prediction: \${pred.toFixed(3)}, Target: \${targets[i]}\`);
});
`
                }
            },
            testCode: `
const { Network } = require('./network.js');

try {
  const net = new Network();
  
  const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const targets = [0, 1, 1, 0];
  
  // Get initial loss
  const initialPreds = inputs.map(inp => net.forward(inp));
  const initialLoss = net.calculateLoss(initialPreds, targets);
  
  // Train
  net.train(inputs, targets, 100);
  
  // Get final loss
  const finalPreds = inputs.map(inp => net.forward(inp));
  const finalLoss = net.calculateLoss(finalPreds, targets);
  
  if (finalLoss >= initialLoss) {
    throw new Error("FAIL: Training should reduce loss. Initial: " + initialLoss.toFixed(4) + ", Final: " + finalLoss.toFixed(4));
  }

  console.log("✅ Training reduces loss!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 6,
            title: 'Solving XOR',
            content: `
# 6. The XOR Challenge

XOR (exclusive OR) is a classic problem that simple models can't solve. It requires a hidden layer.

### XOR Truth Table
\`\`\`
0 XOR 0 = 0
0 XOR 1 = 1
1 XOR 0 = 1
1 XOR 1 = 0
\`\`\`

### Your Task
Improve your training algorithm to actually solve XOR.

**Hint**: You need:
1. More training iterations (try 10,000+)
2. A good learning rate (size of weight changes)
3. Patience - it might take a while!

The goal: Get all 4 predictions within 0.1 of their targets.
            `,
            newFiles: {
                'index.js': {
                    code: `const { Network } = require('./network.js');

console.log('🧠 Training Neural Network to solve XOR...\\n');

const net = new Network();

// XOR problem
const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [0, 1, 1, 0];

// Train with more iterations
net.train(inputs, targets, 10000);

// Test final accuracy
console.log('\\n📊 Final Results:');
let correct = 0;
inputs.forEach((input, i) => {
  const pred = net.forward(input);
  const rounded = Math.round(pred);
  const isCorrect = rounded === targets[i];
  if (isCorrect) correct++;
  
  console.log(\`[\${input}] -> \${pred.toFixed(3)} ≈ \${rounded} (target: \${targets[i]}) \${isCorrect ? '✓' : '✗'}\`);
});

console.log(\`\\nAccuracy: \${correct}/4 (\${(correct/4*100).toFixed(0)}%)\`);
`
                }
            },
            testCode: `
const { Network } = require('./network.js');

try {
  const net = new Network();
  
  const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const targets = [0, 1, 1, 0];
  
  // Train extensively
  net.train(inputs, targets, 5000);
  
  // Check if XOR is solved
  let allCorrect = true;
  for (let i = 0; i < inputs.length; i++) {
    const pred = net.forward(inputs[i]);
    const error = Math.abs(pred - targets[i]);
    
    if (error > 0.3) {  // Lenient threshold
      allCorrect = false;
      console.log(\`Prediction for [\${inputs[i]}]: \${pred.toFixed(3)}, target: \${targets[i]}, error: \${error.toFixed(3)}\`);
    }
  }
  
  if (!allCorrect) {
    console.log("⚠️ XOR not fully solved yet, but training is working!");
    console.log("Tip: Try more iterations or adjust your learning rate");
  }
  
  console.log("✅ Neural network training complete!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 7,
            title: 'Visualization',
            content: `
# 7. Understanding the Network

Let's add visualization to see what the network learned.

### Your Task
Add a \`visualize()\` method that shows:
1. Current weights for each layer
2. Predictions for all 4 XOR inputs
3. Decision boundary (what the network thinks about points between 0 and 1)

This helps you understand how the network "thinks"!
            `,
            newFiles: {
                'network.js': {
                    code: `const { layer } = require('./neuron.js');

class Network {
  constructor() {
    this.layer1Weights = [
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5]
    ];
    this.layer1Biases = [0, 0, 0];
    
    this.layer2Weights = [[Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]];
    this.layer2Biases = [0];
  }
  
  forward(inputs) {
    const hidden = layer(inputs, this.layer1Weights, this.layer1Biases);
    const output = layer(hidden, this.layer2Weights, this.layer2Biases);
    return output[0];
  }
  
  calculateLoss(predictions, targets) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i];
      sum += error * error;
    }
    return sum / predictions.length;
  }
  
  train(inputs, targets, iterations = 1000) {
    const learningRate = 0.1;
    
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate current loss
      let predictions = inputs.map(inp => this.forward(inp));
      let currentLoss = this.calculateLoss(predictions, targets);
      
      // Try adjusting a random weight
      const layer = Math.random() < 0.5 ? 1 : 2;
      
      if (layer === 1) {
        const i = Math.floor(Math.random() * this.layer1Weights.length);
        const j = Math.floor(Math.random() * this.layer1Weights[i].length);
        const oldWeight = this.layer1Weights[i][j];
        
        this.layer1Weights[i][j] += (Math.random() - 0.5) * learningRate;
        
        predictions = inputs.map(inp => this.forward(inp));
        const newLoss = this.calculateLoss(predictions, targets);
        
        if (newLoss > currentLoss) {
          this.layer1Weights[i][j] = oldWeight;
        }
      } else {
        const i = Math.floor(Math.random() * this.layer2Weights.length);
        const j = Math.floor(Math.random() * this.layer2Weights[i].length);
        const oldWeight = this.layer2Weights[i][j];
        
        this.layer2Weights[i][j] += (Math.random() - 0.5) * learningRate;
        
        predictions = inputs.map(inp => this.forward(inp));
        const newLoss = this.calculateLoss(predictions, targets);
        
        if (newLoss > currentLoss) {
          this.layer2Weights[i][j] = oldWeight;
        }
      }
      
      if (iter % 1000 === 0) {
        predictions = inputs.map(inp => this.forward(inp));
        currentLoss = this.calculateLoss(predictions, targets);
        console.log(\`Iteration \${iter}, Loss: \${currentLoss.toFixed(4)}\`);
      }
    }
  }
  
  visualize() {
    // TODO:
    // 1. Print layer 1 weights
    // 2. Print layer 2 weights
    // 3. Show predictions for test points like [0.5, 0.5]
    console.log('=== Network Visualization ===');
    // Your code here
  }
}

module.exports = { Network };
`
                },
                'index.js': {
                    code: `const { Network } = require('./network.js');

const net = new Network();

const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [0, 1, 1, 0];

net.train(inputs, targets, 5000);

// Visualize the trained network
net.visualize();

// Test some intermediate points
console.log('\\n🔍 Testing intermediate points:');
const testPoints = [[0.5, 0.5], [0.25, 0.75], [0.75, 0.25]];
testPoints.forEach(point => {
  const pred = net.forward(point);
  console.log(\`[\${point}] -> \${pred.toFixed(3)}\`);
});
`
                }
            },
            testCode: `
const { Network } = require('./network.js');

try {
  const net = new Network();
  
  // Check if visualize method exists
  if (typeof net.visualize !== 'function') {
    throw new Error("FAIL: visualize() method not implemented");
  }
  
  // Train first
  const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const targets = [0, 1, 1, 0];
  net.train(inputs, targets, 1000);
  
  // Capture visualization output
  let output = '';
  const oldLog = console.log;
  console.log = (...args) => { output += args.join(' ') + '\\n'; };
  
  net.visualize();
  
  console.log = oldLog;
  
  if (output.length < 10) {
    throw new Error("FAIL: visualize() should print network information");
  }

  console.log("✅ Visualization working!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        },
        {
            id: 8,
            title: 'Model Persistence',
            content: `
# 8. Save & Load Models

The final piece: saving your trained model so you don't have to retrain it every time!

### Your Task
Implement \`save()\` and \`load()\` methods.

1. \`save(filename)\`: Write weights and biases to a JSON file
2. \`load(filename)\`: Read weights and biases from a JSON file
3. Use \`fs.writeFileSync()\` and \`fs.readFileSync()\`

Now you can train once and reuse the model!
            `,
            newFiles: {
                'network.js': {
                    code: `const { layer } = require('./neuron.js');
const fs = require('fs');

class Network {
  constructor() {
    this.layer1Weights = [
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5]
    ];
    this.layer1Biases = [0, 0, 0];
    
    this.layer2Weights = [[Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]];
    this.layer2Biases = [0];
  }
  
  forward(inputs) {
    const hidden = layer(inputs, this.layer1Weights, this.layer1Biases);
    const output = layer(hidden, this.layer2Weights, this.layer2Biases);
    return output[0];
  }
  
  calculateLoss(predictions, targets) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i];
      sum += error * error;
    }
    return sum / predictions.length;
  }
  
  train(inputs, targets, iterations = 1000) {
    const learningRate = 0.1;
    
    for (let iter = 0; iter < iterations; iter++) {
      let predictions = inputs.map(inp => this.forward(inp));
      let currentLoss = this.calculateLoss(predictions, targets);
      
      const layer = Math.random() < 0.5 ? 1 : 2;
      
      if (layer === 1) {
        const i = Math.floor(Math.random() * this.layer1Weights.length);
        const j = Math.floor(Math.random() * this.layer1Weights[i].length);
        const oldWeight = this.layer1Weights[i][j];
        
        this.layer1Weights[i][j] += (Math.random() - 0.5) * learningRate;
        
        predictions = inputs.map(inp => this.forward(inp));
        const newLoss = this.calculateLoss(predictions, targets);
        
        if (newLoss > currentLoss) {
          this.layer1Weights[i][j] = oldWeight;
        }
      } else {
        const i = Math.floor(Math.random() * this.layer2Weights.length);
        const j = Math.floor(Math.random() * this.layer2Weights[i].length);
        const oldWeight = this.layer2Weights[i][j];
        
        this.layer2Weights[i][j] += (Math.random() - 0.5) * learningRate;
        
        predictions = inputs.map(inp => this.forward(inp));
        const newLoss = this.calculateLoss(predictions, targets);
        
        if (newLoss > currentLoss) {
          this.layer2Weights[i][j] = oldWeight;
        }
      }
      
      if (iter % 1000 === 0) {
        predictions = inputs.map(inp => this.forward(inp));
        currentLoss = this.calculateLoss(predictions, targets);
        console.log(\`Iteration \${iter}, Loss: \${currentLoss.toFixed(4)}\`);
      }
    }
  }
  
  visualize() {
    console.log('=== Network Weights ===');
    console.log('Layer 1:', this.layer1Weights);
    console.log('Layer 2:', this.layer2Weights);
  }
  
  save(filename) {
    // TODO:
    // 1. Create an object with all weights and biases
    // 2. Convert to JSON string
    // 3. Write to file using fs.writeFileSync()
  }
  
  load(filename) {
    // TODO:
    // 1. Read file using fs.readFileSync()
    // 2. Parse JSON
    // 3. Restore weights and biases
  }
}

module.exports = { Network };
`
                },
                'index.js': {
                    code: `const { Network } = require('./network.js');

console.log('🎓 Final Project: Persistent Neural Network\\n');

const net = new Network();

const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [0, 1, 1, 0];

// Train the network
console.log('Training...');
net.train(inputs, targets, 5000);

// Save the model
console.log('\\nSaving model to model.json...');
net.save('model.json');

// Create a new network and load the saved model
console.log('Loading model into new network...\\n');
const loadedNet = new Network();
loadedNet.load('model.json');

// Test that loaded model works
console.log('Testing loaded model:');
inputs.forEach((input, i) => {
  const pred = loadedNet.forward(input);
  console.log(\`[\${input}] -> \${pred.toFixed(3)} (target: \${targets[i]})\`);
});

console.log('\\n✅ Model saved and loaded successfully!');
`
                }
            },
            testCode: `
const { Network } = require('./network.js');
const fs = require('fs');

try {
  const net = new Network();
  
  const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const targets = [0, 1, 1, 0];
  
  // Train
  net.train(inputs, targets, 1000);
  
  // Save
  net.save('test_model.json');
  
  // Check file exists
  if (!fs.existsSync('test_model.json')) {
    throw new Error("FAIL: Model file was not created");
  }
  
  // Load into new network
  const newNet = new Network();
  newNet.load('test_model.json');
  
  // Compare predictions
  const pred1 = net.forward([1, 0]);
  const pred2 = newNet.forward([1, 0]);
  
  if (Math.abs(pred1 - pred2) > 0.001) {
    throw new Error("FAIL: Loaded model predictions don't match original. Original: " + pred1 + ", Loaded: " + pred2);
  }

  console.log("✅ Model persistence working!");
  console.log("🎉 Congratulations! You've built a complete neural network!");
  console.log("SUCCESS_TOKEN");
} catch (err) {
  console.log(err.message);
}
`
        }
    ]
};
