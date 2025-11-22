import React from "react"
// SỬA LỖI: Bỏ context "hàng mới", dùng "kho" sản phẩm chính
import { useProductAvailable } from "../../Context/product-context" 
import { ProductCard } from "../../index"
import Lottie from "react-lottie"
import LoadingLottie from "../../Assets/Lottie/loading-0.json"

function NewArrivals()
{
    // SỬA LỖI: Lấy data từ "kho" sản phẩm chính
    const { productsAvailableList } = useProductAvailable()

    const loadingObj = {
      loop: true,
      autoplay: true,
      animationData : LoadingLottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    }

    // === THÊM LOGIC: Sắp xếp và Lọc ===
    // 1. Sắp xếp danh sách (sort) theo ngày tạo (mới nhất lên đầu)
    const sortedList = [...productsAvailableList].sort((a, b) => {
        // Đảm bảo createdAt tồn tại trước khi so sánh
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    // 2. Chỉ lấy 4 sản phẩm đầu tiên
    const newArrivals = sortedList.slice(0, 4);
    // === KẾT THÚC LOGIC ===

    return (
        <div className='new-arrivals-container'>
        {
          // Sửa điều kiện: Dùng 'productsAvailableList' (danh sách gốc)
          productsAvailableList.length === 0 ? (
            <Lottie options={loadingObj}
              height={380}
              style={{ margin: "auto"}}
              isStopped={false}
              isPaused={false}
            />
          ) : (
            // Sửa logic: Dùng 'newArrivals' (danh sách đã lọc 4)
            newArrivals.map( product => 
              (
                <ProductCard key={product._id} productdetails={product}/>
              )
            )
          )
        }
      </div>
    )
}

export { NewArrivals };