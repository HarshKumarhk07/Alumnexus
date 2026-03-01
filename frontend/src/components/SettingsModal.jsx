import React, { useState } from 'react';
import { X, User, Lock, Save, Loader2, Briefcase, Linkedin, Globe, MapPin, Building2, Upload, ExternalLink, FileText, Github, Edit2, Trash2, Plus } from 'lucide-react';
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
        mentorshipAvailable: false, resumeReview: false, referrals: false,
        projects: []
    });
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [pendingProfilePhoto, setPendingProfilePhoto] = useState(null);
    const [isSavingAlumni, setIsSavingAlumni] = useState(false);
    const [isFetchingAlumni, setIsFetchingAlumni] = useState(false);

    // Student Profile State
    const [studentData, setStudentData] = useState({
        branch: '', year: '', skills: '',
        linkedin: '', github: '', careerInterest: '',
        resumeURL: '',
        projects: []
    });
    const [uploadResumeFile, setUploadResumeFile] = useState(null);
    const [pendingResume, setPendingResume] = useState(null);
    const [isSavingStudent, setIsSavingStudent] = useState(false);
    const [isFetchingStudent, setIsFetchingStudent] = useState(false);
    const [showResumePreview, setShowResumePreview] = useState(false);
    const [editingProjectIndex, setEditingProjectIndex] = useState(null);
    const [editingRole, setEditingRole] = useState(null); // 'student' or 'alumni'

    // Helper to get JPG preview of Cloudinary PDF
    const getResumePreviewUrl = (url) => {
        if (!url) return '';
        // If it's already an image or there's no extension, just return it
        if (url.match(/\.(jpg|jpeg|png|webp)$/i)) return url;
        // Replace .pdf with .jpg
        return url.replace(/\.pdf$/i, '.jpg');
    };

    React.useEffect(() => {
        if (isOpen && user?.role) {
            if (user.role === 'alumni' && activeTab === 'professional') {
                loadAlumniProfile();
            } else if (user.role === 'student' && activeTab === 'academic') {
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
                    resumeURL: data.resumeURL || '',
                    projects: data.projects || []
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
                    projects: data.projects || []
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
                } else if (key === 'projects') {
                    formData.append('projects', JSON.stringify(alumniData.projects));
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

    const handleAddProject = (role) => {
        const newData = role === 'student' ? { ...studentData } : { ...alumniData };
        newData.projects = [...newData.projects, { title: '', description: '', githubLink: '', liveLink: '' }];
        if (role === 'student') setStudentData(newData);
        else setAlumniData(newData);
        setEditingProjectIndex(newData.projects.length - 1);
        setEditingRole(role);
    };

    const handleRemoveProject = (role, index) => {
        const newData = role === 'student' ? { ...studentData } : { ...alumniData };
        newData.projects = newData.projects.filter((_, i) => i !== index);
        if (role === 'student') setStudentData(newData);
        else setAlumniData(newData);
        if (editingProjectIndex === index && editingRole === role) {
            setEditingProjectIndex(null);
            setEditingRole(null);
        }
    };

    const handleProjectChange = (role, index, field, value) => {
        const newData = role === 'student' ? { ...studentData } : { ...alumniData };
        newData.projects[index][field] = value;
        if (role === 'student') setStudentData(newData);
        else setAlumniData(newData);
    };

    const handleEditProject = (role, index) => {
        setEditingProjectIndex(index);
        setEditingRole(role);
    };

    const stopEditingProject = () => {
        setEditingProjectIndex(null);
        setEditingRole(null);
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
                } else if (key === 'projects') {
                    formData.append('projects', JSON.stringify(studentData.projects));
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
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-2 md:p-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] md:rounded-[32px] w-full max-w-3xl max-h-[92vh] flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                    <div className="p-4 md:p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--primary)]">Settings</h2>
                        <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                            <X size={20} className="md:w-6 md:h-6" />
                        </button>
                    </div>

                    <div className="flex border-b border-[var(--border)] shrink-0">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                            ${activeTab === 'profile' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent text-[var(--text-light)]/60 hover:bg-[var(--primary)]/5'}`}
                        >
                            <User size={18} /> Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                ${activeTab === 'security' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent text-[var(--text-light)]/60 hover:bg-[var(--primary)]/5'}`}
                        >
                            <Lock size={16} className="md:w-[18px]" /> Security
                        </button>
                        {user?.role === 'alumni' && (
                            <button
                                onClick={() => setActiveTab('professional')}
                                className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                    ${activeTab === 'professional' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent text-[var(--text-light)]/60 hover:bg-[var(--primary)]/5'}`}
                            >
                                <Briefcase size={16} className="md:w-[18px]" /> Professional
                            </button>
                        )}
                        {user?.role === 'student' && (
                            <button
                                onClick={() => setActiveTab('academic')}
                                className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-smooth border-b-2
                                    ${activeTab === 'academic' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent text-[var(--text-light)]/60 hover:bg-[var(--primary)]/5'}`}
                            >
                                <Briefcase size={16} className="md:w-[18px]" /> Academic
                            </button>
                        )}
                    </div>

                    <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        {activeTab === 'profile' ? (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-[var(--text-dark)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-[var(--text-dark)]"
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
                                            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">Experience Summary (Bio)</label>
                                            <textarea
                                                value={alumniData.bio}
                                                onChange={(e) => setAlumniData({ ...alumniData, bio: e.target.value })}
                                                className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-medium resize-none h-24 text-[var(--text-dark)]"
                                                placeholder="Write a brief professional summary..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Batch Year</label>
                                                <input type="number" value={alumniData.batchYear} onChange={e => setAlumniData({ ...alumniData, batchYear: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" placeholder="e.g. 2024" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Branch</label>
                                                <select
                                                    value={alumniData.branch}
                                                    onChange={e => setAlumniData({ ...alumniData, branch: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]"
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
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Roll Number</label>
                                                <input type="text" value={alumniData.rollNumber} onChange={e => setAlumniData({ ...alumniData, rollNumber: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" placeholder="e.g. 21BCE0001" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Current Designation</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="text" value={alumniData.designation} onChange={e => setAlumniData({ ...alumniData, designation: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Company</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="text" value={alumniData.company} onChange={e => setAlumniData({ ...alumniData, company: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">LinkedIn URL</label>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="url" placeholder="https://" value={alumniData.linkedin} onChange={e => setAlumniData({ ...alumniData, linkedin: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Portfolio / Website</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="url" placeholder="https://" value={alumniData.portfolio} onChange={e => setAlumniData({ ...alumniData, portfolio: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                <input type="text" placeholder="e.g. San Francisco, CA" value={alumniData.location} onChange={e => setAlumniData({ ...alumniData, location: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Skills (Comma separated)</label>
                                            <input type="text" placeholder="e.g. React, Node.js, Python" value={alumniData.skills} onChange={e => setAlumniData({ ...alumniData, skills: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Profile Photo Updates</label>
                                            <div className="relative flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[var(--border)] border-dashed rounded-xl cursor-pointer bg-[var(--background)] hover:bg-[var(--primary)]/5 transition-smooth group/upload">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-6 h-6 mb-2 text-[var(--text-light)]/40 group-hover/upload:text-[var(--primary)] transition-smooth" />
                                                        <p className="text-xs text-[var(--text-light)]/60 font-medium group-hover/upload:text-[var(--text-dark)] transition-smooth">
                                                            {profilePhotoFile ? profilePhotoFile.name : "Click to upload a new profile photo"}
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

                                        {/* Projects Showcase for Alumni */}
                                        <div className="space-y-6 pt-6 border-t mt-6">
                                            <div className="flex justify-between items-center px-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[var(--surface)] text-[var(--primary)] rounded-lg">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">Professional Projects</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddProject('alumni')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--primary-light)] transition-smooth"
                                                >
                                                    <Plus size={14} /> Add Project
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {alumniData.projects?.map((project, index) => (
                                                    <div key={index} className="animate-fade-in group">
                                                        {editingProjectIndex === index && editingRole === 'alumni' ? (
                                                            <div className="p-6 bg-[var(--surface)] border-2 border-[var(--primary)] rounded-2xl space-y-4 shadow-xl">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-light)]/40 pl-1">Project Title</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Project Title"
                                                                            value={project.title}
                                                                            onChange={(e) => handleProjectChange('alumni', index, 'title', e.target.value)}
                                                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm text-[var(--text-dark)]"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-light)]/40 pl-1">GitHub Link</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="https://github.com/..."
                                                                            value={project.githubLink}
                                                                            onChange={(e) => handleProjectChange('alumni', index, 'githubLink', e.target.value)}
                                                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm text-[var(--text-dark)]"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-light)]/40 pl-1">Live Link</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="https://live-demo.com..."
                                                                            value={project.liveLink}
                                                                            onChange={(e) => handleProjectChange('alumni', index, 'liveLink', e.target.value)}
                                                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm text-[var(--text-dark)]"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1 md:col-span-2">
                                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-light)]/40 pl-1">Description</label>
                                                                        <textarea
                                                                            placeholder="Brief description of your project..."
                                                                            value={project.description}
                                                                            onChange={(e) => handleProjectChange('alumni', index, 'description', e.target.value)}
                                                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium text-sm h-20 resize-none text-[var(--text-dark)]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveProject('alumni', index)}
                                                                        className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-smooth flex items-center gap-1"
                                                                    >
                                                                        <Trash2 size={14} /> Remove
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={stopEditingProject}
                                                                        className="px-6 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-lg hover:bg-[var(--primary-light)] transition-smooth"
                                                                    >
                                                                        Done
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex justify-between items-center hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-smooth group/card">
                                                                <div>
                                                                    <h5 className="font-bold text-[var(--primary)]">{project.title || 'Untitled Project'}</h5>
                                                                    <p className="text-xs text-[var(--text-light)]/60 font-medium truncate max-w-[200px]">{project.description || 'No description'}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditProject('alumni', index)}
                                                                        className="p-2 text-[var(--text-light)]/40 hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-smooth"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveProject('alumni', index)}
                                                                        className="p-2 text-[var(--text-light)]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-smooth"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {alumniData.projects?.length === 0 && (
                                                    <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-[32px] text-[var(--text-light)]/20">
                                                        <Briefcase size={32} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-tight">No projects added yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl space-y-4">
                                            <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">Available For</h4>
                                            <div className="flex flex-col gap-3">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={alumniData.mentorshipAvailable} onChange={(e) => setAlumniData({ ...alumniData, mentorshipAvailable: e.target.checked })} className="w-5 h-5 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[var(--text-dark)] group-hover:text-[var(--primary)] transition-smooth">Mentorship</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={alumniData.resumeReview} onChange={(e) => setAlumniData({ ...alumniData, resumeReview: e.target.checked })} className="w-5 h-5 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[var(--text-dark)] group-hover:text-[var(--primary)] transition-smooth">Resume Review</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={alumniData.referrals} onChange={(e) => setAlumniData({ ...alumniData, referrals: e.target.checked })} className="w-5 h-5 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[var(--text-dark)] group-hover:text-[var(--primary)] transition-smooth">Referrals</span>
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
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Branch</label>
                                                <select
                                                    value={studentData.branch}
                                                    onChange={e => setStudentData({ ...studentData, branch: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]"
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
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Year of Study</label>
                                                <input type="number" min="1" max="5" value={studentData.year} onChange={e => setStudentData({ ...studentData, year: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" placeholder="e.g. 3" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">LinkedIn URL</label>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="url" placeholder="https://linkedin.com/in/..." value={studentData.linkedin} onChange={e => setStudentData({ ...studentData, linkedin: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">GitHub URL</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]/40" size={16} />
                                                    <input type="url" placeholder="https://github.com/..." value={studentData.github} onChange={e => setStudentData({ ...studentData, github: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Career Interest</label>
                                            <input type="text" placeholder="e.g. Software Development, Data Science" value={studentData.careerInterest} onChange={e => setStudentData({ ...studentData, careerInterest: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Skills (Comma separated)</label>
                                            <input type="text" placeholder="e.g. React, Node.js, Python" value={studentData.skills} onChange={e => setStudentData({ ...studentData, skills: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-sm text-[var(--text-dark)]" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[var(--text-light)]/40 pl-2">Profile Photo Updates</label>
                                            <div className="relative flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[var(--border)] border-dashed rounded-xl cursor-pointer bg-[var(--background)] hover:bg-[var(--primary)]/5 transition-smooth group/upload">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-6 h-6 mb-2 text-[var(--text-light)]/40 group-hover/upload:text-[var(--primary)] transition-smooth" />
                                                        <p className="text-xs text-[var(--text-light)]/60 font-medium group-hover/upload:text-[var(--text-dark)] transition-smooth">
                                                            {profilePhotoFile ? profilePhotoFile.name : "Click to upload a new profile photo"}
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
                                                <label className="text-xs font-bold uppercase text-[var(--text-light)]/40">Update Resume</label>
                                                {studentData.resumeURL && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowResumePreview(true)}
                                                        className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                                                    >
                                                        View Current Resume <ExternalLink size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[var(--border)] border-dashed rounded-xl cursor-pointer bg-[var(--background)] hover:bg-[var(--primary)]/5 transition-smooth group/upload">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-6 h-6 mb-2 text-[var(--text-light)]/40 group-hover/upload:text-[var(--primary)] transition-smooth" />
                                                        <p className="text-xs text-[var(--text-light)]/60 font-medium group-hover/upload:text-[var(--text-dark)] transition-smooth text-center px-4">
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

                                        {/* Projects Section */}
                                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-2">Projects Showcase</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddProject('student')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--primary-light)] transition-smooth"
                                                >
                                                    <Plus size={14} /> Add Project
                                                </button>
                                            </div>

                                            {studentData.projects?.length === 0 ? (
                                                <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                                    <p className="text-sm text-gray-400 font-medium">No projects added yet. Showcase your work!</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {studentData.projects?.map((project, index) => (
                                                        <div key={index} className="animate-fade-in group">
                                                            {editingProjectIndex === index && editingRole === 'student' ? (
                                                                <div className="p-6 bg-white border-2 border-[var(--primary)] rounded-2xl space-y-4 shadow-xl">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold uppercase text-gray-400 pl-1">Project Title</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Project Title"
                                                                                value={project.title}
                                                                                onChange={(e) => handleProjectChange('student', index, 'title', e.target.value)}
                                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold uppercase text-gray-400 pl-1">GitHub Link</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="https://github.com/..."
                                                                                value={project.githubLink}
                                                                                onChange={(e) => handleProjectChange('student', index, 'githubLink', e.target.value)}
                                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold uppercase text-gray-400 pl-1">Live Link</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="https://live-demo.com..."
                                                                                value={project.liveLink}
                                                                                onChange={(e) => handleProjectChange('student', index, 'liveLink', e.target.value)}
                                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-bold text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1 md:col-span-2">
                                                                            <label className="text-[10px] font-bold uppercase text-gray-400 pl-1">Description</label>
                                                                            <textarea
                                                                                placeholder="Brief description of your project..."
                                                                                value={project.description}
                                                                                onChange={(e) => handleProjectChange('student', index, 'description', e.target.value)}
                                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-smooth font-medium text-sm h-20 resize-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveProject('student', index)}
                                                                            className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-smooth flex items-center gap-1"
                                                                        >
                                                                            <Trash2 size={14} /> Remove
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={stopEditingProject}
                                                                            className="px-6 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-lg hover:bg-[var(--primary-light)] transition-smooth"
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center hover:border-[var(--primary)] hover:bg-white transition-smooth group/card">
                                                                    <div>
                                                                        <h5 className="font-bold text-[var(--primary)]">{project.title || 'Untitled Project'}</h5>
                                                                        <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{project.description || 'No description'}</p>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditProject('student', index)}
                                                                            className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-smooth"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveProject('student', index)}
                                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-smooth"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">Current Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-[var(--text-dark)]"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">New Password</label>
                                    <input
                                        required
                                        minLength="6"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-smooth font-bold text-[var(--text-dark)]"
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-light)]/40 pl-2">Confirm New Password</label>
                                    <input
                                        required
                                        minLength="6"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={`w-full px-6 py-4 bg-[var(--background)] border-2 rounded-2xl focus:outline-none transition-smooth font-bold text-[var(--text-dark)] ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                                            ? 'border-red-500/50 focus:border-red-500 bg-red-500/5'
                                            : 'border-[var(--border)] focus:border-[var(--primary)] focus:bg-[var(--surface)]'
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
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] w-full max-w-sm premium-shadow overflow-hidden text-center p-6 animate-scale-in">
                            <h3 className="text-xl font-bold text-[var(--primary)] mb-2">Confirm Upload</h3>
                            <p className="text-sm text-[var(--text-light)]/60 mb-6">
                                Are you sure you want to upload <strong className="text-[var(--text-dark)]">{pendingProfilePhoto ? pendingProfilePhoto.name : pendingResume.name}</strong>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setPendingProfilePhoto(null);
                                        setPendingResume(null);
                                    }}
                                    className="flex-1 py-3 bg-[var(--background)] text-[var(--text-light)]/60 rounded-xl font-bold hover:bg-[var(--border)] transition-smooth"
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

            {/* In-App Resume Image Preview Modal */}
            {
                showResumePreview && studentData.resumeURL && (
                    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl transition-smooth">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl overflow-hidden relative animate-scale-in">
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shadow-sm sticky top-0 bg-[var(--surface)] z-10 text-[var(--text-dark)]">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <FileText className="text-[var(--primary)]" size={20} />
                                    Resume Preview
                                </h3>
                                <button
                                    onClick={() => setShowResumePreview(false)}
                                    className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors"
                                >
                                    <X size={20} className="text-[var(--text-light)]/60" />
                                </button>
                            </div>
                            {/* Image Container */}
                            <div className="flex-1 overflow-y-auto bg-[var(--background)] flex items-center justify-center p-4">
                                <img
                                    src={getResumePreviewUrl(studentData.resumeURL)}
                                    alt="Resume Preview"
                                    className="max-w-full h-auto object-contain shadow-md rounded border border-[var(--border)]"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = "https://via.placeholder.com/800x1000?text=Preview+Not+Available";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default SettingsModal;
