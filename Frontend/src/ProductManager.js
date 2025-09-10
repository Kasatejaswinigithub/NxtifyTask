import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import './App.css';

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: ''
    });

    // Fetch all products
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Delete product
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    // Edit product (populate form)
    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add / Update product
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, price: Number(form.price) };
        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload);
                setEditingProduct(null);
            } else {
                await axios.post('http://localhost:5000/api/products', payload);
            }
            setForm({ name: '', price: '', description: '', category: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Check console.');
        }
    };

    // Filter & sort products
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const filteredProducts = products
        .filter(p => {
            if (!normalizedQuery) return true;
            return (
                (p.name || '').toLowerCase().includes(normalizedQuery) ||
                (p.category || '').toLowerCase().includes(normalizedQuery) ||
                (p.description || '').toLowerCase().includes(normalizedQuery) ||
                String(p.price).includes(normalizedQuery)
            );
        })
        .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);

    return (
        <div className="container">
            <header className="app-header">
                <h1 className="app-title">Product Manager</h1>
            </header>

            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search product by name, category, description or price..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', marginBottom: 10 }}
                />

                <label>
                    Sort by price:
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ marginLeft: 8, padding: '6px 10px' }}>
                        <option value="asc">Low to High</option>
                        <option value="desc">High to Low</option>
                    </select>
                </label>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                />
                <button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</button>
            </form>

            <div className="product-list">
                {filteredProducts.length === 0 ? (
                    <div className="empty-state">No products found.</div>
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default ProductManager;
