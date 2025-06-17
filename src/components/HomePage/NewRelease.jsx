import React from 'react';
import { FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';
import '../../style/Homepagestyle.css'; // تأكد من أن المسار صحيح
import book1 from '../../images/download.jpeg'; // مسار صورة الكتاب 1
import book2 from '../../images/download.jpeg'; // مسار صورة الكتاب 2
import book3 from '../../images/download.jpeg'; // مسار صورة الكتاب 3

const NewReleases = () => {
  return (
    <section className="new-releases">
      <div className="section-header">
        <h2>New Release</h2>
      </div>
      
      <div className="books-grid">
        {/* Book 1 */}
        <div className="book-card">
          <div className="book-image-container">
            <img src={book1} alt="You Are Your Only Limit" className="book-image" />
            <div className="hover-icons">
              <button className="icon-button"><FaHeart /></button>
              <button className="icon-button"><FaEye /></button>
              <button className="icon-button"><FaShoppingCart /></button>
            </div>
          </div>
          <div className="price">$12.00</div>
          <h3 className="title">You Are Your Only Limit</h3>
          <p className="author">By John Nathan Muller</p>
          <button className="add-to-cart">Add to Cart</button>
        </div>

        {/* Book 2 */}
        <div className="book-card">
          <div className="book-image-container">
            <img src={book2} alt="10! Essays That Will Change The Way Your Thinks" className="book-image" />
            <div className="hover-icons">
              <button className="icon-button"><FaHeart /></button>
              <button className="icon-button"><FaEye /></button>
              <button className="icon-button"><FaShoppingCart /></button>
            </div>
          </div>
          <div className="price">
            <span className="original-price">$12.00</span> $8.00
          </div>
          <h3 className="title">10! Essays That Will Change The Way Your Thinks</h3>
          <p className="author">By John Nathan Muller</p>
          <button className="add-to-cart">Add to Cart</button>
        </div>

        {/* Book 3 */}
        <div className="book-card">
          <div className="book-image-container">
            <img src={book3} alt="Your Soul Is A River" className="book-image" />
            <div className="hover-icons">
              <button className="icon-button"><FaHeart /></button>
              <button className="icon-button"><FaEye /></button>
              <button className="icon-button"><FaShoppingCart /></button>
            </div>
          </div>
          <div className="price">$12.00</div>
          <h3 className="title">Your Soul Is A River</h3>
          <p className="author">By John Nathan Muller</p>
          <button className="add-to-cart">Add to Cart</button>
        </div>
      </div>
    </section>
  );
};

export default NewReleases;