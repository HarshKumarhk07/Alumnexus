import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommentModal = ({ blog, isOpen, onClose, onCommentAdded, onCommentDeleted }) => {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !blog) return null;

    const handleSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            setIsSubmitting(true);
            await onCommentAdded(blog._id, commentText);
            setCommentText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden flex flex-col relative z-10 animate-scale-in max-h-[80vh]">
                <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--primary)] line-clamp-1">Comments: {blog.title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--accent)] text-[var(--primary)] rounded-xl transition-smooth"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                    {(!blog.comments || blog.comments.length === 0) ? (
                        <div className="py-12 text-center text-gray-400">
                            <p className="font-medium text-sm">No comments yet.</p>
                            <p className="text-xs mt-1">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        blog.comments.slice().reverse().map((comment, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-8 h-8 bg-[var(--accent)] text-[var(--primary)] rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 premium-shadow">
                                    {comment.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 premium-shadow group relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-[var(--primary)] text-sm">{comment.user?.name || 'Anonymous User'}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{new Date(comment.date).toLocaleDateString()}</span>
                                            {(user?._id || user?.id) === (comment.user?._id || comment.user) && onCommentDeleted && (
                                                <button
                                                    onClick={() => onCommentDeleted(blog._id, comment._id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-[var(--border)] bg-white">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit();
                            }}
                            placeholder="Write a comment..."
                            className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !commentText.trim()}
                            className="px-6 py-3 bg-[var(--primary)] text-white text-sm font-bold rounded-xl premium-shadow hover:scale-105 active:scale-95 transition-smooth disabled:opacity-50 disabled:hover:scale-100"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
