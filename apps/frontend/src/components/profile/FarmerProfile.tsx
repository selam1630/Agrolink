import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  isSold: boolean;
  image: string;
  quantity: number; 
}

interface Farmer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface FarmerProfileResponse {
  farmer: Farmer;
  postedProducts: Product[];
  soldProducts: Product[];
}

const FarmerProfile: React.FC = () => {
  const { token, userId } = useAuth();
  const [profile, setProfile] = useState<FarmerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Farmer | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const fetchProfile = async () => {
    try {
      const res = await axios.get<FarmerProfileResponse>(
        `http://localhost:5000/api/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(res.data);
      setFormData(res.data.farmer);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch farmer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setError("You must be logged in to view this page");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [token, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!formData) return;
    setUpdating(true);
    try {
      const res = await axios.put<Farmer>(
        `http://localhost:5000/api/profile/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) =>
        prev
          ? { ...prev, farmer: res.data }
          : { farmer: res.data, postedProducts: [], soldProducts: [] }
      );
      setFormData(res.data);

      setEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };
  const handleUpdateProduct = async () => {
    if (!editingProduct || isNaN(newPrice)) {
      setError("Invalid price.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct.id}`,
        { price: newPrice, name: editingProduct.name, quantity: editingProduct.quantity }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProduct(null);
      setNewPrice(0);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update product price.");
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchProfile(); 
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to delete product.");
      }
    }
  };

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Farmer Profile</h2>

      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData?.name || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            value={formData?.email || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
          />
          <input
            type="text"
            name="phone"
            value={formData?.phone || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Phone"
          />
          <div className="flex gap-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(profile.farmer);
                setError(null);
              }}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              disabled={updating}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>
            <strong>Name:</strong> {profile.farmer.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.farmer.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile.farmer.phone}
          </p>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Edit Profile
          </button>
        </div>
      )}

      <hr className="my-8" />
      
      {/* Posted Products */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Posted Products
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profile.postedProducts.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-3 shadow-sm bg-gray-50 flex flex-col items-center"
            >
              <img
                src={p.image || "/placeholder.png"}
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h4 className="font-medium">{p.name}</h4>
              <p className="font-semibold">${p.price}</p>
              <p
                className={`text-sm mt-1 ${
                  p.isSold ? "text-red-500" : "text-green-600"
                }`}
              >
                {p.isSold ? "Sold" : "Available"}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setNewPrice(p.price); 
                  }}
                  className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition"
                >
                  Edit Price
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Update Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-96 mx-auto">
            <h3 className="text-lg font-bold mb-4">Update Price for {editingProduct.name}</h3>
            <div className="mb-4">
              <label htmlFor="new-price" className="block text-sm font-medium text-gray-700 mb-1">New Price</label>
              <input
                id="new-price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="my-8" />

      {/* Sold Products */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Sold Products
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profile.soldProducts.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-3 shadow-sm bg-gray-50 flex flex-col items-center"
            >
              <img
                src={p.image || "/placeholder.png"}
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h4 className="font-medium">{p.name}</h4>
              <p className="font-semibold">${p.price}</p>
              <p className="text-sm text-red-500 mt-1">Sold</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;