import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, BookOpen, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import { adminService } from '../services/api.service';

const Home = () => {
    const [stats, setStats] = useState({
        alumniCount: '...',
        activeJobs: '...',
        insights: '...',
        partners: '120+' // Currently no partner count in backend, fallback to static
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminService.getPublicStats();
                if (res?.data?.data) {
                    const data = res.data.data;
                    setStats(prev => ({
                        ...prev,
                        alumniCount: data.alumniCount > 0 ? `${data.alumniCount}+` : '0',
                        activeJobs: data.activeJobs > 0 ? `${data.activeJobs}+` : '0',
                        insights: data.insights > 0 ? `${data.insights}+` : '0',
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch landing page stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-20 py-8">
            <section className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] px-4 md:px-8 mb-8">
                <ImageSlider />
            </section>

            {/* Hero Section */}
            <section className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[var(--surface)] text-[var(--primary)] rounded-full text-xs md:text-sm font-bold border border-[var(--border)]">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" /> Empowering Next-Gen Professionals
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--primary)] leading-tight tracking-tight">
                    Where Alumni Success Meets <span className="text-[var(--primary-light)]">Student Ambition.</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    The ultimate professional bridge. Connect with mentors, find exclusive job opportunities, and share your journey with the AlumNexus community.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 px-4 sm:px-0">
                    <Link to="/register" className="px-6 py-3 md:px-8 md:py-4 bg-[var(--primary)] text-[var(--text-light)] rounded-2xl font-bold text-base md:text-lg premium-shadow hover:scale-105 transition-smooth flex items-center justify-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                    <Link to="/login" className="px-6 py-3 md:px-8 md:py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-bold text-base md:text-lg hover:bg-[var(--surface)] transition-smooth flex items-center justify-center">
                        View Live Portal
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-4">
                {[
                    { label: 'Active Alumni', value: stats.alumniCount, icon: Users },
                    { label: 'Placements', value: stats.activeJobs, icon: Briefcase },
                    { label: 'Success Stories', value: stats.insights, icon: BookOpen },
                    { label: 'Trusted Partners', value: stats.partners, icon: ShieldCheck },
                ].map((stat, i) => (
                    <div key={i} className="text-center space-y-2 glass-card p-4 md:p-6 border border-[var(--border)]">
                        <div className="w-12 h-12 bg-[var(--accent)] text-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <stat.icon size={28} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">{stat.value}</h3>
                        <p className="text-gray-500 font-bold md:font-medium text-[10px] md:text-sm uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </section>

            {/* Features Section */}
            <section className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Engineered for Engagement</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">Everything you need to build a high-impact professional network within your college.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group space-y-4 md:space-y-6 p-6 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <Briefcase size={28} />
                        </div>
                        <h3 className="text-2xl font-bold">Curated Job Board</h3>
                        <p className="text-gray-600 leading-relaxed">Exclusive job and internship postings from alumni working at top-tier companies worldwide.</p>
                        <ul className="space-y-3 text-sm font-medium text-gray-500">
                            <li className="flex items-center gap-2">✓ Referral Priority</li>
                            <li className="flex items-center gap-2">✓ Direct HR Access</li>
                        </ul>
                    </div>

                    <div className="group space-y-4 md:space-y-6 p-6 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-bold">Mentorship Flow</h3>
                        <p className="text-gray-600 leading-relaxed">Direct 1-on-1 mentorship requests. Get career guidance from those who've walked your path.</p>
                        <ul className="space-y-3 text-sm font-medium text-gray-500">
                            <li className="flex items-center gap-2">✓ Resume Reviews</li>
                            <li className="flex items-center gap-2">✓ Mock Interviews</li>
                        </ul>
                    </div>

                    <div className="group space-y-4 md:space-y-6 p-6 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-2xl font-bold">Alumni Insights</h3>
                        <p className="text-gray-600 leading-relaxed">A professional publishing platform for alumni to share technical blogs and industry trends.</p>
                        <ul className="space-y-3 text-sm font-medium text-gray-500">
                            <li className="flex items-center gap-2">✓ Knowledge Sharing</li>
                            <li className="flex items-center gap-2">✓ Guest Lecturing</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[var(--primary)] rounded-3xl p-12 text-center text-white space-y-8 premium-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
                <h2 className="text-3xl md:text-5xl font-bold max-w-2xl mx-auto">Ready to bridge the gap between education and career?</h2>
                <div className="flex justify-center gap-6">
                    <Link to="/register" className="px-10 py-4 bg-white text-[var(--primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface)] transition-smooth">
                        Join the Network
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
