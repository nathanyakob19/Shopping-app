import React, { useEffect, useState } from 'react';

const UserCartComponent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // Store image URLs by item ID
  const [hover, setHover] = useState(false);


  // Fetch cart items from backend
  const fetchCartItems = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please log in to add items to your cart.');
      return;
    }

    const user = JSON.parse(storedUser);
    const user_id = user.id;

    try {
      const response = await fetch(`http://localhost:5000/get-cart/${user_id}`);
      const data = await response.json();
      console.log('Fetched cart data:', data);

      if (data.cart && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  // Fetch image for an individual cart item
  const fetchCartItemImage = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/get-cart-image/${itemId}`);
      if (!response.ok) return;

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageUrls((prev) => ({ ...prev, [itemId]: imageUrl }));
    } catch (error) {
      console.error(`Error fetching image for item ${itemId}:`, error);
    }
  };

  // Delete cart item by id
  const deleteCartItem = async (cartItemId) => {
    try {
      const response = await fetch(`http://localhost:5000/delete-cart/${cartItemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
      } else {
        console.error('Failed to delete cart item');
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  // Initial fetch
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Fetch all images once cart items are loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  cartItems.forEach((item) => {
    if (!imageUrls[item.id]) {
      fetchCartItemImage(item.id);
    }
  });
}, [cartItems]);


  return (
    <div style={{ marginTop: '30px', borderTop: '2px solid black', paddingTop: '20px' , paddingLeft:"10px"}}>
      <h2>Your Cart</h2>
      {Array.isArray(cartItems) && cartItems.length > 0 ? (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                alignItems: 'center',
                border: '1px solid #ccc',
                padding: '10px',
                paddingRight:'20px',
                paddingLeft:'50px'
            
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={imageUrls[item.id]}
                  alt="product"
                  width="60"
                  height="60"
                  style={{ marginRight: '10px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <strong>{item.product?.name || 'Unknown Product'}</strong>
                  {item.size && <span> | Size: {item.size}</span>}
                  <div>Quantity: {item.quantity}</div>
                </div>
              </div>
              <div>
                <span style={{ marginRight: '15px' }}>₹{item.product.price * item.quantity}</span>
                <button onClick={() => deleteCartItem(item.id)} style={{
    background: hover ? 'red' : 'black',
    color: 'white'
  }}
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
>Remove</button>
              </div>
            </div>
          ))}
          <h3>Total: ₹{calculateTotal()}</h3>
        </div>
      ) : (
        <p>Cart is empty</p>
      )}
    </div>
  );


}
export default UserCartComponent;
