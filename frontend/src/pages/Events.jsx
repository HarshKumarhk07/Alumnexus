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
                    <h1 className="text-5xl font-extrabold text-[var(--primary)] tracking-tight">Community Events</h1>
                    <p className="text-gray-600 mt-4 text-lg max-w-xl">
                        Live webinars, technical workshops, and alumni meetups to accelerate your professional growth.
                    </p>
                </div>
                {user.role === 'admin' && (
                    <button
                        onClick={() => {
                            setIsEditing(null);
                            setNewEvent({ title: '', speakerName: '', dateTime: '', endTime: '', meetingType: 'online', meetingLink: '', location: '', description: '' });
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
                        className="w-full pl-12 pr-6 py-4 bg-white border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth premium-shadow"
                    />
                </div>
            </div>

            {/* Event Timeline */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-48 glass-card animate-pulse border border-[var(--border)]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {events.length === 0 ? (
                        <div className="py-20 text-center glass-card border border-[var(--border)]">
                            <Calendar size={64} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium text-lg">No upcoming events scheduled yet.</p>
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
                            const isPast = endDate ? (endDate < now) : (startDate < now && (now - startDate) > 60 * 60 * 1000); // assume 1hr duration if no end time
                            const isOngoing = !isPast && (now >= startDate && (endDate ? now <= endDate : (now - startDate) <= 60 * 60 * 1000));

                            // Formatting helpers
                            const formatTime = (dateObj) => dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const durationString = endDate
                                ? `${formatTime(startDate)} - ${formatTime(endDate)}`
                                : formatTime(startDate);

                            return (
                                <div key={event._id} className={`glass-card p-8 border border-[var(--border)] flex flex-col md:flex-row gap-8 hover:bg-[var(--surface)] transition-smooth group relative overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
                                    {/* Admin Action Buttons */}
                                    {user?.role === 'admin' && (
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(event);
                                                }}
                                                className="p-2 bg-blue-50 text-blue-500 rounded-lg transition-smooth hover:bg-blue-100 shadow-sm"
                                                title="Edit Event"
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEvent(event._id);
                                                }}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg transition-smooth hover:bg-red-100 shadow-sm"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Date Badge */}
                                    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl border border-[var(--border)] shadow-sm shrink-0 transition-smooth ${isPast ? 'bg-gray-100' : 'bg-white'}`}>
                                        <span className={`font-extrabold text-3xl ${isPast ? 'text-gray-500' : 'text-[var(--primary)]'}`}>{startDate.getDate()}</span>
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            {startDate.toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-4 text-left">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${isPast ? 'bg-slate-100 text-slate-500' : (isOngoing ? 'bg-amber-100 text-amber-600 flex items-center gap-1.5' : 'bg-green-100 text-green-700')}`}>
                                                {isOngoing && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>}
                                                {isPast ? 'Past Event' : (isOngoing ? 'Ongoing' : 'Upcoming')}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                                <Clock size={14} className={isPast ? 'text-gray-400' : 'text-[var(--primary)]'} />
                                                {durationString}
                                            </span>
                                        </div>

                                        <h2 className={`text-3xl font-bold transition-smooth ${isPast ? 'text-gray-600' : 'text-[var(--primary)] group-hover:text-[var(--primary-light)]'}`}>
                                            {event.title}
                                        </h2>

                                        <div className="flex flex-wrap gap-6 text-sm text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[var(--border)]">
                                                    <Users size={16} />
                                                </div>
                                                {event.speakerName || 'Guest Speaker'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[var(--border)]">
                                                    {event.meetingType === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                                                </div>
                                                {event.meetingType === 'online' ? (event.meetingLink ? 'Live Webinar' : 'Online Event') : event.location || 'Physical Meetup'}
                                            </div>
                                        </div>

                                        <p className="text-gray-500 max-w-2xl leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col justify-end gap-3 min-w-[180px]">
                                        {isPast ? (
                                            <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-center border-2 border-transparent cursor-not-allowed">
                                                Event is Over
                                            </div>
                                        ) : (
                                            <>
                                                {user?.role === 'student' && (
                                                    <button
                                                        onClick={() => handleRegister(event._id)}
                                                        disabled={event.registeredStudents.some(id => id === user?._id || id === user?.id)}
                                                        className={`w-full py-4 rounded-xl font-bold transition-smooth ${event.registeredStudents.some(id => id === user?._id || id === user?.id)
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
                                                        className="w-full py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-bold hover:bg-[var(--surface)] transition-smooth text-center flex items-center justify-center gap-2"
                                                    >
                                                        Join Meeting <ExternalLink size={18} />
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
                    <div className="bg-white rounded-[32px] w-full max-w-2xl premium-shadow overflow-hidden text-left animate-scale-in">
                        <div className="p-8 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">{isEditing ? 'Edit Community Event' : 'Schedule Community Event'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-smooth">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Event Title</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Speaker Name</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
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
                                    <input required className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                        value={newEvent.meetingLink}
                                        onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold">Location / Venue</label>
                                    <input required className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Short Description</label>
                                <textarea rows="3" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:outline-none resize-none"
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
                    <div className="bg-white rounded-[32px] w-full max-w-sm premium-shadow p-10 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">Event Posted!</h2>
                        <p className="text-gray-500 mb-8 font-medium">Your community event has been published and notifications were sent.</p>
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
