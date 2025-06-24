import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CategoryTable from "../../components/admin/CategoryTable"
import Pagination from "../../components/common/Pagination"
import AdminLayout from "../../layouts/AdminLayout"

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const itemsPerPage = 10

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(
                    `http://localhost:8001/api/categories?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch categories")
                }

                const data = await response.json()
                setCategories(data.categories.data || [])
                setTotalPages(data.categories.last_page || 1)
            } catch (error) {
                console.error("Error fetching categories:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [currentPage, searchTerm])

    const handleSearch = e => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleDelete = async id => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(
                    `http://localhost:8001/api/categories/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error("Failed to delete category")
                }

                setCategories(categories.filter(category => category.id !== id))
            } catch (error) {
                console.error("Error deleting category:", error)
            }
        }
    }

    return (
        <AdminLayout>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Manage Categories
                    </h1>
                    <Link
                        to="/admin/categories/create"
                        className="bg-[#199A8E] hover:bg-[#157d74] text-white py-2 px-6 rounded-lg shadow-md transition flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Add New Category
                    </Link>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
                        />
                        <svg
                            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        ></svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No categories found
                        </h3>
                        <p className="mt-1 text-gray-500">
                            Try adjusting your search or add a new category.
                        </p>
                    </div>
                ) : (
                    <>
                        <CategoryTable
                            categories={categories}
                            onDelete={handleDelete}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminCategories
