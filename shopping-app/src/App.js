import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaShoppingCart,
  FaUpload,
  FaSearch,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';


import Login from './components/Login';
import ShowCourseComponent from './components/ShowCourseComponent';
import UserCartComponent from './components/UserCartComponent';
import ImageUpload from './components/ImageUpload';
import ProductDetail from './components/ProductDetails';
import SearchPage from './components/SearchComponent';

import Men from './components/Men';
import MenTshirt from './components/MenTshirt';
import Menshirt from './components/MenShirt';
import MenJackets from './components/MenJacket';
import MenPants from './components/MenPants';
import Women from './components/Women';
import Women1Piece from './components/Women1Piece';
import WomenSkirt from './components/WomenSkirt';
import WomenTshirt from './components/WomenTshirt';
import WomenHoddie from './components/WomenHoddie';

import LiquidChrome from './LiquidChrome';

function App() {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchCourse, setSearchCourse] = useState('');
  const [cartCourses, setCartCourses] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser !== null;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // Optional but explicit
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUser(null);
  };
  const handleSearchBarClick = () => {
    navigate('/search');
  };

  const addCourseToCartFunction = async (productWithSelection) => {
    const { id: product_id, selectedSize, quantity } = productWithSelection;
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      alert('Please log in to add items to your cart.');
      return;
    }

    const user = JSON.parse(storedUser);
    const user_id = user.id;

    try {
      const response = await fetch('http://localhost:5000/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          product_id,
          size: selectedSize,
          quantity
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add to cart');
      }
      alert('Added to cart!');
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteCourseFromCartFunction = (course) => {
    setCartCourses(cartCourses.filter(item => item.product.id !== course.id));
  };

  const totalAmountCalculationFunction = () => {
    return cartCourses.reduce((total, item) =>
      total + (item.product.price || 0) * item.quantity, 0);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const topNavHeight = '60px';
  const sidebarWidth = '200px';
  const totalItemsInCart = cartCourses.reduce((sum, item) => sum + item.quantity, 0);

  const handleSidebarLinkClick = () => setSidebarOpen(false);

return (
  <>
  
   <div
  style={{
    position: 'fixed',
    inset: 0, // shorthand for top, right, bottom, left = 0
    zIndex: -1,
    pointerEvents: 'none',
    overflow: 'hidden',
  }}
>
  
</div>

    <div
    className="App" style={{ position: 'relative', zIndex: 1, 
  fontfamily: 'Lily Script One', color:"", fontSize:"20px"

 }}>
  
      {!isLoggedIn ? (
        <Login onLogin={handleLoginSuccess} />
      ) : (
        <>
          {/* Top Navbar */}
          <nav style={navStyle}>
            <h1 style={{ color: 'black', fontSize: '30px'  ,  fontFamily: 'New Rocker',
  fontweight: 800,
  fontstyle: "normal " }}>SHOPPING</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                style={{ ...navButtonStyle, background: 'none', border: 'none' }}
              >
                <FaBars />
              </button>
              <Link to="/search" style={navButtonStyle}>
                <FaSearch />
              </Link>
              <Link to="/cart" style={{ ...navButtonStyle, position: 'relative' }}>
                <FaShoppingCart />
                {totalItemsInCart > 0 && <span style={cartBadgeStyle}>{totalItemsInCart}</span>}
              </Link>
            </div>
          </nav>

          {/* Secondary Navbar */}


          {/* Sidebar */}
          <div
  style={{
    borderRadius: '12px',
    marginLeft: '8px',
    marginTop: '20px',
    padding: '1rem',
    height: isDropdownOpen ? '500px' : '300px', // ⬅️ Expanded when dropdown is open
    width: sidebarWidth,
    background: 'rgba(0, 123, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'white',
    position: 'fixed',
    top: '95px',
    left: sidebarOpen ? '30px' : `-${parseInt(sidebarWidth) + 30}px`,
    transition: 'left 0.3s ease-in-out, height 0.3s ease-in-out', // ⬅️ Animate height
    zIndex: 998,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }}
>


          
            
            <Link to="/home" style={sidebarItemStyle} onClick={handleSidebarLinkClick}>
              Home
            </Link>
            <hr style={{ borderColor: 'rgb(0, 0, 0)', margin: '0 10px' }} />
            
            <Link to="/upload" style={sidebarItemStyle} onClick={handleSidebarLinkClick}>
              <FaUpload /> Upload
            </Link>
            <hr style={{ borderColor: 'rgb(0, 0, 0)', margin: '0 10px' }} />
          <div style={{ position: 'relative' }}>
        <button
  onClick={() => {
    setSidebarOpen(true);  // 👈 Open the sidebar
    toggleDropdown();      // 👈 Toggle the dropdown as before
  }}
  style={{
    ...navButtonStyle,
    background: "none",
    border: "none",
    fontSize: "clamp(2rem, 1vw, 3rem)",
    whiteSpace: "nowrap",
    fontWeight: 200,
    color: "black",
  }}
>
  Categories
</button>

          {isDropdownOpen && (
            
            <div style={{dropdownStyle ,background:"none", color:'black',  fontSize: "clamp(2rem, 1vw, 1rem)",}}>
              <a href="/men" style={dropdownItemStyle}>Men</a>
              <hr style={{ borderColor: 'rgb(0, 0, 0)', margin: '0 10px' }} />
              <a href="/women" style={dropdownItemStyle}>Women</a>
              <hr style={{ borderColor: 'rgb(0, 0, 0)', margin: '0 10px' }} />
              <a href="/kids" style={dropdownItemStyle}>Kids</a>
              
            </div>
          )}
        </div><hr style={{ borderColor: 'rgb(0, 0, 0)', margin: '0 10px' }} />
            <div
              style={sidebarItemStyle}
              onClick={() => {
                setIsLoggedIn(false);
                setSidebarOpen(false);
              }}
            >
              Logout
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 0,
              overflowY: 'auto',
              padding: '20px',
              paddingLeft: sidebarOpen ? sidebarWidth : '0',
              transition: 'padding-left 0.3s ease-in-out',
            }}
          >
<LiquidChrome></LiquidChrome>  <Routes>
              <Route
                path="/"
                element={
                  <ShowCourseComponent
                    addCourseToCartFunction={addCourseToCartFunction}
                    searchCourse={searchCourse}
                    onProductSelect={handleProductSelect}
                  />

                }
              />
              
              <Route
                path="/home"
                element={
                  <ShowCourseComponent
                    addCourseToCartFunction={addCourseToCartFunction}
                    searchCourse={searchCourse}
                    onProductSelect={handleProductSelect}
                  />
                }
              />
              <Route
                path="/cart"
                element={
                  <UserCartComponent
                    cartCourses={cartCourses}
                    deleteCourseFromCartFunction={deleteCourseFromCartFunction}
                    totalAmountCalculationFunction={totalAmountCalculationFunction}
                  />
                }
              />
              
              <Route path="/upload" element={<ImageUpload />} />
              <Route
                path="/product/:id"
                element={<ProductDetail addCourseToCartFunction={addCourseToCartFunction} />}
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/ProductDetails/:id" element={<ProductDetail addCourseToCartFunction={addCourseToCartFunction} />} />

              <Route path="/men" element={<Men />} />
              <Route path="/MenTshirt" element={<MenTshirt />} />
              <Route path="/Menshirt" element={<Menshirt />} />
              <Route path="/MenJacket" element={<MenJackets />} />
              <Route path="/MenPants" element={<MenPants />} />
              <Route path="/Women" element={<Women />} />
              <Route path="/WomenTshirt" element={<WomenTshirt />} />
              <Route path="/WomenSkirt" element={<WomenSkirt />} />
              <Route path="/WomenHoddie" element={<WomenHoddie />} />
              <Route path="/Women1Piece" element={<Women1Piece />} />
            </Routes>
    
            {selectedProduct && (
              <ProductDetail product={selectedProduct} onClose={closeProductDetail} />
            )}
          </div>
          <footer style={{background:"rgba(18, 179, 72, 0.3)",padding: "10px 20px", textDecoration:"none"}}>
            <h1 style={{textAlign: 'center'}}> &copy; SITECRAFTERZ</h1>
           <a href="https://www.instagram.com/sitecrafterz/" target="_blank" rel="noopener noreferrer">
  <FaInstagram style={{ fontSize: "50px", color: "#E1306C", marginRight: "10px" }} />
</a>

<a href="https://www.youtube.com/channel/UCWJBjPbUs4rJS5c6W9OpOnw" target="_blank" rel="noopener noreferrer">
  <FaYoutube style={{ fontSize: "50px", color: "#FF0000" }} />

</a>
    <div style={{ textAlign: 'right', padding: '1rem' }}>
    <div style={{ display: 'inline-block', textAlign: 'right' }}>
      <Link to="/home" style={sidebarItemStyle} onClick={handleSidebarLinkClick}>
        Home
      </Link>
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />

      <Link to="/AI" style={sidebarItemStyle} onClick={handleSidebarLinkClick}>
        Products
      </Link>
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />

      <Link to="/upload" style={sidebarItemStyle} onClick={handleSidebarLinkClick}>
        <FaUpload /> Upload
      </Link>
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
    </div>
  </div>
          </footer>
        </>
        
      )}
    </div>
    

  </>

);

}
// Styles
const navStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: '1200px',
  height: '64px',
  background: 'rgba(0, 123, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.5rem',
  zIndex: 1000,
  color: 'white',
  
};
const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  background: 'rgba(76, 109, 151, 0.44)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  borderRadius: '8px',
  marginTop: '8px',
  overflow: 'hidden',
  zIndex: 1001,
   fontSize: 'clamp(2rem, 1vw, 8rem)',  // ✅ corrected
  whiteSpace: 'nowrap',               // ✅ corrected
  fontWeight: 200,  
    borderBottom: '6px solid rgba(255, 255, 255, 0.2)',
};

const dropdownItemStyle = {
  display: 'block',
  padding: '10px 20px',
  color: 'black',
  fontWeight:"",
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};
const navButtonStyle = {
  marginLeft: '10px',
  color: 'black',
  textDecoration: 'none',
  fontSize: '18px',
};

const cartBadgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-10px',
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '12px'
};

const sidebarItemStyle = {
  display: 'block',
  padding: '10px 20px',
  color: 'white',
  textDecoration: 'none',
  fontSize: 'clamp(2rem, 1vw, 5rem)',  // ✅ corrected
  whiteSpace: 'nowrap',               // ✅ corrected
  fontWeight: 500,   
  color:'black',                 // ✅ corrected
};

export default App;
