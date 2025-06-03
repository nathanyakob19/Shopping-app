import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = ({ addCourseToCartFunction = () => {} }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        setError(null);
        setQuantity(1);
      } catch (err) {
        console.error(err);
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const fetchSizes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/product_sizes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch sizes');
        const sizesData = await res.json();
        setSizes(sizesData);
        setSelectedSize(sizesData.length > 0 ? sizesData[0] : null);
      } catch (err) {
        console.error(err);
        setSizes([]);
        setSelectedSize(null);
      }
    };

    fetchSizes();
  }, [product, id]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const incrementQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const decrementQuantity = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addCourseToCartFunction({ ...product, selectedSize, quantity });
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <p style={styles.center}></p>
      ) : error ? (
        <p style={styles.center}>{error}</p>
      ) : (
        <div style={styles.modal}>
          <button onClick={() => navigate(-1)} style={styles.closeBtn}>✕</button>
          <h2 style={styles.title}>{product.name}</h2>
          {product.image ? (
            <img
              src={`data:image/jpeg;base64,${product.image}`}
              alt={product.name}
              style={styles.image}
            />
          ) : (
            <p>No image available</p>
          )}
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Type:</strong> {product.type}</p>
          <p><strong>Color:</strong> {product.color}</p>
          <p><strong>Gender:</strong> {product.gender}</p>
          <p><strong>Sizes:</strong></p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: 10 }}>
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeClick(size)}
                  style={{
                    padding: '8px 16px',
                    border: selectedSize === size ? '2px solid blue' : '1px solid gray',
                    backgroundColor: selectedSize === size ? '#cceeff' : 'white',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                >
                  {size}
                </button>
              ))
            ) : (
              <span>N/A</span>
            )}
          </div>

          <p><strong>Quantity:</strong></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 10 }}>
            <button onClick={decrementQuantity} style={styles.qtyBtn}>-</button>
            <span>{quantity}</span>
            <button onClick={incrementQuantity} style={styles.qtyBtn}>+</button>
          </div>

          <p><strong>Description:</strong> {product.description}</p>

          <button
            onClick={handleAddToCart}
            style={styles.button}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  modal: {
    padding: '20px',
    maxWidth: '600px',
    margin: '20px auto',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.44)', // translucent blue
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)'
  },
  closeBtn: {
    position: 'absolute',
    right: '15px',
    top: '15px',
    background: '#e53935',
    color: '#fff',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    display: 'block',
    margin: '10px 0',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  qtyBtn: {
    padding: '4px 12px',
    fontSize: '18px',
    borderRadius: '6px',
    border: '1px solid gray',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  center: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
  }
};

export default ProductDetail;
