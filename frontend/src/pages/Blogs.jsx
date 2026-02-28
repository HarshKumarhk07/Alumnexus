import React, { useState, useEffect } from 'react';
import { blogService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Heart, MessageSquare, User, Calendar, Plus,
    X, Image as ImageIcon, Search, Tag, ArrowRight, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import CommentModal from '../components/CommentModal';

const Blogs = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [likeAnimId, setLikeAnimId] = useState(null);
    const [activeBlogForComments, setActiveBlogForComments] = useState(null);
    const [newBlog, setNewBlog] = useState({
        title: '', content: '', category: 'Technology', image: null
    });

    const categories = ['All', 'Career', 'Technology', 'Interview tips', 'Alumni Story'];

    useEffect(() => {
        fetchBlogs();
    }, [filter]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await blogService.getBlogs(filter !== 'All' ? filter : null);
            setBlogs(res.data.data);
        } catch (err) {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newBlog.title);
            formData.append('content', newBlog.content);
            formData.append('category', newBlog.category);
            if (newBlog.image) {
                formData.append('image', newBlog.image);
            }

            await blogService.createBlog(formData);
            toast.success('Blog published!');
            setShowModal(false);
            setNewBlog({ title: '', content: '', category: 'Technology', image: null });
            fetchBlogs();
        } catch (err) {
            toast.error('Failed to publish blog');
        }
    };

    const handleLike = async (id) => {
        try {
            const blogIndex = blogs.findIndex(b => b._id === id);
            if (blogIndex === -1) return;

            const isCurrentlyLiked = blogs[blogIndex].likes.includes(user?._id);

            // Optimistically update the UI
            setBlogs(prevBlogs => {
                const newBlogs = [...prevBlogs];
                const blog = { ...newBlogs[blogIndex] };

                if (isCurrentlyLiked) {
                    blog.likes = blog.likes.filter(userId => userId !== user?._id);
                } else {
                    blog.likes = [...blog.likes, user?._id];
                    setLikeAnimId(id);
                    setTimeout(() => setLikeAnimId(null), 400);
                }

                newBlogs[blogIndex] = blog;
                return newBlogs;
            });

            // Make the API call in the background
            await blogService.likeBlog(id);
        } catch (err) {
            // Revert optimistic update on failure by refetching
            fetchBlogs();
            toast.error('Action failed');
        }
    };

    const handleCommentAdded = async () => {
        // Just refresh the blogs to fetch the latest comments count and data
        await fetchBlogs();

        // If the modal is open, we need to update the active blog object so it shows the new comment immediately
        // We'll fetch the single blog but since we just fetch all blogs, we can find it
        // Actually, fetchBlogs is already called above, so the UI will update on its own when the prop updates
        // Wait, the activeBlogForComments state needs the fresh data to push to the modal.
    };

    // Re-sync active blog when blogs refresh
    useEffect(() => {
        if (activeBlogForComments) {
            const updatedBlog = blogs.find(b => b._id === activeBlogForComments._id);
            if (updatedBlog) {
                setActiveBlogForComments(updatedBlog);
            }
        }
    }, [blogs]);

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                <div className="max-w-xl">
                    <h1 className="text-5xl font-extrabold text-[var(--primary)] tracking-tight">Alumni Insights</h1>
                    <p className="text-gray-600 mt-4 text-lg leading-relaxed">
                        Professional perspectives, technical deep-dives, and career navigation guides from the AlumNexus network.
                    </p>
                </div>
                {((user.role === 'alumni' && user.isVerified) || user.role === 'admin') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold premium-shadow hover:scale-105 transition-smooth flex items-center gap-2"
                    >
                        <Plus size={20} /> Share Insight
                    </button>
                )}
            </div>

            {/* Search and Categories */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-smooth border-2 ${filter === cat
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-[var(--primary)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search insights..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth text-sm font-medium"
                    />
                </div>
            </div>

            {/* Blog Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-96 glass-card animate-pulse border border-[var(--border)]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.filter(b =>
                        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.content.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((blog) => (
                        <div key={blog._id} className="glass-card overflow-hidden premium-shadow group border border-[var(--border)] flex flex-col hover:-translate-y-2 transition-smooth">
                            <div className="h-48 relative overflow-hidden bg-[var(--accent)] text-[var(--primary)]">
                                {blog.coverImage ? (
                                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                        <ImageIcon size={48} />
                                        <span className="text-xs font-bold mt-2 uppercase tracking-widest">{blog.category}</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[var(--primary)] text-[10px] rounded-full font-bold uppercase tracking-wider shadow-sm">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col text-left">
                                <h3 className="text-xl font-bold group-hover:text-[var(--primary-light)] transition-smooth leading-snug min-h-[56px] line-clamp-2">
                                    {blog.title}
                                </h3>
                                <p className="text-gray-500 text-sm mt-4 line-clamp-3 leading-relaxed flex-1">
                                    {blog.content.substring(0, 150)}...
                                </p>

                                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                                    <div className="w-8 h-8 bg-[var(--surface)] text-[var(--primary)] rounded-full flex items-center justify-center text-xs font-bold">
                                        {blog.author?.name?.charAt(0) || 'A'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold">{blog.author?.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleLike(blog._id)}
                                            className={`flex items-center gap-1.5 transition-smooth ${blog.likes.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                        >
                                            <Heart
                                                size={18}
                                                fill={blog.likes.includes(user?._id) ? 'currentColor' : 'none'}
                                                className={`transition-colors ${blog.likes.includes(user?._id) ? 'text-red-500' : ''} ${likeAnimId === blog._id ? 'animate-pop text-red-500' : ''}`}
                                            />
                                            <span className={`text-xs font-bold ${blog.likes.includes(user?._id) ? 'text-red-500' : ''}`}>{blog.likes.length}</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveBlogForComments(blog)}
                                            className={`flex items-center gap-1.5 transition-smooth ${activeBlogForComments?._id === blog._id ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-[var(--primary)]'}`}
                                        >
                                            <MessageSquare size={18} fill={activeBlogForComments?._id === blog._id ? 'currentColor' : 'none'} />
                                            <span className="text-xs font-bold">{blog.comments?.length || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {blogs.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card">
                            <p className="text-gray-400 font-medium">No insights published in this category yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Post Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-3xl font-extrabold text-[var(--primary)]">Share Your Insight</h2>
                                <p className="text-sm text-[var(--primary-light)] font-medium mt-1">Publish an article to the AlumNexus community.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-[var(--accent)] rounded-2xl transition-smooth">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBlog} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.slice(1).map(cat => (
                                        <button
                                            key={cat} type="button"
                                            onClick={() => setNewBlog({ ...newBlog, category: cat })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth border-2 ${newBlog.category === cat ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-gray-50 border-gray-100'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Article Title</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold"
                                    placeholder="e.g. Navigating the AI Shift in SWE"
                                    value={newBlog.title}
                                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Content</label>
                                <textarea
                                    required rows="6"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth resize-none leading-relaxed"
                                    placeholder="Share your experience or advice..."
                                    value={newBlog.content}
                                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Cover Image (Optional)</label>
                                <label className="flex items-center gap-4 w-full px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[var(--primary)] transition-smooth">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setNewBlog({ ...newBlog, image: e.target.files[0] })}
                                    />
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[var(--primary)] shrink-0">
                                        <Upload size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">
                                            {newBlog.image ? newBlog.image.name : 'Upload Banner Image'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </label>
                            </div>

                            <button type="submit" className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg premium-shadow hover:bg-[var(--primary-light)] transition-smooth hover:scale-[1.02] active:scale-[0.98]">
                                Publish Article
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <CommentModal
                blog={activeBlogForComments}
                isOpen={!!activeBlogForComments}
                onClose={() => setActiveBlogForComments(null)}
                onCommentAdded={async (blogId, text) => {
                    const res = await blogService.addComment(blogId, text);
                    setActiveBlogForComments(res.data.data);
                    toast.success('Comment added!');
                    handleCommentAdded();
                }}
                onCommentDeleted={async (blogId, commentId) => {
                    const res = await blogService.deleteComment(blogId, commentId);
                    setActiveBlogForComments(res.data.data);
                    toast.success('Comment deleted!');
                    handleCommentAdded();
                }}
            />
        </div>
    );
};

export default Blogs;
