import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users, Briefcase, BookOpen, Bell, TrendingUp,
    ArrowUpRight, Clock, Star, Target, ShieldCheck,
    FileText, Mail, Download, CheckCircle2, XCircle, X,
    Heart, MessageSquare, Image as ImageIcon, Handshake, MessageCircle, UserCheck, Loader2, GraduationCap, Upload,
    Newspaper, CalendarDays, BarChart2, PieChart, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService, notificationService, jobService, blogService, profileService, eventService, surveyService } from '../services/api.service';
import toast from 'react-hot-toast';
import ImageSlider from '../components/ImageSlider';
import CommentModal from '../components/CommentModal';
import NotificationModal from '../components/NotificationModal';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentBlogs, setRecentBlogs] = useState([]);
    const [activeBlogForComments, setActiveBlogForComments] = useState(null);
    const [requests, setRequests] = useState([]);
    const [isUpdatingRequest, setIsUpdatingRequest] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Admin Announcement State
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcement, setAnnouncement] = useState({ message: '', targetRole: 'all' });
    const [isPosting, setIsPosting] = useState(false);

    // Admin Engagement Post State
    const [showEngagementModal, setShowEngagementModal] = useState(false);
    const [engagementPost, setEngagementPost] = useState({ title: '', content: '', category: 'General', targetRole: 'all' });
    const [engagementImage, setEngagementImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPostingEngagement, setIsPostingEngagement] = useState(false);

    // Admin Newsletter State
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const [newsletter, setNewsletter] = useState({ subject: '', body: '', targetRole: 'all' });
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

    // Admin Event Invitation State
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventData, setEventData] = useState({ selectedEventId: '', targetRole: 'all', specificUser: '', isReminder: false });
    const [existingEvents, setExistingEvents] = useState([]);
    const [existingAlumni, setExistingAlumni] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isSendingEvent, setIsSendingEvent] = useState(false);

    // Admin Users Modal State
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [modalRole, setModalRole] = useState('student');
    const [modalUsers, setModalUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Survey State
    const [activeSurveys, setActiveSurveys] = useState([]);
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [surveyData, setSurveyData] = useState({ question: '', options: ['', ''], targetRole: 'all' });
    const [isPostingSurvey, setIsPostingSurvey] = useState(false);

    const [pendingAlumni, setPendingAlumni] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin Spotlight State
    const [showSpotlightModal, setShowSpotlightModal] = useState(false);
    const [spotlightData, setSpotlightData] = useState({
        title: '',
        description: '',
        quote: '',
        authorName: '',
        authorRole: '',
        isPublished: true
    });
    const [spotlightImage, setSpotlightImage] = useState(null);
    const [spotlightPreview, setSpotlightPreview] = useState(null);
    const [isUpdatingSpotlight, setIsUpdatingSpotlight] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    useEffect(() => {
        const fetchEventsAndAlumni = async () => {
            if (showEventModal) {
                if (existingEvents.length === 0) {
                    setIsLoadingEvents(true);
                    try {
                        const res = await eventService.getEvents();
                        setExistingEvents(res.data.data || []);
                    } catch (error) {
                        toast.error('Failed to load events');
                    } finally {
                        setIsLoadingEvents(false);
                    }
                }

                if (existingAlumni.length === 0) {
                    try {
                        const res = await profileService.getAlumni();
                        setExistingAlumni(res.data.data || []);
                    } catch (error) {
                        console.error('Failed to load alumni profiles', error);
                    }
                }
            }
        };
        fetchEventsAndAlumni();
    }, [showEventModal, existingEvents.length, existingAlumni.length]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [notifyRes, statsRes, blogsRes, surveysRes] = await Promise.all([
                notificationService.getNotifications(),
                user.role === 'admin' ? adminService.getStats() : adminService.getPublicStats(),
                blogService.getBlogs(),
                surveyService.getSurveys()
            ]);
            setNotifications(notifyRes.data.data);
            setStats(statsRes.data.data);
            setRecentBlogs(blogsRes.data.data.slice(0, 4));
            setActiveSurveys(surveysRes.data.data || []);


            if (user.role === 'admin') {
                const [pendingAlumniRes, pendingStudentsRes, jobsRes] = await Promise.all([
                    adminService.getPendingAlumni(),
                    adminService.getPendingStudents(),
                    adminService.getAllJobs()
                ]);
                setPendingAlumni(pendingAlumniRes.data.data);
                setPendingStudents(pendingStudentsRes.data.data);
                setRecentJobs(jobsRes.data.data.slice(0, 3));
            } else if (user.role === 'alumni') {
                const [jobRes, reqRes] = await Promise.all([
                    jobService.getJobs(),
                    profileService.getReceivedRequests()
                ]);
                setRecentJobs(jobRes.data.data.slice(0, 3));
                setRequests(reqRes.data.data);
            } else if (user.role === 'student') {
                const [jobRes, reqRes] = await Promise.all([
                    jobService.getJobs(),
                    profileService.getSentRequests()
                ]);
                setRecentJobs(jobRes.data.data.slice(0, 3));
                setRequests(reqRes.data.data);
            }
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status, role = 'alumni') => {
        try {
            if (role === 'alumni') {
                await adminService.verifyAlumni(id, status);
                setPendingAlumni(pendingAlumni.filter(a => a._id !== id));
            } else {
                await adminService.verifyStudent(id, status);
                setPendingStudents(pendingStudents.filter(s => s._id !== id));
            }
            toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} ${status === 'approved' ? 'approved' : 'rejected'}`);
            fetchDashboardData();
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    const handleExport = async () => {
        try {
            const response = await adminService.exportUsers();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users.csv');
            document.body.appendChild(link);
            link.click();
            toast.success('User list exported');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            const res = await adminService.postAnnouncement({
                message: announcement.message,
                targetRole: announcement.targetRole
            });
            toast.success(res.data.message || 'Announcement posted successfully!');
            setShowAnnouncementModal(false);
            setAnnouncement({ message: '', targetRole: 'all' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post announcement');
        } finally {
            setIsPosting(false);
        }
    };

    const handlePostEngagement = async (e) => {
        e.preventDefault();
        setIsPostingEngagement(true);
        try {
            const formData = new FormData();
            formData.append('title', engagementPost.title);
            formData.append('content', engagementPost.content);
            formData.append('category', engagementPost.category);
            formData.append('targetRole', engagementPost.targetRole);
            if (engagementImage) formData.append('image', engagementImage);

            await blogService.createBlog(formData);
            toast.success('Engagement post published successfully!');
            setShowEngagementModal(false);
            setEngagementPost({ title: '', content: '', category: 'General', targetRole: 'all' });
            setEngagementImage(null);
            setImagePreview(null);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to post engagement');
        } finally {
            setIsPostingEngagement(false);
        }
    };

    const handleUpdateSpotlight = async (e) => {
        e.preventDefault();
        setIsUpdatingSpotlight(true);
        try {
            const formData = new FormData();
            formData.append('title', spotlightData.title);
            formData.append('description', spotlightData.description);
            formData.append('quote', spotlightData.quote);
            formData.append('authorName', spotlightData.authorName);
            formData.append('authorRole', spotlightData.authorRole);
            formData.append('isPublished', spotlightData.isPublished);
            if (spotlightImage) formData.append('image', spotlightImage);

            await adminService.updateSpotlight(formData);
            toast.success('Spotlight story updated successfully!');
            setShowSpotlightModal(false);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to update spotlight');
        } finally {
            setIsUpdatingSpotlight(false);
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        setIsSendingNewsletter(true);
        try {
            const msg = `📰 NEWSLETTER: ${newsletter.subject}\n\n${newsletter.body}`;
            await adminService.postAnnouncement({ message: msg, targetRole: newsletter.targetRole });
            toast.success('Newsletter sent successfully!');
            setShowNewsletterModal(false);
            setNewsletter({ subject: '', body: '', targetRole: 'all' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send newsletter');
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    const handleSendEvent = async (e) => {
        e.preventDefault();
        setIsSendingEvent(true);
        if (!eventData.selectedEventId) return toast.error('Please select an event');
        try {
            setIsSendingEvent(true);
            const ev = existingEvents.find(e => e._id === eventData.selectedEventId);
            const title = eventData.isReminder ? `REMINDER: ${ev.title}` : `INVITATION: ${ev.title}`;
            let message = `You are invited to ${ev.title}!`;
            if (ev.dateTime) message += `\nDate: ${new Date(ev.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;
            if (ev.location) message += `\nLocation: ${ev.location}`;
            if (ev.speakerName) message += `\nSpeaker: ${ev.speakerName}`;

            await adminService.postAnnouncement({
                title,
                message,
                targetRole: eventData.targetRole,
                specificUser: eventData.targetRole === 'alumni' ? eventData.specificUser : undefined
            });

            toast.success(eventData.isReminder ? 'Reminder sent!' : 'Invitation sent!');
            setShowEventModal(false);
            setEventData({ selectedEventId: '', targetRole: 'all', specificUser: '', isReminder: false });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send event notification');
        } finally {
            setIsSendingEvent(false);
        }
    };

    const handlePostSurvey = async (e) => {
        e.preventDefault();

        // Filter out empty options
        const validOptions = surveyData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            toast.error('Please provide at least two valid options');
            return;
        }

        setIsPostingSurvey(true);
        try {
            await surveyService.createSurvey({
                question: surveyData.question,
                options: validOptions,
                targetRole: surveyData.targetRole
            });
            toast.success('Poll published successfully!');
            setShowSurveyModal(false);
            setSurveyData({ question: '', options: ['', ''], targetRole: 'all' });
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post poll');
        } finally {
            setIsPostingSurvey(false);
        }
    };

    const handleVoteSurvey = async (surveyId, optionId) => {
        try {
            await surveyService.voteSurvey(surveyId, optionId);
            toast.success('Vote submitted!');
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit vote');
        }
    };

    const fetchModalUsers = async (role) => {
        setModalRole(role);
        setShowUsersModal(true);
        setLoadingUsers(true);
        try {
            const res = await adminService.getUsers({ role });
            setModalUsers(res.data.data);
        } catch (err) {
            toast.error(`Failed to fetch ${role}s`);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchAlumniList = async () => {
        try {
            const res = await adminService.getUsers({ role: 'alumni' });
            setAlumniList(res.data.data);
        } catch (err) {
            toast.error('Failed to fetch alumni list');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
        try {
            await adminService.deleteUser(id);
            toast.success('User deleted successfully');
            setModalUsers(modalUsers.filter(u => u._id !== id));
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUpdateUserStatus = async (id, isVerified, currentRole) => {
        const action = isVerified ? 'verify' : 'revoke';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await adminService.updateUserStatus(id, {
                isVerified,
                status: currentRole === 'alumni' ? (isVerified ? 'approved' : 'rejected') : undefined
            });
            toast.success(`User ${isVerified ? 'verified' : 'revoked'} successfully`);
            // Refresh modal list
            const res = await adminService.getUsers({ role: modalRole });
            setModalUsers(res.data.data);
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleLike = async (blogId) => {
        try {
            const res = await blogService.likeBlog(blogId);
            setRecentBlogs(recentBlogs.map(b => (b._id === blogId ? res.data.data : b)));
            if (activeBlogForComments && activeBlogForComments._id === blogId) {
                setActiveBlogForComments(res.data.data);
            }
        } catch (err) {
            toast.error('Failed to like post');
        }
    };

    // Auto-fetch alumni if "specific" is selected
    useEffect(() => {
        if (announcement.targetRole === 'specific' && alumniList.length === 0) {
            fetchAlumniList();
        }
    }, [announcement.targetRole]);

    const handleUpdateRequestStatus = async (requestId, status, responseText) => {
        try {
            setIsUpdatingRequest(requestId);
            await profileService.updateRequestStatus(requestId, { status, response: responseText });
            toast.success(`Request ${status} successfully`);
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to update request');
        } finally {
            setIsUpdatingRequest(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="px-4 md:px-6 space-y-10 animate-fade-in mb-20 text-left">
            <section className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] px-4 md:px-8 mb-8">
                <ImageSlider />
            </section>

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl md:text-4xl font-bold text-[var(--primary)]">Hello, {user?.name}! 👋</h1>
                    <p className="text-sm md:text-base text-[var(--text-dark)] opacity-70 mt-1">Here's the AlumNexus overview for today.</p>
                </div>
                <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
                    {user.role === 'admin' ? (
                        <button onClick={handleExport} className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--background)] transition-smooth flex items-center justify-center gap-2 text-sm md:text-base">
                            <Download size={18} /> <span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span>
                        </button>
                    ) : (
                        <Link to="/directory" className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--background)] transition-smooth flex items-center justify-center gap-2 text-sm md:text-base">
                            <Users size={18} /> <span className="hidden sm:inline">My Network</span><span className="sm:hidden">Network</span>
                        </Link>
                    )}
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setShowSpotlightModal(true)}
                            className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:scale-105 transition-smooth flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <Star size={18} /> <span className="hidden sm:inline">Manage Spotlight</span><span className="sm:hidden">Spotlight</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Verification Warning for Alumni & Students */}
            {((user.role === 'alumni' || user.role === 'student') && !user.isVerified) && (
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6 animate-pulse-subtle">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-amber-800">Account Pending Verification</h3>
                        <p className="text-amber-700 opacity-80 mt-1">
                            Your {user.role} profile is currently being reviewed by our administrators.
                            You'll have full access to all platform features once approved.
                        </p>
                    </div>
                    <div className="px-6 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm border border-amber-200">
                        Status: Pending Approval
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.role === 'admin' ? (
                    <>
                        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} onClick={() => fetchModalUsers('student')} />
                        <StatCard label="Total Alumni" value={stats?.totalAlumni || 0} icon={ShieldCheck} onClick={() => fetchModalUsers('alumni')} />
                        <StatCard label="Pending Alumni" value={stats?.pendingAlumni || 0} icon={Clock} trend="Urgent" color="text-amber-600" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} />
                        <StatCard label="Pending Students" value={stats?.pendingStudents || 0} icon={Clock} trend="Urgent" color="text-amber-600" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} />
                        <StatCard label="Active Jobs" value={stats?.totalJobs || 0} icon={Briefcase} to="/jobs" />
                    </>
                ) : (
                    <>
                        <StatCard label="Alumni Network" value={stats?.alumniCount || '0'} icon={Users} to="/directory" />
                        <StatCard label="Student Members" value={stats?.studentCount || '0'} icon={GraduationCap} to={user.role === 'alumni' ? "/students" : "/dashboard"} />
                        <StatCard label="Active Jobs" value={stats?.activeJobs || 0} icon={Briefcase} to="/jobs" />
                        <StatCard label="Mentors Available" value={stats?.mentors || 0} icon={Star} to="/directory" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {user.role === 'admin' && pendingAlumni.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--text-dark)] flex items-center gap-2">
                                <Clock size={24} className="text-[var(--accent)]" /> Alumni Verification Requests
                            </h2>
                            <div className="space-y-3">
                                {pendingAlumni.map((alumni) => (
                                    <div key={alumni._id} className="glass-card p-5 border border-[var(--border)] flex justify-between items-center group hover:bg-[var(--surface)] transition-smooth">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[var(--accent)] rounded-xl premium-shadow overflow-hidden flex items-center justify-center font-bold text-white shrink-0">
                                                {alumni.profilePhoto && alumni.profilePhoto !== 'no-photo.jpg' ? (
                                                    <img src={alumni.profilePhoto} alt={alumni.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    alumni.user.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--text-dark)]">{alumni.user.name}</h4>
                                                <p className="text-sm text-[var(--text-light)] opacity-80">{alumni.branch} • Class of {alumni.batchYear}</p>
                                                <p className="text-xs text-[var(--primary-light)] font-medium">{alumni.company} - {alumni.designation}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerify(alumni._id, 'approved', 'alumni')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-smooth" title="Approve">
                                                <CheckCircle2 size={24} />
                                            </button>
                                            <button onClick={() => handleVerify(alumni._id, 'rejected', 'alumni')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-smooth" title="Reject">
                                                <XCircle size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {user.role === 'admin' && pendingStudents.length > 0 && (
                        <div className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-[var(--text-dark)] flex items-center gap-2">
                                <Clock size={24} className="text-[var(--accent)]" /> Student Verification Requests
                            </h2>
                            <div className="space-y-3">
                                {pendingStudents.map((student) => (
                                    <div key={student._id} className="glass-card p-5 border border-[var(--border)] flex justify-between items-center group hover:bg-[var(--surface)] transition-smooth">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[var(--primary)] rounded-xl premium-shadow overflow-hidden flex items-center justify-center font-bold text-white shrink-0">
                                                {student.profilePhoto && student.profilePhoto !== 'no-photo.jpg' ? (
                                                    <img src={student.profilePhoto} alt={student.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    student.user.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--text-dark)]">{student.user.name}</h4>
                                                <p className="text-sm text-[var(--text-light)] opacity-80">{student.branch} • Year {student.year}</p>
                                                <p className="text-xs text-[var(--primary-light)] font-medium">Student</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerify(student._id, 'approved', 'student')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-smooth" title="Approve">
                                                <CheckCircle2 size={24} />
                                            </button>
                                            <button onClick={() => handleVerify(student._id, 'rejected', 'student')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-smooth" title="Reject">
                                                <XCircle size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-2xl font-bold text-[var(--text-dark)]">
                                {user.role === 'admin' ? 'Recent Global Activity' : 'Recent Opportunities'}
                            </h2>
                            <Link to="/jobs" className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {(user.role === 'admin' ? recentJobs : recentJobs).map((job, i) => (
                                <Link to="/jobs" key={i} className="glass-card p-5 border border-[var(--border)] flex justify-between items-center group cursor-pointer hover:bg-[var(--primary)] transition-smooth block">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--accent)] rounded-xl flex items-center justify-center font-bold text-white group-hover:bg-[var(--primary)] transition-smooth">
                                            {job.company?.charAt(0) || 'J'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-dark)] transition-smooth">{job.role}</h4>
                                            <p className="text-sm text-[var(--text-light)] opacity-70 transition-smooth">{job.company} • {job.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-xs text-[var(--text-light)] flex items-center gap-1 transition-smooth"><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                        <span className="text-xs font-bold text-[var(--primary)] transition-smooth flex items-center gap-1">View Details <ArrowUpRight size={14} /></span>
                                    </div>
                                </Link>
                            ))}
                            {(user.role !== 'admin' && recentJobs.length === 0) && (
                                <div className="p-10 text-center glass-card text-gray-400">No recent opportunities found</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 pt-10">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-2xl font-bold text-[var(--text-dark)]">Recent Insights</h2>
                            <Link to="/blogs" className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {recentBlogs.map((blog) => (
                                <div key={blog._id} className="glass-card overflow-hidden premium-shadow group border border-[var(--border)] flex flex-col hover:-translate-y-2 transition-smooth">
                                    <div className="h-40 relative overflow-hidden bg-[var(--accent)] text-[var(--primary)]">
                                        {blog.coverImage ? (
                                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                                <ImageIcon size={48} />
                                                <span className="text-xs font-bold mt-2 uppercase tracking-widest">{blog.category}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[var(--primary)] text-[10px] rounded-full font-bold uppercase tracking-wider shadow-sm">
                                                {blog.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col text-left mb-2">
                                        <h3 className="text-lg font-bold group-hover:text-[var(--primary-light)] transition-smooth leading-snug min-h-[48px] line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs mt-3 line-clamp-3 leading-relaxed flex-1">
                                            {blog.content.substring(0, 100)}...
                                        </p>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-[var(--surface)] text-[var(--primary)] rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {blog.author?.name?.charAt(0) || 'A'}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-gray-800 leading-tight truncate max-w-[80px]">{blog.author?.name || 'Anonymous'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleLike(blog._id)} className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-smooth cursor-pointer">
                                                    <Heart size={14} className="text-red-500 hover:scale-110 transition-transform" fill={blog.likes.includes(user?._id) ? 'currentColor' : 'none'} />
                                                    <span className="text-[10px] font-bold text-gray-500">{blog.likes.length}</span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveBlogForComments(blog)}
                                                    className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-smooth text-[var(--primary)] cursor-pointer"
                                                >
                                                    <MessageSquare size={14} />
                                                    <span className="text-[10px] font-bold">{blog.comments?.length || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentBlogs.length === 0 && (
                                <div className="col-span-full p-10 text-center glass-card text-gray-400">No recent insights found</div>
                            )}
                        </div>
                    </div>

                    {/* Requests Section */}
                    {
                        user.role !== 'admin' && (
                            <div className="space-y-6 pt-10">
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[var(--surface)] text-[var(--primary)] rounded-lg">
                                            <Handshake size={24} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-[var(--primary)]">Mentorship & Referrals</h2>
                                    </div>
                                    <span className="bg-white/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--primary)] border">
                                        {requests.length} Total
                                    </span>
                                </div>

                                {requests.length === 0 ? (
                                    <div className="p-16 text-center bg-[var(--surface)] border-2 border-dashed border-[var(--border)] rounded-[32px] animate-fade-in">
                                        <div className="w-16 h-16 bg-[var(--background)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[var(--primary)]/40">
                                            <Clock size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-500 mb-2">No active requests</h3>
                                        <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                            {user.role === 'student'
                                                ? "Request mentorship or referral from our distinguished alumni to boost your career."
                                                : "Students who reach out to you for guidance or referrals will appear here."}
                                        </p>
                                        {user.role === 'student' && (
                                            <Link to="/directory" className="inline-block mt-6 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-light)] transition-smooth">
                                                Find Alumni
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {requests.map((req) => (
                                            <RequestCard
                                                key={req._id}
                                                request={req}
                                                role={user.role}
                                                isUpdating={isUpdatingRequest === req._id}
                                                onStatusUpdate={handleUpdateRequestStatus}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div >

                {/* Sidebar Widgets */}
                <div className="space-y-8 px-4 md:px-0" >
                    {/* Active Polls Widget */}
                    {
                        activeSurveys.length > 0 && (
                            <div className="glass-card p-6 border border-[var(--border)] space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <PieChart size={20} className="text-[var(--primary)]" /> Active Polls
                                </h3>
                                <div className="space-y-4">
                                    {activeSurveys.map(poll => (
                                        <div key={poll._id} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-3 relative group">
                                            {/* Admin Delete Button */}
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Delete this poll?')) {
                                                            try {
                                                                await surveyService.deleteSurvey(poll._id);
                                                                setActiveSurveys(activeSurveys.filter(s => s._id !== poll._id));
                                                                toast.success('Poll deleted');
                                                            } catch (e) { toast.error('Failed to delete poll'); }
                                                        }
                                                    }}
                                                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}

                                            <p className="font-bold text-gray-800 pr-6">{poll.question}</p>

                                            {poll.hasVoted ? (
                                                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                                    <CheckCircle2 size={16} /> Thanks for voting!
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {poll.options.map(opt => (
                                                        <button
                                                            key={opt._id}
                                                            onClick={() => handleVoteSurvey(poll._id, opt._id)}
                                                            className="w-full text-left px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-dark)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-smooth"
                                                        >
                                                            {opt.text}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin Results View */}
                                            {user?.role === 'admin' && poll.totalVotes !== undefined && (
                                                <div className="pt-2 border-t border-[var(--border)] mt-2">
                                                    <p className="text-xs text-gray-500 font-bold mb-2">Live Results ({poll.totalVotes} votes)</p>
                                                    <div className="space-y-1.5">
                                                        {poll.options.map(opt => {
                                                            const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                                                            return (
                                                                <div key={'res_' + opt._id} className="text-xs text-[var(--text-dark)] flex justify-between items-center bg-[var(--background)] px-2 py-1.5 rounded-lg border border-[var(--border)] relative overflow-hidden">
                                                                    <div className="absolute left-0 top-0 bottom-0 bg-[var(--primary)] opacity-10" style={{ width: `${pct}%` }}></div>
                                                                    <span className="relative z-10 w-2/3 truncate pr-2">{opt.text}</span>
                                                                    <span className="relative z-10 font-bold w-1/3 text-right">{opt.votes} ({pct}%)</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    <div className="glass-card p-6 border border-[var(--border)] space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Bell size={20} className="text-[var(--primary)]" /> Notifications
                        </h3>
                        <div className="space-y-4">
                            {notifications.slice(0, 5).map((note, i) => (
                                <div key={i} onClick={() => setSelectedNotification(note)} className="flex gap-4 p-3 hover:bg-[var(--background)] rounded-xl transition-smooth group cursor-pointer">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 transition-smooth ${!note.isRead ? 'bg-[var(--primary)] scale-125 shadow-[0_0_8px_var(--primary)]' : 'bg-gray-300'}`}></div>
                                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{note.message}</p>
                                </div>
                            ))}
                            {notifications.length === 0 && <p className="text-center text-sm text-gray-400">All clear!</p>}
                        </div>
                        <button
                            onClick={() => notificationService.markAsRead().then(fetchDashboardData)}
                            className="w-full py-3 bg-[var(--surface)] text-[var(--primary)] font-bold rounded-xl text-sm border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-smooth"
                        >
                            Mark all as read
                        </button>
                    </div>

                    {
                        user?.role === 'admin' && (
                            <div className="dark-card p-6 border border-[var(--border)] premium-shadow">
                                <h3 className="text-xl font-bold mb-4">Content Studio</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={() => setShowAnnouncementModal(true)} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-smooth text-left w-full">
                                        <Mail size={18} />
                                        <span className="text-sm font-bold">Post Announcement</span>
                                    </button>
                                    <button onClick={() => setShowEngagementModal(true)} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-smooth text-left w-full">
                                        <FileText size={18} />
                                        <span className="text-sm font-bold">Post Engagement Content</span>
                                    </button>
                                    <button onClick={() => setShowNewsletterModal(true)} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-smooth text-left w-full">
                                        <Newspaper size={18} />
                                        <span className="text-sm font-bold">Send Newsletter</span>
                                    </button>
                                    <button onClick={() => setShowEventModal(true)} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-smooth text-left w-full">
                                        <CalendarDays size={18} />
                                        <span className="text-sm font-bold">Event Invitation / Reminder</span>
                                    </button>
                                    <button onClick={() => setShowSurveyModal(true)} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-smooth text-left w-full">
                                        <BarChart2 size={18} />
                                        <span className="text-sm font-bold">Post Poll / Survey</span>
                                    </button>
                                </div>

                            </div>
                        )
                    }
                </div >
            </div >

            {/* Announcement Modal */}
            {
                showAnnouncementModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-[var(--primary)]">Post Announcement</h2>
                                <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <form onSubmit={handlePostAnnouncement} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Message</label>
                                    <textarea required rows="4" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none text-[var(--text-dark)]"
                                        placeholder="Write your announcement here..."
                                        value={announcement.message}
                                        onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'all', label: '🌐 All Users' },
                                            { value: 'alumni', label: '🎓 Alumni Only' },
                                            { value: 'student', label: '📚 Students Only' }
                                        ].map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setAnnouncement({ ...announcement, targetRole: value })}
                                                className={`p-3 rounded-xl border font-bold text-sm transition-smooth text-center
                                                ${announcement.targetRole === value
                                                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                                        : 'bg-[var(--background)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button disabled={isPosting} type="submit" className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isPosting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}>
                                    {isPosting ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                                    ) : (
                                        <><Mail size={20} /> Send Announcement</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Engagement Post Modal */}
            {
                showEngagementModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--primary)]">Post Engagement Content</h2>
                                    <p className="text-sm text-[var(--text-light)]/60 mt-1">Will appear on the community blog feed</p>
                                </div>
                                <button onClick={() => setShowEngagementModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <form onSubmit={handlePostEngagement} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter a catchy title..."
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                        value={engagementPost.title}
                                        onChange={(e) => setEngagementPost({ ...engagementPost, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Category</label>
                                        <select
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                            value={engagementPost.category}
                                            onChange={(e) => setEngagementPost({ ...engagementPost, category: e.target.value })}
                                        >
                                            {['General', 'Career', 'Tech', 'Events', 'Opportunities', 'Community'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Audience</label>
                                        <select
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                            value={engagementPost.targetRole}
                                            onChange={(e) => setEngagementPost({ ...engagementPost, targetRole: e.target.value })}
                                        >
                                            <option value="all">🌐 All Users</option>
                                            <option value="alumni">🎓 Alumni Only</option>
                                            <option value="student">📚 Students Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Content</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none font-medium text-[var(--text-dark)]"
                                        placeholder="Write your post content here..."
                                        value={engagementPost.content}
                                        onChange={(e) => setEngagementPost({ ...engagementPost, content: e.target.value })}
                                    />
                                </div>
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2"><ImageIcon size={14} /> Cover Image <span className="text-gray-400 font-normal">(optional)</span></label>
                                    {imagePreview ? (
                                        <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setEngagementImage(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80 transition-smooth"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-28 bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--accent)] transition-smooth group">
                                            <Upload size={22} className="text-gray-400 group-hover:text-[var(--primary)] mb-1 transition-smooth" />
                                            <span className="text-xs text-gray-400 group-hover:text-[var(--primary)] font-medium transition-smooth">Click to upload image</span>
                                            <span className="text-[11px] text-gray-400 opacity-50">JPG, PNG, WEBP — max 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setEngagementImage(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <button
                                    disabled={isPostingEngagement}
                                    type="submit"
                                    className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isPostingEngagement ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                                >
                                    {isPostingEngagement ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Publishing...</>
                                    ) : (
                                        <><FileText size={20} /> Publish Post</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Newsletter Modal */}
            {
                showNewsletterModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2"><Newspaper size={22} /> Send Newsletter</h2>
                                    <p className="text-sm text-[var(--text-light)]/60 mt-1">Delivered as an in-app notification</p>
                                </div>
                                <button onClick={() => setShowNewsletterModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendNewsletter} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Subject / Headline</label>
                                    <input required type="text" placeholder="e.g. Monthly Alumni Update — February 2026"
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                        value={newsletter.subject}
                                        onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Body</label>
                                    <textarea required rows="5" placeholder="Write the newsletter content here..."
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none font-medium text-[var(--text-dark)]"
                                        value={newsletter.body}
                                        onChange={(e) => setNewsletter({ ...newsletter, body: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ value: 'all', label: '🌐 All Users' }, { value: 'alumni', label: '🎓 Alumni Only' }, { value: 'student', label: '📚 Students Only' }].map(({ value, label }) => (
                                            <button key={value} type="button"
                                                onClick={() => setNewsletter({ ...newsletter, targetRole: value })}
                                                className={`p-3 rounded-xl border font-bold text-sm transition-smooth text-center ${newsletter.targetRole === value ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)]'}`}
                                            >{label}</button>
                                        ))}
                                    </div>
                                </div>
                                <button disabled={isSendingNewsletter} type="submit"
                                    className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isSendingNewsletter ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}>
                                    {isSendingNewsletter ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</> : <><Newspaper size={20} /> Send Newsletter</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Event Invitation / Reminder Modal */}
            {
                showEventModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2"><CalendarDays size={22} /> {eventData.isReminder ? 'Event Reminder' : 'Event Invitation'}</h2>
                                    <p className="text-sm text-[var(--text-light)]/60 mt-1">Sent as an in-app notification to selected audience</p>
                                </div>
                                <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendEvent} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                                {/* Invitation vs Reminder toggle */}
                                <div className="flex gap-3">
                                    {[{ val: false, label: '🎉 Invitation' }, { val: true, label: '🔔 Reminder' }].map(({ val, label }) => (
                                        <button key={String(val)} type="button"
                                            onClick={() => setEventData({ ...eventData, isReminder: val })}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-smooth ${eventData.isReminder === val ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)]'}`}
                                        >{label}</button>
                                    ))}
                                </div>
                                {/* Select from existing events */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Select Event</label>
                                    {isLoadingEvents ? (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl text-gray-400">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-[var(--primary)] rounded-full animate-spin"></div>
                                            Loading events...
                                        </div>
                                    ) : existingEvents.length === 0 ? (
                                        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                                            ⚠️ No events found. Create an event first from the Events page.
                                        </div>
                                    ) : (
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                            value={eventData.selectedEventId}
                                            onChange={(e) => setEventData({ ...eventData, selectedEventId: e.target.value })}
                                        >
                                            <option value="">-- Choose an event --</option>
                                            {existingEvents.map(ev => (
                                                <option key={ev._id} value={ev._id}>
                                                    {ev.title} — {new Date(ev.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                {/* Selected event preview card */}
                                {eventData.selectedEventId && (() => {
                                    const ev = existingEvents.find(e => e._id === eventData.selectedEventId);
                                    if (!ev) return null;
                                    return (
                                        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl space-y-2 text-sm">
                                            <p className="font-bold text-[var(--primary)] text-base">{ev.title}</p>
                                            {ev.description && <p className="text-gray-500 line-clamp-2">{ev.description}</p>}
                                            <div className="flex flex-wrap gap-3 text-gray-600">
                                                {ev.dateTime && <span>🕐 {new Date(ev.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                                                {ev.meetingType === 'online'
                                                    ? <span>💻 Online</span>
                                                    : ev.location && <span>📍 {ev.location}</span>}
                                                {ev.speakerName && <span>🎤 {ev.speakerName}</span>}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ value: 'all', label: '🌐 All Users' }, { value: 'alumni', label: '🎓 Alumni Only' }, { value: 'student', label: '📚 Students Only' }].map(({ value, label }) => (
                                            <button key={value} type="button"
                                                onClick={() => setEventData({ ...eventData, targetRole: value, specificUser: '' })}
                                                className={`p-3 rounded-xl border font-bold text-sm transition-smooth text-center ${eventData.targetRole === value ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)]'}`}
                                            >{label}</button>
                                        ))}
                                    </div>
                                </div>
                                {/* Individual Alumni Dropdown */}
                                {eventData.targetRole === 'alumni' && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-sm font-bold text-[var(--text-dark)]/80">Select Specific Alumni (Optional)</label>
                                        <select
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] text-sm font-medium text-[var(--text-dark)]"
                                            value={eventData.specificUser}
                                            onChange={(e) => setEventData({ ...eventData, specificUser: e.target.value })}
                                        >
                                            <option value="">All Alumni</option>
                                            {existingAlumni.map(alum => (
                                                <option key={alum.user._id} value={alum.user._id}>
                                                    {alum.user.name} ({alum.user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button disabled={isSendingEvent} type="submit"
                                    className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isSendingEvent ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}>
                                    {isSendingEvent ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</> : <><CalendarDays size={20} /> Send {eventData.isReminder ? 'Reminder' : 'Invitation'}</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Post Poll / Survey Modal */}
            {
                showSurveyModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2"><BarChart2 size={22} /> Post Poll / Survey</h2>
                                    <p className="text-sm text-[var(--text-light)]/60 mt-1">Users can vote on their dashboard</p>
                                </div>
                                <button onClick={() => setShowSurveyModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <form onSubmit={handlePostSurvey} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Question</label>
                                    <input required type="text" placeholder="e.g. What should be the theme for the next meetup?"
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-lg text-[var(--text-dark)]"
                                        value={surveyData.question}
                                        onChange={(e) => setSurveyData({ ...surveyData, question: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold flex justify-between items-center">
                                        <span>Options</span>
                                        {surveyData.options.length < 6 && (
                                            <button type="button"
                                                onClick={() => setSurveyData({ ...surveyData, options: [...surveyData.options, ''] })}
                                                className="text-xs text-[var(--primary)] font-bold hover:underline"
                                            >+ Add Option</button>
                                        )}
                                    </label>
                                    {surveyData.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-[var(--border)] pointer-events-none"></div>
                                            <input required type="text" placeholder={`Option ${idx + 1}`}
                                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none font-medium text-[var(--text-dark)]"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOps = [...surveyData.options];
                                                    newOps[idx] = e.target.value;
                                                    setSurveyData({ ...surveyData, options: newOps });
                                                }}
                                            />
                                            {surveyData.options.length > 2 && (
                                                <button type="button" onClick={() => {
                                                    const newOps = surveyData.options.filter((_, i) => i !== idx);
                                                    setSurveyData({ ...surveyData, options: newOps });
                                                }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-smooth"><X size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ value: 'all', label: '🌐 All Users' }, { value: 'alumni', label: '🎓 Alumni Only' }, { value: 'student', label: '📚 Students Only' }].map(({ value, label }) => (
                                            <button key={value} type="button"
                                                onClick={() => setSurveyData({ ...surveyData, targetRole: value })}
                                                className={`p-3 rounded-xl border font-bold text-sm transition-smooth text-center ${surveyData.targetRole === value ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-light)] border-[var(--border)] hover:border-[var(--primary)]'}`}
                                            >{label}</button>
                                        ))}
                                    </div>
                                </div>
                                <button disabled={isPostingSurvey} type="submit"
                                    className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isPostingSurvey ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}>
                                    {isPostingSurvey ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Publishing...</> : <><BarChart2 size={20} /> Publish Poll</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showUsersModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                                <h2 className="text-2xl font-bold text-[var(--primary)] capitalize">Total {modalRole}s</h2>
                                <button onClick={() => setShowUsersModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"><X size={24} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar bg-[var(--background)]/50">
                                {loadingUsers ? (
                                    <div className="flex justify-center flex-col items-center gap-4 py-16">
                                        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-gray-500 font-bold animate-pulse">Fetching users...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modalUsers.map(u => (
                                            <div key={u._id} className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center gap-4 hover:border-[var(--primary)] hover:shadow-lg transition-smooth group cursor-pointer">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] overflow-hidden font-bold text-white text-xl flex items-center justify-center group-hover:scale-110 transition-smooth shrink-0">
                                                    {u.profilePhoto && u.profilePhoto !== 'no-photo.jpg' ? (
                                                        <img src={u.profilePhoto} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[var(--primary)] truncate">{u.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateUserStatus(u._id, !u.isVerified, u.role);
                                                            }}
                                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-smooth ${u.isVerified ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                        >
                                                            {u.isVerified ? 'Revoke' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteUser(u._id, u.name);
                                                            }}
                                                            className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-smooth"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {modalUsers.length === 0 && (
                                            <div className="col-span-full py-16 text-center text-gray-400">
                                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                                <p className="font-bold">No {modalRole}s found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <CommentModal
                blog={activeBlogForComments}
                isOpen={!!activeBlogForComments}
                onClose={() => setActiveBlogForComments(null)}
                onCommentAdded={async (blogId, text) => {
                    const res = await blogService.addComment(blogId, text);
                    toast.success('Comment added!');
                    setActiveBlogForComments(res.data.data);
                    await fetchDashboardData();
                }}
                onCommentDeleted={async (blogId, commentId) => {
                    const res = await blogService.deleteComment(blogId, commentId);
                    toast.success('Comment deleted!');
                    setActiveBlogForComments(res.data.data);
                    await fetchDashboardData();
                }}
            />
            <NotificationModal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                notification={selectedNotification}
            />

            {/* Spotlight Modal */}
            {
                showSpotlightModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
                        <div className="bg-[var(--surface)] rounded-[32px] max-w-2xl w-full premium-shadow relative my-8 flex flex-col max-h-[90vh] overflow-hidden">
                            <button onClick={() => setShowSpotlightModal(false)} className="absolute top-6 right-6 p-2 hover:bg-[var(--background)] rounded-full transition-smooth z-10">
                                <X size={24} className="text-[var(--text-light)]/60" />
                            </button>

                            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                                <div className="text-center space-y-4 mb-8">
                                    <div className="w-16 h-16 bg-[var(--background)] text-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto border border-[var(--border)]">
                                        <Star size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-[var(--primary)]">Manage Spotlight Story</h2>
                                    <p className="text-[var(--text-light)]/70 font-medium">This story will be featured prominently on the landing page.</p>
                                </div>

                                <form onSubmit={handleUpdateSpotlight} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Featured Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={spotlightData.title}
                                                onChange={(e) => setSpotlightData({ ...spotlightData, title: e.target.value })}
                                                placeholder="e.g. From Campus Lead to CTO"
                                                className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] rounded-2xl outline-none transition-smooth font-medium text-[var(--text-dark)] placeholder:text-[var(--text-light)]/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Author Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={spotlightData.authorName}
                                                onChange={(e) => setSpotlightData({ ...spotlightData, authorName: e.target.value })}
                                                placeholder="e.g. Sarah Johnson"
                                                className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] rounded-2xl outline-none transition-smooth font-medium text-[var(--text-dark)] placeholder:text-[var(--text-light)]/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Author Role/Subtitle</label>
                                        <input
                                            type="text"
                                            required
                                            value={spotlightData.authorRole}
                                            onChange={(e) => setSpotlightData({ ...spotlightData, authorRole: e.target.value })}
                                            placeholder="e.g. CTO at TechFlow, Class of 2018"
                                            className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] rounded-2xl outline-none transition-smooth font-medium text-[var(--text-dark)] placeholder:text-[var(--text-light)]/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Impactful Quote</label>
                                        <textarea
                                            required
                                            value={spotlightData.quote}
                                            onChange={(e) => setSpotlightData({ ...spotlightData, quote: e.target.value })}
                                            placeholder="A powerful one-liner..."
                                            className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] rounded-2xl outline-none transition-smooth font-medium text-[var(--text-dark)] placeholder:text-[var(--text-light)]/30"
                                            rows="2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Brief Description</label>
                                        <textarea
                                            required
                                            value={spotlightData.description}
                                            onChange={(e) => setSpotlightData({ ...spotlightData, description: e.target.value })}
                                            placeholder="Elaborate on their journey..."
                                            className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] rounded-2xl outline-none transition-smooth font-medium text-[var(--text-dark)] placeholder:text-[var(--text-light)]/30"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-dark)]/80 ml-1">Cover Image</label>
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-2xl bg-[var(--background)] border-2 border-dashed border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
                                                {spotlightPreview ? (
                                                    <img src={spotlightPreview} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <ImageIcon className="text-[var(--text-light)]/30" size={32} />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="spotlight-image"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setSpotlightImage(file);
                                                            setSpotlightPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor="spotlight-image" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--background)] text-[var(--primary)] border border-[var(--border)] rounded-xl font-bold cursor-pointer hover:bg-[var(--accent)] transition-smooth text-sm">
                                                    <Upload size={18} /> Upload Story Image
                                                </label>
                                                <p className="text-[10px] text-[var(--text-light)]/40 font-medium">Recommended: High resolution. Max 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={isUpdatingSpotlight}
                                        className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-smooth disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
                                    >
                                        {isUpdatingSpotlight ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Update Landing Page Spotlight
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const StatCard = ({ label, value, icon: Icon, trend, color, to, onClick }) => {
    const Component = to ? Link : (onClick ? 'button' : 'div');
    return (
        <Component to={to} onClick={onClick} className={`text-left w-full bg-[var(--surface)] p-4 md:p-6 border border-[var(--border)] rounded-2xl premium-shadow group hover:bg-[var(--primary)] transition-smooth ${to || onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 md:p-3 bg-[var(--background)] text-[var(--primary)] rounded-xl group-hover:bg-white group-hover:text-[var(--primary)] transition-smooth">
                    <Icon size={20} className="md:w-6 md:h-6" />
                </div>
                {trend && <span className={`text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full ${color || 'text-amber-400 bg-amber-500/10 border border-amber-500/20'} group-hover:bg-white/20 group-hover:text-white transition-smooth`}>{trend}</span>}
            </div>
            <h3 className="text-xl md:text-3xl font-bold text-[var(--text-dark)] group-hover:text-white transition-smooth">{value}</h3>
            <p className="text-[var(--text-light)] text-xs md:text-sm font-medium opacity-60 group-hover:text-white/80 transition-smooth">{label}</p>
        </Component>
    );
};

const RequestCard = ({ request, onStatusUpdate, isUpdating, role }) => {
    const isSent = role === 'student';
    const otherUser = isSent ? request.receiver : request.sender;
    const [response, setResponse] = useState('');
    const [tempStatus, setTempStatus] = useState(request.status);
    const [showResponseInput, setShowResponseInput] = useState(false);

    useEffect(() => {
        if (showResponseInput) {
            setResponse(request.response || '');
            setTempStatus(request.status);
        }
    }, [showResponseInput, request.response, request.status]);

    const typeIcons = {
        mentorship: MessageCircle,
        'resume-review': FileText,
        referral: UserCheck
    };

    const StatusIcon = typeIcons[request.type] || MessageCircle;

    const statusColors = {
        pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        accepted: 'text-green-400 bg-green-500/10 border-green-500/20',
        rejected: 'text-red-400 bg-red-500/10 border-red-500/20'
    };

    return (
        <div className="bg-[var(--surface)] p-6 border border-[var(--border)] rounded-3xl premium-shadow hover:scale-[1.01] transition-smooth group animate-fade-in text-left">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-[var(--surface)] text-[var(--primary)] rounded-xl group-hover:bg-white transition-smooth">
                        <StatusIcon size={24} />
                    </div>
                    <div className="overflow-hidden text-left">
                        <h4 className="font-bold text-[var(--primary)] capitalize truncate">{request.type.replace('-', ' ')}</h4>
                        <p className="text-xs text-[var(--text-dark)] opacity-60 font-medium truncate">
                            {isSent ? 'To' : 'From'}: <span className="text-[var(--primary)] font-bold">{otherUser?.name || 'Unknown'}</span>
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider shrink-0 ${statusColors[request.status]}`}>
                    {request.status}
                </span>
            </div>

            <div className="mb-4 p-4 bg-[var(--background)] rounded-xl">
                <p className="text-sm italic text-[var(--text-light)]">"{request.message}"</p>
            </div>

            {request.response && (
                <div className="mb-4 p-4 bg-[var(--accent)]/30 rounded-xl border border-[var(--border)] relative group/resp">
                    <p className="text-[10px] font-bold text-[var(--primary)] uppercase mb-1">Response:</p>
                    {!showResponseInput ? (
                        <>
                            <p className="text-sm text-[var(--text-dark)]">{request.response}</p>
                            {!isSent && (
                                <button
                                    onClick={() => setShowResponseInput(true)}
                                    className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 opacity-0 group-hover/resp:opacity-100 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-smooth"
                                    title="Edit Response"
                                >
                                    <MessageSquare size={14} />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-3 pt-2">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTempStatus('accepted')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-smooth ${tempStatus === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                                >
                                    Accept
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTempStatus('rejected')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-smooth ${tempStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                                >
                                    Reject
                                </button>
                            </div>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Update your response..."
                                className="w-full p-3 text-sm border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-dark)]"
                                rows="2"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    disabled={isUpdating}
                                    onClick={() => {
                                        onStatusUpdate(request._id, tempStatus, response);
                                        setShowResponseInput(false);
                                    }}
                                    className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Update
                                </button>
                                <button
                                    onClick={() => setShowResponseInput(false)}
                                    className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-smooth"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isSent && request.status === 'pending' && !showResponseInput && (
                <div className="space-y-4">
                    <button
                        onClick={() => setShowResponseInput(true)}
                        className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--primary-light)] transition-smooth"
                    >
                        Review & Respond
                    </button>
                </div>
            )}

            {!isSent && request.status === 'pending' && showResponseInput && !request.response && (
                <div className="space-y-4 animate-fade-in text-left">
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Add a short response (optional)..."
                        className="w-full p-3 text-sm border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-dark)]"
                        rows="2"
                    />
                    <div className="flex gap-2">
                        <button
                            disabled={isUpdating}
                            onClick={() => onStatusUpdate(request._id, 'accepted', response)}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Accept
                        </button>
                        <button
                            disabled={isUpdating}
                            onClick={() => onStatusUpdate(request._id, 'rejected', response)}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Reject
                        </button>
                        <button
                            onClick={() => setShowResponseInput(false)}
                            className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-smooth"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-[var(--text-light)]/60 font-medium text-right mt-4">
                Requested on {new Date(request.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
};

export default Dashboard;
