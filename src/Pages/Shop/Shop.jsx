import React, { useState, useEffect, useRef } from 'react'
import jwt_decode from "jwt-decode"
import { useLocation } from "react-router-dom"
import "./Shop.css"
import { 
  Sidebar, 
  ProductCard,
  useWishlist,
  useCart,
  useSearchBar,
  Pagination
} from "../../index.js"
import { useProductAvailable } from "../../Context/product-context"
import axios from 'axios'
import { useTranslation } from 'react-i18next';

function Shop(props) {
    const isMounted = useRef(true)

    let { 
      productsAvailableList, 
      loading
    } = useProductAvailable()

    const { dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart } = useCart()
    const { pathname } = useLocation();
    const { searchBarTerm } = useSearchBar()
    const { t } = useTranslation();
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ productsPerPage ] = useState(12)
   
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname, currentPage]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [productsAvailableList, searchBarTerm]);

    // === ĐÃ XÓA BỎ useEffect GỌI API products ===
    // (Vì file 'product-context.js' đã làm việc này rồi,
    // 'productsAvailableList' sẽ tự động được cập nhật từ context)

    // Cleanup effect
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    // useEffect này để lấy cart/wishlist (và đã sửa lỗi if(token))
    useEffect(()=>{
      const token=localStorage.getItem('token')

      // SỬA LỖI: Thêm "if (token)"
      if(token)
      {
        try { // Thêm try...catch
          const user = jwt_decode(token)
          if(!user)
          {
              localStorage.removeItem('token')
          }
          else
          {
            (async function getUpdatedWishlistAndCart()
            {
                try {
                    // URL này đã đúng
                    let updatedUserInfo = await axios.get(
                    "http://localhost:5000/api/user",
                    {
                        headers:
                        {
                        'x-access-token': localStorage.getItem('token'),
                        }
                    })

                    if(isMounted.current && updatedUserInfo.data.status==="ok")
                    {
                      dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: updatedUserInfo.data.user.wishlist})
                      dispatchUserCart({type: "UPDATE_USER_CART",payload: updatedUserInfo.data.user.cart})
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            })()
          }
        } catch (e) {
          localStorage.removeItem('token'); // Xóa token nếu nó bị hỏng
        }
      }   
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]) // Chỉ chạy 1 lần

    // Logic lọc (sử dụng productsAvailableList đã được filter bởi context)
    let searchedProducts = productsAvailableList
    .filter(productdetails=>{
      return (
        productdetails.bookName.toLowerCase().includes(searchBarTerm.toLowerCase()) 
        || productdetails.author.toLowerCase().includes(searchBarTerm.toLowerCase())
      )
    })

    // Nếu không có search term thì sử dụng toàn bộ danh sách đã được filter
    let displayProducts = searchBarTerm === "" ? productsAvailableList : searchedProducts

    // Debug logging
    console.log('Shop: products=' + productsAvailableList.length + ', display=' + displayProducts.length);
    
    // Emergency: If no display products but we have loading=false, show message
    if (displayProducts.length === 0 && !loading && productsAvailableList.length === 0) {
        console.log('🚨 No products available from context!');
    }

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct= indexOfLastProduct - productsPerPage;
    let currentDisplayProducts = displayProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    return (
        <div>
            <div className='shop-container'>
                <Sidebar/>
                <div className='products-container'>
                    {loading ? (
                        <>
                            <div className="skeleton-header"></div>
                            <div className="products-card-grid">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="skeleton-card">
                                        <div className="skeleton-image"></div>
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-text short"></div>
                                        <div className="skeleton-button"></div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* === DỊCH === */}
                            <h2>{t("Hiển thị", { count: displayProducts.length })} {t('sản phẩm')}</h2>
                            <div className="products-card-grid">
                                {
                                    currentDisplayProducts && currentDisplayProducts.length > 0 ?
                                    (
                                        currentDisplayProducts.map(productdetails => (
                                            <ProductCard key={productdetails._id} productdetails={productdetails} />
                                        ))
                                    ) : (
                                        <div className="no-products-found">
                                            <p>{t('Không tìm thấy sản phẩm nào')}</p>
                                        </div>
                                    )
                                }
                            </div>
                            <Pagination 
                              productsPerPage={productsPerPage} 
                              totalProducts={displayProducts.length}
                              paginate={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export { Shop }