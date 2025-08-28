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
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "@components/Header";
import { 
  useGetProductsQuery,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
} from "@state/api";

// Data interactions now handled via RTK Query hooks.

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
          {product.category} {"        theme : "} {product.theme}
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
            <TextField
              fullWidth
              margin="dense"
              name="subCategory"
              label="Sub Category"
              value={editedProduct.subCategory}
              onChange={handleInputChange}
            />
            {/* Add multiple image URLs */}
            <TextField
              fullWidth
              margin="dense"
              name="image"
              label="Image URLs (separate with commas)"
              value={editedProduct.image.join(", ")}
              onChange={(e) =>
                setEditedProduct((prev) => ({
                  ...prev,
                  image: e.target.value.split(",").map((url) => url.trim()),
                }))
              }
            />
            
            <TextField
              fullWidth
              margin="dense"
              name="gender"
              label="Gender"
              value={editedProduct.gender}
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
              name="discount"
              label="Discount"
              value={editedProduct.discount}
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
              name="stock"
              label="Stock"
              value={editedProduct.stock}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="size"
              label="Size"
              value={editedProduct.size}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="color"
              label="Color"
              value={editedProduct.color}
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
          <Typography>Category: {product.category}</Typography>
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
  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteAdminProductMutation();
  const [toast, setToast] = useState({ open: false, severity: "success", message: "" });
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const products = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      await deleteProduct({ id }).unwrap();
      setToast({ open: true, severity: "success", message: "Product deleted." });
      refetch();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      setToast({ open: true, severity: "error", message: "Failed to delete product." });
    }
  };

  const handleUpdate = async (id, updatedProduct) => {
    try {
      await updateProduct({ id, body: updatedProduct }).unwrap();
      setToast({ open: true, severity: "success", message: "Product updated." });
      refetch();
    } catch (error) {
      console.error("❌ Error updating product:", error);
      setToast({ open: true, severity: "error", message: "Failed to update product." });
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading products.</p>;
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

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
