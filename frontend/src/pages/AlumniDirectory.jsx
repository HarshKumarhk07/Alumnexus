import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, MapPin, Briefcase,
    GraduationCap, Mail, MessageCircle, ShieldCheck,
    UserCheck, ExternalLink, Linkedin, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const AlumniDirectory = () => {
    const { user } = useAuth();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ branch: 'All', batchYear: '' });

    const branches = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const res = await profileService.getAlumni();

            // Only show verified alumni to everyone, admin sees all
            const visibleAlumni = (user?.role === 'admin')
                ? res.data.data
                : res.data.data.filter(a => a.verificationStatus === 'approved');

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
        const checkBranch = (userBranch, filterText) => {
            if (!userBranch) return false;
            const branch = userBranch.toLowerCase();
            const filter = filterText.toLowerCase();
            if (branch.includes(filter)) return true;
            if (filter === 'computer science' && (branch.includes('cse') || branch.includes('cs'))) return true;
            if (filter === 'information technology' && branch.includes('it')) return true;
            if (filter === 'electronics' && (branch.includes('ece') || branch.includes('en'))) return true;
            if (filter === 'mechanical' && branch.includes('mech')) return true;
            if (filter === 'electrical' && (branch.includes('ee') || branch.includes('eee'))) return true;
            return false;
        };

        const matchesBranch = filters.branch === 'All' || checkBranch(a.branch, filters.branch);
        const matchesYear = !filters.batchYear || a.batchYear?.toString().includes(filters.batchYear);
        return matchesSearch && matchesBranch && matchesYear;
    });

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
                            placeholder="Batch Year (e.g. 2023)"
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold"
                            value={filters.batchYear}
                            onChange={(e) => setFilters({ ...filters, batchYear: e.target.value })}
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
                                <a href={`mailto:${item.user.email}`} className="flex-1 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth shadow-lg shadow-[var(--primary)]/20">
                                    <Mail size={18} /> Connect
                                </a>
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
        </div>
    );
};

export default AlumniDirectory;
