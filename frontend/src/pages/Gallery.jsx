import React, { useState, useEffect } from 'react';
import { galleryService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Image as ImageIcon, Upload, X, Filter,
    Maximize2, Plus, LayoutGrid, Camera, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Gallery = () => {
    const { user } = useAuth();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFiles, setImageFiles] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newMedia, setNewMedia] = useState({
        category: 'Events', caption: ''
    });

    const categories = ['All', 'Events', 'Achievements', 'Alumni meet', 'Campus'];

    useEffect(() => {
        fetchMedia();
    }, [filter]);

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            await galleryService.deleteMedia(id);
            setMedia(media.filter(item => item._id !== id));

            if (selectedImage && selectedImage._id === id) {
                setSelectedImage(null);
            }

            toast.success('Image deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete image');
            console.error('Delete error:', error);
        }
    };

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const res = await galleryService.getGallery(filter !== 'All' ? filter : null);
            setMedia(res.data.data);
        } catch (err) {
            toast.error('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFiles || imageFiles.length === 0) return toast.error('Please select at least one image file');

        const formData = new FormData();
        Array.from(imageFiles).forEach(file => {
            formData.append('images', file);
        });
        formData.append('category', newMedia.category);
        formData.append('caption', newMedia.caption);

        try {
            setIsUploading(true);
            await galleryService.uploadMedia(formData);
            toast.success(`${imageFiles.length > 1 ? 'Media files' : 'Media'} uploaded to gallery!`);
            setShowModal(false);
            setNewMedia({ category: 'Events', caption: '' });
            setImageFiles(null);
            fetchMedia();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                <div>
                    <h1 className="text-5xl font-extrabold text-[var(--text-dark)] tracking-tight">Memory Lane</h1>
                    <p className="text-[var(--text-light)] mt-4 text-lg opacity-80">
                        Capturing the legacy, achievements, and moments that define AlumNexus.
                    </p>
                </div>
                {(user.role === 'admin' || (user.role === 'alumni' && user.isVerified)) && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white rounded-2xl font-bold premium-shadow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 border border-white/20"
                    >
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Upload size={18} />
                        </div>
                        <span className="tracking-tight">Share a Memory</span>
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-[var(--surface)] backdrop-blur-md p-2 rounded-2xl border border-[var(--border)] inline-flex self-start">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${filter === cat
                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-105'
                            : 'text-[var(--text-light)]/60 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] hover:shadow-sm'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square glass-card animate-pulse border border-[var(--border)] rounded-3xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {media.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => setSelectedImage(item)}
                            className="group aspect-square relative rounded-3xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[var(--primary)] transition-smooth"
                        >
                            <img src={item.mediaURL} alt={item.caption} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white translate-y-full group-hover:translate-y-0 transition-smooth">
                                <p className="text-xs font-bold truncate">{item.caption}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-70">{item.category}</span>
                                    <p className="text-[10px] opacity-70">By {item.uploadedBy?.name}</p>
                                </div>
                            </div>

                            {(user?.role === 'admin' || item.uploadedBy?._id === user?.id) && (
                                <button
                                    onClick={(e) => handleDelete(item._id, e)}
                                    className="absolute top-4 left-4 p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-smooth"
                                    title="Delete Image"
                                >
                                    <Trash2 size={16} className="text-white" />
                                </button>
                            )}

                            <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-smooth">
                                <Maximize2 size={16} className="text-white" />
                            </div>
                        </div>
                    ))}
                    {media.length === 0 && (
                        <div className="col-span-full py-32 text-center glass-card border border-[var(--border)] bg-[var(--surface)]">
                            <Camera size={64} className="mx-auto text-[var(--primary)] opacity-40 mb-4" />
                            <p className="text-[var(--text-light)] font-medium text-lg opacity-60">No precious moments captured in this category yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Upload New Memory</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpload} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700">Visual Memory</label>
                                <div className="relative group/upload">
                                    <input
                                        required
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setImageFiles(e.target.files)}
                                    />
                                    <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-smooth group-hover/upload:border-[var(--primary)] group-hover/upload:bg-[var(--accent)]/10">
                                        <div className="p-3 bg-[var(--background)] rounded-xl shadow-sm text-[var(--primary)]">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-sm text-gray-700">
                                                {imageFiles && imageFiles.length > 0
                                                    ? `${imageFiles.length} file(s) selected`
                                                    : 'Drop your memories here or browse'}
                                            </p>
                                            <p className="text-xs text-[var(--text-light)]/60 mt-1">PNG, JPG or WebP up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                                        value={newMedia.category}
                                        onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
                                    >
                                        {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Caption Tag</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                                        placeholder="Add a short caption..."
                                        value={newMedia.caption}
                                        onChange={(e) => setNewMedia({ ...newMedia, caption: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isUploading}
                                type="submit"
                                className={`w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white rounded-2xl font-bold premium-shadow hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''} `}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="tracking-wide">Preserving Your Memory...</span>
                                    </>
                                ) : (
                                    <>
                                        <Camera size={20} />
                                        <span className="tracking-wide">Share This Moment</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-smooth"><X size={48} /></button>
                    <div className="max-w-5xl max-h-full space-y-4" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage.mediaURL} alt={selectedImage.caption} className="max-w-full max-h-[80vh] rounded-3xl premium-shadow" />
                        <div className="text-white text-center">
                            <h3 className="text-2xl font-bold">{selectedImage.caption}</h3>
                            <p className="text-[var(--text-light)]/60 mt-1 uppercase tracking-widest text-xs">{selectedImage.category} • Uploaded by {selectedImage.uploadedBy?.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
