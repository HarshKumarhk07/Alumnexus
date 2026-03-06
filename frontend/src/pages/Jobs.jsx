import React, { useEffect, useState } from 'react';
import { jobService, adminService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter, Plus, X, ArrowUpRight, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Jobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ company: '', role: '', location: '' });
    const [newJob, setNewJob] = useState({
        company: '', role: '', location: '', description: '',
        package: '', deadline: ''
    });
    const [applicants, setApplicants] = useState([]);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applying, setApplying] = useState({});
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
    const [showResumePreview, setShowResumePreview] = useState(false);
    const [selectedResumeUrl, setSelectedResumeUrl] = useState('');
    const [selectedJobView, setSelectedJobView] = useState(null);
    const [editJob, setEditJob] = useState(null);

    const hasApplied = (job) => {
        if (!user || user.role !== 'student') return false;
        return job.applicants?.some(a => String(a.user?._id || a.user) === String(user._id || user.id));
    };

    const getResumePreviewUrl = (url) => {
        if (!url) return '';
        if (url.match(/\.(jpg|jpeg|png|webp)$/i)) return url;
        return url.replace(/\.pdf$/i, '.jpg');
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            let res;
            if (user.role === 'admin' && viewMode === 'my') {
                res = await adminService.getAllJobs();
            } else if (user.role === 'alumni' && viewMode === 'my') {
                res = await jobService.getMyJobs();
            } else {
                res = await jobService.getJobs();
            }
            setJobs(res.data.data);
        } catch (err) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [viewMode, user.role]);


    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await jobService.createJob(newJob);
            toast.success('Job posted successfully!');
            setShowModal(false);
            setNewJob({ company: '', role: '', location: '', description: '', package: '', deadline: '' });
            fetchJobs();
        } catch (err) {
            toast.error('Failed to post job');
        }
    };

    const handleEditJob = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                company: editJob.company,
                role: editJob.role,
                location: editJob.location,
                description: editJob.description,
                package: editJob.package,
                deadline: editJob.deadline
            };
            await jobService.updateJob(editJob._id, payload);
            toast.success('Job updated successfully!');
            setEditJob(null);
            fetchJobs();
        } catch (err) {
            toast.error('Failed to update job');
        }
    };

    const handleApply = async (jobId) => {
        try {
            setApplying(prev => ({ ...prev, [jobId]: true }));
            const res = await jobService.applyToJob(jobId);
            toast.success(res.data.message || 'Applied successfully!');
            fetchJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(prev => ({ ...prev, [jobId]: false }));
        }
    };

    const handleWithdraw = async (jobId) => {
        if (!window.confirm('Are you sure you want to withdraw your application?')) return;
        try {
            setApplying(prev => ({ ...prev, [jobId]: true }));
            const res = await jobService.withdrawJob(jobId);
            toast.success(res.data.message || 'Application withdrawn successfully!');
            fetchJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to withdraw');
        } finally {
            setApplying(prev => ({ ...prev, [jobId]: false }));
        }
    };

    const fetchApplicants = async (jobId) => {
        try {
            setSelectedJobId(jobId);
            const res = await jobService.getApplicants(jobId);
            setApplicants(res.data.data);
            setShowApplicantsModal(true);
        } catch (err) {
            toast.error('Failed to load applicants');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return;
        try {
            await jobService.deleteJob(jobId);
            toast.success('Job deleted successfully');
            fetchJobs();
        } catch (err) {
            toast.error('Failed to delete job');
        }
    };

    const handleCloseDrive = async (jobId) => {
        if (!window.confirm('Are you sure you want to close this drive? Students will no longer be able to apply.')) return;
        try {
            await jobService.updateJob(jobId, { isActive: false });
            toast.success('Drive closed successfully');
            fetchJobs();
        } catch (err) {
            toast.error('Failed to close drive');
        }
    };

    const handleReopenDrive = async (jobId) => {
        if (!window.confirm('Are you sure you want to reopen this drive?')) return;
        try {
            await jobService.updateJob(jobId, { isActive: true });
            toast.success('Drive reopened successfully');
            fetchJobs();
        } catch (err) {
            toast.error('Failed to reopen drive');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.company.toLowerCase().includes(filters.company.toLowerCase()) &&
        job.role.toLowerCase().includes(filters.role.toLowerCase()) &&
        job.location.toLowerCase().includes(filters.location.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--primary)]">Opportunities</h1>
                    <p className="text-[var(--text-light)] mt-2 opacity-80">Exclusive job and internship postings for the AlumNexus community</p>
                </div>
                {((user.role === 'alumni' && user.isVerified) || user.role === 'admin') && (
                    <div className="flex gap-4">
                        <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-smooth ${viewMode === 'all' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-light)] opacity-60'}`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => setViewMode('my')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-smooth ${viewMode === 'my' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-light)] opacity-60'}`}
                            >
                                {user.role === 'admin' ? 'Manage All' : 'My Postings'}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow hover:scale-105 transition-smooth flex items-center gap-2"
                        >
                            <Plus size={20} /> Post a Job
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="glass-card p-6 border border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Company..."
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth text-sm font-medium text-[var(--text-dark)]"
                        value={filters.company}
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Role..."
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth text-sm font-medium text-[var(--text-dark)]"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Location..."
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth text-sm font-medium text-[var(--text-dark)]"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                </div>
            </div>

            {/* Job List */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 glass-card animate-pulse border border-[var(--border)]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
                    {filteredJobs.map(job => (
                        <div key={job._id} onClick={() => setSelectedJobView(job)} className="bg-[var(--surface)] cursor-pointer rounded-2xl md:rounded-[32px] premium-shadow p-3 md:p-6 border border-[var(--border)] flex flex-col justify-between hover:bg-[var(--primary)]/5 transition-smooth group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:opacity-20 transition-smooth">
                                <Briefcase size={40} className="md:w-20 md:h-20" />
                            </div>

                            <div className="space-y-3 md:space-y-4 relative z-10 text-left">
                                <div className="flex items-center gap-2 md:gap-4">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-[var(--accent)] rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-2xl text-white border border-[var(--border)] group-hover:scale-110 transition-smooth shrink-0">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm md:text-xl font-bold group-hover:text-[var(--primary)] transition-smooth flex items-center gap-1.5 text-[var(--text-dark)] truncate">
                                            {job.role}
                                        </h3>
                                        <p className="text-[var(--primary)] font-bold opacity-80 text-xs md:text-base truncate">{job.company}</p>
                                        <p className="text-[10px] md:text-xs text-[var(--text-light)] mt-0.5 truncate">
                                            Posted by: {job.postedBy?.name || 'Admin'}
                                        </p>
                                    </div>
                                </div>

                                {job.isActive === false && (
                                    <span className="inline-block text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-lg font-bold">Closed</span>
                                )}

                                <p className="hidden md:line-clamp-2 text-[var(--text-light)] opacity-70 text-sm leading-relaxed">
                                    {job.description || 'No description provided.'}
                                </p>

                                <div className="flex flex-col gap-1.5 md:gap-4 text-[10px] md:text-xs font-bold text-[var(--text-light)]">
                                    <div className="flex items-center gap-1 bg-[var(--background)]/50 px-2 py-1 rounded-lg w-fit">
                                        <MapPin size={12} className="text-[var(--primary)]" /> <span className="truncate max-w-[80px] md:max-w-none">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[var(--background)]/50 px-2 py-1 rounded-lg w-fit">
                                        <span className="font-extrabold text-green-600">₹</span> {job.package ? (job.package.toLowerCase().includes('lpa') ? job.package : `${job.package} LPA`) : 'Competitive'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-6 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
                                {user.role === 'student' ? (
                                    hasApplied(job) ? (
                                        <div className="flex gap-2">
                                            <button
                                                disabled
                                                className="flex-1 py-2 md:py-3 text-white text-center font-bold rounded-xl transition-smooth premium-shadow flex items-center justify-center gap-2 bg-green-600 cursor-default text-xs md:text-base"
                                            >
                                                Applied
                                            </button>
                                            <button
                                                onClick={() => handleWithdraw(job._id)}
                                                disabled={applying[job._id]}
                                                className="px-3 py-2 md:py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-smooth border border-red-200 text-xs md:text-base"
                                            >
                                                {applying[job._id] ? '...' : <X size={16} />}
                                            </button>
                                        </div>
                                    ) : job.isActive === false ? (
                                        <button
                                            disabled
                                            className="w-full py-2 md:py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-[10px] md:text-sm cursor-not-allowed border border-gray-200"
                                        >
                                            Closed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            disabled={applying[job._id]}
                                            className="w-full py-2 md:py-3 text-white text-center font-bold rounded-xl transition-smooth premium-shadow flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-xs md:text-base"
                                        >
                                            {applying[job._id] ? '...' : 'Apply'}
                                            <ArrowUpRight size={16} className="hidden md:block" />
                                        </button>
                                    )
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && (
                                            <button
                                                onClick={() => fetchApplicants(job._id)}
                                                className="flex-1 py-2 md:py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--accent)] hover:text-white transition-smooth flex items-center justify-center gap-2 text-[10px] md:text-sm"
                                            >
                                                Applicants ({job.applicants?.length || 0})
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && (
                                            <button
                                                onClick={() => setEditJob(job)}
                                                className="hidden md:block px-4 py-3 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-smooth whitespace-nowrap"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && job.isActive !== false && (
                                            <button
                                                onClick={() => handleCloseDrive(job._id)}
                                                className="hidden md:block px-4 py-3 bg-orange-50 border border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-smooth whitespace-nowrap"
                                            >
                                                Close
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && job.isActive === false && (
                                            <button
                                                onClick={() => handleReopenDrive(job._id)}
                                                className="hidden md:block px-4 py-3 bg-green-50 border border-green-200 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-smooth whitespace-nowrap"
                                            >
                                                Reopen
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && (
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-smooth group/del flex items-center justify-center"
                                            >
                                                <X size={16} className="text-red-500 group-hover/del:scale-110" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredJobs.length === 0 && (
                        <div className="col-span-full text-center py-20 glass-card">
                            <p className="text-[var(--text-light)] font-medium text-lg opacity-60">No matching opportunities found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Post Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-3xl w-full max-w-2xl premium-shadow overflow-hidden text-left">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Post New Opportunity</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handlePostJob} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Company Name</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newJob.company}
                                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Job Role</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newJob.role}
                                    onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Location</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newJob.location}
                                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Package (e.g. 12 LPA)</label>
                                <input
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newJob.package}
                                    onChange={(e) => setNewJob({ ...newJob, package: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Deadline</label>
                                <input
                                    required type="date"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newJob.deadline}
                                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Job Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow hover:bg-[var(--primary-light)] transition-smooth">
                                    Submit Posting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Job Modal */}
            {editJob && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-3xl w-full max-w-2xl premium-shadow overflow-hidden text-left">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Edit Job</h2>
                            <button onClick={() => setEditJob(null)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditJob} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Company Name</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={editJob.company}
                                    onChange={(e) => setEditJob({ ...editJob, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Job Role</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={editJob.role}
                                    onChange={(e) => setEditJob({ ...editJob, role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Location</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={editJob.location}
                                    onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Package (e.g. 12 LPA)</label>
                                <input
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={editJob.package}
                                    onChange={(e) => setEditJob({ ...editJob, package: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Deadline</label>
                                <input
                                    required type="date"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={editJob.deadline ? new Date(editJob.deadline).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditJob({ ...editJob, deadline: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Job Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none"
                                    value={editJob.description}
                                    onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2 pt-4 flex gap-4">
                                <button type="button" onClick={() => setEditJob(null)} className="flex-1 py-4 bg-[var(--background)] border border-[var(--border)] text-[var(--text-dark)] rounded-xl font-bold transition-smooth">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow hover:bg-[var(--primary-light)] transition-smooth">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Full Job Modal */}
            {selectedJobView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4" onClick={() => setSelectedJobView(null)}>
                    <div
                        className="bg-[var(--surface)] text-[var(--text-dark)] rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center font-bold text-2xl text-white border border-[var(--border)] shrink-0">
                                    {selectedJobView.company.charAt(0)}
                                </div>
                                <button onClick={() => setSelectedJobView(null)} className="p-2 text-[var(--text-light)] hover:bg-[var(--background)] rounded-full transition-smooth focus:outline-none">
                                    <X size={20} />
                                </button>
                            </div>

                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-dark)] leading-tight">
                                    {selectedJobView.role}
                                </h2>
                                <p className="text-lg font-bold text-[var(--primary)] mt-1">{selectedJobView.company}</p>
                            </div>

                            <div className="flex items-center gap-3 py-4 border-y border-[var(--border)] flex-wrap">
                                <div className="flex items-center gap-2 bg-[var(--background)]/50 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--text-light)]">
                                    <MapPin size={16} className="text-[var(--primary)]" /> {selectedJobView.location}
                                </div>
                                <div className="flex items-center gap-2 bg-[var(--background)]/50 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--text-light)]">
                                    <DollarSign size={16} className="text-green-600" /> {selectedJobView.package ? (selectedJobView.package.toLowerCase().includes('lpa') ? selectedJobView.package : `${selectedJobView.package} LPA`) : 'Competitive'}
                                </div>
                                <div className="flex items-center gap-2 bg-[var(--background)]/50 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--text-light)]">
                                    <Calendar size={16} className="text-orange-500" /> Deadline: {selectedJobView.deadline ? new Date(selectedJobView.deadline).toLocaleDateString() : 'Rolling'}
                                </div>
                            </div>

                            <div className="bg-[var(--background)] px-4 py-3 rounded-xl border border-[var(--border)] inline-block w-max">
                                <p className="text-xs text-[var(--text-light)] uppercase font-bold tracking-wider">Posted By</p>
                                <p className="text-sm font-bold text-[var(--text-dark)] mt-0.5">{selectedJobView.postedBy?.name || 'Admin'}</p>
                            </div>

                            <div className="whitespace-pre-wrap leading-relaxed text-[var(--text-dark)]/80 text-sm md:text-base">
                                <h4 className="font-bold text-lg mb-2 text-[var(--text-dark)]">Job Description</h4>
                                {selectedJobView.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Actions fixed at bottom */}
                        <div className="p-6 md:p-8 bg-[var(--surface)] border-t border-[var(--border)]">
                            {user.role === 'student' ? (
                                hasApplied(selectedJobView) ? (
                                    <button disabled className="w-full py-3 bg-green-600 text-white font-bold rounded-xl cursor-default text-lg">
                                        Applied
                                    </button>
                                ) : selectedJobView.isActive === false ? (
                                    <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed border border-gray-200 text-lg">
                                        Drive Closed
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { handleApply(selectedJobView._id); setSelectedJobView(null); }}
                                        disabled={applying[selectedJobView._id]}
                                        className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-light)] transition-smooth premium-shadow flex items-center justify-center gap-2"
                                    >
                                        Apply Now <ArrowUpRight size={20} />
                                    </button>
                                )
                            ) : (
                                <button onClick={() => setSelectedJobView(null)} className="w-full py-3 bg-[var(--background)] text-[var(--text-dark)] font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth text-lg">
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Applicants Modal */}
            {showApplicantsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-3xl w-full max-w-2xl premium-shadow overflow-hidden text-left flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Applications</h2>
                            <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {applicants.length === 0 ? (
                                <p className="text-center py-10 text-[var(--text-light)] opacity-60">No applicants yet.</p>
                            ) : (
                                applicants.map((applicant, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-lg">{applicant.user.name}</h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-light)] opacity-70">
                                                <span className="text-[var(--primary)]">{applicant.user.email}</span>
                                                {applicant.branch && <span>• {applicant.branch}</span>}
                                                {applicant.year && <span>• {applicant.year} Year</span>}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Applied on {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {applicant.resumeURL ? (
                                                <button
                                                    onClick={() => {
                                                        window.open(getResumePreviewUrl(applicant.resumeURL), '_blank', 'noopener,noreferrer');
                                                    }}
                                                    className="px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--primary-light)] transition-smooth premium-shadow"
                                                >
                                                    View Resume
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No resume uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Premium Resume Preview Modal */}
            {showResumePreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[var(--surface)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col premium-shadow relative">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-[var(--primary)]">Resume Preview</h3>
                            <button
                                onClick={() => setShowResumePreview(false)}
                                className="p-2 hover:bg-white rounded-xl transition-smooth text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 md:p-8 bg-[var(--background)]/50 flex flex-col items-center">
                            {selectedResumeUrl ? (
                                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 min-h-[600px] flex items-center justify-center relative group">
                                    <img
                                        src={getResumePreviewUrl(selectedResumeUrl)}
                                        alt="Resume Preview"
                                        className="w-full h-auto object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/800x1100?text=Preview+Generation+Failed';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No resume available for preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
