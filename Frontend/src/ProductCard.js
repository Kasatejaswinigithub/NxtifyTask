function ProductCard({ product, onDelete, onEdit }) {
    return (
        <div className="product-card">
            <div className="product-card__header">
                <h3 className="product-card__title">{product.name}</h3>
                <span className="product-card__badge">{product.category}</span>
            </div>
            <p className="product-card__description">{product.description}</p>
            <div className="product-card__footer">
                <span className="product-card__price">${product.price}</span>
                <div>
                    <button className="btn btn-primary" onClick={() => onEdit(product)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => onDelete(product._id)}>Delete</button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
