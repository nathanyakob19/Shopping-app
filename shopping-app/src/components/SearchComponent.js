import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';




const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5000/search-products?q=${query}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div style={{textAlign:"center", margin:"70px"}}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '80%', padding: '10px', fontSize: '16px' }}
      />
      <div style={{ marginTop: 20 }}>
        {results.length === 0 ? (
          <p>No results found</p>
        ) : (
          results.map((product) => (
            <div key={product.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              <button onClick={() => navigate(`/product/${product.id}`)}>View Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
