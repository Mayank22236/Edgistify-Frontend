import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCartItems, 
  removeFromCartAsync,
  selectCartItems, 
  selectCartLoading, 
  selectCartError 
} from '../store/cartSlice';
import Navbar from './Navbar';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
      toast.success('Item removed from cart!');
    } catch (error) {
      toast.error('Failed to remove item from cart');
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
        <div className="text-xl font-semibold">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
        <div className="text-xl text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} userName={localStorage.getItem('fullName') || 'Guest'} />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Your Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-lg p-10">
            <p className="text-gray-700 text-lg mb-4">Your cart is empty.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 transition-all duration-300 shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                <img 
                  src={item.productId.image}
                  alt={item.productId.name} 
                  className="w-28 h-28 object-cover rounded-lg shadow-md"
                />
                <div className="flex-grow ml-4">
                  <h3 className="text-xl font-semibold text-gray-800">{item.productId.name}</h3>
                  <p className="text-gray-600">${item.productId.price.toFixed(2)} x {item.quantity}</p>
                  <p className="text-gray-900 font-bold mt-1">
                    Total: ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg shadow-sm">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(item.productId._id)}
                    className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-all duration-300 shadow-md"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Total:</h3>
                <p className="text-2xl font-bold text-green-700">${totalPrice.toFixed(2)}</p>
              </div>
              <div className="mb-4">
                <label className="text-lg font-semibold mb-2 block">Shipping Address:</label>
                <input 
                  type="text" 
                  value={shippingAddress} 
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    setIsAddressValid(e.target.value.trim() !== '');
                  }}
                  className="border border-gray-300 rounded-lg p-3 w-full shadow-sm"
                  placeholder="Enter your shipping address"
                />
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => navigate('/')} 
                  className="bg-gray-300 text-gray-800 rounded-lg px-6 py-3 hover:bg-gray-400 transition-all duration-300 shadow-md"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={handleCheckout} 
                  className={`bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg px-6 py-3 hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-md ${!isAddressValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isAddressValid}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
