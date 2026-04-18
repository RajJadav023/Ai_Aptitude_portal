import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Building2, BrainCircuit, Search, ChevronRight, LogOut, Loader2 } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [topics, setTopics] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [testLimit, setTestLimit] = useState(20);
    const [activeTab, setActiveTab] = useState('companies'); // 'companies' or 'topics'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [topicsRes, companiesRes] = await Promise.all([
                    api.get('/questions/topics'),
                    api.get('/questions/companies')
                ]);
                setTopics(topicsRes.data);
                setCompanies(companiesRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTopics = topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredCompanies = companies.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const startTest = (type, value) => {
        navigate(`/test?${type}=${encodeURIComponent(value)}&limit=${testLimit}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            {/* Sidebar / Top Nav */}
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/20">
                            <BrainCircuit className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Aptitude<span className="text-blue-500">AI</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-white">{user?.name}</span>
                            <span className="text-xs text-slate-500">Aspirant</span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-300"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        Power up your <span className="bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">preparation</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Select a topic or dynamic company mock test to begin. AI-powered analysis will follow
                        your performance to identify weak spots.
                    </p>
                </div>
                {/* Tab Navigation */}
                <div className="flex items-center gap-8 border-b border-white/5 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'companies', label: 'Company Mocks', icon: Building2 },
                        { id: 'topics', label: 'Practice by Topic', icon: BookOpen },
                        { id: 'ai-mock', label: 'AI Mock Generator', icon: BrainCircuit }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 px-2 relative transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-blue-400 font-bold'
                                    : 'text-slate-500 hover:text-slate-300 font-medium'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    {/* Search Bar */}
                    <div className="relative group flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Limit Selector */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-white/5 p-2 rounded-2xl">
                        {[20, 30].map(limit => (
                            <button
                                key={limit}
                                onClick={() => setTestLimit(limit)}
                                className={`px-6 py-2 rounded-xl font-bold transition-all ${testLimit === limit ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {limit} Qs
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Sections */}
                <div className="min-h-[400px]">
                    {activeTab === 'companies' && (
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCompanies.length > 0 ? filteredCompanies.map((company) => (
                                    <button
                                        key={company}
                                        onClick={() => startTest('company', company)}
                                        className="group flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300 text-left shadow-lg hover:shadow-indigo-500/10"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{company}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </button>
                                )) : (
                                    <p className="text-slate-500 col-span-full py-20 text-center text-lg italic">No companies matching "{searchQuery}"</p>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'topics' && (
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTopics.length > 0 ? filteredTopics.map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => startTest('topic', topic)}
                                        className="group flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 text-left shadow-lg hover:shadow-blue-500/10"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{topic}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </button>
                                )) : (
                                    <p className="text-slate-500 col-span-full py-20 text-center text-lg italic">No topics matching "{searchQuery}"</p>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'ai-mock' && (
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="p-12 rounded-4xl bg-linear-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center mb-8">
                                        <BrainCircuit className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">Coming Soon</span>
                                    <h2 className="text-4xl font-black text-white mt-4 mb-4">Generate AI-Powered Mock</h2>
                                    <p className="text-slate-400 max-w-xl text-lg mb-10 leading-relaxed">
                                        Let our AI create a unique test tailored to your level. We use advanced prompt engineering
                                        to generate fresh questions similar to real company exams.
                                    </p>
                                    <button className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center gap-3">
                                        Configure AI Mock <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
