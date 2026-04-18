import { useState } from 'react';
import api from '../services/api';
import {
    Upload,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight
} from 'lucide-react';

const UploadPaper = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('upload'); // upload, processing, review
    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setStage('processing');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Step 1: Extract Text via OCR
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Step 2: Process Text via AI
            const aiRes = await api.post('/ai/process-upload', { text: uploadRes.data.text });

            setExtractedQuestions(aiRes.data);
            setStage('review');
        } catch (err) {
            console.error(err);
            setError('Failed to process file. Please ensure it\'s a valid PDF or Image.');
            setStage('upload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        AI Paper <span className="text-blue-500">Extractor</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Upload old papers or photos of questions. Our AI will extract and categorize them for the community.
                    </p>
                </div>

                {stage === 'upload' && (
                    <div className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-4xl p-12 flex flex-col items-center justify-center transition-all hover:border-blue-500/30 group">
                        <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                            <Upload className="w-12 h-12 text-blue-400" />
                        </div>

                        <label className="cursor-pointer text-center">
                            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                            <span className="block text-xl font-bold text-white mb-2">
                                {file ? file.name : 'Select a PDF or Image'}
                            </span>
                            <span className="text-slate-500 text-sm">Drag and drop or click to browse</span>
                        </label>

                        {file && (
                            <button
                                onClick={handleUpload}
                                className="mt-8 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                Process File <ArrowRight className="w-5 h-5" />
                            </button>
                        )}

                        {error && (
                            <div className="mt-6 flex items-center gap-2 text-red-400 font-medium">
                                <AlertCircle className="w-5 h-5" /> {error}
                            </div>
                        )}
                    </div>
                )}

                {stage === 'processing' && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl p-20 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-10">
                            <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">Analyzing with AI...</h2>
                        <p className="text-slate-400 max-w-sm">
                            We're running OCR extraction and using Gemini 1.5 to structure the questions. This takes a few seconds.
                        </p>
                    </div>
                )}

                {stage === 'review' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-6 rounded-3xl mb-8">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">Extraction Successful</h3>
                                    <p className="text-green-200/60">We found {extractedQuestions.length} questions in your document.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStage('upload')}
                                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold"
                            >
                                Upload Another
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {extractedQuestions.map((q, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                                            {q.topic || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-6 leading-relaxed">{q.question_text}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {q.options?.map((opt, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border ${opt === q.correct_answer ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                                            </div>
                                        ))}
                                    </div>
                                    {q.explanation && (
                                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-sm italic">
                                            <strong>AI Explanation:</strong> {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPaper;
