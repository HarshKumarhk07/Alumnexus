import React, { useState } from 'react';
import { X, User, Lock, Save, Loader2, Briefcase, Linkedin, Globe, MapPin, Building2, Upload, ExternalLink } from 'lucide-react';
import { authService, profileService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth(); // using login to update local storage user state
    const [activeTab, setActiveTab] = useState('profile');

    // Alumni Profile State
    const [alumniData, setAlumniData] = useState({
        batchYear: '', branch: '', rollNumber: '', designation: '', company: '', location: '',
        linkedin: '', portfolio: '', bio: '', skills: '',
        mentorshipAvailable: false, resumeReview: false, referrals: false
    });
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [pendingProfilePhoto, setPendingProfilePhoto] = useState(null);
    const [isSavingAlumni, setIsSavingAlumni] = useState(false);
    const [isFetchingAlumni, setIsFetchingAlumni] = useState(false);

    // Student Profile State
    const [studentData, setStudentData] = useState({
        branch: '', year: '', skills: '',
        linkedin: '', github: '', careerInterest: '',
        resumeURL: ''
    });
    const [uploadResumeFile, setUploadResumeFile] = useState(null);
    const [pendingResume, setPendingResume] = useState(null);
    const [isSavingStudent, setIsSavingStudent] = useState(false);
    const [isFetchingStudent, setIsFetchingStudent] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (user?.role === 'alumni' && activeTab === 'professional') {
                loadAlumniProfile();
            } else if (user?.role === 'student' && activeTab === 'academic') {
                loadStudentProfile();
            }
        }
    }, [isOpen, user?.role, activeTab]);

    const loadStudentProfile = async () => {
        try {
            setIsFetchingStudent(true);
            const res = await profileService.getMeStudentProfile();
            const data = res.data.data;
            if (data) {
                setStudentData({
                    branch: data.branch || '',
                    year: data.year || '',
                    skills: data.skills ? data.skills.join(', ') : '',
                    linkedin: data.linkedin || '',
                    github: data.github || '',
                    careerInterest: data.careerInterest || '',
                    resumeURL: data.resumeURL || ''
                });
            }
        } catch (error) {
            console.error("Failed to load student profile", error);
        } finally {
            setIsFetchingStudent(false);
        }
    };

    const loadAlumniProfile = async () => {
        try {
            setIsFetchingAlumni(true);
            const res = await profileService.getMeAlumniProfile();
            const data = res.data.data;
            if (data) {
                setAlumniData({
                    batchYear: data.batchYear || '',
                    branch: data.branch || '',
                    rollNumber: data.rollNumber || '',
                    designation: data.designation || '',
                    company: data.company || '',
                    location: data.location || '',
                    linkedin: data.linkedin || '',
                    portfolio: data.portfolio || '',
                    bio: data.bio || '',
                    skills: data.skills ? data.skills.join(', ') : '',
                    mentorshipAvailable: data.mentorshipAvailable || false,
                    resumeReview: data.resumeReview || false,
                    referrals: data.referrals || false,
                });
            }
        } catch (error) {
            console.error("Failed to load alumni profile", error);
        } finally {
            setIsFetchingAlumni(false);
        }
    };

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    if (!isOpen) return null;

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSavingProfile(true);
            const res = await authService.updateProfile(profileData);

            // Update local storage user data
            const updatedUser = res.data.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // This forces context refresh if there's a mechanism, otherwise reloading works best
            toast.success('Profile updated successfully!');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAlumniSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSavingAlumni(true);
            const formData = new FormData();

            Object.keys(alumniData).forEach(key => {
                if (key === 'skills') {
                    const skillsArray = alumniData.skills.split(',').map(s => s.trim()).filter(Boolean);
                    skillsArray.forEach(skill => formData.append('skills', skill));

                    // Alternatively, just send as JSON string if backend supports it. Let's send multiple values.
                    // If backend expects native array, we might need a minor tweak there, but let's try direct map.
                } else if (typeof alumniData[key] === 'boolean') {
                    formData.append(key, alumniData[key]);
                } else {
                    formData.append(key, alumniData[key]);
                }
            });

            if (profilePhotoFile) {
                formData.append('profilePhoto', profilePhotoFile);
            }

            await profileService.upsertAlumni(formData);
            toast.success('Professional profile updated!');
            setProfilePhotoFile(null); // Clear file input
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update professional profile');
        } finally {
            setIsSavingAlumni(false);
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSavingStudent(true);

            // Upload photo separately if provided
            if (profilePhotoFile) {
                const photoData = new FormData();
                photoData.append('profilePhoto', profilePhotoFile);
                await profileService.uploadStudentPhoto(photoData);
                setProfilePhotoFile(null);
            }

            const formData = new FormData();

            Object.keys(studentData).forEach(key => {
                if (key === 'skills') {
                    const skillsArray = studentData.skills.split(',').map(s => s.trim()).filter(Boolean);
                    formData.append('skills', JSON.stringify(skillsArray));
                } else if (key !== 'resumeURL') {
                    formData.append(key, studentData[key]);
                }
            });

            if (uploadResumeFile) {
                formData.append('resume', uploadResumeFile);
            }

            await profileService.upsertStudentProfile(formData);
            toast.success('Academic profile updated!');
            setUploadResumeFile(null);
            pendingResume && setPendingResume(null);
            loadStudentProfile(); // refresh data to show right resume link
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update academic profile');
        } finally {
            setIsSavingStudent(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        try {
            setIsSavingPassword(true);
            const res = await authService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            // Update token if returned
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setActiveTab('profile'); // Switch back to profile view
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                <div className="p-6 md:p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-bold text-[var(--primary)]">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                            ${activeTab === 'profile' ? 'border-[var(--primary)] text-[var(--primary)] bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        <User size={18} /> Edit Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                ${activeTab === 'security' ? 'border-[var(--primary)] text-[var(--primary)] bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Lock size={18} /> Password & Security
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('professional')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                    ${activeTab === 'professional' ? 'border-[var(--primary)] text-[var(--primary)] bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Briefcase size={18} /> Professional Profile
                        </button>
                    )}
                    {user?.role === 'student' && (
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                    ${activeTab === 'academic' ? 'border-[var(--primary)] text-[var(--primary)] bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Briefcase size={18} /> Academic Profile
                        </button>
                    )}
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold"
                                />
                            </div>
                            <button
                                disabled={isSavingProfile}
                                type="submit"
                                className="w-full mt-4 py-4 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingProfile ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </form>
                    ) : activeTab === 'professional' ? (
                        <form onSubmit={handleAlumniSubmit} className="space-y-6">
                            {isFetchingAlumni ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[var(--primary)]" /></div>
                            ) : (
                                <div className="space-y-6 pr-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Experience Summary (Bio)</label>
                                        <textarea
                                            value={alumniData.bio}
                                            onChange={(e) => setAlumniData({ ...alumniData, bio: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-medium resize-none h-24"
                                            placeholder="Write a brief professional summary..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Batch Year</label>
                                            <input type="number" value={alumniData.batchYear} onChange={e => setAlumniData({ ...alumniData, batchYear: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" placeholder="e.g. 2024" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Branch</label>
                                            <input type="text" value={alumniData.branch} onChange={e => setAlumniData({ ...alumniData, branch: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" placeholder="e.g. Computer Science" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Roll Number</label>
                                            <input type="text" value={alumniData.rollNumber} onChange={e => setAlumniData({ ...alumniData, rollNumber: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" placeholder="e.g. 21BCE0001" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Current Designation</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="text" value={alumniData.designation} onChange={e => setAlumniData({ ...alumniData, designation: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Company</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="text" value={alumniData.company} onChange={e => setAlumniData({ ...alumniData, company: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">LinkedIn URL</label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="url" placeholder="https://" value={alumniData.linkedin} onChange={e => setAlumniData({ ...alumniData, linkedin: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Portfolio / Website</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="url" placeholder="https://" value={alumniData.portfolio} onChange={e => setAlumniData({ ...alumniData, portfolio: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="text" placeholder="e.g. San Francisco, CA" value={alumniData.location} onChange={e => setAlumniData({ ...alumniData, location: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Skills (Comma separated)</label>
                                        <input type="text" placeholder="e.g. React, Node.js, Python" value={alumniData.skills} onChange={e => setAlumniData({ ...alumniData, skills: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Profile Photo Updates</label>
                                        <div className="relative flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-smooth">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {profilePhotoFile ? profilePhotoFile.name : "Click to upload a new profile photo (Cloudinary)"}
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setPendingProfilePhoto(e.target.files[0]);
                                                    }
                                                    e.target.value = null; // reset input
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--primary)]/20 rounded-xl space-y-4">
                                        <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">Available For</h4>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input type="checkbox" checked={alumniData.mentorshipAvailable} onChange={(e) => setAlumniData({ ...alumniData, mentorshipAvailable: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-smooth">Mentorship</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input type="checkbox" checked={alumniData.resumeReview} onChange={(e) => setAlumniData({ ...alumniData, resumeReview: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-smooth">Resume Review</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input type="checkbox" checked={alumniData.referrals} onChange={(e) => setAlumniData({ ...alumniData, referrals: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-smooth">Referrals</span>
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            )}
                            <button
                                disabled={isSavingAlumni || isFetchingAlumni}
                                type="submit"
                                className="w-full mt-4 py-4 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingAlumni ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Save Professional Profile
                            </button>
                        </form>
                    ) : activeTab === 'academic' ? (
                        <form onSubmit={handleStudentSubmit} className="space-y-6">
                            {isFetchingStudent ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[var(--primary)]" /></div>
                            ) : (
                                <div className="space-y-6 pr-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Branch</label>
                                            <input type="text" value={studentData.branch} onChange={e => setStudentData({ ...studentData, branch: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" placeholder="e.g. Computer Science" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">Year of Study</label>
                                            <input type="number" min="1" max="5" value={studentData.year} onChange={e => setStudentData({ ...studentData, year: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" placeholder="e.g. 3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">LinkedIn URL</label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="url" placeholder="https://linkedin.com/in/..." value={studentData.linkedin} onChange={e => setStudentData({ ...studentData, linkedin: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 pl-2">GitHub URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input type="url" placeholder="https://github.com/..." value={studentData.github} onChange={e => setStudentData({ ...studentData, github: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Career Interest</label>
                                        <input type="text" placeholder="e.g. Software Development, Data Science" value={studentData.careerInterest} onChange={e => setStudentData({ ...studentData, careerInterest: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Skills (Comma separated)</label>
                                        <input type="text" placeholder="e.g. React, Node.js, Python" value={studentData.skills} onChange={e => setStudentData({ ...studentData, skills: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 pl-2">Profile Photo Updates</label>
                                        <div className="relative flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-smooth">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {profilePhotoFile ? profilePhotoFile.name : "Click to upload a new profile photo (Cloudinary)"}
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setPendingProfilePhoto(e.target.files[0]);
                                                    }
                                                    e.target.value = null; // reset input
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center pl-2 pr-1">
                                            <label className="text-xs font-bold uppercase text-gray-400">Update Resume</label>
                                            {studentData.resumeURL && (
                                                <a
                                                    href={studentData.resumeURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                                                >
                                                    View Current Resume <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="relative flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-smooth">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {uploadResumeFile ? uploadResumeFile.name : studentData.resumeURL ? "Resume uploaded ✅. Click to replace." : "Click to upload a resume (PDF/DOC)"}
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setPendingResume(e.target.files[0]);
                                                    }
                                                    e.target.value = null; // reset input
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            )}
                            <button
                                disabled={isSavingStudent || isFetchingStudent}
                                type="submit"
                                className="w-full mt-4 py-4 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingStudent ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Save Academic Profile
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Current Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">New Password</label>
                                <input
                                    required
                                    minLength="6"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-smooth font-bold"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Confirm New Password</label>
                                <input
                                    required
                                    minLength="6"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none transition-smooth font-bold ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                                        : 'border-gray-100 focus:border-[var(--primary)] focus:bg-white'
                                        }`}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button
                                disabled={isSavingPassword || (passwordData.confirmPassword.length > 0 && passwordData.newPassword !== passwordData.confirmPassword)}
                                type="submit"
                                className="w-full mt-4 py-4 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingPassword ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Photo & Resume Confirmation Modal */}
            {(pendingProfilePhoto || pendingResume) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-sm premium-shadow overflow-hidden text-center p-6 animate-scale-in">
                        <h3 className="text-xl font-bold text-[var(--primary)] mb-2">Confirm Upload</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to upload <strong>{pendingProfilePhoto ? pendingProfilePhoto.name : pendingResume.name}</strong>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPendingProfilePhoto(null);
                                    setPendingResume(null);
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-smooth"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (pendingProfilePhoto) setProfilePhotoFile(pendingProfilePhoto);
                                    if (pendingResume) setUploadResumeFile(pendingResume);
                                    setPendingProfilePhoto(null);
                                    setPendingResume(null);
                                }}
                                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-light)] transition-smooth"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsModal;
