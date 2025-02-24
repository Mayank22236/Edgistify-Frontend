import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import { addToCartAsync, selectCartItems, fetchCartItems } from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to add items to the cart.');
      return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
      await fetchProducts();
      dispatch(fetchCartItems());
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-200">
        <div className="text-xl font-semibold">Loading products...</div>
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
      <Navbar 
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} 
        userName={localStorage.getItem('fullName') || 'Guest'} 
      />
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-lg p-6 transform transition duration-300 hover:scale-105">
              <img 
                src={product.image}
                alt={product.name} 
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{product.name}</h3>
              <p className="text-gray-700 text-lg font-bold mb-3">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mb-4">Stock: {product.stock}</p>
              <button 
                onClick={() => handleAddToCart(product._id)}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-xl px-4 py-3 hover:from-green-600 hover:to-green-800 transition duration-200 shadow-lg"
              >
                {cartItems[product._id] ? 'Add More' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
