import React from 'react';
import blog1 from '../../images/midsection-man-working-office_1048944-27784392.avif'
import blog2 from '../../images/what-we-do.jpg';
import blog3 from '../../images/business-brainstorming-graph-chart-report-data-concept_53876-31213.avif';
import '../../style/Homepagestyle.css'; // Ensure the path is correct


const BlogSection = () => {
  return (
    <section className="blog-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">BLOG</span>
          <h2 className="section-title">Recent Blog</h2>
        </div>

        <div className="blog-grid">
          {/* Blog Post 1 */}
          <div className="blog-card">
            <div className="blog-image-container">
              <img src={blog1} alt="New Friends With Books" className="blog-image" />
              <div className="date-badge">
                <span className="month">MAY</span>
                <span className="year">2025</span>
              </div>
            </div>
            <div className="blog-content">
              <h3 className="blog-title">New Friends With Books</h3>
              <p className="blog-excerpt">
                A small river named Duden flows by their place and supplies it with the necessary regelialia.
              </p>
            </div>
          </div>

          {/* Blog Post 2 */}
          <div className="blog-card">
            <div className="blog-image-container">
              <img src={blog2} alt="New Friends With Books" className="blog-image" />
              <div className="date-badge">
                <span className="month">MAY</span>
                <span className="year">2025</span>
              </div>
            </div>
            <div className="blog-content">
              <h3 className="blog-title">New Friends With Books</h3>
              <p className="blog-excerpt">
                A small river named Duden flows by their place and supplies it with the necessary regelialia.
              </p>
            </div>
          </div>

          {/* Blog Post 3 */}
          <div className="blog-card">
            <div className="blog-image-container">
              <img src={blog3} alt="New Friends With Books" className="blog-image" />
              <div className="date-badge">
                <span className="month">MAY</span>
                <span className="year">2025</span>
              </div>
            </div>
            <div className="blog-content">
              <h3 className="blog-title">New Friends With Books</h3>
              <p className="blog-excerpt">
                A small river named Duden flows by their place and supplies it with the necessary regelialia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;