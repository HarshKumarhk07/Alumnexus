import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, BookOpen, ShieldCheck, ArrowRight, Zap, Calendar, ChevronRight, ChevronLeft, Globe, HelpCircle, Mail, MessageSquare, Quote, ChevronDown } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import { adminService, eventService, blogService, profileService } from '../services/api.service';

const Home = () => {
    const [stats, setStats] = useState({
        alumniCount: '...',
        activeJobs: '...',
        insights: '...',
        eventsCount: '...'
    });
    const [events, setEvents] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [alumni, setAlumni] = useState([]);
    const [activeFaq, setActiveFaq] = useState(null);
    const [spotlight, setSpotlight] = useState({
        title: "From Campus Lead to CTO in Silicon Valley",
        description: "After graduating in 2018, Hemant spearheaded multiple open-source projects before landing at Google. Now leading tech strategy at a major startup, he shares how community networking was key to his success.",
        quote: "Don't just code; build connections that last a lifetime.",
        authorName: "Hemant Kumar",
        authorRole: "CTO at TechFlow",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });

    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, eventsRes, blogsRes, alumniRes, spotlightRes] = await Promise.all([
                    adminService.getPublicStats().catch(() => null),
                    eventService.getEvents().catch(() => null),
                    blogService.getBlogs().catch(() => null),
                    profileService.getAlumni().catch(() => null),
                    adminService.getSpotlight().catch(() => null)
                ]);

                if (statsRes?.data?.data) {
                    const data = statsRes.data.data;
                    setStats(prev => ({
                        ...prev,
                        alumniCount: data.alumniCount > 0 ? `${data.alumniCount}+` : '0',
                        activeJobs: data.activeJobs > 0 ? `${data.activeJobs}+` : '0',
                        insights: data.insights > 0 ? `${data.insights}+` : '0',
                    }));
                }

                if (eventsRes?.data?.data) {
                    const sorted = eventsRes.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setEvents(sorted.slice(0, 3));
                    setStats(prev => ({ ...prev, eventsCount: `${eventsRes.data.data.length}+` }));
                }

                if (blogsRes?.data?.data) {
                    const sorted = blogsRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setBlogs(sorted.slice(0, 3));
                }

                if (alumniRes?.data?.data) {
                    const verified = alumniRes.data.data.filter(a => a.verificationStatus === 'approved');
                    setAlumni(verified);
                }

                if (spotlightRes?.data?.data) {
                    setSpotlight(spotlightRes.data.data);
                }

            } catch (error) {
                console.error("Failed to fetch landing page data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-20 pb-20">
            <section className="w-full px-4 md:px-8 mb-8 mt-0">
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
                <p className="text-base sm:text-lg md:text-xl text-[var(--text-light)] leading-relaxed max-w-2xl mx-auto opacity-70">
                    The ultimate professional bridge. Connect with mentors, find exclusive job opportunities, and share your journey with the AlumNexus community.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 px-4 sm:px-0">
                    <Link to="/register" className="px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg premium-shadow hover:scale-105 transition-smooth flex items-center justify-center gap-2">
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="px-10 py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface)]/20 transition-smooth flex items-center justify-center">
                        View Live Portal
                    </Link>
                </div>
            </section>

            {/* Quick Action Links */}
            <section className="px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Link to="/login" className="group relative h-40 md:h-48 rounded-3xl overflow-hidden premium-shadow transition-smooth hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-smooth"></div>
                        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="absolute inset-0 w-full h-full object-cover -z-10" alt="" />
                        <div className="absolute inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 space-y-1 md:space-y-2 text-white group-hover:translate-x-1 transition-smooth">
                            <h4 className="text-base md:text-xl font-bold border-b border-white/20 pb-1 md:pb-2">Your Alumni Profile</h4>
                            <p className="text-[10px] md:text-xs opacity-90 line-clamp-2">Access your profile, settings and network recognized in community.</p>
                            <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white text-black rounded-lg text-[10px] md:text-xs font-bold mt-1 md:mt-2 uppercase tracking-wider group-hover:bg-[#EBE6E1]">LOGIN</div>
                        </div>
                    </Link>
                    <Link to="/public-directory" className="group relative h-40 md:h-48 rounded-3xl overflow-hidden premium-shadow transition-smooth hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-[#5A3E2B]/60 group-hover:bg-[#5A3E2B]/40 transition-smooth"></div>
                        <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="absolute inset-0 w-full h-full object-cover -z-10" alt="" />
                        <div className="absolute inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 space-y-1 md:space-y-2 text-white group-hover:translate-x-1 transition-smooth">
                            <h4 className="text-base md:text-xl font-bold border-b border-white/20 pb-1 md:pb-2">Alumni Connect</h4>
                            <p className="text-[10px] md:text-xs opacity-90 line-clamp-2">Search and explore alumni directory without any barriers.</p>
                            <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white text-black rounded-lg text-[10px] md:text-xs font-bold mt-1 md:mt-2 uppercase tracking-wider group-hover:bg-[#EBE6E1]">BROWSE</div>
                        </div>
                    </Link>
                    <Link to="/public-directory" className="group relative h-40 md:h-48 rounded-3xl overflow-hidden premium-shadow transition-smooth hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-[#8B5E3C]/60 group-hover:bg-[#8B5E3C]/40 transition-smooth"></div>
                        <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="absolute inset-0 w-full h-full object-cover -z-10" alt="" />
                        <div className="absolute inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 space-y-1 md:space-y-2 text-white group-hover:translate-x-1 transition-smooth">
                            <h4 className="text-base md:text-xl font-bold border-b border-white/20 pb-1 md:pb-2">Find Batchmates</h4>
                            <p className="text-[10px] md:text-xs opacity-90 line-clamp-2">Reconnect with your peers and relive campus memories.</p>
                            <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white text-black rounded-lg text-[10px] md:text-xs font-bold mt-1 md:mt-2 uppercase tracking-wider group-hover:bg-[#EBE6E1]">FIND</div>
                        </div>
                    </Link>
                    <Link to="/blogs" className="group relative h-40 md:h-48 rounded-3xl overflow-hidden premium-shadow transition-smooth hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-[#4A3728]/60 group-hover:bg-[#4A3728]/40 transition-smooth"></div>
                        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="absolute inset-0 w-full h-full object-cover -z-10" alt="" />
                        <div className="absolute inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 space-y-1 md:space-y-2 text-white group-hover:translate-x-1 transition-smooth">
                            <h4 className="text-base md:text-xl font-bold border-b border-white/20 pb-1 md:pb-2">Alumni Success Wall</h4>
                            <p className="text-[10px] md:text-xs opacity-90 line-clamp-2">Explore inspiring journeys and stories of our distinguished alumni.</p>
                            <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white text-black rounded-lg text-[10px] md:text-xs font-bold mt-1 md:mt-2 uppercase tracking-wider group-hover:bg-[#EBE6E1]">VIEW</div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: 'Active Alumni', value: stats.alumniCount, icon: Users },
                        { label: 'Placements conducted for students by alumni', value: stats.activeJobs, icon: Briefcase },
                        { label: 'Success Stories', value: stats.insights, icon: BookOpen },
                        { label: 'Events Conducted Till Now', value: stats.eventsCount, icon: Calendar }
                    ].map((stat, index) => (
                        <div key={index} className="glass-card p-6 md:p-8 relative overflow-hidden group hover:scale-[1.05] transition-smooth border border-[var(--primary)]/5">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--primary)]/10 transition-smooth"></div>
                            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                                <div className="p-3 bg-[var(--background)] rounded-2xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-smooth shadow-sm">
                                    <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-4xl font-black text-[var(--primary)] tracking-tight">
                                        {stat.value}
                                    </h3>
                                    <p className="text-[10px] md:text-xs font-bold text-[var(--text-light)] uppercase tracking-[0.2em] mt-1 opacity-70">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            < section className="max-w-7xl mx-auto px-4 md:px-8 space-y-16" >
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-dark)]">Natural Networking</h2>
                    <p className="text-[var(--text-light)] max-w-xl mx-auto opacity-90">Experience a professional ecosystem designed to grow your career potential organically.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    <div className="group space-y-4 md:space-y-6 p-5 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <Briefcase size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]">Curated Job Board</h3>
                        <p className="text-xs md:text-sm text-[var(--text-dark)] opacity-70 leading-relaxed hidden sm:block">Exclusive job and internship postings from alumni working at top-tier companies worldwide.</p>
                        <ul className="space-y-2 md:space-y-3 text-[10px] md:text-sm font-medium text-[var(--primary)]">
                            <li className="flex items-center gap-2">✓ Referral Priority</li>
                            <li className="flex items-center gap-2">✓ Direct HR Access</li>
                        </ul>
                    </div>

                    <div className="group space-y-4 md:space-y-6 p-5 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]">Mentorship Flow</h3>
                        <p className="text-xs md:text-sm text-[var(--text-light)] leading-relaxed hidden sm:block opacity-70">Direct 1-on-1 mentorship requests. Get career guidance from those who've walked your path.</p>
                        <ul className="space-y-2 md:space-y-3 text-[10px] md:text-sm font-bold text-[var(--primary)]">
                            <li className="flex items-center gap-2">✓ Resume Reviews</li>
                            <li className="flex items-center gap-2">✓ Mock Interviews</li>
                        </ul>
                    </div>

                    <div className="group space-y-4 md:space-y-6 p-5 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]">Alumni Insights</h3>
                        <p className="text-xs md:text-sm text-[var(--text-light)] leading-relaxed hidden sm:block opacity-70">A professional publishing platform for alumni to share technical blogs and trends.</p>
                        <ul className="space-y-2 md:space-y-3 text-[10px] md:text-sm font-bold text-[var(--primary)]">
                            <li className="flex items-center gap-2">✓ Industry Trends</li>
                            <li className="flex items-center gap-2">✓ Guest Lecturing</li>
                        </ul>
                    </div>

                    <div className="group space-y-4 md:space-y-6 p-5 md:p-8 glass-card border border-[var(--border)] hover:bg-[var(--surface)] transition-smooth">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center transition-smooth group-hover:rotate-12">
                            <Globe size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]">Global Network</h3>
                        <p className="text-xs md:text-sm text-[var(--text-light)] leading-relaxed hidden sm:block opacity-70">Expand your horizons beyond borders. Connect with alumni in over 20+ countries.</p>
                        <ul className="space-y-2 md:space-y-3 text-[10px] md:text-sm font-bold text-[var(--primary)]">
                            <li className="flex items-center gap-2">✓ Global Referrals</li>
                            <li className="flex items-center gap-2">✓ Relocation Hep</li>
                        </ul>
                    </div>
                </div>
            </section >

            <section className="px-4 md:px-8">
                <div className="dark-card rounded-[32px] overflow-hidden flex flex-col lg:flex-row shadow-2xl max-w-6xl mx-auto border-4 border-[var(--border)]/10">
                    <div className="lg:w-2/5 h-[300px] lg:h-auto relative overflow-hidden">
                        <img
                            src={spotlight.image}
                            className="w-full h-full object-cover transition-smooth duration-700 hover:scale-110"
                            alt="Success Spotlight"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#242426] via-transparent to-transparent"></div>
                    </div>
                    <div className="lg:w-3/5 p-8 md:p-14 flex flex-col justify-center space-y-6 text-[#EBE6E1] bg-gradient-to-br from-[#242426] to-[#333336]">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-bold w-fit uppercase tracking-[0.2em] border border-white/10">
                            <Quote size={12} className="text-[var(--primary-light)]" /> Spotlight Story
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white">{spotlight.title}</h2>
                        <div className="relative">
                            <Quote className="absolute -left-6 -top-4 opacity-10 w-12 h-12 text-[var(--primary-light)]" />
                            <p className="text-[#F3E8D9]/90 text-lg md:text-xl leading-relaxed font-medium italic relative z-10 pl-2">
                                {spotlight.quote}
                            </p>
                        </div>
                        <p className="text-[#F3E8D9]/70 text-sm md:text-base leading-relaxed line-clamp-3 font-medium">{spotlight.description}</p>
                        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                            <div className="w-12 h-12 rounded-full border-2 border-[var(--primary-light)] overflow-hidden shrink-0">
                                <img src={spotlight.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                                <p className="text-xl font-black tracking-wide text-white">{spotlight.authorName}</p>
                                <p className="text-[var(--primary-light)] font-bold tracking-[0.2em] text-[10px] uppercase mt-0.5">{spotlight.authorRole}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events & News Feed */}
            <section className="px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[var(--border)]/20 pb-4">
                            <h2 className="text-3xl font-bold text-[var(--text-dark)]">Events</h2>
                            <Link to="/login" className="text-[var(--primary)] font-bold border border-[var(--border)] px-4 py-1.5 rounded-lg text-sm hover:bg-[var(--surface)]/20 transition-smooth">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                            {events.length > 0 ? events.map((event, idx) => {
                                const eventDate = event.date ? new Date(event.date) : null;
                                const isValidDate = eventDate && !isNaN(eventDate.getTime());

                                return (
                                    <Link key={idx} to="/login" className="flex flex-col sm:flex-row gap-3 md:gap-6 p-3 md:p-4 rounded-2xl hover:bg-[var(--surface)] transition-smooth border border-transparent hover:border-[var(--border)] group glass-card">
                                        <div className="w-full sm:w-20 h-20 bg-[var(--surface)]/20 rounded-2xl flex items-center justify-center shrink-0 border border-[var(--border)] shadow-sm">
                                            <Calendar className="text-[var(--primary)] w-8 h-8 group-hover:scale-110 transition-smooth" />
                                        </div>
                                        <div className="space-y-1.5 md:space-y-2 flex-1 min-w-0">
                                            <h4 className="font-bold text-sm md:text-base text-[var(--text-dark)] leading-tight group-hover:text-[var(--primary)] transition-smooth line-clamp-2">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--text-light)]/60 font-bold tracking-wider">
                                                <Calendar size={14} />
                                                {isValidDate ? eventDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'TBA'}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }) : (
                                <p className="col-span-full text-gray-400 text-sm py-10 text-center">No upcoming events found</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[var(--border)]/20 pb-4">
                            <h2 className="text-3xl font-bold text-[var(--text-dark)]">News & Stories</h2>
                            <Link to="/login" className="text-[var(--primary)] font-bold border border-[var(--border)] px-4 py-1.5 rounded-lg text-sm hover:bg-[var(--surface)]/20 transition-smooth">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                            {blogs.length > 0 ? blogs.map((blog, idx) => (
                                <button key={idx} onClick={() => setSelectedBlog(blog)} className="w-full flex flex-col sm:flex-row gap-3 md:gap-6 p-3 md:p-4 rounded-2xl hover:bg-[var(--surface)] transition-smooth border border-transparent hover:border-[var(--border)] group glass-card text-left">
                                    <div className="w-full sm:w-24 h-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]/30 shadow-sm relative">
                                        {blog.coverImage ? (
                                            <img src={blog.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" alt={blog.title} />
                                        ) : (
                                            <div className="w-full h-full bg-[var(--surface)]/20 flex items-center justify-center">
                                                <BookOpen className="text-[var(--primary)] w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 md:space-y-2 flex-1 min-w-0">
                                        <h4 className="font-bold text-sm md:text-base text-[var(--text-dark)] leading-tight group-hover:text-[var(--primary)] transition-smooth line-clamp-2">{blog.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold tracking-wider">
                                            <Calendar size={12} />
                                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                        </div>
                                    </div>
                                </button>
                            )) : (
                                <p className="col-span-full text-gray-400 text-sm py-10 text-center">No recent news found</p>
                            )}
                        </div>
                    </div>
                </div>
            </section >

            {/* Distinguished Alumni Carousel */}
            < section className="px-4 md:px-8 space-y-10" >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-3xl font-bold text-[var(--text-dark)] font-extrabold tracking-tight">Distinguished Alumni</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => scrollCarousel('left')}
                            className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-smooth premium-shadow"
                        >
                            <ChevronLeft size={20} className="text-[var(--primary)]" />
                        </button>
                        <button
                            onClick={() => scrollCarousel('right')}
                            className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-smooth premium-shadow"
                        >
                            <ChevronRight size={20} className="text-[var(--primary)]" />
                        </button>
                    </div>
                </div>

                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-8"
                >
                    {alumni.length > 0 ? alumni.map((person, idx) => (
                        <div key={idx} className="min-w-[260px] md:min-w-[300px] snap-center bg-[var(--surface)] rounded-3xl overflow-hidden premium-shadow group border border-[var(--border)]">
                            <div className="h-32 bg-[var(--primary-light)]/20 relative transition-smooth group-hover:h-36">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent"></div>
                                <div className="absolute inset-x-0 -bottom-12 flex justify-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-[var(--surface)] bg-[var(--surface)] shadow-lg overflow-hidden group-hover:scale-110 transition-smooth shrink-0 relative">
                                        {person.profilePhoto && person.profilePhoto !== 'no-photo.jpg' ? (
                                            <img
                                                src={person.profilePhoto}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                alt={person.user?.name}
                                                style={{ objectPosition: 'center top' }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[var(--background)] flex items-center justify-center text-2xl font-bold text-[var(--primary)] uppercase">
                                                {person.user?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-8 px-6 text-center space-y-2 bg-[var(--surface)]">
                                <h4 className="text-xl font-extrabold text-[var(--primary)]">{person.user?.name}</h4>
                                <p className="text-sm font-bold text-[var(--text-dark)] uppercase tracking-widest leading-none">{person.company || 'Distinguished Alumni'}</p>
                                <p className="text-xs text-[var(--text-light)]/60 font-medium">{person.designation || 'Strategic Partner'}</p>
                            </div>
                        </div>
                    )) : (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[260px] md:min-w-[300px] snap-center bg-[var(--surface)] rounded-3xl overflow-hidden premium-shadow animate-pulse border border-[var(--border)]">
                                <div className="h-32 bg-[var(--background)]"></div>
                                <div className="p-12 space-y-4">
                                    <div className="h-6 bg-[var(--background)] rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-[var(--background)]/50 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section >


            {/* FAQ Section */}
            < section className="max-w-4xl mx-auto px-4 space-y-12" >
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--primary)]">Common Queries</h2>
                    <p className="text-[var(--text-light)]">Everything you need to know about getting started.</p>
                </div>
                <div className="space-y-4">
                    {[
                        { q: "Is AlumNexus free for all students?", a: "Yes! The platform is completely free to use for all verified students of the institution." },
                        { q: "How do I connect with a specific alumnus?", a: "You can find them in the Public Directory and send a connection request once you log in to your student dashboard." },
                        { q: "Can alumni post job opportunities directly?", a: "Absolutely. Alumni have specialized tools to post referrals and job leads directly on the portal." },
                        { q: "What is the verification process?", a: "We verify every user via their college ERP record or through a LinkedIn profile check to ensure a safe community." }
                    ].map((item, i) => (
                        <div key={i} className="glass-card border border-[var(--border)] overflow-hidden">
                            <button
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full flex justify-between items-center p-6 text-left hover:bg-[var(--surface)] transition-smooth"
                            >
                                <div className="flex items-center gap-4">
                                    <HelpCircle className="text-[var(--primary)]" />
                                    <span className="font-bold text-lg text-[var(--primary)]">{item.q}</span>
                                </div>
                                <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            {activeFaq === i && (
                                <div className="p-6 pt-0 text-[var(--text-dark)] opacity-80 font-medium animate-in slide-in-from-top-2 duration-300">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section >


            {/* Final CTA Section */}
            <section className="px-4 md:px-12 py-12">
                <div className="bg-gradient-to-br from-black via-[#1A1A1A] to-[#2D1B10] rounded-[48px] p-12 md:p-24 text-center text-white space-y-10 premium-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--background)] opacity-[0.03] rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7B5239] opacity-10 rounded-full -ml-32 -mb-32"></div>
                    <div className="space-y-6 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black max-w-3xl mx-auto leading-tight">Ready to build your professional legacy?</h2>
                        <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto">Join 2000+ students and alumni who are already redefining campus networking.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <Link to="/register" className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-[#EBE6E1] transition-smooth hover:scale-105 shadow-xl">
                            Join the Network
                        </Link>
                        <Link to="/login" className="px-12 py-5 border-2 border-white/20 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-smooth">
                            Login Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Blog Modal */}
            {
                selectedBlog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto premium-shadow animate-in zoom-in-95 duration-300 relative text-[var(--text-dark)]">
                            <button
                                onClick={() => setSelectedBlog(null)}
                                className="absolute top-6 right-6 p-2 bg-[var(--surface)]/80 hover:bg-[var(--surface)] rounded-full transition-smooth border border-[var(--border)] z-10"
                            >
                                <ChevronLeft className="rotate-180" size={24} />
                            </button>

                            <div className="h-64 relative overflow-hidden">
                                {selectedBlog.coverImage ? (
                                    <img src={selectedBlog.coverImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-[var(--surface)]/20 flex items-center justify-center">
                                        <BookOpen className="text-[var(--primary)] w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-8 right-8 text-white">
                                    <h2 className="text-3xl font-bold">{selectedBlog.title}</h2>
                                    <p className="text-sm opacity-90 mt-2">
                                        By {selectedBlog.user?.name} â€¢ {new Date(selectedBlog.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 space-y-6">
                                <div className="prose prose-stone max-w-none text-[var(--text-dark)]/90 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: selectedBlog.content }}></div>

                                <div className="pt-8 border-t border-[var(--border)] flex justify-center">
                                    <Link to="/login" className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:scale-105 transition-smooth">
                                        Login to read more stories
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Home;
