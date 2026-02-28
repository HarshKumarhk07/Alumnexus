import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase, GraduationCap, Loader2, Eye, EyeOff, Building2, BadgeCheck, FileText, Linkedin, Award, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student',
        batchYear: '', branch: '', rollNumber: '', company: '', designation: '', linkedin: '',
        github: '', careerInterest: '', year: '', skills: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            return toast.error('Please enter a valid email address');
        }

        setLoading(true);
        try {
            // Build FormData to support file uploads
            const dataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                dataToSubmit.append(key, formData[key]);
            });

            if (formData.role === 'student' && resumeFile) {
                dataToSubmit.append('resume', resumeFile);
            }

            await register(dataToSubmit);
            toast.success('Account created! Welcome to AlumNexus.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-8">
            <div className="glass-card premium-shadow p-8 border border-[var(--border)]">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-[var(--primary)]">Join AlumNexus</h1>
                    <p className="text-gray-600 mt-2">Connect with your college community and grow beyond limits.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">I am a...</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-smooth ${formData.role === 'student' ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] grayscale opacity-60'
                                        }`}
                                >
                                    <GraduationCap size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'alumni' })}
                                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-smooth ${formData.role === 'alumni' ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] grayscale opacity-60'
                                        }`}
                                >
                                    <Briefcase size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Alumni</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Create Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full pl-10 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--primary)] transition-smooth"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Student Details Section */}
                    {formData.role === 'student' && (
                        <div className="animate-fade-in space-y-6 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--primary)]/20 shadow-inner">
                            <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">
                                <GraduationCap size={20} className="text-blue-500" /> Student Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Branch <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="e.g. B.Tech CSE" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Year of Study <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="number" min="1" max="5" required className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="e.g. 3" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Skills (Comma separated) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="e.g. React, Node.js, Python" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="url" className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">GitHub URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="url" className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="https://github.com/..." value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Career Interest <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium" placeholder="e.g. Software Development, Data Science" value={formData.careerInterest} onChange={(e) => setFormData({ ...formData, careerInterest: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Resume (PDF/DOC)</label>
                                    <div className="relative flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-smooth">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {resumeFile ? resumeFile.name : "Click to upload your resume"}
                                                </p>
                                            </div>
                                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setResumeFile(e.target.files[0]);
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.role === 'alumni' && (
                        <div className="animate-fade-in space-y-6 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--primary)]/20 shadow-inner">
                            <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">
                                <BadgeCheck size={20} className="text-blue-500" /> Professional Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Batch Year <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="number"
                                            required
                                            min="1950"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="e.g. 2023"
                                            value={formData.batchYear}
                                            onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Branch <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="e.g. B.Tech CSE"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Roll Number</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="College ID (Optional)"
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Company <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="e.g. Google"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Designation <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm transition-smooth font-medium"
                                            placeholder="e.g. Software Engineer"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--primary)] text-[var(--text-light)] rounded-xl font-bold premium-shadow hover:bg-[var(--primary-light)] disabled:opacity-70 transition-smooth flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[var(--primary)] font-bold hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
