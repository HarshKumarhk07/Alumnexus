import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});

// API Services

// Add a request interceptor to include JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Option to force reload or redirect, but usually the UI handles the missing token
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        const response = await API.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    register: async (userData) => {
        const response = await API.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getMe: () => API.get('/auth/me'),
    updateProfile: (data) => API.put('/auth/profile'),
    updatePassword: (data) => API.put('/auth/password', data)
};

export const profileService = {
    getAlumni: () => API.get('/profiles/alumni'),
    getStudent: (id) => API.get(`/profiles/student/${id}`),
    upsertAlumni: (data) => API.post('/profiles/alumni', data),
    getMeAlumniProfile: () => API.get('/profiles/alumni/me'),
    getMeStudentProfile: () => API.get('/profiles/student/me'),
    upsertStudentProfile: (data) => API.post('/profiles/student', data),
    uploadStudentPhoto: (data) => API.post('/profiles/student/photo', data)
};

export const jobService = {
    getJobs: () => API.get('/jobs'),
    getMyJobs: () => API.get('/jobs/my-jobs'),
    getJob: (id) => API.get(`/jobs/${id}`),
    createJob: (data) => API.post('/jobs', data),
    updateJob: (id, data) => API.put(`/jobs/${id}`, data),
    deleteJob: (id) => API.delete(`/jobs/${id}`),
    applyToJob: (id) => API.put(`/jobs/${id}/apply`),
    withdrawJob: (id) => API.put(`/jobs/${id}/withdraw`),
    getApplicants: (id) => API.get(`/jobs/${id}/applicants`)
};

export const blogService = {
    getBlogs: (category) => API.get('/blogs', { params: { category } }),
    createBlog: (data) => API.post('/blogs', data),
    likeBlog: (id) => API.put(`/blogs/like/${id}`),
    addComment: (id, text) => API.post(`/blogs/${id}/comment`, { text }),
    deleteComment: (id, commentId) => API.delete(`/blogs/${id}/comment/${commentId}`)
};

export const eventService = {
    getEvents: () => API.get('/events'),
    createEvent: (data) => API.post('/events', data),
    updateEvent: (id, data) => API.put(`/events/${id}`, data),
    registerForEvent: (id) => API.put(`/events/register/${id}`),
    deleteEvent: (id) => API.delete(`/events/${id}`)
};

export const galleryService = {
    getGallery: (category) => API.get('/gallery', { params: { category } }),
    uploadMedia: (data) => API.post('/gallery', data),
    deleteMedia: (id) => API.delete(`/gallery/${id}`)
};

export const adminService = {
    getStats: () => API.get('/admin/stats'),
    getAllJobs: () => API.get('/admin/jobs'),
    getPublicStats: () => API.get('/admin/public-stats'),
    getPendingAlumni: () => API.get('/admin/pending-alumni'),
    verifyAlumni: (id, status) => API.put(`/admin/verify-alumni/${id}`, { status }),
    getUsers: (params) => API.get('/admin/users', { params }),
    exportUsers: () => API.get('/admin/export-users', { responseType: 'blob' }),
    postAnnouncement: (data) => API.post('/admin/announcement', data),
    sendBulkEmail: (data) => API.post('/admin/bulk-email', data)
};

export const notificationService = {
    getNotifications: () => API.get('/notifications'),
    markAsRead: () => API.put('/notifications/read')
};

export const queryService = {
    getQueries: () => API.get('/queries'),
    getQuery: (id) => API.get(`/queries/${id}`),
    createQuery: (data) => API.post('/queries', data),
    replyToQuery: (id, text) => API.post(`/queries/${id}/reply`, { text }),
    resolveQuery: (id) => API.put(`/queries/${id}/resolve`),
    deleteQuery: (id) => API.delete(`/queries/${id}`)
};
