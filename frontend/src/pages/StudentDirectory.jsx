import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, GraduationCap, Mail,
    ExternalLink, Linkedin, Globe, Loader2, X, Github,
    FileText, User, Briefcase
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

    const branches = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];

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

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) ||
            s.careerInterest?.toLowerCase().includes(search.toLowerCase());

        const matchesBranch = filters.branch === 'All' || s.branch === filters.branch;
        const matchesYear = !filters.year || s.year?.toString() === filters.year;
        const matchesSkill = !filters.skill || s.skills?.some(skill => skill.toLowerCase().includes(filters.skill.toLowerCase()));

        return matchesSearch && matchesBranch && matchesYear && matchesSkill;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in mb-20 text-left">
            {/* Header */}
            <div className="max-w-2xl">
                <h1 className="text-5xl font-extrabold text-[var(--primary)] tracking-tight">Student Talent</h1>
                <p className="text-gray-600 mt-4 text-lg">
                    Discover and mentor the next generation of professionals. Browse through student profiles, projects, and resumes.
                </p>
            </div>

            {/* Advanced Filter Bar */}
            <div className="glass-card p-8 border border-[var(--border)] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or career interest..."
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
                            placeholder="Year (1-4)"
                            min="1"
                            max="5"
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        />
                    </div>
                </div>

                <div className="relative pb-2">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filter by Skill (e.g. React, Python)..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredStudents.map((student) => (
                        <div key={student._id} className="glass-card p-8 border border-[var(--border)] premium-shadow group hover:bg-[var(--surface)] transition-smooth flex flex-col items-center text-center relative overflow-hidden rounded-[32px]">

                            <div className="w-24 h-24 rounded-[32px] bg-[var(--accent)] border-4 border-white premium-shadow mb-6 overflow-hidden">
                                {student.profilePhoto && student.profilePhoto !== 'no-photo.jpg' ? (
                                    <img src={student.profilePhoto} alt={student.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--primary)] text-uppercase">
                                        {student.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-[var(--primary)]">{student.user.name}</h3>
                                <p className="text-[var(--primary-light)] font-bold text-sm uppercase tracking-widest">{student.branch}</p>
                                <div className="flex items-center justify-center gap-1.5 text-gray-500 font-bold text-xs uppercase">
                                    <GraduationCap size={14} className="text-[var(--primary)]" /> Year {student.year}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 w-full gap-3 mt-8">
                                <div className="bg-white/50 p-3 rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Interest</p>
                                    <p className="text-xs font-bold truncate">{student.careerInterest || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full mt-6">
                                <button
                                    onClick={() => setSelectedStudent(student)}
                                    className="flex-1 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth shadow-lg shadow-[var(--primary)]/20"
                                >
                                    <User size={18} /> View Profile
                                </button>
                                {student.linkedin && (
                                    <a
                                        href={student.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-[#0077b5] group/link transition-smooth"
                                    >
                                        <Linkedin size={18} className="text-gray-400 group-hover/link:text-white" />
                                    </a>
                                )}
                                {student.github && (
                                    <a
                                        href={student.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-[#333] group/link transition-smooth"
                                    >
                                        <Github size={18} className="text-gray-400 group-hover/link:text-white" />
                                    </a>
                                )}
                            </div>
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
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Student Profile</h2>
                            <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="w-32 h-32 rounded-[40px] bg-[var(--accent)] border-4 border-white premium-shadow overflow-hidden shrink-0">
                                    {selectedStudent.profilePhoto && selectedStudent.profilePhoto !== 'no-photo.jpg' ? (
                                        <img src={selectedStudent.profilePhoto} alt={selectedStudent.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--primary)] text-uppercase">
                                            {selectedStudent.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-[var(--primary)]">{selectedStudent.user.name}</h3>
                                    <p className="text-xl text-[var(--primary-light)] font-bold">{selectedStudent.branch} - Year {selectedStudent.year}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-500 font-bold text-sm uppercase">
                                        <span className="flex items-center gap-1"><Briefcase size={16} /> Interested in {selectedStudent.careerInterest || 'Not Specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                                        selectedStudent.skills.map((skill, i) => (
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
                                                <p className="text-xs text-gray-500 leading-relaxed">{project.description}</p>
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
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-smooth"
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
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-smooth"
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
                <div className="fixed inset-0 bg-white/10 z-[120] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-full flex flex-col premium-shadow overflow-hidden relative animate-scale-in text-left">
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between bg-white z-10">
                            <h3 className="font-bold text-xl text-[var(--primary)] flex items-center gap-2">
                                <FileText className="text-[var(--primary)]" size={24} />
                                Resume Preview
                            </h3>
                            <button
                                onClick={() => setShowResumePreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-smooth"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                        {/* Image Container */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 flex items-center justify-center p-8">
                            <img
                                src={getResumePreviewUrl(selectedStudent.resumeURL)}
                                alt="Resume Preview"
                                className="max-w-full h-auto object-contain premium-shadow rounded-2xl border border-gray-200"
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
