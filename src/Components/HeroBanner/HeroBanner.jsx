import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBanner.css';

const HeroBanner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides = [
    {
      image: 'https://cdn-statics.vietgigs.vn/gigs/gallery/large/90054AE20DD9E8EFE72C.webp',
      title: 'Khám Phá Thế Giới Sách',
      subtitle: 'Hàng ngàn đầu sách hay chờ bạn',
      cta: 'Mua Ngay',
      ctaLink: '/shop'
    },
    {
      image: 'https://png.pngtree.com/thumb_back/fw800/back_pic/05/13/72/6759a17695bc624.jpg',
      title: 'Các Tác Giả Nổi Tiếng',
      subtitle: 'Sưu tập độc quyền từ những nhà văn hàng đầu',
      cta: 'Xem Bộ Sưu Tập',
      ctaLink: '/shop'
    },
    {
      image: 'https://marketplace.canva.com/EAF68wFI0R8/2/0/1600w/canva-hình-nền-máy-tính-động-lực-khẳng-định-phá-cách-màu-xanh-lá-xanh-coban-Yka0myxxR_w.jpg',
      title: 'Ưu Đãi Hôm Nay',
      subtitle: 'Giảm giá đến 40% cho các đầu sách hot',
      cta: 'Xem Khuyến Mãi',
      ctaLink: '/shop'
    }
  ];

  // Auto-play slides
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const handleCTA = (link) => {
    navigate(link);
  };

  return (
    <div className="hero-banner-container">
      <div className="hero-banner-wrapper">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%), url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Content Overlay */}
            <div className="hero-content">
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <button
                className="hero-cta-btn"
                onClick={() => handleCTA(slide.ctaLink)}
              >
                {slide.cta}
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button className="hero-nav-btn hero-prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="hero-nav-btn hero-next" onClick={nextSlide}>
          ❯
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
