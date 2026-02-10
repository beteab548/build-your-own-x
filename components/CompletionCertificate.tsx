'use client';

import React, { useRef } from 'react';
import { Award, Download, Share2, X } from 'lucide-react';

interface CompletionCertificateProps {
    courseName: string;
    courseId: string;
    onClose: () => void;
}

export default function CompletionCertificate({
    courseName,
    courseId,
    onClose
}: CompletionCertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            // Use html2canvas if available, otherwise just save as text
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 800;
            canvas.height = 600;

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 800, 600);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#7c3aed');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 600);

            // Border
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 10;
            ctx.strokeRect(20, 20, 760, 560);

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Certificate of Completion', 400, 120);

            ctx.font = '24px Arial';
            ctx.fillText('This certifies that', 400, 200);

            ctx.font = 'bold 36px Arial';
            ctx.fillText('Developer', 400, 260);

            ctx.font = '24px Arial';
            ctx.fillText('has successfully completed', 400, 320);

            ctx.font = 'bold 32px Arial';
            ctx.fillText(courseName, 400, 380);

            ctx.font = '20px Arial';
            ctx.fillText(completionDate, 400, 450);

            ctx.font = 'italic 18px Arial';
            ctx.fillText('Build Your Own X - Interactive Learning Platform', 400, 520);

            // Download
            const link = document.createElement('a');
            link.download = `${courseId}-certificate.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            alert('Failed to download certificate. Please try again.');
        }
    };

    const handleShare = () => {
        const text = `🎉 I just completed "${courseName}" on Build Your Own X! #BuildYourOwnX #Coding #Learning`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative max-w-3xl w-full">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Certificate */}
                <div
                    ref={certificateRef}
                    className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-12 rounded-3xl border-8 border-yellow-500/50 shadow-2xl"
                >
                    {/* Award Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-yellow-500/20 rounded-full">
                            <Award size={64} className="text-yellow-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold text-center mb-8 text-white tracking-tight">
                        Certificate of Completion
                    </h1>

                    {/* Body */}
                    <div className="text-center space-y-6 text-gray-200">
                        <p className="text-xl">This certifies that</p>

                        <p className="text-4xl font-bold text-white">Developer</p>

                        <p className="text-xl">has successfully completed</p>

                        <p className="text-3xl font-bold text-yellow-400">{courseName}</p>

                        <p className="text-lg text-gray-400 pt-8">{completionDate}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-white/10 text-center">
                        <p className="text-sm italic text-gray-400">
                            Build Your Own X - Interactive Learning Platform
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Master engineering fundamentals by building from scratch
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-8">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                    >
                        <Download size={20} />
                        Download Certificate
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold"
                    >
                        <Share2 size={20} />
                        Share on Twitter
                    </button>
                </div>
            </div>
        </div>
    );
}
