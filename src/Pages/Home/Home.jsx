import { useTranslation } from 'react-i18next';
import React,{ useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import axios from "axios"
import { useLocation } from "react-router-dom"
import './Home.css'
import jwt_decode from "jwt-decode"
import {  
  GenreCard, 
  NewArrivals,
  Footer,
  useWishlist,
  useCart 
} from "../../index.js"
import { useProductAvailable } from "../../Context/product-context"
import { useGenre } from "../../Context/genre-context"

function Home() {
  const { t } = useTranslation();
  const { dispatchProductFilterOptions } = useProductAvailable()
  const { dispatchUserWishlist } = useWishlist()
  const { dispatchUserCart } = useCart()
  const {
    setFictionCategoryCheckbox,
    setThrillerCategoryCheckbox,
    setTechCategoryCheckbox,
    setPhilosophyCategoryCheckbox,
    setRomanceCategoryCheckbox,
    setMangaCategoryCheckbox, 
  } = useGenre()

  const [currentSlide, setCurrentSlide] = useState(0)
  const { pathname } = useLocation();

  // Slider data
  const bannerSlides = [
    {
      id: 1,
      title: "SINH NHẬT BOOKZTRON",
      subtitle: "MỞ ĐẠI TIỆC SÁCH",
      discount: "Giảm đến 50%",
      color: "linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)",
      backgroundImage: "https://blogphotoshop.com/wp-content/uploads/2019/01/thiet-ke-bia-sach-dep.jpg",
      books: [
        { title: "Sách Văn Học", image: "📚" },
        { title: "Sách Thiếu Nhi", image: "🎨" },
        { title: "Sách Kỹ Năng", image: "💡" }
      ]
    },
    {
      id: 2,
      title: "BLACK FRIDAY",
      subtitle: "SIÊU SALE KHỦNG",
      discount: "Giảm đến 70%",
      color: "linear-gradient(135deg, rgba(255, 65, 108, 0.9) 0%, rgba(255, 75, 43, 0.9) 100%)",
      backgroundImage: "https://thietkelogo.edu.vn/uploads/images/thiet-ke-do-hoa-khac/banner-sach/1.png",
      books: [
        { title: "Bestseller", image: "⭐" },
        { title: "New Arrivals", image: "🔥" },
        { title: "Top Rated", image: "📖" }
      ]
    },
    {
      id: 3,
      title: "CHÀO XUÂN 2024",
      subtitle: "SÁCH MỚI XUẤT BẢN",
      discount: "Ưu đãi đặc biệt",
      color: "linear-gradient(135deg, rgba(17, 153, 142, 0.9) 0%, rgba(56, 239, 125, 0.9) 100%)",
      backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      books: [
        { title: "Tâm Lý Học", image: "🧠" },
        { title: "Phát Triển Bản Thân", image: "🚀" },
        { title: "Kinh Doanh", image: "💼" }
      ]
    }
  ]

  const promotionalCards = [
    {
      title: "CHIẾN THẮP",
      subtitle: "NGU VỦA",
      description: "Sách tâm lý & phát triển bản thân",
      discount: "Giảm 40%",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonText: "MUA NGAY"
    },
    {
      title: "MỪNG NXB OXFORD",
      subtitle: "TẠI VIỆT NAM TUỔI 30",
      description: "Sách học tiếng Anh chính hãng",
      discount: "Ưu đãi khủng",
      color: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
      buttonText: "MUA NGAY"
    },
    {
      title: "MCBOOKS",
      subtitle: "THÁNG 11 SALE ĐỊNH SẢN",
      description: "Sách chuyên ngành & học thuật",
      discount: "Giảm đến 50%",
      color: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
      buttonText: "MUA NGAY"
    },
    {
      title: "BOOKZTRON CÙNG BẠN",
      subtitle: "TRÍ ẤN THÀY CÔ",
      description: "Sách giáo dục & đào tạo",
      discount: "Ưu đãi đặc biệt",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      buttonText: "MUA NGAY"
    }
  ]

  const categoryIcons = [
    { 
      name: "Viễn tưởng", 
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=100&h=100&fit=crop&crop=center", 
      color: "#667eea" 
    },
    { 
      name: "Kinh dị", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center", 
      color: "#764ba2" 
    },
    { 
      name: "Công nghệ", 
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center", 
      color: "#f093fb" 
    },
    { 
      name: "Triết học", 
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop&crop=center", 
      color: "#f5576c" 
    },
    { 
      name: "Lãng mạn", 
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop&crop=center", 
      color: "#ff6b6b" 
    },
    { 
      name: "Manga", 
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center", 
      color: "#4ecdc4" 
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerSlides.length])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(()=>{
      const token=localStorage.getItem('token')

      if(token)
      {
          const user = jwt_decode(token)
          if(!user)
          {
                localStorage.removeItem('token')
          }
          else
          {
                (async function getUpdatedWishlistAndCart()
                {
                    let updatedUserInfo = await axios.get(
                    "http://localhost:5000/api/user",
                    {
                        headers:
                        {
                        'x-access-token': localStorage.getItem('token'),
                        }
                    })

                    if(updatedUserInfo.data.status==="ok")
                    {
                        dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: updatedUserInfo.data.user.wishlist})
                        dispatchUserCart({type: "UPDATE_USER_CART",payload: updatedUserInfo.data.user.cart})
                    }
                })()
          }
      }   
  },[dispatchUserCart, dispatchUserWishlist])

  return (
    <div className='home-component-container'>
      {/* Hero Banner Slider */}
      <div className="hero-slider-container">
        <div className="hero-slider" style={{transform: `translateX(-${currentSlide * 100}%)`}}>
          {bannerSlides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="hero-slide"
            >
              <div className="hero-slide-content">
                <div className="hero-text">
                  <h1 className="hero-title">{slide.title}</h1>
                  <h2 className="hero-subtitle">{slide.subtitle}</h2>
                  <div className="hero-discount">{slide.discount}</div>
                  <Link to="/shop" className="hero-cta-btn">KHÁM PHÁ NGAY</Link>
                </div>
                <div className="hero-books">
                  {slide.books.map((book, idx) => (
                    <div key={idx} className="book-item">
                      <div className="book-cover">{book.image}</div>
                      <span className="book-title">{book.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slider Indicators */}
        <div className="slider-indicators">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Category Icons Grid */}
      <div className="category-icons-section">
        <h2 className="category-section-title">Thể loại</h2>
        <div className="category-icons-grid">
          {categoryIcons.map((category, index) => (
            <Link key={index} to="/shop" className="category-icon-item">
              <div className="category-icon" style={{backgroundColor: category.color}}>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                />
              </div>
              <span className="category-name">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Promotional Cards Grid */}
      <div className="promotional-section">
        <div className="promotional-grid">
          {promotionalCards.map((card, index) => (
            <div key={index} className="promo-card" style={{background: card.color}}>
              <div className="promo-content">
                <h3 className="promo-title">{card.title}</h3>
                <h4 className="promo-subtitle">{card.subtitle}</h4>
                <p className="promo-description">{card.description}</p>
                <div className="promo-discount">{card.discount}</div>
                <Link to="/shop" className="promo-btn">{card.buttonText}</Link>
              </div>
              <div className="promo-decoration">
                <div className="promo-books">📚📖📕</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Category Showcase */}
      <div className="modern-categories-section">
        <div className="section-header">
          <h1 className='homepage-headings'>{t('genres')}</h1>
          <p className="section-subtitle">Khám phá thế giới tri thức đa dạng</p>
        </div>

        {/* Featured Category Highlight */}
        <div className="featured-category">
          <div className="featured-content">
            <div className="featured-info">
              <span className="featured-badge">Nổi Bật</span>
              <h2>Bestsellers Tháng Này</h2>
              <p>Những cuốn sách được yêu thích nhất, từ tiểu thuyết hấp dẫn đến sách kỹ năng thực tế</p>
              <div className="featured-stats">
                <div className="stat-item">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Sách bán chạy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Tác giả nổi tiếng</span>
                </div>
              </div>
              <Link to="/shop" className="featured-btn">
                Khám Phá Ngay
                <span className="btn-arrow">→</span>
              </Link>
            </div>
            <div className="featured-visual">
              <div className="floating-books">
                <div className="book-stack book-1">
                  <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Book 1" />
                </div>
                <div className="book-stack book-2">
                  <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Book 2" />
                </div>
                <div className="book-stack book-3">
                  <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Book 3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Category Grid */}
        <div className="interactive-categories">
          <div className="category-card category-fiction" onClick={() => {
            setFictionCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop">
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">📖</div>
                <h3>{t('fiction')}</h3>
                <p>Những câu chuyện hấp dẫn</p>
                <span className="category-count">200+ sách</span>
              </div>
            </Link>
          </div>

          <div className="category-card category-thriller" onClick={() => {
            setThrillerCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop">
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">🔍</div>
                <h3>{t('thriller')}</h3>
                <p>Kịch tính, bí ẩn</p>
                <span className="category-count">150+ sách</span>
              </div>
            </Link>
          </div>

          <div className="category-card category-tech" onClick={() => {
            setTechCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop">
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">💻</div>
                <h3>{t('tech')}</h3>
                <p>Công nghệ, lập trình</p>
                <span className="category-count">180+ sách</span>
              </div>
            </Link>
          </div>

          <div className="category-card category-philosophy" onClick={() => {
            setPhilosophyCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop">
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">🤔</div>
                <h3>{t('philosophy')}</h3>
                <p>Triết học, tâm linh</p>
                <span className="category-count">120+ sách</span>
              </div>
            </Link>
          </div>

          <div className="category-card category-romance" onClick={() => {
            setRomanceCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop">
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">💕</div>
                <h3>{t('romance')}</h3>
                <p>Tình yêu, lãng mạn</p>
                <span className="category-count">90+ sách</span>
              </div>
            </Link>
          </div>

          <div className="category-card category-manga" onClick={() => {
            setMangaCategoryCheckbox(true);
            dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
          }}>
            <Link to="/shop" state={{navigate: true}}>
              <div className="category-overlay"></div>
              <div className="category-content">
                <div className="category-icon">🎨</div>
                <h3>{t('manga')}</h3>
                <p>Manga, truyện tranh</p>
                <span className="category-count">300+ sách</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Browse All Section */}
        <div className="browse-all-section">
          <div className="browse-content">
            <h3>Không tìm thấy thể loại yêu thích?</h3>
            <p>Khám phá toàn bộ kho sách với hàng ngàn đầu sách đa dạng</p>
            <Link to="/shop">
              <button 
                onClick={()=>{
                  setFictionCategoryCheckbox(true)
                  setThrillerCategoryCheckbox(true)
                  setTechCategoryCheckbox(true)
                  setPhilosophyCategoryCheckbox(true)
                  setRomanceCategoryCheckbox(true)
                  setMangaCategoryCheckbox(true)
                  dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"}) }  
                }
                className="browse-all-btn">
                <span>{t('exploreAll')}</span>
                <div className="btn-glow"></div>
              </button>
            </Link>
          </div>
          <div className="browse-decoration">
            <div className="floating-elements">
              <span className="float-element">📚</span>
              <span className="float-element">✨</span>
              <span className="float-element">📖</span>
              <span className="float-element">💫</span>
            </div>
          </div>
        </div>
      </div>

      <h1 className='homepage-headings'>{t('newArrivals')}</h1>
      <NewArrivals/>
      <Footer/>

    </div>
  )
}

export { Home };