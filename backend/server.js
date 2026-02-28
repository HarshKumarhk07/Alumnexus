const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Validate SendGrid API Key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('WARNING: SENDGRID_API_KEY is not defined. Email service will be disabled.');
}

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined/null values

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize both the request origin and allowed origins (strip trailing slashes)
    const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, '').toLowerCase());

    if (normalizedAllowed.indexOf(normalizedOrigin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profiles', require('./routes/profile.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/gallery', require('./routes/gallery.routes'));
app.use('/api/queries', require('./routes/query.routes'));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AlumNexus API is running' });
});

// Test Email Route (Remove in production)
app.get('/api/test-email', async (req, res) => {
  const sendEmail = require('./utils/sendEmail');
  const success = await sendEmail({
    to: req.query.to || 'test@example.com',
    subject: 'SendGrid Test Email',
    html: '<strong>This is a test email from AlumNexus using SendGrid!</strong>'
  });

  if (success) {
    res.status(200).json({ success: true, message: 'Email sent' });
  } else {
    res.status(500).json({ success: false, message: 'Email failed' });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
});

// Windows stability: Handle SIGHUP/SIGINT to prevent premature terminal termination
process.on('SIGHUP', () => {
  console.log('Received SIGHUP. Keeping server alive.');
});
