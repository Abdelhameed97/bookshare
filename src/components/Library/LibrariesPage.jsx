import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  MapPin, 
  Star, 
  Search,
  Building2,
  Eye
} from 'lucide-react';
import apiService from '../../services/api';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import useAuth from '../../hooks/useAuth';
import '../../style/LibrariesPage.css';

const LibrariesPage = () => {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      
      const librariesResponse = await apiService.get('/libraries');
      const owners = librariesResponse.data.data;
      
      const booksResponse = await apiService.get('/books');
      const allBooks = booksResponse.data.data;
      
      const librariesData = owners.map(owner => {
        const ownerBooks = allBooks.filter(book => book.user_id === owner.id);
        const totalBooks = ownerBooks.length;
        const totalRating = ownerBooks.reduce((sum, book) => {
          return sum + (book.ratings?.reduce((acc, rating) => acc + rating.rating, 0) || 0);
        }, 0);
        const totalReviews = ownerBooks.reduce((sum, book) => {
          return sum + (book.ratings?.length || 0);
        }, 0);
        const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
        
        return {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone_number,
          address: owner.location,
          bio: owner.bio,
          totalBooks,
          avgRating,
          totalReviews,
          books: ownerBooks.slice(0, 3),
          image: ownerBooks[0]?.images?.[0] 
            ? ownerBooks[0].images[0].startsWith('http') 
              ? ownerBooks[0].images[0] 
              : `http://localhost:8000/storage/${ownerBooks[0].images[0]}`
            : '/placeholder.svg'
        };
      });
      
      setLibraries(librariesData);
    } catch (error) {
      console.error('Error fetching libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminViewBooks = (libraryId) => {
    navigate(`/admin/books?user_id=${libraryId}`);
  };

  const filteredLibraries = libraries.filter(library => {
    const matchesSearch = library.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         library.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="libraries-loading">
          <div className="loading-spinner"></div>
          <p>Loading libraries...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="libraries-page">
        <div className="libraries-header">
          <div className="header-content">
            <h1>Discover Libraries</h1>
            <p>Explore amazing book collections from library owners around the world</p>
          </div>
        </div>

        <div className="libraries-container">
          <div className="search-filter-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search libraries by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="libraries-grid">
            {filteredLibraries.length > 0 ? (
              filteredLibraries.map((library) => (
                <div key={library.id} className="library-card">
                  <div className="library-header">
                    <div className="library-image">
                      <img 
                        src={library.image} 
                        alt={library.name}
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    </div>
                    <div className="library-info">
                      <h3>{library.name}</h3>
                      {library.address && (
                        <div className="library-location">
                          <MapPin size={16} />
                          <span>{library.address}</span>
                        </div>
                      )}
                      <div className="library-stats">
                        <div className="stat">
                          <BookOpen size={16} />
                          <span>{library.totalBooks} books</span>
                        </div>
                        <div className="stat">
                          <Star size={16} fill="#fbbf24" />
                          <span>{library.avgRating} ({library.totalReviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {library.bio && <div className="library-bio"><p>{library.bio}</p></div>}

                  {library.books.length > 0 && (
                    <div className="library-books">
                      <h4>Featured Books ({library.totalBooks} total)</h4>
                      <div className="books-count">
                        <BookOpen size={20} />
                        <span>{library.totalBooks} books available</span>
                      </div>
                    </div>
                  )}

                  <div className="library-actions">
                    <Link to={`/library/${library.id}`} className="btn-view-library">
                      View Library
                    </Link>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleAdminViewBooks(library.id)} 
                        className="btn-view-library admin"
                        title="Admin: View all books"
                      >
                        <Eye size={16} />
                        Admin View Books
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-libraries">
                <Building2 size={64} />
                <h3>No libraries found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibrariesPage; 