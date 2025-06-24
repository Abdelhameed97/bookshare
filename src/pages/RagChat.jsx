import React, { useState } from "react"
import axios from "axios"

export default function RagChat() {
    const [question, setQuestion] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleQuery = async () => {
        if (!question.trim()) return
        setLoading(true)
        setErrorMsg("")
        setResults([])

        try {
            const response = await axios.post("http://127.0.0.1:8000/query", {
                question,
            })

            const data = response.data

            if (data.results.length > 0) {
                setResults(data.results)
            } else if (data.message) {
                setErrorMsg(data.message)
            } else {
                setErrorMsg("❌ لا توجد نتائج.")
            }
        } catch (error) {
            console.error("Error:", error)
            setErrorMsg("❌ حدث خطأ أثناء الاتصال بالخادم.")
        }

        setLoading(false)
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">💬 اسأل عن أي كتاب</h2>

            <div className="input-group mb-4">
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    className="form-control"
                    placeholder="مثال: كتب عن الذكاء العاطفي أو أدب الصف الثالث"
                />
                <button className="btn btn-primary" onClick={handleQuery}>
                    بحث
                </button>
            </div>

            {loading && (
                <div className="text-center mb-3">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />
                    <p className="mt-2">⏳ جاري البحث...</p>
                </div>
            )}

            {errorMsg && (
                <div className="alert alert-warning text-center">
                    {errorMsg}
                </div>
            )}

            <div className="row">
                {results.map((book, i) => (
                    <div key={i} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            {book.images && book.images.length > 0 ? (
                                <img
                                    src={`http://localhost:8001/storage/${book.images[0]}`}
                                    alt={book.title}
                                    className="card-img-top"
                                    style={{
                                        height: "240px",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <img
                                    src="/placeholder.svg"
                                    alt="no cover"
                                    className="card-img-top"
                                    style={{
                                        height: "240px",
                                        objectFit: "cover",
                                    }}
                                />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{book.title}</h5>
                                <p className="card-text">
                                    {book.description || "لا يوجد وصف متاح."}
                                </p>
                            </div>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    ✍️ المؤلف: {book.author}
                                </li>
                                <li className="list-group-item">
                                    🏷️ التصنيف: {book.category}
                                </li>
                                <li className="list-group-item">
                                    💰 السعر: {book.price} ج.م
                                </li>
                                {book.rental_price && (
                                    <li className="list-group-item">
                                        📖 للإيجار: {book.rental_price} ج.م
                                    </li>
                                )}
                                {book.educational_level && (
                                    <li className="list-group-item">
                                        🎓 المرحلة: {book.educational_level}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
