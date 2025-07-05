// resources/js/pages/RagChat.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, Filter, Heart, Eye, Check, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import BookCard from "../components/BookCard";

const RagChat = () => {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [assistant, setAssistant] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const API_URL = "/api/query";

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setWishlist(savedWishlist);
    setCart(savedCart);
  }, []);

  const handleQuery = useCallback(async () => {
    if (!question.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setAssistant("");
    setShowResults(false);

    try {
      const { data } = await axios.post(API_URL, { question });

      if (data.results?.length) {
        setResults(data.results);
        setShowResults(true);
      } else if (data.message) {
        setAssistant(data.message);
      } else {
        setAssistant("❌ لم يتم العثور على نتائج.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("⚠️ حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, [question]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const toggleWishlist = (book) => {
    const isInWishlist = wishlist.some((item) => item.id === book.id);
    let updatedWishlist;

    if (isInWishlist) {
      updatedWishlist = wishlist.filter((item) => item.id !== book.id);
      Swal.fire({
        icon: "success",
        title: "تم الحذف!",
        text: "تم إزالة الكتاب من قائمة الرغبات",
        timer: 1500,
      });
    } else {
      updatedWishlist = [...wishlist, book];
      Swal.fire({
        icon: "success",
        title: "تمت الإضافة!",
        text: "تم إضافة الكتاب إلى قائمة الرغبات",
        timer: 1500,
      });
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const addToCart = (book) => {
    const isInCart = cart.some((item) => item.id === book.id);

    if (isInCart) {
      Swal.fire({
        icon: "info",
        title: "موجود بالفعل",
        text: "هذا الكتاب موجود بالفعل في سلة التسوق",
        timer: 1500,
      });
      return;
    }

    const updatedCart = [...cart, book];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    Swal.fire({
      icon: "success",
      title: "تمت الإضافة!",
      text: "تم إضافة الكتاب إلى سلة التسوق",
      timer: 1500,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-600 mb-4 text-center">
          مساعد BookShare للبحث عن الكتب
        </h1>

        <div className="mb-6">
          <div className="relative flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="اكتب سؤالك هنا..."
              dir="rtl"
            />
            <button
              className="bg-purple-600 text-white px-6 rounded-r-lg hover:bg-purple-700 transition-colors"
              onClick={handleQuery}
              disabled={loading}
            >
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">جاري البحث في قاعدة البيانات...</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{errorMsg}</p>
          </div>
        )}

        {!loading && assistant && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="bg-gray-50 p-4 rounded border">
              <p className="whitespace-pre-wrap" dir="rtl">
                {assistant}
              </p>
            </div>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-600">
                نتائج البحث ({results.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isInWishlist={wishlist.some((item) => item.id === book.id)}
                  isInCart={cart.some((item) => item.id === book.id)}
                  onWishlist={() => toggleWishlist(book)}
                  onAddToCart={() => addToCart(book)}
                  delay={i * 100}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RagChat;