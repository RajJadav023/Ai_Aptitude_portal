import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Send,
    AlertCircle,
    CheckCircle2,
    BrainCircuit,
    Loader2
} from 'lucide-react';

const TestEngine = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const topic = query.get('topic');
    const company = query.get('company');
    const testId = query.get('testId');
    const limit = query.get('limit') || 10;

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const timerRef = useRef(null);

    // Save session to localStorage
    useEffect(() => {
        if (questions.length > 0 && !isSubmitting) {
            const sessionData = {
                questions,
                userAnswers,
                timeLeft,
                currentIdx,
                topic,
                company,
                limit,
                lastStep: Date.now()
            };
            localStorage.setItem('aptitude_active_test', JSON.stringify(sessionData));
        }
    }, [questions, userAnswers, timeLeft, currentIdx]);

    // Handle session restoration and initial fetch
    useEffect(() => {
        const initTest = async () => {
            const savedSession = localStorage.getItem('aptitude_active_test');
            if (savedSession) {
                const session = JSON.parse(savedSession);
                // Check if session is still valid (not more than 1 hour old and matches current test params)
                const isMatch = (session.topic === topic && session.company === company && session.testId === testId);
                const isRecent = (Date.now() - session.lastStep) < 3600000;

                if (isMatch && isRecent) {
                    setQuestions(session.questions);
                    setUserAnswers(session.userAnswers || {});
                    setTimeLeft(session.timeLeft);
                    setCurrentIdx(session.currentIdx || 0);
                    setLoading(false);
                } else {
                    localStorage.removeItem('aptitude_active_test');
                    await fetchQuestions();
                }
            } else {
                await fetchQuestions();
            }
        };

        const fetchQuestions = async () => {
            try {
                if (testId) {
                    const res = await api.get(`/tests/${testId}`);
                    setQuestions(res.data.questions_list);
                } else {
                    const res = await api.get('/questions', {
                        params: { topic, company, limit }
                    });
                    setQuestions(res.data);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            }
        };

        initTest();

        // Timer
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Robust Navigation Interception
        const handlePopState = (e) => {
            if (questions.length > 0 && !isSubmitting) {
                // If the user tries to go back, we push them FORWARD again immediately
                // to stay on the quiz page, then show our modal.
                window.history.pushState(null, document.title, window.location.href);
                setShowExitModal(true);
            }
        };

        // Initial push to create a "popable" state for our lock
        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            clearInterval(timerRef.current);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [topic, company, limit, questions.length, isSubmitting]);

    const handleOptionSelect = (option) => {
        setUserAnswers({
            ...userAnswers,
            [currentIdx]: option
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        clearInterval(timerRef.current);

        const payload = {
            questions_list: questions.map(q => q._id),
            answers: questions.map((_, i) => userAnswers[i] || null)
        };

        try {
            const res = await api.post('/tests/submit', payload);
            localStorage.removeItem('aptitude_active_test');
            navigate(`/result/${res.data._id}`, {
                replace: true,
                state: {
                    result: res.data,
                    questions: questions,
                    userAnswers: userAnswers
                }
            });
        } catch (err) {
            console.error(err);
            alert('Error submitting test');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        // Clear listeners and storage before navigating
        localStorage.removeItem('aptitude_active_test');
        window.onpopstate = null; // Kill any global popstate locks
        // Navigate to dashboard
        window.location.href = '/dashboard'; // Force a full navigation to clear any history loops
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse" />
                <p className="text-slate-400 font-medium animate-pulse">Assembling your test questions...</p>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center">
            {/* Header / Timer */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-8 bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExit}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-none">
                            {topic || company} Test
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">QC: {currentIdx + 1}/{questions.length}</p>
                    </div>
                </div>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-blue-400'}`}>
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Question Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-4xl shadow-2xl min-h-[400px] flex flex-col">
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-white mb-10 leading-relaxed">
                                {currentQuestion.question_text}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`group relative flex items-center p-5 rounded-2xl border transition-all duration-300 text-left ${userAnswers[currentIdx] === option ? 'bg-blue-600/20 border-blue-500/50 text-white ring-2 ring-blue-500/20' : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-300 hover:text-white'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mr-4 transition-colors font-bold ${userAnswers[currentIdx] === option ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-medium text-lg">{option}</span>
                                        {userAnswers[currentIdx] === option && (
                                            <div className="absolute right-6">
                                                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                            <button
                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentIdx === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all font-bold"
                            >
                                <ChevronLeft className="w-5 h-5" /> Previous
                            </button>

                            <div className="hidden sm:block flex-grow mx-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {currentIdx === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-lg shadow-green-600/20"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Finish Test</>}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Next <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Question Palette */}
                <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Question Palette</h4>
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentIdx === i ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30' : userAnswers[i] ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-400'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 space-y-3 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                                <div className="w-4 h-4 rounded-md bg-green-500/20 border border-green-500/30" /> Answered
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                                <div className="w-4 h-4 rounded-md bg-white/5 border border-white/5" /> Unanswered
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-white">
                                <div className="w-4 h-4 rounded-md bg-blue-500 border border-blue-500" /> Current
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Pro Tip</h4>
                        </div>
                        <p className="text-indigo-200/60 text-sm leading-relaxed">
                            Don't spend too much time on one question. Use the palette to skip and return later.
                        </p>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showExitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExitModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Quit Test?</h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Your current progress will be lost. Are you sure you want to exit the quiz?
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className="py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Stay
                                </button>
                                <button
                                    onClick={confirmExit}
                                    className="py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all"
                                >
                                    Quit
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestEngine;
