import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Target,
    AlertCircle,
    ChevronRight,
    Home,
    RotateCcw,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Sparkles
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const ResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
    const result = state?.result;

    if (!result) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Result Found</h2>
                <p className="text-slate-400 mb-8">It seems like you haven't taken this test yet or the result is missing.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const totalAnswered = result.correct_answers + result.wrong_answers;
    const accuracy = totalAnswered > 0 ? ((result.correct_answers / totalAnswered) * 100).toFixed(1) : 0;

    const chartData = {
        labels: result.topic_performance.map(t => t.topic),
        datasets: [{
            data: result.topic_performance.map(t => (t.correct / t.total) * 100),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(99, 102, 241, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(244, 63, 94, 0.8)',
            ],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
        }]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw.toFixed(1)}% Accuracy`
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center">
            {/* Header / Hero Stats */}
            <div className="w-full max-w-5xl bg-linear-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-8">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-linear-to-tr from-yellow-400 to-orange-500 p-1 mb-6 shadow-lg shadow-yellow-500/20"
                    >
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-yellow-400" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">Test Summary</h1>
                    <p className="text-blue-200/50 text-lg font-medium mb-10 italic">Detailed performance breakdown</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {[
                            { label: 'Score', val: result.score, color: 'text-blue-400' },
                            { label: 'Correct', val: result.correct_answers, color: 'text-green-400' },
                            { label: 'Wrong', val: result.wrong_answers, color: 'text-red-400' },
                            { label: 'Accuracy', val: accuracy + '%', color: 'text-indigo-400' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center backdrop-blur-sm"
                            >
                                <span className={`${stat.color} font-black text-3xl`}>{stat.val}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Analytics Section */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <Target className="w-8 h-8 text-blue-400" />
                            <h2 className="text-2xl font-black text-white tracking-tight">Performance Analytics</h2>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold ring-1 ring-blue-500/20">Topic Distribution</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Pie Chart */}
                        <div className="w-64 h-64 relative flex-shrink-0">
                            <Pie data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-20 h-20 rounded-full bg-slate-950 flex flex-col items-center justify-center border border-white/5 shadow-inner">
                                    <span className="text-xl font-black text-white">{accuracy}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className="grid grid-cols-1 gap-6 flex-grow w-full">
                            {result.topic_performance.map((item, idx) => {
                                const percent = ((item.correct / item.total) * 100).toFixed(0);
                                const color = chartData.datasets[0].backgroundColor[idx];
                                return (
                                    <div key={idx} className="group flex items-center gap-4">
                                        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: color }} />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="font-bold text-slate-300 text-sm uppercase tracking-wider">{item.topic}</span>
                                                <span className="text-xs font-black text-white">{percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full rounded-full" style={{ backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions / Weakness */}
                <div className="space-y-6">
                    <div className="bg-linear-to-br from-slate-900 to-blue-900/40 border border-blue-500/20 p-8 rounded-[2rem] relative overflow-hidden group">
                        <TrendingUp className="w-10 h-10 text-blue-400 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">Goal Discovery</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            {result.topic_performance && result.topic_performance.length > 0
                                ? `Focus on ${result.topic_performance[0].topic} to boost your logic scores.`
                                : "Analyze more sessions to reveal strengths."}
                        </p>
                        <button className="flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:gap-3 transition-all underline decoration-blue-500/30 underline-offset-4">
                            Full Roadmap <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 transition-all">
                                <span className="font-bold">Home</span>
                                <Home className="w-4 h-4 text-blue-400" />
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 transition-all">
                                <span className="font-bold">Retake Mock</span>
                                <RotateCcw className="w-4 h-4 text-indigo-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Review Section */}
            <div className="w-full max-w-5xl mt-8 mb-20">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 rounded-2xl bg-green-500/10 ring-1 ring-green-500/20 text-green-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Review Solutions</h2>
                            <p className="text-slate-500 text-sm mt-1">Select a question to see the master solution</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Interactive Palette */}
                        <div className="xl:col-span-4 h-fit">
                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {state?.questions?.map((q, idx) => {
                                    const isCorrect = state.userAnswers[idx] === q.correct_answer;
                                    const isSelected = selectedReviewIndex === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedReviewIndex(idx)}
                                            className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${isSelected
                                                    ? 'scale-110 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-950'
                                                    : ''
                                                } ${isCorrect
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-around items-center py-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400/70 tracking-tighter">
                                    <div className="w-2 h-2 rounded-full bg-green-500" /> Correct
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400/70 tracking-tighter">
                                    <div className="w-2 h-2 rounded-full bg-red-500" /> Wrong
                                </div>
                            </div>
                        </div>

                        {/* Stable Detail View */}
                        <div className="xl:col-span-8 min-h-[450px]">
                            <AnimatePresence mode="wait">
                                {state?.questions && state.questions[selectedReviewIndex] && (
                                    <motion.div
                                        key={selectedReviewIndex}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="h-full"
                                    >
                                        {(() => {
                                            const q = state.questions[selectedReviewIndex];
                                            const userAns = state.userAnswers[selectedReviewIndex];
                                            const isCorrect = userAns === q.correct_answer;

                                            return (
                                                <div className="bg-slate-900/50 border border-white/10 p-10 rounded-[2rem] h-full flex flex-col">
                                                    <div className="flex items-start justify-between gap-6 mb-8">
                                                        <div className="flex items-start gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center font-black text-2xl text-blue-400 flex-shrink-0">
                                                                {selectedReviewIndex + 1}
                                                            </div>
                                                            <h4 className="text-xl md:text-2xl font-bold text-white leading-tight">{q.question_text}</h4>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                            }`}>
                                                            {isCorrect ? 'Mastery' : 'Mistake'}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                        <div className={`p-6 rounded-[1.5rem] border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                                                            <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-40">Your Answer</span>
                                                            <p className="text-lg font-bold">{userAns || "Skipped"}</p>
                                                        </div>
                                                        {!isCorrect && (
                                                            <div className="p-6 rounded-[1.5rem] bg-green-500/10 border border-green-500/20 text-green-200 shadow-lg shadow-green-500/5">
                                                                <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-40">Correct Logic</span>
                                                                <p className="text-lg font-bold">{q.correct_answer}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {q.explanation && (
                                                        <div className="p-8 rounded-[1.5rem] bg-linear-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/10 mt-auto">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Sparkles className="w-5 h-5 text-blue-400" />
                                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Expert Shortcut</span>
                                                            </div>
                                                            <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                                                {q.explanation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
