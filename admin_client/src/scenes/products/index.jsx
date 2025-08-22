import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Button,
  Typography,
  Rating,
  useTheme,
  useMediaQuery,
  TextField,
  Grid,
} from "@mui/material";
import Header from "@components/Header";

// ✅ Fallback to localhost if env variable is missing
const serverURL = import.meta.env.VITE_BACKEND_SERVER;
const token = localStorage.getItem("token");
console.log("token : ", token);

const Product = ({ product, onDelete, onUpdate }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(product._id, editedProduct);
    setIsEditing(false);
  };

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? `${theme.palette.background.alt}` : `${theme.palette.background.Card}`,
        borderRadius: "1rem",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
        },
      }}
    >
      <CardContent>
        {/* Category */}
        <Typography
          sx={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: theme.palette.mode === "dark" ? `#F6F1C1` : `#665F0F` }}
          color={theme.palette.secondary[600]}
          gutterBottom
        >
          {product.category}
        </Typography>

        {/* Image */}
        <Box sx={{ textAlign: "center", mb: 2,  }}>
          <img
            src={product.image?.[0]}
            alt={product.title}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "contain",
              borderRadius: "0.75rem",
              background: "#f9f9f9",
              padding: "8px",
              backgroundColor: theme.palette.mode === "dark" ? `#EBEBEB` : `#EBEBEB`,
            }}
          />
        </Box>

        {/* Editing Mode */}
        {isEditing ? (
          <>
            <TextField
              fullWidth
              margin="dense"
              name="title"
              label="Title"
              value={editedProduct.title}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="price"
              label="Price"
              value={editedProduct.price}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="brand"
              label="Brand"
              value={editedProduct.brand}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="description"
              label="Description"
              multiline
              rows={3}
              value={editedProduct.description}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="category"
              label="Category"
              value={editedProduct.category}
              onChange={handleInputChange}
            />
          </>
        ) : (
          <>
            <Typography
              variant="h5"
              component="div"
              fontWeight={600}
              gutterBottom
              sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              {product.title}
            </Typography>
            <Rating value={parseFloat(product.rating)} readOnly precision={0.5} />
            <Typography
              variant="body2"
              sx={{ mt: 1, color: theme.palette.text.secondary, color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              {product.description}
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 1, fontWeight: "bold", color: theme.palette.mode === "dark" ? "#A692F6" : "#87068F" }}
            >
              ${Number(product.price).toFixed(2)}
            </Typography>
          </>
        )}
      </CardContent>

      {/* Card Actions */}
      <CardActions >
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              variant="contained"
              color="success"
              size="small"
            >
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outlined"
              color="error"
              size="small"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button style={{ bold : "bold", margin: "auto", color: theme.palette.mode === "dark" ? "white" : "black" }} size="small" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Show Less" : "Show More"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ margin: "auto", bold : "bold", color: theme.palette.mode === "dark" ? "#0AC2F5" : "#033645", borderColor: theme.palette.mode === "dark" ? "#0AC2F5" : "#033645" }}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ margin: "auto", bold : "bold", color: theme.palette.mode === "dark" ? "#F86262" : "#8F0606", borderColor: theme.palette.mode === "dark" ? "#F86262" : "#8F0606" }} 
              onClick={() => onDelete(product._id)}
            >
              Delete
            </Button>
          </>
        )}
      </CardActions>

      {/* Expanded Details */}
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        sx={{ color: theme.palette.neutral[300], px: 2 }}
      >
        <CardContent>
          <Typography>ID: {product._id}</Typography>
          <Typography>Brand: {product.brand}</Typography>
          <Typography>Gender: {product.gender}</Typography>
          <Typography>Color: {product.color}</Typography>
          <Typography>Size: {product.size}</Typography>
          <Typography>Subcategory: {product.subcategory}</Typography>
          <Typography>Discount: {product.discount}%</Typography>
          <Typography>Theme: {product.theme}</Typography>
          <Typography>Supply Left: {product.supply}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
  const res = await fetch(`${serverURL.replace(/\/$/, '')}/clients/products`, { credentials: 'include' });
      console.log(" res: ", res);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      console.log("json: ", json.data);
      setProducts(json.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      console.log("Deleting product with ID:", id);
  const res = await fetch(`${serverURL.replace(/\/$/, '')}/clients/products/delete/${id}`, {
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`, 
        },
        method: "DELETE",
      });
      console.log("delete res:", res);
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
    }
  };

  const handleUpdate = async (id, updatedProduct) => {
    try {
      console.log("Updating product with ID:", id, updatedProduct);
  const res = await fetch(`${serverURL.replace(/\/$/, '')}/clients/products/update/${id}`, {
        method: "PATCH",
       headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      fetchProducts();
    } catch (error) {
      console.error("❌ Error updating product:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  console.log("products: ", products);
  return (
    <Box m="1.5rem 2.5rem">
      <Header title="PRODUCTS" subtitle="See your list of products." />

      <Grid container spacing={3} mt={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Product
              product={product}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Products;
