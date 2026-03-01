import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, MapPin, Briefcase,
    GraduationCap, Mail, MessageCircle, ShieldCheck,
    Linkedin, Globe, X, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicDirectory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ branch: 'All', batchYear: '', location: '', skill: '' });
    const [selectedAlumni, setSelectedAlumni] = useState(null);

    const branches = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Others'];

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const res = await profileService.getAlumni();

            // Publicly only show verified alumni
            const visibleAlumni = res.data.data.filter(a => a.verificationStatus === 'approved');
            setAlumni(visibleAlumni);
        } catch (err) {
            toast.error('Failed to load alumni directory');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectClick = (e) => {
        if (!user) {
            e.preventDefault();
            toast.error('Please login to connect with alumni');
            navigate('/login');
            return false;
        }
        return true;
    };

    const filteredAlumni = alumni.filter(a => {
        const matchesSearch = a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.company?.toLowerCase().includes(search.toLowerCase()) ||
            a.designation?.toLowerCase().includes(search.toLowerCase());

        const matchesBranch = filters.branch === 'All' ||
            a.branch === filters.branch ||
            (a.branch?.toLowerCase().includes(filters.branch.toLowerCase()));
        const matchesYear = !filters.batchYear || a.batchYear?.toString().includes(filters.batchYear);
        const matchesLocation = !filters.location || a.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSkill = !filters.skill || a.skills?.some(s => s.toLowerCase().includes(filters.skill.toLowerCase()));

        return matchesSearch && matchesBranch && matchesYear && matchesLocation && matchesSkill;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 animate-fade-in mb-20 text-left pt-12 px-4">
            {/* Header */}
            <div className="max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--primary)] tracking-tight">Public Directory</h1>
                <p className="text-[var(--text-light)] mt-2 md:mt-4 text-sm md:text-lg font-medium">
                    Explore our global network of distinguished alumni. Login to connect and seek mentorship.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-5 md:p-8 border border-[var(--border)] space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, company, or role..."
                            className="w-full px-4 py-3 md:py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)] text-sm md:text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full px-4 py-3 md:py-4 bg-white border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)] opacity-70 text-sm md:text-base"
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
                            className="w-full px-4 py-3 md:py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)] text-sm md:text-base"
                            value={filters.batchYear}
                            onChange={(e) => setFilters({ ...filters, batchYear: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 glass-card animate-pulse border border-[var(--border)] rounded-[32px]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 text-left">
                    {filteredAlumni.map((item) => (
                        <div key={item._id} className="bg-[var(--surface)] p-3 md:p-6 border border-[var(--border)] premium-shadow group hover:bg-[var(--primary)]/5 transition-smooth flex flex-col items-center text-center relative overflow-hidden rounded-[20px] md:rounded-[32px]">
                            <div className="w-10 h-10 md:w-20 md:h-20 rounded-[14px] md:rounded-[28px] bg-[var(--background)] border-2 md:border-4 border-[var(--surface)] premium-shadow mb-1.5 md:mb-3 overflow-hidden shrink-0">
                                {item.profilePhoto && item.profilePhoto !== 'no-photo.jpg' ? (
                                    <img src={item.profilePhoto} alt={item.user?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base md:text-3xl font-bold text-white">
                                        {item.user?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0 md:space-y-1">
                                <h3 className="text-[11px] md:text-lg font-bold text-[var(--text-dark)] leading-tight line-clamp-1">{item.user?.name}</h3>
                                <p className="text-[var(--primary)] font-bold text-[8px] md:text-xs uppercase tracking-widest leading-tight opacity-80 line-clamp-1">{item.designation}</p>
                                <div className="flex items-center justify-center gap-1 text-[var(--text-light)] font-bold text-[7px] md:text-[10px] uppercase line-clamp-1">
                                    <Briefcase size={10} className="text-[var(--primary)] md:hidden" />
                                    <Briefcase size={12} className="text-[var(--primary)] hidden md:block" /> {item.company}
                                </div>
                            </div>

                            <div className="flex gap-1.5 w-full mt-2 md:mt-4">
                                <button
                                    onClick={() => setSelectedAlumni(item)}
                                    className="flex-1 py-1 md:py-2.5 bg-[var(--primary)] text-white rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--primary-light)] transition-smooth"
                                >
                                    {window.innerWidth < 768 ? 'View' : 'Quick View'}
                                </button>
                                <button
                                    onClick={(e) => handleConnectClick(e)}
                                    className="p-1 md:p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg md:rounded-xl hover:bg-[#0077b5] group/link transition-smooth"
                                >
                                    <Linkedin size={12} className="text-gray-400 group-hover/link:text-white md:hidden" />
                                    <Linkedin size={18} className="text-gray-400 group-hover/link:text-white hidden md:block" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Public Detail Modal */}
            {selectedAlumni && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-xl premium-shadow overflow-hidden text-left animate-scale-in relative">
                        <button onClick={() => setSelectedAlumni(null)} className="absolute top-6 right-6 p-2 hover:bg-[var(--background)] rounded-xl transition-smooth z-10">
                            <X size={24} />
                        </button>

                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-[32px] bg-[var(--background)] border-4 border-[var(--border)] premium-shadow overflow-hidden shrink-0">
                                    {selectedAlumni.profilePhoto && selectedAlumni.profilePhoto !== 'no-photo.jpg' ? (
                                        <img src={selectedAlumni.profilePhoto} alt={selectedAlumni.user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                                            {selectedAlumni.user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-[var(--primary)]">{selectedAlumni.user?.name}</h3>
                                    <p className="text-lg text-[var(--primary-light)] font-bold">{selectedAlumni.designation}</p>
                                    <p className="text-[var(--text-light)] font-bold text-sm uppercase">{selectedAlumni.company}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Education & Location</h4>
                                <div className="flex flex-wrap gap-4">
                                    <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-light)] bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                                        <GraduationCap size={16} /> Class of {selectedAlumni.batchYear}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-light)] bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                                        <MapPin size={16} /> {selectedAlumni.location || 'Not Specified'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[var(--border)]">
                                <button
                                    onClick={(e) => handleConnectClick(e)}
                                    className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-smooth flex items-center justify-center gap-3"
                                >
                                    <UserCheck size={20} /> Login to Connect & View Full Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDirectory;
