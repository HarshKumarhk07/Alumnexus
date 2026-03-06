import React, { useState, useEffect } from 'react';
import { blogService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Heart, MessageSquare, User, Calendar, Plus,
    X, Image as ImageIcon, Search, Tag, ArrowRight, Upload, Trash2, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import CommentModal from '../components/CommentModal';

const Blogs = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBlog, setEditBlog] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', category: '', image: null, imagePreview: null });
    const [isEditing, setIsEditing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [likeAnimId, setLikeAnimId] = useState(null);
    const [activeBlogForComments, setActiveBlogForComments] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
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

            // Make the API call
            const res = await blogService.likeBlog(id);

            // Sync with server response to ensure author and likes are correct
            setBlogs(prevBlogs => prevBlogs.map(b => (b._id === id ? res.data.data : b)));
        } catch (err) {
            // Revert on failure
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

    const handleDeleteBlog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await blogService.deleteBlog(id);
            toast.success('Blog deleted successfully');
            fetchBlogs();
        } catch (err) {
            toast.error('Failed to delete blog');
        }
    };

    const openEditModal = (blog) => {
        setEditBlog(blog);
        setEditForm({ title: blog.title, content: blog.content, category: blog.category, image: null, imagePreview: null });
    };

    const handleEditBlog = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        try {
            const payload = {
                title: editForm.title,
                content: editForm.content,
                category: editForm.category
            };
            // Step 1: Upload new image if selected
            if (editForm.image) {
                const imgRes = await blogService.uploadBlogCoverImage(editBlog._id, editForm.image);
                payload.coverImage = imgRes.data.url;
            }
            // Step 2: Update text fields (+ coverImage URL if uploaded)
            const res = await blogService.updateBlog(editBlog._id, payload);
            toast.success('Blog updated!');
            setBlogs(prev => prev.map(b => b._id === editBlog._id ? res.data.data : b));
            setEditBlog(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update blog');
        } finally {
            setIsEditing(false);
        }
    };

    // Re-sync active blog when blogs refresh
    useEffect(() => {
        if (activeBlogForComments) {
            const updatedBlog = blogs.find(b => b._id === activeBlogForComments._id);
            if (updatedBlog) {
                setActiveBlogForComments(updatedBlog);
            }
        }
        if (selectedBlog) {
            const updatedBlog = blogs.find(b => b._id === selectedBlog._id);
            if (updatedBlog) {
                setSelectedBlog(updatedBlog);
            }
        }
    }, [blogs]);

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in mb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                <div className="max-w-xl">
                    <h1 className="text-5xl font-extrabold text-[var(--text-dark)] tracking-tight">Alumni Insights</h1>
                    <p className="text-[var(--text-light)] mt-4 text-lg leading-relaxed opacity-80">
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
                                : 'bg-[var(--surface)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)]'
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
                        className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth text-sm font-medium text-[var(--text-dark)]"
                    />
                </div>
            </div>

            {/* Blog Grid */}
            {
                loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-96 glass-card animate-pulse border border-[var(--border)]"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {blogs.filter(b =>
                            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.content.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((blog) => (
                            <div key={blog._id} onClick={() => setSelectedBlog(blog)} className="bg-[var(--surface)] overflow-hidden rounded-2xl md:rounded-[32px] premium-shadow border border-[var(--border)] flex flex-col hover:-translate-y-2 transition-smooth group cursor-pointer">
                                <div className="h-32 md:h-48 relative overflow-hidden bg-[var(--accent)] text-white">
                                    {blog.coverImage ? (
                                        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                            <ImageIcon size={32} />
                                            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">{blog.category}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 md:top-4 left-2 md:left-4">
                                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[var(--surface)]/90 backdrop-blur-md text-[var(--primary)] text-[8px] md:text-[10px] rounded-full font-bold uppercase tracking-wider shadow-sm border border-[var(--border)]">
                                            {blog.category}
                                        </span>
                                    </div>
                                    {((String(blog.author?._id || blog.author) === String(user._id || user.id)) || user.role === 'admin') && (
                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 transition-smooth">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(blog); }}
                                                className="p-1.5 md:p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg md:rounded-xl backdrop-blur-sm shadow-lg transition-smooth"
                                                title="Edit Blog"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteBlog(blog._id); }}
                                                className="p-1.5 md:p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg md:rounded-xl backdrop-blur-sm shadow-lg transition-smooth"
                                                title="Delete Blog"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 md:p-6 flex-1 flex flex-col text-left">
                                    <h3 className="text-sm md:text-xl font-bold group-hover:text-[var(--primary)] transition-smooth leading-tight md:leading-snug md:min-h-[56px] line-clamp-2 text-[var(--text-dark)]">
                                        {blog.title}
                                    </h3>
                                    <p className="hidden md:line-clamp-3 text-[var(--text-light)] opacity-80 text-sm mt-4 leading-relaxed flex-1">
                                        {blog.content.substring(0, 150)}...
                                    </p>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-[var(--background)] text-[var(--primary)] rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold border border-[var(--border)]">
                                                {blog.author?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] md:text-xs font-bold text-[var(--text-dark)] truncate">{blog.author?.name?.split(' ')[0] || 'Anonymous'}</p>
                                                <p className="text-[8px] md:text-[10px] text-[var(--text-light)] opacity-60 font-medium uppercase tracking-tighter">
                                                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleLike(blog._id); }}
                                                className={`flex items-center gap-1 transition-smooth ${blog.likes.includes(user?._id) ? 'text-red-500' : 'text-[var(--text-light)]/60 hover:text-red-400'}`}
                                            >
                                                <Heart
                                                    size={14}
                                                    fill={blog.likes.includes(user?._id) ? 'currentColor' : 'none'}
                                                    className={`transition-colors ${blog.likes.includes(user?._id) ? 'text-red-500' : ''} ${likeAnimId === blog._id ? 'animate-pop text-red-500' : ''}`}
                                                />
                                                <span className={`text-[10px] font-bold ${blog.likes.includes(user?._id) ? 'text-red-500' : ''}`}>{blog.likes.length}</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveBlogForComments(blog); }}
                                                className={`flex items-center gap-1 transition-smooth ${activeBlogForComments?._id === blog._id ? 'text-[var(--primary)]' : 'text-[var(--text-light)]/60 hover:text-[var(--primary)]'}`}
                                            >
                                                <MessageSquare size={14} fill={activeBlogForComments?._id === blog._id ? 'currentColor' : 'none'} />
                                                <span className="text-[10px] font-bold">{blog.comments?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {blogs.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-card">
                                <p className="text-[var(--text-light)]/60 font-medium">No insights published in this category yet.</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Post Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
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
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.slice(1).map(cat => (
                                            <button
                                                key={cat} type="button"
                                                onClick={() => setNewBlog({ ...newBlog, category: cat })}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth border-2 ${newBlog.category === cat ? 'bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-light)]'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Article Title</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)]"
                                        placeholder="e.g. Navigating the AI Shift in SWE"
                                        value={newBlog.title}
                                        onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Content</label>
                                    <textarea
                                        required rows="6"
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth resize-none leading-relaxed text-[var(--text-dark)]"
                                        placeholder="Share your experience or advice..."
                                        value={newBlog.content}
                                        onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Cover Image (Optional)</label>
                                    <label className="flex items-center gap-4 w-full px-6 py-4 bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] transition-smooth">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setNewBlog({ ...newBlog, image: e.target.files[0] })}
                                        />
                                        <div className="w-12 h-12 bg-[var(--surface)] rounded-xl shadow-sm flex items-center justify-center text-[var(--primary)] shrink-0">
                                            <Upload size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">
                                                {newBlog.image ? newBlog.image.name : 'Upload Banner Image'}
                                            </p>
                                            <p className="text-xs text-[var(--text-light)]/60 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </label>
                                </div>

                                <button type="submit" className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg premium-shadow hover:bg-[var(--primary-light)] transition-smooth hover:scale-[1.02] active:scale-[0.98]">
                                    Publish Article
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Post Modal */}
            {
                editBlog && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-[var(--primary)]">Edit Post</h2>
                                    <p className="text-sm text-[var(--primary-light)] font-medium mt-1">Update your article content.</p>
                                </div>
                                <button onClick={() => setEditBlog(null)} className="p-3 hover:bg-[var(--accent)] rounded-2xl transition-smooth">
                                    <X size={28} />
                                </button>
                            </div>
                            <form onSubmit={handleEditBlog} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.slice(1).map(cat => (
                                            <button
                                                key={cat} type="button"
                                                onClick={() => setEditForm({ ...editForm, category: cat })}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth border-2 ${editForm.category === cat ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] border border-[var(--border)] text-[var(--text-light)]/60'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Title</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)]"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Content</label>
                                    <textarea
                                        required rows="6"
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth resize-none leading-relaxed text-[var(--text-dark)]"
                                        value={editForm.content}
                                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/60">Cover Image (Optional)</label>
                                    {editForm.imagePreview ? (
                                        <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--border)]">
                                            <img src={editForm.imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                                            <button type="button" onClick={() => setEditForm({ ...editForm, image: null, imagePreview: null })} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80 transition-smooth">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-4 w-full px-6 py-4 bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] transition-smooth">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) setEditForm({ ...editForm, image: file, imagePreview: URL.createObjectURL(file) });
                                            }} />
                                            <div className="w-12 h-12 bg-[var(--surface)] rounded-xl shadow-sm flex items-center justify-center text-[var(--primary)] shrink-0">
                                                <Upload size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-[var(--text-dark)]">{editBlog?.coverImage ? '✓ Current image kept — click to replace' : 'Upload Cover Image'}</p>
                                                <p className="text-xs text-[var(--text-light)]/60 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className={`w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg premium-shadow transition-smooth ${isEditing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--primary-light)] hover:scale-[1.02] active:scale-[0.98]'}`}
                                >
                                    {isEditing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* View Full Blog Modal */}
            {
                selectedBlog && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4" onClick={() => setSelectedBlog(null)}>
                        <div
                            className="bg-[var(--surface)] text-[var(--text-dark)] rounded-[32px] w-full max-w-3xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header Image if exists */}
                            {selectedBlog.coverImage && (
                                <div className="h-48 md:h-64 w-full relative shrink-0">
                                    <img src={selectedBlog.coverImage} alt={selectedBlog.title} className="w-full h-full object-cover" />
                                    <button onClick={() => setSelectedBlog(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-smooth">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                                {!selectedBlog.coverImage && (
                                    <div className="flex justify-between items-start">
                                        <div className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--primary)] text-xs rounded-full font-bold uppercase tracking-wider mb-4 inline-block">
                                            {selectedBlog.category}
                                        </div>
                                        <button onClick={() => setSelectedBlog(null)} className="p-2 text-[var(--text-light)] hover:bg-[var(--background)] rounded-full transition-smooth focus:outline-none">
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                                {selectedBlog.coverImage && (
                                    <div className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--primary)] text-xs rounded-full font-bold uppercase tracking-wider inline-block w-max">
                                        {selectedBlog.category}
                                    </div>
                                )}

                                <h2 className="text-2xl md:text-4xl font-extrabold text-[var(--text-dark)] leading-tight">
                                    {selectedBlog.title}
                                </h2>

                                <div className="flex items-center gap-3 py-4 border-y border-[var(--border)]">
                                    <div className="w-10 h-10 bg-[var(--background)] text-[var(--primary)] rounded-full flex items-center justify-center text-sm font-bold border border-[var(--border)]">
                                        {selectedBlog.author?.name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--text-dark)]">{selectedBlog.author?.name || 'Anonymous'}</p>
                                        <p className="text-xs text-[var(--text-light)] font-medium">
                                            {new Date(selectedBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="whitespace-pre-wrap leading-relaxed text-[var(--text-dark)]/80 text-sm md:text-base">
                                    {selectedBlog.content}
                                </div>

                                <div className="flex items-center gap-6 mt-4 pt-6 border-t border-[var(--border)]">
                                    <button
                                        onClick={() => handleLike(selectedBlog._id)}
                                        className={`flex items-center gap-2 transition-smooth ${selectedBlog.likes.includes(user?._id) ? 'text-red-500' : 'text-[var(--text-light)]/60 hover:text-red-400'}`}
                                    >
                                        <Heart
                                            size={20}
                                            fill={selectedBlog.likes.includes(user?._id) ? 'currentColor' : 'none'}
                                        />
                                        <span className="font-bold">{selectedBlog.likes.length} Likes</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveBlogForComments(selectedBlog);
                                            setSelectedBlog(null);
                                        }}
                                        className="flex items-center gap-2 text-[var(--text-light)]/60 hover:text-[var(--primary)] transition-smooth"
                                    >
                                        <MessageSquare size={20} />
                                        <span className="font-bold">{selectedBlog.comments?.length || 0} Comments</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

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
