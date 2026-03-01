import React, { useState, useEffect } from 'react';
import { profileService, adminService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, GraduationCap, Mail,
    ExternalLink, Linkedin, Globe, Loader2, X, Github,
    FileText, User, Briefcase, ShieldCheck, ShieldOff, Trash2, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDirectory = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ branch: 'All', year: '', skill: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showResumePreview, setShowResumePreview] = useState(false);

    const branches = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Others'];

    // Helper to get JPG preview of Cloudinary PDF
    const getResumePreviewUrl = (url) => {
        if (!url) return '';
        // If it's already an image or there's no extension, just return it
        if (url.match(/\.(jpg|jpeg|png|webp)$/i)) return url;
        // Replace .pdf with .jpg
        return url.replace(/\.pdf$/i, '.jpg');
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await profileService.getStudents();
            setStudents(res.data.data);
        } catch (err) {
            toast.error('Failed to load student directory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
        try {
            await adminService.deleteUser(id);
            toast.success('Student deleted successfully');
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete student');
        }
    };

    const handleUpdateStatus = async (id, newVerifiedState) => {
        const action = newVerifiedState ? 'approve' : 'revoke';
        if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;

        try {
            await adminService.updateUserStatus(id, { isVerified: newVerifiedState });
            toast.success(`Student ${newVerifiedState ? 'approved' : 'revoked'} successfully`);
            // Optimistically update local state so the card reflects the new status immediately
            setStudents(prev => prev.map(s => {
                if (String(s.user._id) === String(id)) {
                    return { ...s, user: { ...s.user, isVerified: newVerifiedState } };
                }
                return s;
            }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await adminService.exportStudents();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Student data exported successfully!');
        } catch (err) {
            toast.error('Failed to export student data');
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) ||
            s.careerInterest?.toLowerCase().includes(search.toLowerCase());

        const matchesBranch = filters.branch === 'All' ||
            s.branch === filters.branch ||
            (s.branch?.toLowerCase().includes(filters.branch.toLowerCase()));
        const matchesYear = !filters.year || s.year?.toString() === filters.year;
        const matchesSkill = !filters.skill || s.skills?.some(skill => skill.toLowerCase().includes(filters.skill.toLowerCase()));

        return matchesSearch && matchesBranch && matchesYear && matchesSkill;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 animate-fade-in mb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--primary)] tracking-tight">Student Talent</h1>
                    <p className="text-[var(--text-light)] mt-2 md:mt-4 text-sm md:text-lg">
                        Discover and mentor the next generation of professionals. Browse through student profiles, projects, and resumes.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-[var(--primary)]/20 shrink-0 mt-2"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                )}
            </div>

            {/* Advanced Filter Bar */}
            <div className="glass-card p-4 md:p-8 border border-[var(--border)] space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or career interest..."
                            className="w-full pl-12 pr-4 py-3 md:py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)] text-sm md:text-base"
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
                            placeholder="Year (1-4)"
                            min="1"
                            max="5"
                            className="w-full px-4 py-3 md:py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold text-[var(--text-dark)] text-sm md:text-base"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        />
                    </div>
                </div>

                <div className="relative pb-2">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by Skill (e.g. React, Python)..."
                        className="w-full pl-12 pr-4 py-3 md:py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-medium text-[var(--text-dark)] text-sm md:text-base"
                        value={filters.skill}
                        onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    />
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 glass-card animate-pulse border border-[var(--border)] rounded-[32px]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 text-left">
                    {filteredStudents.map((student) => (
                        <div key={student._id} className="bg-[var(--surface)] p-3 md:p-6 border border-[var(--border)] premium-shadow group hover:bg-[var(--primary)]/5 transition-smooth flex flex-col items-center text-center relative overflow-hidden rounded-[20px] md:rounded-[32px]">

                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-[14px] md:rounded-[24px] bg-[var(--accent)] border-2 md:border-4 border-[var(--surface)] premium-shadow mb-1.5 md:mb-3 overflow-hidden">
                                {student.profilePhoto && student.profilePhoto !== 'no-photo.jpg' ? (
                                    <img src={student.profilePhoto} alt={student.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base md:text-2xl font-bold text-white text-uppercase">
                                        {student.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0 md:space-y-1">
                                <h3 className="text-[11px] md:text-lg font-bold text-[var(--primary)] leading-tight line-clamp-1">{student.user.name}</h3>
                                <p className="text-[var(--primary-light)] font-bold text-[8px] md:text-xs uppercase tracking-widest line-clamp-1">{student.branch}</p>
                                <div className="flex items-center justify-center gap-1 text-[var(--text-light)] font-bold text-[7px] md:text-xs uppercase line-clamp-1">
                                    <GraduationCap size={12} className="text-[var(--primary)] md:hidden" />
                                    <GraduationCap size={16} className="text-[var(--primary)] hidden md:block" /> Year {student.year}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 w-full gap-1 mt-2 md:mt-4">
                                <div className="bg-[var(--background)] p-1.5 md:p-3 rounded-lg md:rounded-2xl border border-[var(--border)]">
                                    <p className="text-[7px] md:text-[10px] text-[var(--text-light)] font-bold uppercase tracking-tight">Interest</p>
                                    <p className="text-[8px] md:text-xs font-bold truncate text-[var(--text-dark)]">{student.careerInterest || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex gap-1.5 w-full mt-2 md:mt-3">
                                <button
                                    onClick={() => setSelectedStudent(student)}
                                    className="flex-1 py-1.5 md:py-3 bg-[var(--primary)] text-white rounded-lg md:rounded-2xl font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--primary-light)] transition-smooth shadow-lg shadow-[var(--primary)]/20 text-[9px] md:text-base"
                                >
                                    <User size={12} className="md:hidden" />
                                    <User size={18} className="hidden md:block" /> {window.innerWidth < 768 ? 'View' : 'View Profile'}
                                </button>
                                {student.linkedin && (
                                    <a
                                        href={student.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 md:p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg md:rounded-2xl hover:bg-[#0077b5] group/link transition-smooth"
                                    >
                                        <Linkedin size={12} className="text-gray-400 group-hover/link:text-white md:hidden" />
                                        <Linkedin size={18} className="text-gray-400 group-hover/link:text-white hidden md:block" />
                                    </a>
                                )}
                            </div>

                            {user?.role === 'admin' && (
                                <div className="mt-4 w-full">
                                    {/* Status Badge */}
                                    <div className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3 ${student.user?.isVerified
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                                        }`}>
                                        {student.user?.isVerified
                                            ? <><ShieldCheck size={12} /> Verified Student</>
                                            : <><ShieldOff size={12} /> Not Verified</>
                                        }
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleUpdateStatus(student.user._id, !student.user?.isVerified)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${student.user?.isVerified
                                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200'
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                }`}
                                        >
                                            {student.user?.isVerified
                                                ? <><ShieldOff size={13} /> Revoke</>
                                                : <><ShieldCheck size={13} /> Approve</>
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student.user._id, student.user.name)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-red-200"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card border border-[var(--border)]">
                            <Search size={64} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium text-lg">No students matching your search found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Student Profile Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Student Profile</h2>
                            <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="w-32 h-32 rounded-[40px] bg-[var(--accent)] border-4 border-[var(--surface)] premium-shadow overflow-hidden shrink-0">
                                    {selectedStudent.profilePhoto && selectedStudent.profilePhoto !== 'no-photo.jpg' ? (
                                        <img src={selectedStudent.profilePhoto} alt={selectedStudent.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white text-uppercase">
                                            {selectedStudent.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-[var(--primary)]">{selectedStudent.user.name}</h3>
                                    <p className="text-xl text-[var(--primary-light)] font-bold">{selectedStudent.branch} - Year {selectedStudent.year}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-[var(--text-light)] font-bold text-sm uppercase">
                                        <span className="flex items-center gap-1"><Briefcase size={16} /> Interested in {selectedStudent.careerInterest || 'Not Specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                                        selectedStudent.skills.map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-light)]">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm italic">No skills listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Projects Showcase */}
                            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Featured Projects</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedStudent.projects.map((project, i) => (
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
                                                <p className="text-xs text-[var(--text-light)] opacity-70 leading-relaxed">{project.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resume Section */}
                            {selectedStudent.resumeURL && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Resume</h4>
                                    <button
                                        onClick={() => setShowResumePreview(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--background)] text-[var(--text-dark)] rounded-xl font-bold hover:bg-[var(--accent)] hover:text-white transition-smooth"
                                    >
                                        <FileText size={20} /> View Resume
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <a
                                    href={selectedStudent.linkedin || '#'}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 py-4 bg-[#0077b5] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-smooth"
                                >
                                    <Linkedin size={20} /> LinkedIn Profile
                                </a>
                                <a
                                    href={`mailto:${selectedStudent.user.email}`}
                                    className="flex-1 py-4 bg-[var(--background)] text-[var(--text-dark)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent)] hover:text-white transition-smooth"
                                >
                                    <Mail size={20} /> Contact Student
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Resume Image Preview Modal */}
            {showResumePreview && selectedStudent?.resumeURL && (
                <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl animate-fade-in">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-4xl max-h-full flex flex-col premium-shadow overflow-hidden relative animate-scale-in text-left">
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] z-10">
                            <h3 className="font-bold text-xl text-[var(--primary)] flex items-center gap-2">
                                <FileText className="text-[var(--primary)]" size={24} />
                                Resume Preview
                            </h3>
                            <button
                                onClick={() => setShowResumePreview(false)}
                                className="p-2 hover:bg-[var(--background)] rounded-xl transition-smooth"
                            >
                                <X size={24} className="text-[var(--text-light)]" />
                            </button>
                        </div>
                        {/* Image Container */}
                        <div className="flex-1 overflow-y-auto bg-[var(--background)] flex items-center justify-center p-8">
                            <img
                                src={getResumePreviewUrl(selectedStudent.resumeURL)}
                                alt="Resume Preview"
                                className="max-w-full h-auto object-contain premium-shadow rounded-2xl border border-[var(--border)]"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/800x1200?text=Preview+Not+Available";
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDirectory;
