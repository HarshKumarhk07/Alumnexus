import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { adminService } from '../services/api.service';
import toast from 'react-hot-toast';

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        branch: 'Computer Science',
        year: '1',
        careerInterest: ''
    });

    const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Others'];
    const years = ['1', '2', '3', '4'];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminService.addStudent(formData);
            toast.success('Student added successfully');
            onSuccess();
            onClose();
            setFormData({
                name: '',
                email: '',
                password: '',
                branch: 'Computer Science',
                year: '1',
                careerInterest: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <div className="bg-[var(--surface)] rounded-[32px] w-full max-w-lg flex flex-col premium-shadow overflow-hidden text-left animate-scale-in">
                <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2">
                        <UserPlus size={24} /> Add New Student
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-smooth">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                        <input
                            required
                            type="password"
                            minLength="6"
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Branch</label>
                            <select
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            >
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Year</label>
                            <select
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Career Interest</label>
                        <input
                            type="text"
                            placeholder="e.g. Web Development, AI, Cloud"
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-smooth font-bold"
                            value={formData.careerInterest}
                            onChange={(e) => setFormData({ ...formData, careerInterest: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-smooth disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                        {loading ? 'Adding Student...' : 'Add Student'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
