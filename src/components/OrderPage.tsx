import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

// Define interfaces for Product and Order
interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
}

interface Order {
  _id: string;
  userId: string;
  products: {
    productId: Product;
    quantity: number;
    price: number;
    _id: string;
  }[];
  totalPrice: number;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
}

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-200">
        <div className="text-xl font-semibold">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="text-xl text-red-600 font-bold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-300">
      <Navbar cartItemsCount={0} userName={localStorage.getItem('fullName') || 'Guest'} />
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">Your Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-700 mb-4">You have no orders yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl px-4 py-3 hover:from-blue-600 hover:to-blue-800 transition duration-200 shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg p-6 transform transition duration-300 hover:scale-105">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order ID: {order._id}</h3>
                <p className="text-gray-700 text-lg font-bold mb-2">Total Price: ${order.totalPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-2">Shipping Address: {order.shippingAddress}</p>
                <p className="text-sm text-gray-600 mb-4">Order Status: {order.orderStatus}</p>
                <h4 className="font-semibold text-gray-800">Products:</h4>
                <ul>
                  {order.products.map((product) => (
                    <li key={product._id} className="flex items-center text-gray-700 mb-3">
                      <img 
                        src={product.productId.image} 
                        alt={product.productId.name} 
                        className="w-16 h-16 object-cover rounded-xl mr-3"
                      />
                      <div>
                        <p className="text-md font-semibold">{product.productId.name}</p>
                        <p className="text-sm">${product.price.toFixed(2)} x {product.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
