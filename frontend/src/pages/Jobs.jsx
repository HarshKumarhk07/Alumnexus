import React, { useEffect, useState } from 'react';
import { jobService, adminService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter, Plus, X, ArrowUpRight } from 'lucide-react';
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

    const hasApplied = (job) => {
        if (!user || user.role !== 'student') return false;
        return job.applicants?.some(a => String(a.user?._id || a.user) === String(user._id || user.id));
    };

    useEffect(() => {
        fetchJobs();
    }, []);

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
    }, [viewMode]);


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
                    <p className="text-gray-600 mt-2">Exclusive job and internship postings for the AlumNexus community</p>
                </div>
                {((user.role === 'alumni' && user.isVerified) || user.role === 'admin') && (
                    <div className="flex gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-smooth ${viewMode === 'all' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-500'}`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => setViewMode('my')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-smooth ${viewMode === 'my' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-500'}`}
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
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                        value={filters.company}
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Role..."
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Location..."
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                </div>
            </div>

            {/* Job List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 glass-card animate-pulse border border-[var(--border)]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map(job => (
                        <div key={job._id} className="glass-card premium-shadow p-6 border border-[var(--border)] flex flex-col justify-between hover:bg-[var(--surface)] transition-smooth group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-smooth">
                                <Briefcase size={80} />
                            </div>

                            <div className="space-y-4 relative z-10 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-bold text-2xl text-[var(--primary)] border border-[var(--border)] group-hover:scale-110 transition-smooth">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-[var(--primary)] transition-smooth flex items-center gap-2">
                                            {job.role}
                                            {job.isActive === false && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg">Closed</span>
                                            )}
                                        </h3>
                                        <p className="text-[var(--primary-light)] font-bold">{job.company}</p>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                    {job.description || 'No description provided. Click apply to see more details on the portal.'}
                                </p>

                                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                                    <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                                        <MapPin size={14} className="text-[var(--primary)]" /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                                        <span className="font-extrabold text-green-600">₹</span> {job.package ? (job.package.toLowerCase().includes('lpa') ? job.package : `${job.package} LPA`) : 'Competitive'}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                                        <Calendar size={14} className="text-amber-600" /> {new Date(job.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 relative z-10">
                                {user.role === 'student' ? (
                                    hasApplied(job) ? (
                                        <div className="flex gap-3">
                                            <button
                                                disabled
                                                className="flex-1 py-3 text-white text-center font-bold rounded-xl transition-smooth premium-shadow flex items-center justify-center gap-2 bg-green-600 cursor-default"
                                            >
                                                Applied
                                            </button>
                                            <button
                                                onClick={() => handleWithdraw(job._id)}
                                                disabled={applying[job._id]}
                                                className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-smooth border border-red-200"
                                            >
                                                {applying[job._id] ? '...' : 'Deregister'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            disabled={applying[job._id]}
                                            className="w-full py-3 text-white text-center font-bold rounded-xl transition-smooth premium-shadow flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-light)]"
                                        >
                                            {applying[job._id] ? 'Applying...' : 'Apply Now'}
                                            <ArrowUpRight size={18} />
                                        </button>
                                    )
                                ) : (
                                    <div className="flex gap-3">
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && (
                                            <button
                                                onClick={() => fetchApplicants(job._id)}
                                                className="flex-1 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--accent)] transition-smooth flex items-center justify-center gap-2"
                                            >
                                                View Applicants ({job.applicants?.length || 0})
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && job.isActive !== false && (
                                            <button
                                                onClick={() => handleCloseDrive(job._id)}
                                                className="px-4 py-3 bg-orange-50 border border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-smooth whitespace-nowrap"
                                            >
                                                Close Drive
                                            </button>
                                        )}
                                        {((String(job.postedBy?._id || job.postedBy) === String(user._id || user.id)) || user.role === 'admin') && (
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-smooth group/del"
                                            >
                                                <X size={20} className="text-red-500 group-hover/del:scale-110" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredJobs.length === 0 && (
                        <div className="col-span-full text-center py-20 glass-card">
                            <p className="text-gray-500 font-medium text-lg">No matching opportunities found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Post Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl premium-shadow overflow-hidden text-left">
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
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newJob.company}
                                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Job Role</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newJob.role}
                                    onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Location</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newJob.location}
                                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Package (e.g. 12 LPA)</label>
                                <input
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newJob.package}
                                    onChange={(e) => setNewJob({ ...newJob, package: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Deadline</label>
                                <input
                                    required type="date"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none"
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
            {/* Applicants Modal */}
            {showApplicantsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl premium-shadow overflow-hidden text-left flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Applications</h2>
                            <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {applicants.length === 0 ? (
                                <p className="text-center py-10 text-gray-500">No applicants yet.</p>
                            ) : (
                                applicants.map((applicant, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                        <div>
                                            <h4 className="font-bold">{applicant.user.name}</h4>
                                            <p className="text-sm text-gray-500">{applicant.user.email}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {applicant.resumeURL ? (
                                                <a
                                                    href={applicant.resumeURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-[var(--primary-light)] text-white text-sm font-bold rounded-lg hover:bg-[var(--primary)] transition-smooth"
                                                >
                                                    Preview Resume
                                                </a>
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
        </div>
    );
};

export default Jobs;
