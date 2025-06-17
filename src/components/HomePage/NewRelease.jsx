// import React from 'react';
// import { FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';
// import '../../style/Homepagestyle.css'; // تأكد من أن المسار صحيح
// import book1 from '../../images/download.jpeg'; // مسار صورة الكتاب 1
// import book2 from '../../images/download.jpeg'; // مسار صورة الكتاب 2
// import book3 from '../../images/download.jpeg'; // مسار صورة الكتاب 3

// const NewReleases = () => {
//   return (
//     <section className="new-releases">
//       <div className="section-header">
//         <h2>New Release</h2>
//       </div>
      
//       <div className="books-grid">
//         {/* Book 1 */}
//         <div className="book-card">
//           <div className="book-image-container">
//             <img src={book1} alt="You Are Your Only Limit" className="book-image" />
//             <div className="hover-icons">
//               <button className="icon-button"><FaHeart /></button>
//               <button className="icon-button"><FaEye /></button>
//               <button className="icon-button"><FaShoppingCart /></button>
//             </div>
//           </div>
//           <div className="price">$12.00</div>
//           <h3 className="title">You Are Your Only Limit</h3>
//           <p className="author">By John Nathan Muller</p>
//           <button className="add-to-cart">Add to Cart</button>
//         </div>

//         {/* Book 2 */}
//         <div className="book-card">
//           <div className="book-image-container">
//             <img src={book2} alt="10! Essays That Will Change The Way Your Thinks" className="book-image" />
//             <div className="hover-icons">
//               <button className="icon-button"><FaHeart /></button>
//               <button className="icon-button"><FaEye /></button>
//               <button className="icon-button"><FaShoppingCart /></button>
//             </div>
//           </div>
//           <div className="price">
//             <span className="original-price">$12.00</span> $8.00
//           </div>
//           <h3 className="title">10! Essays That Will Change The Way Your Thinks</h3>
//           <p className="author">By John Nathan Muller</p>
//           <button className="add-to-cart">Add to Cart</button>
//         </div>

//         {/* Book 3 */}
//         <div className="book-card">
//           <div className="book-image-container">
//             <img src={book3} alt="Your Soul Is A River" className="book-image" />
//             <div className="hover-icons">
//               <button className="icon-button"><FaHeart /></button>
//               <button className="icon-button"><FaEye /></button>
//               <button className="icon-button"><FaShoppingCart /></button>
//             </div>
//           </div>
//           <div className="price">$12.00</div>
//           <h3 className="title">Your Soul Is A River</h3>
//           <p className="author">By John Nathan Muller</p>
//           <button className="add-to-cart">Add to Cart</button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default NewReleases;
import { FaHeart, FaEye, FaShoppingCart } from "react-icons/fa"
// استيراد الصور بالطريقة الصحيحة
import book1 from "../../images/download.jpeg"
import book2 from "../../images/download.jpeg"
import book3 from "../../images/download.jpeg"

const NewReleases = () => {
  const books = [
    {
      id: 1,
      image: book1, // استخدام المتغير المستورد
      price: "$12.00",
      originalPrice: null,
      title: "You Are Your Only Limit",
      author: "By John Nathan Muller",
    },
    {
      id: 2,
      image: book2, // استخدام المتغير المستورد
      price: "$8.00",
      originalPrice: "$12.00",
      title: "101 Essays That Will Change The Way Your Thinks",
      author: "By John Nathan Muller",
    },
    {
      id: 3,
      image: book3, // استخدام المتغير المستورد
      price: "$12.00",
      originalPrice: null,
      title: "Your Soul Is A River",
      author: "By John Nathan Muller",
    },
  ]

  return (
    <section className="new-releases">
      <div className="section-header">
        <span className="books-label">BOOKS</span>
        <h2>New Release</h2>
      </div>

      <div className="books-container">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-image-container">
              <img
                src={book.image || "/placeholder.svg"}
                alt={book.title}
                className="book-image"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=200&width=150"
                }}
              />
              <div className="hover-icons">
                <button className="icon-button">
                  <FaHeart />
                </button>
                <button className="icon-button">
                  <FaEye />
                </button>
                <button className="icon-button">
                  <FaShoppingCart />
                </button>
              </div>
            </div>

            <div className="book-content">
              <div className="price">
                {book.originalPrice && <span className="original-price">{book.originalPrice}</span>}
                <span className="current-price">{book.price}</span>
              </div>
              <h3 className="title">{book.title}</h3>
              <p className="author">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default NewReleases
