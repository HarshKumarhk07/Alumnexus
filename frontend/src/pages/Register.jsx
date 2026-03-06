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
        <div className="max-w-2xl mx-auto mt-12 mb-20 px-4">
            <div className="glass-card premium-shadow p-8 border border-[var(--border)]">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-[var(--primary)]">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join the institution's most powerful network</p>
                </div>

                <div className="flex bg-[var(--background)] p-1.5 rounded-2xl mb-10 border border-[var(--border)] overflow-hidden relative">
                    <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-3px)] bg-[var(--primary)] rounded-xl transition-smooth ${formData.role === 'alumni' ? 'translate-x-full' : 'translate-x-0'}`}></div>
                    <button
                        onClick={() => setFormData({ ...formData, role: 'student' })}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 transition-smooth ${formData.role === 'student' ? 'text-[var(--text-light)]' : 'text-gray-500'}`}
                    >
                        I'm a Student
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, role: 'alumni' })}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 transition-smooth ${formData.role === 'alumni' ? 'text-[var(--text-light)]' : 'text-gray-500'}`}
                    >
                        I'm an Alumnus
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
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
                            <label className="text-sm font-semibold">Password</label>
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
                    </div>

                    <div className="space-y-6 pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="text-[var(--primary)]" size={20} />
                            <h3 className="font-bold text-[var(--primary)] text-lg">Academic Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">{formData.role === 'alumni' ? 'Graduation Batch Year' : 'Expected Graduation Year'}</label>
                                <input
                                    type="number"
                                    required
                                    min="1950"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                    placeholder="2024"
                                    value={formData.batchYear}
                                    onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Branch</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                >
                                    <option value="">Select Branch</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            {formData.role === 'student' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Current Academic Year</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                        <option value="5">5th Year (Dual/Architecture)</option>
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Roll Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                    placeholder="College ID (Optional)"
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">LinkedIn URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                    placeholder="https://linkedin.com/in/..."
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                />
                            </div>

                            {formData.role === 'alumni' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Current Company</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                                placeholder="e.g. Google"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Designation</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth"
                                            placeholder="e.g. Software Engineer"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow hover:bg-[var(--primary-light)] disabled:opacity-70 transition-smooth flex justify-center items-center gap-2"
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
