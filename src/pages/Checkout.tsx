import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Tag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_discount: number | null;
}

const Checkout: React.FC = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    is_default: false,
  });

  const subtotal = getTotal();
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const shippingAmount = subtotal > 999 ? 0 : 50;
  const discountAmount = appliedCoupon 
    ? appliedCoupon.type === 'percentage' 
      ? Math.min(subtotal * (appliedCoupon.value / 100), appliedCoupon.max_discount || Infinity)
      : appliedCoupon.value
    : 0;
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [user, items, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        return;
      }

      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .insert({
          ...newAddress,
          user_id: user.id,
        });

      if (error) {
        console.error('Error adding address:', error);
        return;
      }

      setShowAddressForm(false);
      setNewAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'India',
        is_default: false,
      });
      await fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        alert('Invalid coupon code');
        return;
      }

      // Check if coupon is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        alert('Coupon has expired');
        return;
      }

      // Check minimum order value
      if (subtotal < data.min_order_value) {
        alert(`Minimum order value of ₹${data.min_order_value} required`);
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        alert('Coupon usage limit exceeded');
        return;
      }

      setAppliedCoupon(data);
      alert('Coupon applied successfully!');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Error applying coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    setLoading(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: 'pending',
          shipping_address_id: selectedAddress,
          coupon_id: appliedCoupon?.id || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        alert('Error placing order');
        return;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        alert('Error placing order');
        return;
      }

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ used_count: appliedCoupon.used_count + 1 })
          .eq('id', appliedCoupon.id);

        await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: appliedCoupon.id,
            user_id: user.id,
            order_id: orderData.id,
            discount_amount: discountAmount,
          });
      }

      // Clear cart
      await clearCart();

      // Redirect to order confirmation
      navigate(`/order-confirmation/${orderData.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-black transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Shipping Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Add New Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={newAddress.zip_code}
                      onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Add Address
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map((address) => (
                  <label key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{address.name}</div>
                      <div className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.state} {address.zip_code}
                      </div>
                      {address.is_default && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard size={20} />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-5 h-5 bg-orange-500 rounded"></div>
                  <span>UPI</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Truck size={20} />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="mr-2" size={20} />
                Coupon Code
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                    <span className="text-sm text-green-600 ml-2">
                      ₹{discountAmount} discount applied
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.variant.size} | {item.variant.color} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST)</span>
                  <span>₹{Math.round(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{Math.round(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full mt-6 bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;