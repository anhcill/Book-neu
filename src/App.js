import './i18n';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { 
  Navbar, 
  Toast,
  Home,
  Shop, 
  ProductPage,
  Login,
  Signup,
  Wishlist,
  Cart,
  Orders,
  VnPayReturn,
  Checkout,
  AdminRoute,
  ChatbotWidget,
  Profile
} from "./index"
import AdminDashboard from './Pages/Admin/AdminDashboard'
import ProductManager from './Pages/Admin/ProductManager'
import ProductEditor from './Pages/Admin/ProductEditor'
import OrderManager from './Pages/Admin/OrderManager'
import UserManagement from './Pages/Admin/UserManagement'
import Analytics from './Pages/Admin/Analytics'
import CouponManager from './Pages/Admin/CouponManager'
import InventoryManager from './Pages/Admin/InventoryManager'
import StripeDebug from './Pages/StripeDebug/StripeDebug'
import VNPayDebug from './Pages/VNPayDebug/VNPayDebug'

// Informational pages added from Footer
import Contact from './Pages/Contact/Contact'
import About from './Pages/About/About'
import FAQ from './Pages/FAQ/FAQ'
import Careers from './Pages/Careers/Careers'
import GiftCards from './Pages/GiftCards/GiftCards'
import OrderTracking from './Pages/OrderTracking/OrderTracking'
import DeliveryHistory from './Pages/DeliveryHistory/DeliveryHistory'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Routes>
          {/* === USER ROUTES === */}
          <Route path="/"         exact element={<Home/>} />
          <Route path="/shop"     exact element={<Shop/>} />
          <Route path="/shop/:id"       element={<ProductPage/>} />
          <Route path="/login"          element={<Login/>} />
          <Route path="/signup"         element={<Signup/>} />
          <Route path="/profile"        element={<Profile/>} />
          <Route path="/wishlist"       element={<Wishlist/>} />
          <Route path="/cart"           element={<Cart/>} />
          <Route path="/orders"         element={<Orders/>} />
          <Route path="/checkout"           element={<Checkout/>} />
          <Route path="/orders/vnpay_return" element={<VnPayReturn/>} />
          {/* Route mới cho VNPay return đơn giản hơn */}
          <Route path="/vnpay_return" element={<VnPayReturn/>} />

          {/* === INFO PAGES === */}
          <Route path="/contact" element={<Contact/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/faq" element={<FAQ/>} />
          <Route path="/careers" element={<Careers/>} />
          <Route path="/gift-cards" element={<GiftCards/>} />
          <Route path="/order-tracking" element={<OrderTracking/>} />
          <Route path="/delivery-history" element={<DeliveryHistory/>} />
          
          {/* === DEBUG TOOL === */}
          <Route path="/stripe-debug" element={<StripeDebug/>} />
          <Route path="/vnpay-debug" element={<VNPayDebug/>} />

          {/* === ADMIN ROUTES (Protected) === */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductManager />} />
          <Route path="/admin/products/new" element={<ProductEditor />} />
          <Route path="/admin/products/:productId/edit" element={<ProductEditor />} />
          <Route path="/admin/orders" element={<OrderManager />} />
          <Route path="/admin/orders/:orderId" element={<OrderManager />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/coupons" element={<CouponManager />} />
          <Route path="/admin/inventory" element={<InventoryManager />} />

        </Routes>
        <Toast position="bottom-right"/>
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;