import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductDetail from "./ProductDetails";
const MenTshirt = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Fetch products for MEN category
  useEffect(() => {
    fetch("http://localhost:5000/MEN-TSHIRT")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching by category:", err));
  }, []);

  return (
    <div>
     
      <div>
        <h2 style={{textAlign:"center", margin:"70px"}}>Men's Products</h2>
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
  }
};

export default MenTshirt;
