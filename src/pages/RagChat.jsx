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
        try {
            const response = await axios.post("http://127.0.0.1:8000/query", {
                question,
            })

            const data = response.data

            if (data && Array.isArray(data.results)) {
                setResults(data.results)
            } else {
                setErrorMsg("⚠️ Unexpected response format from server.")
                setResults([])
            }
        } catch (error) {
            console.error("Error:", error)
            setErrorMsg("❌ An error occurred while connecting to the server.") // Translated 'حدث خطأ أثناء الاتصال بالسيرفر.'
            setResults([])
        }

        setLoading(false)
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">💬 Ask about any book</h2>{" "}
            {/* Translated 'اسأل عن أي كتاب' */}
            <div className="input-group mb-3">
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    className="form-control"
                    placeholder="Example: a book about emotional intelligence" // Translated 'مثال: كتاب عن الذكاء العاطفي'
                />
                <button className="btn btn-primary" onClick={handleQuery}>
                    Search {/* Translated 'بحث' */}
                </button>
            </div>
            {loading && <p className="text-center">⏳ Searching...</p>}{" "}
            {/* Translated 'جاري البحث...' */}
            {errorMsg && <p className="text-danger text-center">{errorMsg}</p>}
            <div className="row">
                {results.map((book, i) => (
                    <div key={i} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{book.title}</h5>
                                <p className="card-text">{book.description}</p>
                            </div>
                            <div className="card-footer text-muted">
                                <span>✍️ {book.author}</span> <br />
                                <span>📚 {book.category}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
