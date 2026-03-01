import React, { useState, useEffect } from 'react';
import { eventService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, Clock, MapPin, Video, Users,
    Plus, X, Bell, ExternalLink, Filter, Search, Trash2, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '', speakerName: '', dateTime: '', endTime: '', meetingType: 'online', meetingLink: '', location: '', description: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await eventService.getEvents();
            setEvents(res.data.data);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            setIsPublishing(true);
            if (isEditing) {
                await eventService.updateEvent(isEditing, newEvent);
                toast.success('Event updated successfully!');
            } else {
                await eventService.createEvent(newEvent);
                setShowSuccessModal(true);
            }
            setShowModal(false);
            setIsEditing(null);
            setNewEvent({ title: '', speakerName: '', dateTime: '', endTime: '', meetingType: 'online', meetingLink: '', location: '', description: '' });
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || (isEditing ? 'Failed to update event' : 'Failed to schedule event'));
        } finally {
            setIsPublishing(false);
        }
    };

    const handleRegister = async (id) => {
        try {
            await eventService.registerForEvent(id);
            toast.success('Registered successfully!');
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await eventService.deleteEvent(id);
                toast.success('Event deleted successfully');
                // Remove the deleted event from the local state immediately
                setEvents(events.filter(event => event._id !== id));
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete event');
            }
        }
    };

    const handleEditClick = (event) => {
        // Format dates for html datetime-local inputs (YYYY-MM-DDThh:mm)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const d = new Date(dateString);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setNewEvent({
            title: event.title,
            speakerName: event.speakerName || '',
            dateTime: formatDateForInput(event.dateTime),
            endTime: formatDateForInput(event.endTime),
            meetingType: event.meetingType || 'online',
            meetingLink: event.meetingLink || '',
            location: event.location || '',
            description: event.description || ''
        });
        setIsEditing(event._id);
        setShowModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                <div>
                    <h1 className="text-5xl font-extrabold text-[var(--text-dark)] tracking-tight">Community Events</h1>
                    <p className="text-[var(--text-light)] mt-4 text-lg max-w-xl opacity-80">
                        Live webinars, technical workshops, and alumni meetups to accelerate your professional growth.
                    </p>
                </div>
                {(user.role === 'admin' || (user.role === 'alumni' && user.isVerified)) && (
                    <button
                        onClick={() => {
                            setIsEditing(null);
                            setNewEvent({ title: '', speakerName: user.role === 'alumni' ? user.name : '', dateTime: '', endTime: '', meetingType: 'online', meetingLink: '', location: '', description: '' });
                            setShowModal(true);
                        }}
                        className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold premium-shadow hover:scale-105 transition-smooth flex items-center gap-2"
                    >
                        <Plus size={20} /> Schedule Event
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search events by title, speaker, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth premium-shadow text-[var(--text-dark)]"
                    />
                </div>
            </div>

            {/* Event Timeline */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-48 glass-card animate-pulse border border-[var(--border)]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
                    {events.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass-card border border-[var(--border)] bg-[var(--surface)]">
                            <Calendar size={64} className="mx-auto text-[var(--primary)] opacity-40 mb-4" />
                            <p className="text-[var(--text-light)] font-medium text-lg opacity-60">No upcoming events scheduled yet.</p>
                        </div>
                    ) : (
                        events.filter(e =>
                            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (e.speakerName && e.speakerName.toLowerCase().includes(searchTerm.toLowerCase()))
                        ).map((event) => {
                            const startDate = new Date(event.dateTime);
                            const endDate = event.endTime ? new Date(event.endTime) : null;
                            const now = new Date();
                            const isPast = endDate ? (endDate < now) : (startDate < now && (now - startDate) > 60 * 60 * 1000);
                            const isOngoing = !isPast && (now >= startDate && (endDate ? now <= endDate : (now - startDate) <= 60 * 60 * 1000));

                            const formatTime = (dateObj) => dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const durationString = endDate
                                ? `${formatTime(startDate)} - ${formatTime(endDate)}`
                                : formatTime(startDate);

                            return (
                                <div key={event._id} className={`glass-card p-3 md:p-8 border border-[var(--border)] flex flex-col gap-3 md:gap-8 hover:bg-[var(--primary)]/5 transition-smooth group relative overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
                                    {/* Admin/Author Action Buttons */}
                                    {(user?.role === 'admin' || (event.speaker?._id || event.speaker) === (user?._id || user?.id)) && (
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-smooth z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(event);
                                                }}
                                                className="p-1.5 md:p-2 bg-blue-50 text-blue-500 rounded-lg transition-smooth hover:bg-blue-100 shadow-sm"
                                            >
                                                <Pencil size={14} className="md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEvent(event._id);
                                                }}
                                                className="p-1.5 md:p-2 bg-red-50 text-red-500 rounded-lg transition-smooth hover:bg-red-100 shadow-sm"
                                            >
                                                <Trash2 size={14} className="md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                        {/* Date Badge */}
                                        <div className={`flex flex-col items-center justify-center w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border border-[var(--border)] shadow-sm shrink-0 transition-smooth ${isPast ? 'bg-[var(--background)] opacity-50' : 'bg-[var(--surface)]'}`}>
                                            <span className={`font-extrabold text-lg md:text-3xl ${isPast ? 'text-gray-400' : 'text-[var(--primary)]'}`}>{startDate.getDate()}</span>
                                            <span className={`text-[var(--text-light)] opacity-60 text-[8px] md:text-xs font-bold uppercase tracking-widest ${isPast ? 'text-gray-400' : ''}`}>
                                                {startDate.toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex-1 space-y-2 md:space-y-4 text-left">
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-wider ${isPast ? 'bg-gray-100 text-gray-400' : (isOngoing ? 'bg-amber-100/10 text-amber-600 border border-amber-500/20 flex items-center gap-1' : 'bg-[var(--primary)] text-white')}`}>
                                                    {isOngoing && <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-amber-500 rounded-full animate-ping"></div>}
                                                    {isPast ? 'Past' : (isOngoing ? 'Live' : 'Upcoming')}
                                                </span>
                                                <span className="flex items-center gap-1 text-[8px] md:text-xs font-bold text-[var(--text-dark)] opacity-70 bg-[var(--background)] px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-[var(--border)] shadow-sm">
                                                    <Clock size={10} className="md:w-3.5 md:h-3.5 text-[var(--primary)]" />
                                                    <span className="truncate">{durationString}</span>
                                                </span>
                                            </div>

                                            <h2 className={`text-sm md:text-3xl font-bold transition-smooth line-clamp-2 ${isPast ? 'text-[var(--text-dark)] opacity-40' : 'text-[var(--text-dark)] group-hover:text-[var(--primary)]'}`}>
                                                {event.title}
                                            </h2>

                                            <div className="flex flex-col gap-2 md:gap-4 text-[10px] md:text-sm text-[var(--text-light)] font-medium">
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[var(--background)] rounded-full flex items-center justify-center border border-[var(--border)] shrink-0">
                                                        <Users size={12} className="md:w-4 md:h-4" />
                                                    </div>
                                                    <span className="truncate">{event.speakerName || 'Guest Speaker'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[var(--background)] rounded-full flex items-center justify-center border border-[var(--border)] shrink-0">
                                                        {event.meetingType === 'online' ? <Video size={12} className="md:w-4 md:h-4" /> : <MapPin size={12} className="md:w-4 md:h-4" />}
                                                    </div>
                                                    <span className="truncate">{event.meetingType === 'online' ? (event.meetingLink ? 'Webinar' : 'Online') : event.location || 'Physical'}</span>
                                                </div>
                                            </div>

                                            <p className="hidden md:block text-[var(--text-light)] opacity-80 max-w-2xl leading-relaxed line-clamp-2">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-auto">
                                        {isPast ? (
                                            <div className="w-full py-2 md:py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-center text-xs md:text-base cursor-not-allowed">
                                                Over
                                            </div>
                                        ) : (
                                            <>
                                                {user?.role === 'student' && (
                                                    <button
                                                        onClick={() => handleRegister(event._id)}
                                                        disabled={event.registeredStudents.some(id => id === user?._id || id === user?.id)}
                                                        className={`w-full py-2 md:py-4 rounded-xl font-bold transition-smooth text-xs md:text-base ${event.registeredStudents.some(id => id === user?._id || id === user?.id)
                                                            ? 'bg-gray-100 text-gray-400 cursor-default'
                                                            : 'bg-[var(--primary)] text-white premium-shadow hover:bg-[var(--primary-light)]'
                                                            }`}
                                                    >
                                                        {event.registeredStudents.some(id => id === user?._id || id === user?.id) ? 'Registered ✓' : 'Register Now'}
                                                    </button>
                                                )}
                                                {event.meetingType === 'online' && event.meetingLink && (
                                                    <a
                                                        href={event.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-2 md:py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-bold hover:bg-[var(--surface)] transition-smooth text-center flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-base"
                                                    >
                                                        Join <ExternalLink size={14} className="md:w-[18px] md:h-[18px]" />
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">{isEditing ? 'Edit Community Event' : 'Schedule Community Event'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Event Title</label>
                                <input required className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Speaker Name</label>
                                <input required className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                    value={newEvent.speakerName}
                                    onChange={(e) => setNewEvent({ ...newEvent, speakerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Meeting Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newEvent.meetingType}
                                    onChange={(e) => setNewEvent({ ...newEvent, meetingType: e.target.value })}
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Start Date & Time</label>
                                <input required type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newEvent.dateTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, dateTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">End Date & Time</label>
                                <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newEvent.endTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                />
                            </div>
                            {newEvent.meetingType === 'online' ? (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold">Meeting Link (Zoom/Google Meet)</label>
                                    <input required className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                        value={newEvent.meetingLink}
                                        onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold">Location / Venue</label>
                                    <input required className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none text-[var(--text-dark)]"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Short Description</label>
                                <textarea rows="3" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none resize-none text-[var(--text-dark)]"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={isPublishing}
                                    className={`w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow transition-smooth flex items-center justify-center gap-2 ${isPublishing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                                >
                                    {isPublishing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        isEditing ? 'Save Changes' : 'Publish Event'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-sm premium-shadow p-10 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">Event Posted!</h2>
                        <p className="text-[var(--text-light)] mb-8 font-medium">Your community event has been published and notifications were sent.</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold premium-shadow hover:bg-[var(--primary-light)] transition-smooth"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
