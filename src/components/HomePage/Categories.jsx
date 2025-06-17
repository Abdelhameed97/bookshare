// import React from 'react';
// import '../../style/Homepagestyle.css';



// const BookCategories = () => {
//   const categories = [
//     {
//       title: "Children's Book",
//       description: "A small river named Duden flows by their place and supplies it with the necessary regelisils."
//     },
//     {
//       title: "Romance",
//       description: "A small river named Duden flows by their place and supplies it with the necessary regelisils."
//     },
//     {
//       title: "Art & Architecture",
//       description: "A small river named Duden flows by their place and supplies it with the necessary regelisils."
//     },
//     {
//       title: "History",
//       description: "A small river named Duden flows by their place and supplies it with the necessary regelisils."
//     }
//   ];

//   return (
//     <section className="book-categories">
//       <div className="container">
//         <div className="categories-grid">
//           {categories.map((category, index) => (
//             <div className="category-card" key={index}>
//               <h3 className="category-title">{category.title}</h3>
//               <p className="category-description">{category.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BookCategories;


import React from 'react';
import { FaBook, FaHeart, FaPalette, FaHistory } from 'react-icons/fa';
// import '../../style/BookCategories.css';
import '../../style/Homepagestyle.css'; // Adjust the path as necessary

const BookCategories = () => {
  const categories = [
    {
      title: "Children's Book",
      description: "A small river named Duden flows by their place and supplies it with the necessary regelialia.",
      icon: <FaBook className="category-icon" />
    },
    {
      title: "Romance",
      description: "A small river named Duden flows by their place and supplies it with the necessary regelialia.",
      icon: <FaHeart className="category-icon" />
    },
    {
      title: "Art & Architecture",
      description: "A small river named Duden flows by their place and supplies it with the necessary regelialia.",
      icon: <FaPalette className="category-icon" />
    },
    {
      title: "History",
      description: "A small river named Duden flows by their place and supplies it with the necessary regelialia.",
      icon: <FaHistory className="category-icon" />
    }
  ];

  return (
    <section className="book-categories-section">
      <div className="book-categories-container">
        {categories.map((category, index) => (
          <div className="book-category-card" key={index}>
            <div className="category-icon-container">
              {category.icon}
            </div>
            <h3 className="book-category-title">{category.title}</h3>
            <div className="book-category-divider"></div>
            <p className="book-category-description">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookCategories;