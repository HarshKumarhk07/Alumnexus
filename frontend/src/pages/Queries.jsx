import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { queryService } from '../services/api.service';
import { HelpCircle, MessageCircle, Send, CheckCircle, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Queries = () => {
    const { user } = useAuth();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [activeQuery, setActiveQuery] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Form state
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await queryService.getQueries();
            setQueries(res.data.data);
        } catch (err) {
            toast.error('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuery = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await queryService.createQuery(formData);
            setQueries([res.data.data, ...queries]);
            setShowQueryModal(false);
            setFormData({ title: '', description: '' });
            toast.success('Query posted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post query');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (queryId) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await queryService.replyToQuery(queryId, replyText);
            setQueries(queries.map(q => q._id === queryId ? res.data.data : q));
            if (activeQuery?._id === queryId) {
                setActiveQuery(res.data.data);
            }
            setReplyText('');
            toast.success('Reply added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async (queryId, replyId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;
        setIsSubmitting(true);
        try {
            const res = await queryService.deleteReply(queryId, replyId);
            setQueries(queries.map(q => q._id === queryId ? res.data.data : q));
            if (activeQuery?._id === queryId) {
                setActiveQuery(res.data.data);
            }
            toast.success('Reply deleted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async (queryId) => {
        try {
            const res = await queryService.resolveQuery(queryId);
            setQueries(queries.map(q => q._id === queryId ? res.data.data : q));
            if (activeQuery?._id === queryId) {
                setActiveQuery(res.data.data);
            }
            toast.success('Query marked as resolved!');
        } catch (err) {
            toast.error('Failed to resolve query');
        }
    };

    const handleDeleteQuery = async (e, queryId) => {
        e.stopPropagation(); // prevent modal from opening
        if (!window.confirm('Are you sure you want to delete this query?')) return;
        try {
            await queryService.deleteQuery(queryId);
            setQueries(queries.filter(q => q._id !== queryId));
            if (activeQuery?._id === queryId) {
                setActiveQuery(null);
            }
            toast.success('Query deleted successfully');
        } catch (err) {
            toast.error('Failed to delete query');
        }
    };

    const filteredQueries = queries.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in mb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--surface)] p-8 rounded-[32px] border border-[var(--border)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl premium-shadow text-[var(--primary)] mb-6">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-[var(--primary)]">Help & Queries</h1>
                    <p className="text-gray-600 mt-2">
                        {user.role === 'student'
                            ? "Ask questions and get answers directly from alumni and administrators."
                            : "Help students navigate their careers by answering their questions."}
                    </p>
                </div>
                {(user.role === 'student' && user.isVerified) && (
                    <button
                        onClick={() => setShowQueryModal(true)}
                        className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold premium-shadow hover:scale-105 transition-smooth flex items-center gap-2 z-10"
                    >
                        <MessageCircle size={20} />
                        Ask a Question
                    </button>
                )}
                {(user.role === 'student' && !user.isVerified) && (
                    <div className="bg-amber-50 border border-amber-200 px-6 py-4 rounded-2xl text-amber-700 text-sm font-bold flex items-center gap-2 z-10">
                        <Clock size={18} /> Verification Pending
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth premium-shadow text-sm"
                />
            </div>

            {/* Queries List */}
            <div className="space-y-6">
                {filteredQueries.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No queries found.</h3>
                        {user.role === 'student' && <p className="text-gray-400 mt-2">Be the first to ask a question!</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredQueries.map(query => (
                            <div key={query._id} onClick={() => setActiveQuery(query)} className="glass-card p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-smooth cursor-pointer flex flex-col group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full opacity-20 transition-smooth group-hover:opacity-40
                                    ${query.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 bg-[var(--accent)] text-white rounded-full flex items-center justify-center font-bold">
                                            {query.student?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--primary)] text-sm">{query.student?.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(query.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider h-fit ${query.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {query.status}
                                        </span>
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={(e) => handleDeleteQuery(e, query._id)}
                                                className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary-light)] transition-smooth relative z-10 line-clamp-2">{query.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-6 relative z-10 flex-1">{query.description}</p>

                                <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] relative z-10">
                                    <MessageCircle size={16} />
                                    {query.replies?.length || 0} Replies
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Query Modal */}
            {showQueryModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--primary)]">Ask a Question</h2>
                                <p className="text-sm text-gray-500 mt-1">Get advice and guidance from the community</p>
                            </div>
                            <button onClick={() => setShowQueryModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-xl transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateQuery} className="p-8 space-y-6 bg-gray-50/50">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Question Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth premium-shadow text-sm"
                                    placeholder="Brief summary of your question..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Details</label>
                                <textarea
                                    required
                                    rows="6"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth premium-shadow text-sm resize-none custom-scrollbar"
                                    placeholder="Explain your situation or question in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowQueryModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-smooth">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-[var(--primary)] text-white font-bold rounded-xl premium-shadow hover:scale-105 transition-smooth disabled:opacity-50">
                                    {isSubmitting ? 'Posting...' : 'Post Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Read Query & Replies Modal */}
            {activeQuery && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-3xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 md:p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-start shrink-0">
                            <div className="pr-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${activeQuery.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {activeQuery.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">Posted by {activeQuery.student?.name}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--primary)] leading-snug">{activeQuery.title}</h2>
                            </div>
                            <button onClick={() => setActiveQuery(null)} className="p-2 hover:bg-[var(--accent)] hover:text-white rounded-xl transition-smooth shrink-0 bg-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                            <div className="p-6 md:p-8 space-y-8">
                                {/* Main Question */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 premium-shadow relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)]"></div>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">{activeQuery.description}</p>
                                </div>

                                {/* Replies Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <MessageCircle size={20} className="text-[var(--primary)]" />
                                        {activeQuery.replies?.length || 0} Replies
                                    </h3>

                                    <div className="space-y-6">
                                        {activeQuery.replies?.map((reply, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold shrink-0 mt-1 shadow-sm">
                                                    {reply.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 premium-shadow">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[var(--primary)] text-sm">{reply.user?.name}</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">{reply.user?.role}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                            {(user.role === 'admin' || (reply.user?._id === user._id)) && (
                                                                <button
                                                                    onClick={() => handleDeleteReply(activeQuery._id, reply._id)}
                                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth"
                                                                    title="Delete Reply"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {activeQuery.replies?.length === 0 && (
                                            <div className="text-center bg-white p-8 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-gray-500 font-medium">No replies yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Reply Action */}
                        <div className="p-6 border-t border-[var(--border)] bg-white shrink-0">
                            {activeQuery.status === 'resolved' ? (
                                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-xl font-bold text-sm border border-green-200">
                                    <CheckCircle size={18} /> This query has been officially resolved.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(user.role === 'admin' || user._id === activeQuery.student?._id) && (
                                        <button
                                            onClick={() => handleResolve(activeQuery._id)}
                                            className="w-full md:w-auto px-6 py-2.5 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 transition-smooth rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Mark as Resolved
                                        </button>
                                    )}

                                    {/* Only Alumni verified & Admin can reply directly from UI (though API blocks unverified alumni too) */}
                                    {((user.role === 'alumni' && user.isVerified) || user.role === 'admin') && (
                                        <div className="flex gap-3">
                                            <textarea
                                                rows="1"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium resize-none custom-scrollbar"
                                                placeholder="Write your response here..."
                                            />
                                            <button
                                                onClick={() => handleReply(activeQuery._id)}
                                                disabled={isSubmitting || !replyText.trim()}
                                                className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl premium-shadow hover:scale-105 transition-smooth disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                            >
                                                <Send size={18} />
                                                <span className="hidden md:inline">Send Reply</span>
                                            </button>
                                        </div>
                                    )}
                                    {(user.role === 'alumni' && !user.isVerified) && (
                                        <p className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">Your profile is pending verification. You will be able to reply once approved.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Queries;
