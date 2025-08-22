import {
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import Header from "@components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

const serverUrl = import.meta.env.VITE_BACKEND_SERVER;

function UserCard({ user, onEdit, onDelete }) {

  const [showAll, setShowAll] = useState(false);
  const [address, setAddress] = useState({});


  useEffect(() => {
    let addr = {};
    try {
      addr = JSON.parse(user.address || "{}");
    } catch {
      addr = {};
    }
    setAddress(addr); // <-- update state whenever user changes
  }, [user]); 

  return (
    <Box
      sx={{
        width: 280,
        p: 1,
        borderRadius: "16px",
        bgcolor: "#46B4E7",
        boxShadow: 3,
        textAlign: "center",
      }}
    >
      {/* Profile Pic */}
      <img
        src={user.profile_pic}
        alt={user.first_name}
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          objectFit: "cover",
          margin: "0 auto",
        }}
      />

      {/* Basic Info */}
      <h3 style={{ marginTop: "0.1px", fontWeight: "800", fontSize: "18px" }}>
        {user.first_name} {user.last_name}
      </h3>
      <p style={{ fontSize: "14px", color: "#444" }}>{user.email}</p>
      <p
        style={{
          marginTop: "0.04px",
          fontSize: "14px",
          color: "#FFFFFF",
          fontWeight: "600",
        }}
      >
        Role:{" "}
        <span style={{ color: "#6203A1", fontSize: "14px" }}>{user.role}</span>
      </p>

      {/* Buttons */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 1 }}>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            padding: "6px 12px",
            background: "#1976d2",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {showAll ? "Hide" : "See All"}
        </button>

        <button
          onClick={() => onEdit(user)}
          style={{
            padding: "6px 12px",
            background: "#FF9800",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(user._id)}
          style={{
            padding: "6px 12px",
            background: "#D32F2F",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </Box>

      {/* Expanded Info */}
      {showAll && (
        <Box sx={{ mt: 2, textAlign: "left", fontSize: "14px" }}>
          <p>
            <strong>Phone:</strong> {user.phone || "N/A"}
          </p>
          <p>
            <strong>Gender:</strong> {user.gender || "N/A"}
          </p>
          <p>
            <strong>DOB:</strong> {user.dob || "N/A"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {`${address.address_village || "N/A"}, ${address.landmark || "N/A"}, ${
              address.city || "N/A"
            }, ${address.state || "N/A"}, ${address.zip || "N/A"}, ${
              address.country || "N/A"
            }`}
          </p>
          <p>
            <strong>Account Status: </strong>
            <strong style={{ color: user.isActive ? "green" : "#901313" }}>
              {user.isActive ? "Active" : "Inactive"}
            </strong>
          </p>
          <p>
            <strong> Email Status: </strong>
            <strong style={{ color: user.emailVerified ? "green" : "#901313" }}>
              {user.emailVerified ? "Email Verified" : "Email Not Verified"}
            </strong>
          </p>
          <p>
            <strong> Phone Status: </strong>
            <strong style={{ color: user.phoneVerified ? "green" : "#901313" }}>
              {user.phoneVerified ? "Phone Verified" : "Phone Not Verified"}
            </strong>
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {new Date(user.updatedAt).toLocaleString() || user.updatedAt || "N/A"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(user.createdAt).toLocaleString() || user.createdAt || "N/A"}
          </p>
        </Box>
      )}
    </Box>
  );
}

function Admin() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For editing
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/admin/users`, {
          withCredentials: true,
        });

        console.log("API Response:", res);

        if (res.data.users) {
          setUsers(res.data.users);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleEditClick = (user) => {
    setEditUser(user);
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser || !editUser._id) return;

    try {
      const res = await axios.patch(
        `${serverUrl}/admin/users/${editUser._id}`,
        editUser,
        {
          withCredentials: true,
        }
      );

      console.log("User updated successfully:", res);

      const updatedUser = res.data.data || res.data;

      setUsers((prev) =>
        prev.map((u) => (u._id === editUser._id ? updatedUser : u))
      );

      setOpenEdit(false);
      setEditUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${serverUrl}/admin/users/${id}`, {
        withCredentials: true,
      });

      // Remove from UI
      setUsers((prev) => prev.filter((u) => u._id !== id));
      console.log("User deleted:", id);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="CUSTOMERS" subtitle="List of Customers" />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Box
          sx={{
            mt: 4,
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {users.map((user, idx) =>
            user && user.role === "admin" ? (
              <UserCard
                key={user._id || user.id || user.email || idx}
                user={user}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ) : null
          )}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          {editUser && (
            <>
              <TextField
                label="First Name"
                name="first_name"
                value={editUser.first_name || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={editUser.last_name || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Role"
                name="role"
                value={editUser.role || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Email"
                name="email"
                value={editUser.email || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Phone"
                name="phone"
                value={editUser.phone || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Gender"
                name="gender"
                value={editUser.gender || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="DOB"
                name="dob"
                value={editUser.dob || "N/A"}
                onChange={handleChange}
              />
              <TextField
                label="Profile Pic URL"
                name="profile_pic"
                value={editUser.profile_pic || ""}
                onChange={handleChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Admin;
