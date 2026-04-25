import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Upload,
    Building2,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Zap,
    BrainCircuit,
    ChevronRight
} from 'lucide-react';

const CompanyMockGenerator = () => {
    const [file, setFile] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('upload'); // upload, processing, ready
    const [error, setError] = useState('');
    const [testData, setTestData] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleGenerate = async () => {
        if (!companyName.trim()) {
            setError('Please enter the target company name (e.g., TCS, Cognizant).');
            return;
        }
        if (!file) {
            setError('Please upload a paper or photo of the questions.');
            return;
        }

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

            // Step 2: Create Company Mock (Extract, Generate, Mix, Save)
            const mockRes = await api.post('/ai/create-company-mock', {
                text: uploadRes.data.text,
                companyName: companyName,
                totalCount: 10
            });

            setTestData(mockRes.data);
            setStage('ready');
        } catch (err) {
            console.error(err);
            let msg = 'Failed to generate mock. Ensure the file is clear and try again.';
            
            if (err.response?.data?.msg) {
                msg = err.response.data.msg;
            } else if (err.message) {
                msg = `System Error: ${err.message}`;
            }
            
            setError(msg);
            setStage('upload');
        } finally {
            setLoading(false);
        }
    };

    const startTest = () => {
        if (testData?.testId) {
            navigate(`/test?testId=${testData.testId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-6 animate-in fade-in slide-in-from-top-10 duration-700">
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                        AI Company <span className="bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Mock Engine</span>
                    </h1>
                </div>

                {stage === 'upload' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        {/* Company Name Input */}
                        <div className="relative group">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            <input
                                id="company_name_field"
                                name="company_name"
                                type="text"
                                placeholder="Target Company (e.g. TCS, Google, Infosys)"
                                className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg font-bold text-white placeholder:text-slate-600 shadow-2xl"
                                value={companyName}
                                onChange={(e) => {
                                    setCompanyName(e.target.value);
                                    if (error) setError('');
                                }}
                            />
                        </div>

                        {/* File Upload Area */}
                        <div className={`relative overflow-hidden group rounded-3xl border-2 border-dashed transition-all duration-500 ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'}`}>
                            <label className="flex flex-col items-center justify-center p-10 cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.txt" />
                                
                                <div className={`p-6 rounded-2xl mb-6 transition-all duration-500 ${file ? 'bg-blue-600/20 scale-110 shadow-blue-500/20 shadow-2xl' : 'bg-white/5 group-hover:scale-105'}`}>
                                    <Upload className={`w-10 h-10 ${file ? 'text-blue-400' : 'text-slate-500'}`} />
                                </div>
                                
                                <span className="text-xl font-black text-white mb-1">
                                    {file ? file.name : 'Drop Paper or Photos'}
                                </span>
                                <p className="text-slate-500 font-medium text-sm">Click to browse (PDF, PNG, JPG, TXT)</p>
                            </label>
                            
                            {/* Decorative elements */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            className="w-full py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-black shadow-2xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
                        >
                            Generate AI Mock <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                )}

                {stage === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="relative mb-12">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
                            <Loader2 className="w-32 h-32 text-blue-500 animate-spin relative z-10" />
                            <Sparkles className="absolute top-0 right-0 w-10 h-10 text-yellow-400 animate-bounce" />
                        </div>
                        
                        <h2 className="text-4xl font-black text-white mb-6">AI is Thinking...</h2>
                        
                        <div className="space-y-4 max-w-sm mx-auto">
                            {[
                                "Running OCR on uploaded documents",
                                "Extracting question patterns and difficulty",
                                "Generating similar high-quality MCQs",
                                "Mixing with existing company databases"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-400 font-medium opacity-0 animate-in fade-in duration-1000 fill-mode-forwards" style={{ animationDelay: `${i * 1.5}s` }}>
                                    <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stage === 'ready' && (
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-3">Mock Test Ready!</h2>
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                                <span className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Company</span>
                                <span className="text-lg font-black text-blue-400">{companyName}</span>
                            </div>
                            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                                <span className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Questions</span>
                                <span className="text-lg font-black text-indigo-400">{testData?.count || 10} Mixed</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-10 text-left">
                            <h3 className="flex items-center gap-2 text-indigo-300 font-bold mb-3">
                                <BrainCircuit className="w-5 h-5" /> AI Insight
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                We've generated ~80% of questions matching the specific pattern and difficulty of the uploaded paper. 
                                The remaining 20% were pulled from our public database to ensure broad variety and coverage.
                            </p>
                        </div>

                        <button
                            onClick={startTest}
                            className="w-full py-5 rounded-2xl bg-white text-slate-950 text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Start Assessment Now <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => setStage('upload')}
                            className="mt-6 text-slate-500 font-bold hover:text-white transition-colors"
                        >
                            Back to Upload
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyMockGenerator;
