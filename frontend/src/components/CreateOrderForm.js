import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateOrderForm = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [total, setTotal] = useState(0);

    useEffect(() => {
        // Fetch the suppliers on component mount
        axios.get('http://localhost:5000/api/suppliers')
            .then(response => setSuppliers(response.data))
            .catch(error => console.error('Error fetching suppliers:', error));
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            // Fetch products based on the selected supplier
            axios.get(`http://localhost:5000/api/products/by-supplier?supplier=${selectedSupplier}`)
                .then(response => {
                    console.log('Fetched products:', response.data); // Add this line to check the response
                    setProducts(response.data);
                    setOrderItems({}); // Reset selections when supplier changes
                })
                .catch(error => console.error('Error fetching products:', error));
        }
    }, [selectedSupplier]);

    // Handle quantity selection
    const handleQuantityChange = (productId, quantity) => {
        const newOrderItems = { ...orderItems, [productId]: quantity };
        setOrderItems(newOrderItems);

        // Calculate total
        const newTotal = Object.entries(newOrderItems).reduce((sum, [id, qty]) => {
            const product = products.find(p => p._id === id);
            return sum + (product ? product.price * qty : 0);
        }, 0);

        setTotal(newTotal);
    };

    // Submit order
    const handleSubmitOrder = () => {
        const orderData = {
            supplierId: selectedSupplier,
            items: Object.entries(orderItems).map(([productId, quantity]) => ({
                productId,
                quantity
            }))
        };

        axios.post('http://localhost:5000/api/orders', orderData)
            .then(response => {
                alert('Order placed successfully!');
                setOrderItems({});
                setTotal(0);
            })
            .catch(error => console.error('Error placing order:', error));
    };

    // Separate low-stock and normal-stock products
    const lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold);
    const normalStockProducts = products.filter(p => p.stock >= p.lowStockThreshold);

    return (
        <div>
            <h2>Create Order</h2>

            <label>Select Supplier:</label>
            <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                <option value="">-- Select --</option>
                {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                ))}
            </select>

            {products.length > 0 && (
                <>
                    <h3>Low-Stock Products</h3>
                    {lowStockProducts.length === 0 ? <p>No low-stock products</p> : (
                        <ul>
                            {lowStockProducts.map(p => (
                                <li key={p._id}>
                                    {p.name} (Stock: {p.stock}) - ${p.price}
                                    <input
                                        type="number"
                                        min="1"
                                        onChange={e => handleQuantityChange(p._id, parseInt(e.target.value, 10) || 0)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>Normal Stock Products</h3>
                    {normalStockProducts.length === 0 ? <p>No normal-stock products</p> : (
                        <ul>
                            {normalStockProducts.map(p => (
                                <li key={p._id}>
                                    {p.name} (Stock: {p.stock}) - ${p.price}
                                    <input
                                        type="number"
                                        min="1"
                                        onChange={e => handleQuantityChange(p._id, parseInt(e.target.value, 10) || 0)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>Total: ${total.toFixed(2)}</h3>
                    <button onClick={handleSubmitOrder}>Place Order</button>
                </>
            )}
        </div>
    );
};

export default CreateOrderForm;
