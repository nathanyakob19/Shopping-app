import React, { useState, useEffect } from 'react';

function ImageUpload() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(null); // for update
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState('');
  const [type_, setType] = useState('');
  const [description, setdescription] = useState('');
  const [image, setImage] = useState(null);

  // Unified fetch
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/all-products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setProductId(product.id);
    setName(product.name);
    setPrice(product.price);
    setColor(product.color);
    setGender(product.gender);
    setType(product.type);
    setdescription(product.description);
    setSize(product.sizes ? product.sizes.join(', ') : '');
    setImage(null); // Don't preload image
  };

  const resetForm = () => {
    setProductId(null);
    setName('');
    setPrice('');
    setSize('');
    setColor('');
    setGender('');
    setType('');
    setdescription('');
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('color', color);
    formData.append('gender', gender);
    formData.append('type', type_);
    formData.append('description', description);
    size.split(',').map(s => s.trim().toUpperCase()).forEach(s => {
      formData.append('sizes', s);
    });
    if (image) {
      formData.append('image', image);
    }

    const url = productId
      ? `http://localhost:5000/update-product/${productId}`
      : 'http://localhost:5000/add-product';

    const method = productId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) throw new Error('Failed');

      alert(productId ? 'Product updated!' : 'Product uploaded!');
      resetForm();
      await fetchProducts(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Failed to upload/update product.');
    }
  };
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`http://localhost:5000/delete-product/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error("Failed to delete");

    alert("Product deleted!");
    await fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to delete product.");
  }
};


  return (
    <div>
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={styles.form}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={styles.input} />
        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Size (comma separated like: S, M, L)" value={size} onChange={e => setSize(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Color" value={color} onChange={e => setColor(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Type" value={type_} onChange={e => setType(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Description" value={description} onChange={e => setdescription(e.target.value)} required style={styles.input} />
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={styles.input} />
        {productId && image === null && (
          <p style={{ fontSize: '14px', color: 'gray' }}>(Previous image will be kept unless a new one is selected)</p>
        )}

        <button type="submit" style={styles.button}>
          {productId ? 'Update' : 'Upload'}
        </button>
        {productId && (
          <button type="button" onClick={resetForm} style={{ ...styles.button, backgroundColor: '#bbb' }}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2 style={{ textAlign: 'center' }}>Product List</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Color</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Gender</th>
             
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id}>
              <td style={styles.td}>{prod.name}</td>
              <td style={styles.td}>{prod.price}</td>
              <td style={styles.td}>{prod.color}</td>
               <td style={styles.td}>{prod.type}</td>
              <td style={styles.td}>{prod.gender}</td>
             <td style={styles.td}>
  <button onClick={() => handleEdit(prod)} style={styles.editButton}>Edit</button>
  <button onClick={() => handleDelete(prod.id)} style={styles.deleteButton}>Delete</button>

   
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  form: {
    maxWidth: '500px',
    margin: 'auto',
    padding: '50px',
   background: 'rgba(0, 0, 0, 0.25)', // translucent blue
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
   
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#6200ea',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  editButton: {
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#03a9f4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px'
  },
  table: {
    background: 'rgba(0, 0, 0, 0.25)', // translucent blue
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
   
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '30px',
    border: '1px solid #ccc'
  },
  th: {
    border: '1px solid #ccc',
    backgroundColor: '#eee',
    padding: '8px',
    textAlign: 'center'
  },
  td: {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'center'
  },
  deleteButton: {
  padding: '6px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  backgroundColor: '#e53935',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  marginLeft: '10px'
}

};

export default ImageUpload;
