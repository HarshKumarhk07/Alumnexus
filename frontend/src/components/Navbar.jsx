import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Menu, X, Settings, ChevronDown } from 'lucide-react';
import { notificationService } from '../services/api.service';
import SettingsModal from './SettingsModal';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    const [notifications, setNotifications] = React.useState([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [userProfilePhoto, setUserProfilePhoto] = React.useState(null);

    React.useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    React.useEffect(() => {
        const fetchProfilePhoto = async () => {
            if (!user) return;
            try {
                // Reusing the same service we use for Settings
                const profileServiceStr = await import('../services/api.service');
                const profileService = profileServiceStr.profileService;

                let res;
                if (user.role === 'alumni') {
                    res = await profileService.getMeAlumniProfile();
                } else if (user.role === 'student') {
                    res = await profileService.getMeStudentProfile();
                }

                if (res?.data?.data && res.data.data.profilePhoto && res.data.data.profilePhoto !== 'no-photo.jpg') {
                    setUserProfilePhoto(res.data.data.profilePhoto);
                }
            } catch (err) {
                console.error('Failed to fetch profile photo', err);
            }
        };
        fetchProfilePhoto();
    }, [user, isSettingsOpen]); // Refetch if settings closed in case it was updated

    const handleMarkAsRead = async () => {
        try {
            await notificationService.markAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setShowNotifications(false);
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <nav className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 sticky top-0 z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link to="/" className="text-xl md:text-2xl font-bold text-[var(--primary)] uppercase tracking-wider">
                        AlumNexus
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 font-medium">
                    {user && !isAuthPage && (
                        <>
                            <Link to="/dashboard" className="hover:text-[var(--primary)] transition-smooth">Dashboard</Link>
                            <Link to="/directory" className="hover:text-[var(--primary)] transition-smooth">Alumni</Link>
                            <Link to="/jobs" className="hover:text-[var(--primary)] transition-smooth">Jobs</Link>
                            <Link to="/blogs" className="hover:text-[var(--primary)] transition-smooth">Blogs</Link>
                            <Link to="/events" className="hover:text-[var(--primary)] transition-smooth">Events</Link>
                            <Link to="/gallery" className="hover:text-[var(--primary)] transition-smooth">Gallery</Link>
                            <Link to="/queries" className="hover:text-[var(--primary)] transition-smooth">Queries</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {user && !isAuthPage ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 hover:bg-[var(--accent)] rounded-full transition-smooth relative"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--surface)]"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white border border-[var(--border)] rounded-2xl premium-shadow z-[60] overflow-hidden">
                                        <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                                            <h3 className="font-bold text-[var(--primary)]">Notifications</h3>
                                            <button onClick={handleMarkAsRead} className="text-xs font-bold text-[var(--primary)] hover:underline">
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                                            ) : (
                                                notifications.map((n, i) => (
                                                    <div key={i} className={`p-4 border-b border-gray-100 last:border-0 hover:bg-[var(--background)] transition-smooth cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                                                        <p className="text-sm text-gray-800">{n.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                                                            {new Date(n.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Dropdown */}
                            <div className="relative flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-[var(--border)]">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-2 hover:bg-[var(--background)] p-2 rounded-xl transition-smooth"
                                >
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-bold text-[var(--primary)] leading-none">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">{user.role}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0">
                                        {userProfilePhoto ? (
                                            <img src={userProfilePhoto} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[var(--border)] rounded-2xl premium-shadow z-[60] overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 bg-gray-50 lg:hidden">
                                            <p className="text-sm font-bold text-[var(--primary)]">{user.name}</p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    setIsSettingsOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 text-sm font-bold text-gray-600 hover:text-[var(--primary)] hover:bg-[var(--background)] rounded-xl transition-smooth"
                                            >
                                                <Settings size={18} /> Settings
                                            </button>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-smooth"
                                            >
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-2 md:gap-4">
                            <Link to="/login" className="px-3 md:px-4 py-2 hover:text-[var(--primary)] transition-smooth font-medium text-sm md:text-base">Login</Link>
                            <Link to="/register" className="px-4 md:px-6 py-2 bg-[var(--primary)] text-[var(--text-light)] rounded-xl premium-shadow hover:scale-105 transition-smooth font-bold text-sm md:text-base">
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[var(--surface)] border-b border-[var(--border)] premium-shadow animate-fade-in py-6 px-6 space-y-4">
                    {user ? (
                        <div className="flex flex-col gap-4">
                            <div className="pb-4 border-b border-[var(--border)] lg:hidden">
                                <p className="font-bold text-[var(--primary)]">{user.name}</p>
                                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                            </div>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Dashboard</Link>
                            <Link to="/directory" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Alumni</Link>
                            <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Jobs</Link>
                            <Link to="/blogs" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Blogs</Link>
                            <Link to="/events" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Events</Link>
                            <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Gallery</Link>
                            <Link to="/queries" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-[var(--primary)] transition-smooth">Queries</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center font-bold text-[var(--primary)] border border-[var(--primary)] rounded-xl">Login</Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center font-bold bg-[var(--primary)] text-white rounded-xl">Join Now</Link>
                        </div>
                    )}
                </div>
            )}

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </nav>
    );
};

export default Navbar;
