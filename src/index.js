import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ProductsProvider } from "./Context/product-context"
import { GenreProvider } from "./Context/genre-context"
// DÒNG NÀY ĐÃ BỊ XÓA: import { NewArrivalsProvider } from "./Context/new-arrival-context"
import { ToastContextProvider } from './Context/toast-context';
import { UserLoginContextProvider } from './Context/user-login-context'
import { WishlistContextProvider } from './Context/wishlist-context';
import { CartContextProvider } from './Context/cart-context';
import { OrdersContextProvider } from './Context/orders-context'
import { SearchBarContextProvider } from './Context/search-bar-context'
import { ThemeProvider } from './Context/theme-context'

export { useProductAvailable } from "./Context/product-context"
export { useGenre } from "./Context/genre-context"
// DÒNG NÀY ĐÃ BỊ XÓA: export { useNewArrivals } from "./Context/new-arrival-context"
export { useToast } from './Context/toast-context';
export { useUserLogin } from './Context/user-login-context'
export { useWishlist } from './Context/wishlist-context';
export { useCart } from "./Context/cart-context"
export { useOrders } from "./Context/orders-context"
export { useSearchBar } from "./Context/search-bar-context"
export { useTheme } from './Context/theme-context'

export { Navbar } from "./Components/Navbar/Navbar"
export { GenreCard } from './Components/GenreCards/GenreCard'
export { NewArrivals } from "./Components/NewArrivals/NewArrival"
export { ProductCard } from "./Components/Card/ProductCard"
export { HorizontalProductCard } from "./Components/HorizontalCard/HorizontalProductCard"
export { Footer } from "./Components/Footer/Footer"
export { Sidebar } from './Components/Sidebar/Sidebar'
export { Toast } from './Components/Toast/Toast'
export { ShoppingBill } from './Components/ShoppingBill/ShoppingBill'
export { WishlistProductCard } from './Components/WishlistProductCard/WishlistProductCard'
export { ProductOrderCard } from './Components/ProductOrderCard/ProductOrderCard'
export { Pagination } from './Components/Pagination/Pagination'
export { AdminRoute } from './Components/AdminRoute'
export { ChatbotWidget } from './Components/ChatbotWidget/ChatbotWidget'

export { Home } from "./Pages/Home/Home"
export { Login } from "./Pages/AuthenticationPages/Login"
export { Signup } from "./Pages/AuthenticationPages/Signup"
export { ProductPage } from "./Pages/ProductPage/ProductPage"
export { Shop } from "./Pages/Shop/Shop"
export { Wishlist } from "./Pages/Wishlist/Wishlist"
export { Cart } from "./Pages/Cart/Cart"
export { Orders } from "./Pages/Orders/Orders"
export { Profile } from "./Pages/Profile/Profile"

// === THÊM 2 DÒNG EXPORT MỚI NÀY ===
export { VnPayReturn } from "./Pages/VnPayReturn/VnPayReturn";
export { Checkout } from "./Pages/Checkout/Checkout";
// === KẾT THÚC THÊM EXPORT ===

// --- Storage shim: prefer sessionStorage for auth keys so each tab can have independent sessions.
// This makes calls to localStorage.getItem('token') return sessionStorage value first.
// We also expose original localStorage functions on window so code can explicitly persist to localStorage
// (used for "remember me" behaviour).
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const originalLocalGet = window.localStorage.getItem.bind(window.localStorage)
    const originalLocalSet = window.localStorage.setItem.bind(window.localStorage)
    const originalLocalRemove = window.localStorage.removeItem.bind(window.localStorage)

    // expose originals for explicit persistence
    window.__origLocalGet = originalLocalGet
    window.__origLocalSet = originalLocalSet
    window.__origLocalRemove = originalLocalRemove

    const authKeys = ['token', 'userRole', 'userInfo']

    window.localStorage.getItem = function (key) {
      if (authKeys.includes(key)) {
        const fromSession = sessionStorage.getItem(key)
        if (fromSession !== null && fromSession !== undefined) return fromSession
        return originalLocalGet(key)
      }
      return originalLocalGet(key)
    }

    window.localStorage.setItem = function (key, value) {
      if (authKeys.includes(key)) {
        // default: write to sessionStorage to make auth per-tab
        sessionStorage.setItem(key, value)
        return
      }
      return originalLocalSet(key, value)
    }

    window.localStorage.removeItem = function (key) {
      if (authKeys.includes(key)) {
        sessionStorage.removeItem(key)
        try { originalLocalRemove(key) } catch (e) {}
        return
      }
      return originalLocalRemove(key)
    }
  } catch (e) {
    // ignore in environments where localStorage is not writable
    console.warn('Storage shim not applied', e)
  }
}

// Global message listener: respond to token requests from same-origin child windows.
// Child windows can `postMessage({type: 'REQUEST_TOKEN'}, origin)` to ask for the current
// auth token. We reply with `{type: 'TOKEN', token}`. This allows newly opened tabs
// (which intentionally use `sessionStorage` per-tab) to obtain the token from the
// opener tab when the user wants that UX (same-origin only).
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('message', (e) => {
    try {
      if (e.origin !== window.location.origin) return
      const data = e.data || {}
      if (data && data.type === 'REQUEST_TOKEN') {
        // Respect storage shim: localStorage.getItem will prefer sessionStorage for auth keys.
        const token = (window.localStorage && window.localStorage.getItem && window.localStorage.getItem('token')) || (window.__origLocalGet && window.__origLocalGet('token')) || null
        // Send token back to the requester (same origin)
        if (e.source && typeof e.source.postMessage === 'function') {
          e.source.postMessage({ type: 'TOKEN', token }, e.origin)
        }
      }
    } catch (err) {
      // swallow errors to avoid breaking app initialization
      // console.warn('token request handler error', err)
    }
  })
}
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <UserLoginContextProvider>
        <WishlistContextProvider>
          <CartContextProvider>
            <ToastContextProvider>
              {/* DÒNG NÀY ĐÃ BỊ XÓA: <NewArrivalsProvider> */}
                <GenreProvider>
                  <ProductsProvider>
                    <OrdersContextProvider>
                      <SearchBarContextProvider>
                        <App/>
                      </SearchBarContextProvider>
                    </OrdersContextProvider>
                  </ProductsProvider>
                </GenreProvider>
              {/* DÒNG NÀY ĐÃ BỊ XÓA: </NewArrivalsProvider> */}
            </ToastContextProvider>
          </CartContextProvider>
        </WishlistContextProvider>
      </UserLoginContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);