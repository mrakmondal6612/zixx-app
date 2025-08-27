import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useAuthContext } from '@/hooks/AuthProvider';
import { apiUrl } from '@/lib/api';

const Account = () => {

  const { user, token, setUser } = useAuthContext();
  type Address = {
    personal_address?: string;
    shoping_address?: string;
    billing_address?: string;
    address_village?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };

  const [formData, setFormData] = useState({
    first_name: "N/A",
    last_name: "N/A",
    email: "N/A",
    phone: "N/A",
    gender: "N/A",
    dob: "N/A",
    personal_address: "N/A",
    shoping_address: "N/A",
    billing_address: "N/A",
    address_village: "N/A",
    landmark: "N/A",
    city: "N/A",
    state: "N/A",
    country: "N/A",
    zip: "N/A",
  });
  const [profilePic, setProfilePic] = useState<string>("");
  const [previewPic, setPreviewPic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (user) {
      const u: any = user as any;
      // If address is a string (from backend), parse it
      let addressObj = u.address;
      if (typeof addressObj === 'string') {
        try {
          addressObj = JSON.parse(addressObj);
        } catch {
          addressObj = {};
        }
      }
      setFormData({
        first_name: u.first_name || "N/A",
        last_name: u.last_name || "N/A",
        email: u.email || "N/A",
        phone: u.phone?.toString() || "N/A",
        gender: u.gender || "N/A",
        dob: u.dob || "N/A",
        personal_address: addressObj?.personal_address ?? "N/A",
        shoping_address: addressObj?.shoping_address ?? "N/A",
        billing_address: addressObj?.billing_address ?? "N/A",
        address_village: addressObj?.address_village ?? "N/A",
        landmark: addressObj?.landmark ?? "N/A",
        city: addressObj?.city ?? "N/A",
        state: addressObj?.state ?? "N/A",
        country: addressObj?.country ?? "N/A",
        zip: addressObj?.zip ?? "N/A",
      });
      setProfilePic(u.profile_pic || "");
      setPreviewPic(u.profile_pic || "");
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const [uploading, setUploading] = useState(false);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Prepare FormData for only image upload
      const form = new FormData();
      form.append('profile_pic', file);
      // Only send image to backend for upload
  const res = await fetch(apiUrl('/clients/user/me'), {
        method: 'PATCH',
        body: form,
        credentials: 'include',
      });
      // console.log("Profile picture upload response:", res);
      const data = await res.json();
      if (data.ok && data.user) {
        setUser(data.user);
        setProfilePic(file as any);
        setPreviewPic(data.user.profile_pic || URL.createObjectURL(file));
      } else {
        alert(data.msg || 'Image upload failed');
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      // Append non-address fields
      form.append('first_name', formData.first_name);
      form.append('last_name', formData.last_name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('gender', formData.gender);
      form.append('dob', formData.dob);
      // Append flat address fields (backend merges into address)
      if (formData.address_village) form.append('address_village', formData.address_village);
      if (formData.landmark) form.append('landmark', formData.landmark);
      if (formData.city) form.append('city', formData.city);
      if (formData.state) form.append('state', formData.state);
      if (formData.country) form.append('country', formData.country);
      if (formData.zip) form.append('zip', formData.zip);
      if (profilePic && typeof profilePic !== 'string') {
        form.append('profile_pic', profilePic);
      }
      const res = await fetch(apiUrl('/clients/user/me'), {
        method: 'PATCH',
        body: form,
        credentials: 'include',
      });
      if (res.status === 401) {
        alert('Please sign in to update your profile.');
        window.location.href = '/auth';
        return;
      }
      const data = await res.json();
      if (data.ok && data.user) {
        setUser(data.user);
        setFormData({
          first_name: data.user.first_name || "N/A",
          last_name: data.user.last_name || "N/A",
          email: data.user.email || "N/A",
          phone: data.user.phone?.toString() || "N/A",
          gender: data.user.gender || "N/A",
          dob: data.user.dob || "N/A",
          personal_address: data.user.address?.personal_address ?? "N/A",
          shoping_address: data.user.address?.shoping_address ?? "N/A",
          billing_address: data.user.address?.billing_address ?? "N/A",
          address_village: data.user.address?.address_village ?? "N/A",
          landmark: data.user.address?.landmark ?? "N/A",
          city: data.user.address?.city ?? "N/A",
          state: data.user.address?.state ?? "N/A",
          country: data.user.address?.country ?? "N/A",
          zip: data.user.address?.zip ?? "N/A",
        });
        alert('Profile updated!');
      } else {
        alert(data.msg || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-4">
            <Card className="bg-[#D92030] text-white hover:bg-[#BC1C2A] transition-colors">
              <CardContent className="p-4">
                <Link to="/account" className="flex items-center gap-3">
                  <User size={20} />
                  <span className="font-medium">Account Details</span>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/orders" className="flex items-center gap-3">
                  <ShoppingBag size={20} />
                  <span className="font-medium">Orders</span>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/wishlist" className="flex items-center gap-3">
                  <Heart size={20} />
                  <span className="font-medium">Wishlist</span>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/logout" className="flex items-center gap-3 text-gray-500">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </Link>
              </CardContent>
            </Card>
          </aside>


          {/* Main Content */}
          <div className="space-y-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} encType="multipart/form-data">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                    <div className="relative w-28 h-28">
                      <img
                        src={previewPic || "/placeholder.svg"}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border"
                        style={{ opacity: uploading ? 0.5 : 1 }}
                      />
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-full">
                          <svg className="animate-spin h-8 w-8 text-[#D92030]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-[#D92030] text-white rounded-full p-1 hover:bg-[#BC1C2A]"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change profile picture"
                        disabled={uploading}
                      >
                        <span className="text-xs">Edit</span>
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleProfilePicChange}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zip"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.zip}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address (Village)</label>
                      <input
                        type="text"
                        name="address_village"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.address_village}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                      <input
                        type="text"
                        name="landmark"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.landmark}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <input
                        type="text"
                        name="gender"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.dob}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button className="bg-[#D92030] hover:bg-[#BC1C2A]" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Show additional user info for e-commerce */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wishlist Items</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.wishlist?.length ? user.wishlist.length : 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orders</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.orders?.length ? user.orders.length : 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.emailVerified ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.isActive ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button className="bg-[#D92030] hover:bg-[#BC1C2A]">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Account;
