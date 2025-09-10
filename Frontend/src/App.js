import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import './App.css';

function App() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchProducts = async () => {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.description || !form.category) return alert('All fields required.');
        const payload = { ...form, price: Number(form.price) };
        try {
            if (editing && editing._id) {
                const id = String(editing._id).trim();
                console.log('Updating product:', { id, payload, editing });
                
                // First check if product exists
                try {
                    await axios.get(`http://localhost:5000/api/products/${id}`);
                } catch (checkErr) {
                    console.error('Product check failed:', checkErr);
                    alert('Product not found. It may have been deleted. Refreshing list...');
                    setEditing(null);
                    fetchProducts();
                    return;
                }
                
                // Then update
                await axios.put(`http://localhost:5000/api/products/${id}`, payload);
                setEditing(null);
                alert('Product updated successfully!');
            } else {
                console.log('Adding new product:', payload);
                await axios.post('http://localhost:5000/api/products', payload);
                alert('Product added successfully!');
            }
            setForm({ name: '', price: '', description: '', category: '' });
            fetchProducts();
        } catch (err) {
            const status = err?.response?.status;
            const message = err?.response?.data?.error || err?.message || 'Request failed';
            console.error('Request failed', { status, message, payload });
            alert(`Error: ${message}`);
            if (status === 404 && editing) {
                setEditing(null);
                fetchProducts();
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure to delete this product?')) {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        console.log('Edit clicked for product:', product);
        setEditing(product);
        setForm({
            name: product.name || '',
            price: product.price ?? '',
            description: product.description || '',
            category: product.category || ''
        });
        console.log('Form set to:', { name: product.name, price: product.price, description: product.description, category: product.category });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const normalizedQuery = search.trim().toLowerCase();
    const filteredProducts = products
        .filter(p => {
            if (!normalizedQuery) return true;
            const name = (p.name || '').toLowerCase();
            const category = (p.category || '').toLowerCase();
            const description = (p.description || '').toLowerCase();
            const priceStr = String(p.price ?? '').toLowerCase();
            return (
                name.includes(normalizedQuery) ||
                category.includes(normalizedQuery) ||
                description.includes(normalizedQuery) ||
                priceStr.includes(normalizedQuery)
            );
        })
        .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);

    return (
        <div className="container">
            <header className="app-header">
                <div className="app-header__content">
                    <h1 className="app-title">Nxtify Products</h1>
                    <p className="app-subtitle">Manage your catalog with ease</p>
                </div>
            </header>

            <div className="toolbar">
                <div className="toolbar__left">
                    <input
                        type="text"
                        placeholder="Search by name, category, or description..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-bar"
                    />
                    <label className="sort-control">
                        <span className="sort-label">Sort by price</span>
                        <select className="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                            <option value="asc">Low to High</option>
                            <option value="desc">High to Low</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="form-panel">
            <form onSubmit={handleSubmit} className="product-form">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
                <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
                <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
                <button type="submit">{editing ? 'Update Product' : 'Add Product'}</button>
            </form>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="empty-state">No products match your search.</div>
            ) : (
                <div className="product-list">
                    {filteredProducts.map(product => (
                        <ProductCard key={product._id} product={product} onDelete={handleDelete} onEdit={handleEdit} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
