'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

type FileMap = Record<string, { code: string }>;

interface ExportButtonProps {
    files: FileMap;
    courseName: string;
    courseId: string;
}

export default function ExportButton({ files, courseName, courseId }: ExportButtonProps) {
    const handleExport = async () => {
        const zip = new JSZip();

        // Add all user files
        Object.keys(files).forEach(filename => {
            zip.file(filename, files[filename].code);
        });

        // Add a README for the exported project
        const readme = `# ${courseName} - Exported Project

This project was created using the Build Your Own X interactive learning platform.

## Files Included
${Object.keys(files).map(f => `- ${f}`).join('\n')}

## Running This Project

\`\`\`bash
# If this is a Node.js project
node index.js

# Or run specific files
node <filename>
\`\`\`

## About

Course: ${courseName}
Course ID: ${courseId}
Exported: ${new Date().toLocaleDateString()}

Learn more at: https://github.com/codecrafters-io/build-your-own-x
`;

        zip.file('README.md', readme);

        // Generate and download the ZIP
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${courseId}-${Date.now()}.zip`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export project. Please try again.');
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 transition-colors"
            title="Download project as ZIP"
        >
            <Download size={14} />
            Export
        </button>
    );
}
