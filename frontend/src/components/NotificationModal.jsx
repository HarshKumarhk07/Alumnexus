import React from 'react';
import { X, Bell } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, notification }) => {
    if (!isOpen || !notification) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-[32px] w-full max-w-xl premium-shadow overflow-hidden flex flex-col relative z-10 animate-scale-in max-h-[85vh]">
                <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
                            <Bell size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--primary)]">Notification</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--accent)] text-[var(--primary)] rounded-xl transition-smooth"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {notification.message}
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                            {new Date(notification.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                        </span>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border)] bg-gray-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-smooth"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
