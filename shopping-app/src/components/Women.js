import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductDetail from "./ProductDetails";

const Women = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Fetch products for MEN category
  useEffect(() => {
    fetch("http://localhost:5000/WOMEN")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching by category:", err));
  }, []);

  const handleImageClick = () => {
    navigate("/WomenTshirt"); // Navigate to login page
  };
  const handleImageClick1 = () => {
    navigate("/WomenHoddie"); // Navigate to login page
  };
 const handleImageClick2 = () => {
    navigate("/Women1Piece"); // Navigate to login page
  };
  const handleImageClick3 = () => {
    navigate("/WomenSkirt"); // Navigate to login page
  };
  return (
    <div style={{margin:"60px"}}>
      <img
        src="/Tshirt.png"
        alt="HTC Product"
        style={{ width: "100px", cursor: "pointer" }}
        onClick={handleImageClick}
      />
       <img
        src="/pngegg (1).png"
        alt="shirt Product"
        style={{ width: "150px", cursor: "pointer" }}
        onClick={handleImageClick1}
      />
      <img
        src="/pngegg (2).png"
        alt="shirt Product"
        style={{ width: "60px", cursor: "pointer" }}
        onClick={handleImageClick2}
      />
      <img
        src="/pngegg (3).png"
        alt="shirt Product"
        style={{ width: "100px", cursor: "pointer" }}
        onClick={handleImageClick3}
      />
      <div>
        <h2 style={{textAlign:"center", margin:"70px"}}>Women's Products</h2>
        <div style={styles.grid}>
          {products.map((product) => (
            <div
            key={product.id}
            style={styles.card}
            onClick={() => navigate(`/ProductDetails/${product.id}`)} // Navigate on card click
          >
              {product.image ? (
                <img
                  src={`data:image/jpeg;base64,${product.image}`}
                  alt={product.name}
                  style={styles.image}
                />
              ) : (
                <p>No image available</p>
              )}
              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              <p>Color: {product.color}</p>
              <p>Gender: {product.gender}</p>
              <button
                onClick={() => navigate(`/ProductDetails/${product.id}`)}
                style={styles.button}
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '15px',
    width: '250px',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  background: 'rgba(0, 0, 0, 0.25)', // translucent blue
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  button: {
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  h2:{
    position: 'center',
  }
};

export default Women;
