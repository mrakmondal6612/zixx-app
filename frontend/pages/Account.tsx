import React, { useEffect, useState } from "react";
import axios from "axios";

const Account: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/backend/users/me", {
          headers: { Authorization: token },
        });
        setUser(res.data.user);
        setForm(res.data.user);
      } catch (err: any) {
        setError("Failed to load user info");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/backend/update/${user._id}`, form, {
        headers: { Authorization: token },
      });
      setSuccess("Account updated successfully");
    } catch (err: any) {
      setError("Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" value={form.first_name || ""} onChange={handleChange} placeholder="First Name" className="input" />
        <input name="last_name" value={form.last_name || ""} onChange={handleChange} placeholder="Last Name" className="input" />
        <input name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="input" />
        <input name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone" className="input" />
        <input name="dob" value={form.dob || ""} onChange={handleChange} placeholder="Date of Birth" className="input" />
        <input name="gender" value={form.gender || ""} onChange={handleChange} placeholder="Gender" className="input" />
        <input name="profile_pic" value={form.profile_pic || ""} onChange={handleChange} placeholder="Profile Picture URL" className="input" />
        {/* Add address fields as needed */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Account"}
        </button>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
};

export default Account;
