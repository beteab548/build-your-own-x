# 🚀 Build Your Own X - Interactive Coding Platform

An interactive, browser-based learning platform where you **build industry-standard tools from scratch**. Inspired by the legendary [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x) repository, this project brings hands-on learning directly to your browser.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![WebContainer](https://img.shields.io/badge/WebContainer-Powered-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

### 🎯 **Interactive Learning**
- **In-Browser Code Execution**: Write and run Node.js code directly in your browser using [WebContainer](https://webcontainers.io/)
- **Real-Time Feedback**: Instant test results with detailed error messages and hints
- **Step-by-Step Progression**: Unlock new challenges as you complete each step
- **Progress Tracking**: Your code is automatically saved in localStorage

### 🛠️ **Professional Tools**
- **Monaco Editor**: The same editor that powers VS Code
- **Split-Pane Interface**: View instructions, code, and terminal simultaneously
- **File Management**: Work with multiple files just like a real project
- **Export Projects**: Download your completed code as a ZIP file

### 📚 **Course Catalog**

| Course | Difficulty | Lessons | What You'll Learn |
|--------|-----------|---------|-------------------|
| **Build Your Own Database** | Intermediate | 3 | File systems, JSON persistence, SHA-256 hashing |
| **Build Your Own CLI Tool** | Beginner | 3 | Argument parsing, file operations, command-line interfaces |
| **Build Your Own Git** | Advanced | 5 | Binary data, zlib compression, SHA-1 hashing, Git internals |
| **Build Your Own Redis** | Intermediate | 4 | TCP networking, RESP protocol, in-memory storage, TTL |
| **Build Your Own ML Model** | Advanced | 8 | Neural networks, backpropagation, gradient descent |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/build-your-own-x.git
cd build-your-own-x

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start learning!

### Building for Production

```bash
npm run build
npm start
```

---

## 🎓 How It Works

1. **Choose a Course**: Select from the dashboard
2. **Read Instructions**: Each step explains what to build
3. **Write Code**: Use the Monaco editor to implement the solution
4. **Run Tests**: Click "Run Code" to validate your implementation
5. **Progress**: Pass tests to unlock the next challenge
6. **Export**: Download your completed project

---

## 🏗️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[React Split](https://github.com/nathancahill/split/tree/master/packages/react-split)** - Resizable panels

### Runtime
- **[WebContainer API](https://webcontainers.io/)** - Browser-based Node.js runtime
- **[Zustand](https://github.com/pmndrs/zustand)** - State management

### UI Components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering

---

## 📁 Project Structure

```
build-your-own-x/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard (course catalog)
│   ├── course/[id]/       # Dynamic course pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── CodeRunner.tsx     # Main learning interface
│   ├── Editor.tsx         # Monaco editor wrapper
│   └── ExportButton.tsx   # Project export functionality
├── data/                  # Course content
│   ├── catalog.ts         # Course metadata
│   └── courses/           # Individual course definitions
│       ├── database.ts
│       ├── cli.ts
│       ├── git.ts
│       ├── redis.ts
│       └── ml.ts
├── lib/                   # Utilities
│   ├── webcontainer.ts    # WebContainer singleton
│   └── hints.ts           # Error hint system
└── public/                # Static assets
```

---

## 🎨 Design Philosophy

### **Learn by Building**
Instead of passive tutorials, you build real, working implementations. Each course teaches fundamental concepts by having you recreate industry-standard tools.

### **No Hand-Holding**
Instructions explain *what* to build, not *how*. You figure out the implementation, just like real-world engineering.

### **Instant Feedback**
Automated tests validate your work immediately. No waiting for code reviews or manual grading.

### **Zero Setup**
Everything runs in the browser. No Docker, no VMs, no local environment setup required.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding a New Course

1. Create a new file in `data/courses/your-course.ts`
2. Follow the existing course structure:

```typescript
export const COURSE = {
  id: 'build-own-something',
  title: 'Build Your Own Something',
  steps: [
    {
      id: 1,
      title: 'Step Title',
      content: '# Markdown instructions',
      initialFiles: { /* starter code */ },
      testCode: '/* validation logic */'
    }
    // ... more steps
  ]
};
```

3. Register in `data/catalog.ts`
4. Add an icon from [Lucide](https://lucide.dev/)
5. Test thoroughly!

### Improving Existing Courses
- Fix typos or unclear instructions
- Add better error messages
- Improve test coverage
- Add hints for common mistakes

### Code Contributions
- Follow the existing code style
- Add TypeScript types
- Test on multiple browsers
- Update documentation

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/build-your-own-x)

Or manually:

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload the .next folder to Netlify
```

### Environment Variables

No environment variables required! Everything runs client-side.

---

## 📝 License

MIT License - feel free to use this project for learning, teaching, or building your own courses!

---

## 🙏 Acknowledgments

- **[Build Your Own X](https://github.com/codecrafters-io/build-your-own-x)** - Original inspiration
- **[CodeCrafters](https://codecrafters.io/)** - Similar concept, different approach
- **[StackBlitz](https://stackblitz.com/)** - WebContainer technology
- **VS Code Team** - Monaco Editor

---

## 🐛 Known Issues

- WebContainer requires a modern browser with SharedArrayBuffer support
- Some browsers may require specific headers for WebContainer to work
- Mobile experience is optimized but desktop is recommended for coding

---

## 📧 Contact

Questions? Suggestions? Open an issue or reach out!

**Built with ❤️ for developers who love to learn by doing.**
