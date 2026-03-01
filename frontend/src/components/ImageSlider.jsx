import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryService } from '../services/api.service';

const ImageSlider = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestImages();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [images.length, currentIndex]);

    const fetchLatestImages = async () => {
        try {
            // Get all images (already sorted by latest in backend)
            const res = await galleryService.getGallery();
            // Take only the top 20
            const latestImages = res.data.data.slice(0, 20);
            setImages(latestImages);
        } catch (error) {
            console.error('Failed to fetch slider images:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    if (loading) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center border border-[var(--border)]">
                <span className="text-gray-400 font-bold">Loading highlights...</span>
            </div>
        );
    }

    if (images.length === 0) {
        return null; // Don't show slider if no gallery images exist
    }

    return (
        <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden group premium-shadow border border-[var(--border)] bg-zinc-900">
            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 bg-center bg-cover blur-xl scale-110 opacity-60 transition-all duration-700 ease-in-out"
                style={{ backgroundImage: `url(${images[currentIndex].mediaURL})` }}
            ></div>

            {/* Dark overlay to ensure text readability against the blur */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* The Main Image (Contained) */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <img
                    src={images[currentIndex].mediaURL}
                    alt={images[currentIndex].caption || 'Gallery highlight'}
                    className="w-full h-full object-contain drop-shadow-2xl transition-all duration-700 ease-in-out pointer-events-auto"
                />
            </div>

            {/* Bottom Gradient for Caption Readability */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

            {/* Caption Text overlays */}
            <div className="absolute bottom-6 md:bottom-12 w-full text-center px-4 md:px-20 z-10 transition-smooth">
                {images[currentIndex].caption && (
                    <h2 className="text-white text-xl md:text-3xl font-bold tracking-wide drop-shadow-md line-clamp-2">
                        {images[currentIndex].caption}
                    </h2>
                )}
            </div>

            {/* Left Arrow */}
            <button
                onClick={goToPrevious}
                className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 text-white p-2 rounded-full bg-black/30 hover:bg-black/60 transition-smooth opacity-0 group-hover:opacity-100 z-10"
            >
                <ChevronLeft size={36} />
            </button>

            {/* Right Arrow */}
            <button
                onClick={goToNext}
                className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 text-white p-2 rounded-full bg-black/30 hover:bg-black/60 transition-smooth opacity-0 group-hover:opacity-100 z-10"
            >
                <ChevronRight size={36} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:gap-3 z-10">
                {images.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`transition-all duration-300 rounded-full ${currentIndex === slideIndex
                            ? 'bg-[var(--primary)] w-8 h-2 md:w-10 md:h-2.5'
                            : 'bg-white/50 w-2 h-2 md:w-2.5 md:h-2.5 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${slideIndex + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
