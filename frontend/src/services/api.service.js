import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // If we're on localhost, default to the local backend port
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001/api';
    }

    // In production, if VITE_API_URL is missing, try to use the current origin
    // This assumes the backend and frontend are on the same domain or follows a convention
    return `${window.location.origin}/api`;
};

const API = axios.create({
    baseURL: getBaseURL()
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
    updateProfile: (data) => API.put('/auth/profile', data),
    updatePassword: (data) => API.put('/auth/password', data)
};

export const profileService = {
    getAlumni: () => API.get('/profiles/alumni'),
    getStudent: (id) => API.get(`/profiles/student/${id}`),
    upsertAlumni: (data) => API.post('/profiles/alumni', data),
    getMeAlumniProfile: () => API.get('/profiles/alumni/me'),
    getMeStudentProfile: () => API.get('/profiles/student/me'),
    upsertStudentProfile: (data) => API.post('/profiles/student', data),
    uploadStudentPhoto: (data) => API.post('/profiles/student/photo', data),
    createRequest: (data) => API.post('/profiles/requests', data),
    getSentRequests: () => API.get('/profiles/requests/sent'),
    getReceivedRequests: () => API.get('/profiles/requests/received'),
    updateRequestStatus: (id, data) => API.put(`/profiles/requests/${id}`, data),
    getStudents: () => API.get('/profiles/students')
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
    createBlog: (data) => {
        if (data instanceof FormData) {
            return API.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return API.post('/blogs', data);
    },
    updateBlog: (id, data) => API.put(`/blogs/${id}`, data),
    uploadBlogCoverImage: (id, file) => {
        const fd = new FormData();
        fd.append('image', file);
        return API.post(`/blogs/${id}/cover-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    likeBlog: (id) => API.put(`/blogs/like/${id}`),
    addComment: (id, text) => API.post(`/blogs/${id}/comment`, { text }),
    deleteComment: (id, commentId) => API.delete(`/blogs/${id}/comment/${commentId}`),
    deleteBlog: (id) => API.delete(`/blogs/${id}`)
};

export const eventService = {
    getEvents: () => API.get('/events'),
    createEvent: (data) => API.post('/events', data),
    updateEvent: (id, data) => API.put(`/events/${id}`, data),
    registerForEvent: (id) => API.put(`/events/register/${id}`),
    deleteEvent: (id) => API.delete(`/events/${id}`)
};

export const surveyService = {
    getSurveys: () => API.get('/surveys'),
    createSurvey: (data) => API.post('/surveys', data),
    voteSurvey: (id, optionId) => API.put(`/surveys/${id}/vote`, { optionId }),
    deleteSurvey: (id) => API.delete(`/surveys/${id}`)
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
    sendBulkEmail: (data) => API.post('/admin/bulk-email', data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    updateUserStatus: (id, data) => API.put(`/admin/users/status/${id}`, data),
    exportStudents: () => API.get('/admin/export-students', { responseType: 'blob' }),
    getSpotlight: () => API.get('/admin/spotlight'),
    updateSpotlight: (data) => {
        if (data instanceof FormData) {
            return API.post('/admin/spotlight', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return API.post('/admin/spotlight', data);
    }
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
    deleteQuery: (id) => API.delete(`/queries/${id}`),
    deleteReply: (id, replyId) => API.delete(`/queries/${id}/reply/${replyId}`)
};
