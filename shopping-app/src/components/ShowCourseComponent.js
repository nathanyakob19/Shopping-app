import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductDetail from './ProductDetails';

const ShowCourseComponent = ({ addCourseToCartFunction, searchCourse = '' }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ needed for navigation on card click

  useEffect(() => {
    fetch('http://localhost:5000/all-products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchCourse.toLowerCase())
  );

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      
      {/* Optional Video Banner */}
      <div className="w-full h-[300px] p-0 m-0 overflow-hidden relative">
        <video
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            justifyContent:"flex-end",
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            display: 'flex',
          }}
        />
      </div>

      <h2>Available Products</h2>
      

      {filteredCourses.length === 0 ? (
        <p>No products match your search.</p>
      ) : (
        <div style={styles.grid}>
          {filteredCourses.map(course => (
            <div
              key={course.id}
              style={styles.card}
              onClick={() => navigate(`/product/${course.id}`)} // ✅ navigate on card click
            >
              <img
                src={course.image ? `data:image/jpeg;base64,${course.image}` : '/default.jpg'}
                alt={course.name}
                style={styles.image}
              />
              <h3>{course.name}</h3>
              <p><strong>Price:</strong> ₹{course.price}</p>
              <p><strong>Type:</strong> {course.type}</p>
              <p><strong>Color:</strong> {course.color}</p>
              <p><strong>Gender:</strong> {course.gender}</p>
              <p><strong>Sizes:</strong> {Array.isArray(course.sizes) ? course.sizes.join(', ') : 'N/A'}</p>
              <button
                onClick={(e) => {
                  <ProductDetail/>
                }}
                style={styles.button}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
    
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  grid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
      
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
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default ShowCourseComponent;
