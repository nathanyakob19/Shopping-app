import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SearchComponent from './components/SearchComponent';
import ShowCourseComponent from './components/ShowCourseComponent';
import UserCartComponent from './components/UserCartComponent';
import ImageUpload from './components/ImageUpload';
import ProductDetail from './components/ProductDetails';  // <-- Import here
import { FaShoppingCart, FaUpload, FaBars } from 'react-icons/fa';
import Login from './components/Login';
import AIChatStylist from './components/AIchatstylish';
import men from './components/MEN.JS';

// Suppose you have this addCourseToCartFunction defined somewhere

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchCourse, setSearchCourse] = useState('');
  const [cartCourses, setCartCourses] = useState([]);
  
  // New state for selected product details
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleLoginSuccess = () => setIsLoggedIn(true);

  const addCourseToCartFunction = (course) => {
    const alreadyInCart = cartCourses.find(item => item.product.id === course.id);
    if (alreadyInCart) {
      setCartCourses(cartCourses.map(item =>
        item.product.id === course.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartCourses([...cartCourses, { product: course, quantity: 1 }]);
    }
  };

  const deleteCourseFromCartFunction = (course) => {
    setCartCourses(cartCourses.filter(item => item.product.id !== course.id));
  };

  const totalAmountCalculationFunction = () => {
    return cartCourses.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const courseSearchUserFunction = (event) => {
    setSearchCourse(event.target.value);
  };

  // New handler for product select
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Close product detail modal
  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <Router>
      <div className="App" style={{ display: 'flex', height: '100vh' }}>
        {!isLoggedIn ? (
          <Login onLogin={handleLoginSuccess} />
        ) : (
          <>
            <div
              style={{
                width: '200px',
                backgroundColor: '#4b0082',
                color: 'white',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
                zIndex: 1000,
                paddingTop: '60px',
              }}
            >
              <Link to="/home" style={sidebarItemStyle}>Home</Link>
              <Link to="/AI" style={sidebarItemStyle}>Products</Link>
              <Link to="/upload" style={sidebarItemStyle}><FaUpload /> Upload</Link>
              <div style={sidebarItemStyle} onClick={() => setIsLoggedIn(false)}>Logout</div>
            </div>

            <div style={{ flex: 1, marginLeft: sidebarOpen ? '200px' : '0', transition: 'margin-left 0.3s ease-in-out', width: '100%' }}>
              <nav style={navStyle}>
                <button onClick={() => setSidebarOpen(prev => !prev)} style={navButtonStyle}>
                  <FaBars />
                </button>

                <button onClick={() => setShowCart(prev => !prev)} style={{ ...navButtonStyle, position: 'relative' }}>
                  <FaShoppingCart />
                  <span style={cartBadgeStyle}>{cartCourses.length}</span>
                </button>
              </nav>

              <SearchComponent
                searchCourse={searchCourse}
                courseSearchUserFunction={courseSearchUserFunction}
              />
             


              <Routes>
                <Route
                  path="/"
                  element={
                    <ShowCourseComponent
                      addCourseToCartFunction={addCourseToCartFunction}
                      searchCourse={searchCourse}
                      onProductSelect={handleProductSelect}  // Pass handler here
                    />
                  }
                />
                  <Route path='/cart'
                  
                  element={
                <UserCartComponent
                  cartCourses={cartCourses}
                  deleteCourseFromCartFunction={deleteCourseFromCartFunction}
                  totalAmountCalculationFunction={totalAmountCalculationFunction}
                />}
              />
                <Route
                  path="/home"
                  element={
                    <ShowCourseComponent
                      addCourseToCartFunction={addCourseToCartFunction}
                      searchCourse={searchCourse}
                      onProductSelect={handleProductSelect}  // Pass handler here
                    />
                  }
                  />
                  <Route path="/AI" element={<AIChatStylist />} />
                  <Route path="/upload" element={<ImageUpload />} />
                  <Route path="/product/:id" element={
            <ProductDetail addCourseToCartFunction={addCourseToCartFunction} />

        } />
            <Route path='/MEN' element={<men/>}/>
              </Routes>

              {/* Product Detail Modal */}
              {selectedProduct && (
                <ProductDetail product={selectedProduct} onClose={closeProductDetail} />
              )}
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

// Styles (unchanged)
const sidebarItemStyle = {
  padding: '15px 20px',
  cursor: 'pointer',
  borderBottom: '1px solid #666',
  textDecoration: 'none',
  color: 'white',
  display: 'block'
};

const navStyle = {
  background: 'purple',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '10px 20px'
};

const navButtonStyle = {
  backgroundColor: 'transparent',
  color: 'white',
  padding: '8px',
  fontSize: '20px',
  border: 'none',
  cursor: 'pointer',
  marginLeft: '15px'
};

const cartBadgeStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '12px'
};

export default App;
