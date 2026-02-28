import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, MapPin, Briefcase,
    GraduationCap, Mail, MessageCircle, ShieldCheck,
    UserCheck, ExternalLink, Linkedin, Globe, Loader2, X, Github
} from 'lucide-react';
import toast from 'react-hot-toast';

const AlumniDirectory = () => {
    const { user } = useAuth();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ branch: 'All', batchYear: '', location: '', skill: '' });
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [requestData, setRequestData] = useState({ type: '', message: '' });
    const [showRequestModal, setShowRequestModal] = useState(false);

    const branches = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const res = await profileService.getAlumni();

            // Only show verified alumni to everyone, admin sees all, filter out own profile
            const visibleAlumni = res.data.data.filter(a => {
                const isVerified = a.verificationStatus === 'approved' || user?.role === 'admin';
                const isNotSelf = String(a.user._id || a.user) !== String(user._id || user.id);
                return isVerified && isNotSelf;
            });

            setAlumni(visibleAlumni);
        } catch (err) {
            toast.error('Failed to load alumni directory');
        } finally {
            setLoading(false);
        }
    };

    const filteredAlumni = alumni.filter(a => {
        const matchesSearch = a.user.name.toLowerCase().includes(search.toLowerCase()) ||
            a.company.toLowerCase().includes(search.toLowerCase()) ||
            a.designation.toLowerCase().includes(search.toLowerCase());

        const matchesBranch = filters.branch === 'All' || checkBranch(a.branch, filters.branch);
        const matchesYear = !filters.batchYear || a.batchYear?.toString().includes(filters.batchYear);
        const matchesLocation = !filters.location || a.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSkill = !filters.skill || a.skills?.some(s => s.toLowerCase().includes(filters.skill.toLowerCase()));

        return matchesSearch && matchesBranch && matchesYear && matchesLocation && matchesSkill;
    });

    const handleSendRequest = async (e) => {
        e.preventDefault();
        try {
            setRequesting(true);
            await profileService.createRequest({
                receiverId: selectedAlumni.user._id,
                type: requestData.type,
                message: requestData.message
            });
            toast.success('Request sent successfully!');
            setShowRequestModal(false);
            setRequestData({ type: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in mb-20 text-left">
            {/* Header */}
            <div className="max-w-2xl">
                <h1 className="text-5xl font-extrabold text-[var(--primary)] tracking-tight">Alumni Network</h1>
                <p className="text-gray-600 mt-4 text-lg">
                    Connect with professionals from your college who are leading industries across the globe.
                </p>
            </div>

            {/* Advanced Filter Bar */}
            <div className="glass-card p-8 border border-[var(--border)] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, company, or role..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-gray-600"
                            value={filters.branch}
                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                        >
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Batch Year"
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold"
                            value={filters.batchYear}
                            onChange={(e) => setFilters({ ...filters, batchYear: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by Location (e.g. Bangalore)..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by Skill (e.g. React)..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
                            value={filters.skill}
                            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 glass-card animate-pulse border border-[var(--border)] rounded-[32px]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAlumni.map((item) => (
                        <div key={item._id} className="glass-card p-8 border border-[var(--border)] premium-shadow group hover:bg-[var(--surface)] transition-smooth flex flex-col items-center text-center relative overflow-hidden rounded-[32px]">
                            {/* Verification Badge */}
                            {item.verificationStatus === 'approved' && (
                                <div className="absolute top-4 right-4 text-blue-600 bg-blue-50 p-2 rounded-xl" title="Verified Alumni">
                                    <ShieldCheck size={20} />
                                </div>
                            )}

                            <div className="w-24 h-24 rounded-[32px] bg-[var(--accent)] border-4 border-white premium-shadow mb-6 overflow-hidden">
                                {item.profilePhoto && item.profilePhoto !== 'no-photo.jpg' ? (
                                    <img src={item.profilePhoto} alt={item.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
                                        {item.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-[var(--primary)]">{item.user.name}</h3>
                                <p className="text-[var(--primary-light)] font-bold text-sm uppercase tracking-widest">{item.designation}</p>
                                <div className="flex items-center justify-center gap-1.5 text-gray-500 font-bold text-xs uppercase">
                                    <Briefcase size={14} className="text-[var(--primary)]" /> {item.company}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-3 mt-8">
                                <div className="bg-white/50 p-3 rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Branch</p>
                                    <p className="text-xs font-bold truncate">{item.branch}</p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Class of</p>
                                    <p className="text-xs font-bold">{item.batchYear}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full mt-6">
                                <button
                                    onClick={() => setSelectedAlumni(item)}
                                    className="flex-1 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth shadow-lg shadow-[var(--primary)]/20"
                                >
                                    <UserCheck size={18} /> View Profile
                                </button>
                                <a
                                    href={item.linkedin || 'https://linkedin.com'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-[#0077b5] group/link transition-smooth"
                                >
                                    <Linkedin size={18} className="text-gray-400 group-hover/link:text-white" />
                                </a>
                                {item.portfolio && (
                                    <a
                                        href={item.portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-[var(--primary)] group/link transition-smooth"
                                        title="View Portfolio"
                                    >
                                        <Globe size={18} className="text-gray-400 group-hover/link:text-white" />
                                    </a>
                                )}
                            </div>

                            {item.mentorshipAvailable && (
                                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                    <UserCheck size={14} /> Available for Mentoring
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredAlumni.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card border border-[var(--border)]">
                            <Search size={64} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium text-lg">No alumni matching your search found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Profile Detail Modal */}
            {selectedAlumni && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Alumni Profile</h2>
                            <button onClick={() => setSelectedAlumni(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="w-32 h-32 rounded-[40px] bg-[var(--accent)] border-4 border-white premium-shadow overflow-hidden shrink-0">
                                    {selectedAlumni.profilePhoto && selectedAlumni.profilePhoto !== 'no-photo.jpg' ? (
                                        <img src={selectedAlumni.profilePhoto} alt={selectedAlumni.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--primary)]">
                                            {selectedAlumni.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-[var(--primary)]">{selectedAlumni.user.name}</h3>
                                    <p className="text-xl text-[var(--primary-light)] font-bold">{selectedAlumni.designation} at {selectedAlumni.company}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-500 font-bold text-sm uppercase">
                                        <span className="flex items-center gap-1"><MapPin size={16} /> {selectedAlumni.location || 'Not Specified'}</span>
                                        <span className="flex items-center gap-1"><GraduationCap size={16} /> Class of {selectedAlumni.batchYear}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">About</h4>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {selectedAlumni.bio || "No bio provided by this alumnus yet."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Skills & Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.skills && selectedAlumni.skills.length > 0 ? (
                                        selectedAlumni.skills.map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm italic">No skills listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Projects Showcase */}
                            {selectedAlumni.projects && selectedAlumni.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Featured Projects</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedAlumni.projects.map((project, i) => (
                                            <div key={i} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-[var(--primary)]">{project.title}</h5>
                                                    <div className="flex gap-2">
                                                        {project.githubLink && (
                                                            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#333] hover:border-[#333] transition-smooth" title="GitHub">
                                                                <Github size={14} />
                                                            </a>
                                                        )}
                                                        {project.liveLink && (
                                                            <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-smooth" title="Live Demo">
                                                                <Globe size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{project.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Request Actions */}
                            {user?.role === 'student' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Available Support</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {selectedAlumni.mentorshipAvailable && (
                                            <button
                                                onClick={() => { setShowRequestModal(true); setRequestData({ ...requestData, type: 'mentorship' }); }}
                                                className="py-3 px-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-smooth flex flex-col items-center gap-2"
                                            >
                                                <UserCheck size={20} /> Mentorship
                                            </button>
                                        )}
                                        {selectedAlumni.resumeReview && (
                                            <button
                                                onClick={() => { setShowRequestModal(true); setRequestData({ ...requestData, type: 'resume-review' }); }}
                                                className="py-3 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-smooth flex flex-col items-center gap-2"
                                            >
                                                <Briefcase size={20} /> Resume Review
                                            </button>
                                        )}
                                        {selectedAlumni.referrals && (
                                            <button
                                                onClick={() => { setShowRequestModal(true); setRequestData({ ...requestData, type: 'referral' }); }}
                                                className="py-3 px-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition-smooth flex flex-col items-center gap-2"
                                            >
                                                <ShieldCheck size={20} /> Referral Check
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <a
                                    href={selectedAlumni.linkedin || '#'}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 py-4 bg-[#0077b5] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-smooth"
                                >
                                    <Linkedin size={20} /> LinkedIn
                                </a>
                                <a
                                    href={`mailto:${selectedAlumni.user.email}`}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-smooth"
                                >
                                    <Mail size={20} /> Send Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--primary)] capitalize">Request {requestData.type.replace('-', ' ')}</h2>
                            <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-smooth">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSendRequest} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Personal Note</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-medium"
                                    placeholder="Briefly explain why you're reaching out..."
                                    value={requestData.message}
                                    onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={requesting}
                                type="submit"
                                className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-70"
                            >
                                {requesting ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                                Send Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
