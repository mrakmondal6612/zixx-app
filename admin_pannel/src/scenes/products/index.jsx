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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Autocomplete,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Header from "@components/Header";
import { 
  useGetProductsQuery,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useAddAdminProductMutation,
  useUploadAdminProductImageMutation,
} from "@state/api";
import { Add as AddIcon, Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

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
    // Normalize fields to match backend expectations
    const payload = { ...editedProduct };
    // subcategory mapping
    payload.subcategory = editedProduct.subCategory ?? editedProduct.subcategory ?? "";
    delete payload.subCategory;
    // images: ensure array of strings in `images` for backend normalization
    if (Array.isArray(editedProduct.image)) {
      payload.images = editedProduct.image;
    } else if (typeof editedProduct.image === "string") {
      payload.images = editedProduct.image
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // size: array
    if (Array.isArray(editedProduct.size)) {
      payload.size = editedProduct.size;
    } else if (typeof editedProduct.size === "string") {
      payload.size = editedProduct.size
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // color: array (schema field is `color`)
    if (Array.isArray(editedProduct.colors)) {
      payload.color = editedProduct.colors;
    } else if (typeof editedProduct.colors === "string") {
      payload.color = editedProduct.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(editedProduct.color)) {
      payload.color = editedProduct.color;
    } else if (typeof editedProduct.color === "string") {
      payload.color = editedProduct.color
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // price/discount as numbers when possible
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.discount !== undefined && payload.discount !== "") payload.discount = Number(payload.discount);
    // stock -> supply mapping
    if (editedProduct.stock !== undefined || editedProduct.supply !== undefined) {
      const supplyVal = editedProduct.stock ?? editedProduct.supply ?? 1;
      payload.supply = Number(supplyVal);
    }
    // Cleanup fields not used by backend
    delete payload.image; // backend derives legacy `image` from `images`
    delete payload.colors;

    onUpdate(product._id, payload);
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
              name="theme"
              label="Theme"
              value={editedProduct.theme}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="subCategory"
              label="Sub Category"
              value={editedProduct.subCategory ?? editedProduct.subcategory ?? ""}
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
              value={editedProduct.stock ?? editedProduct.supply ?? ""}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="size"
              label="Size"
              value={Array.isArray(editedProduct.size) ? editedProduct.size.join(", ") : (editedProduct.size ?? "")}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="color"
              label="Color"
              value={Array.isArray(editedProduct.colors) ? editedProduct.colors.join(", ") : (editedProduct.color ?? editedProduct.colors ?? "")}
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
              sx={{ mt: 1, color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              {product.description}
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 1, fontWeight: "bold", color: theme.palette.mode === "dark" ? "#A692F6" : "#87068F" }}
            >
              ${Number(product.price).toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Theme : {product.theme}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Gender : {product.gender}
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
          <Typography>
            Color: {Array.isArray(product.color) ? product.color.join(", ") : (product.color ?? "")}
          </Typography>
          <Typography>Size: {Array.isArray(product.size) ? product.size.join(", ") : (product.size ?? "")}</Typography>
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
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteAdminProductMutation();
  const [addProduct, { isLoading: isAdding }] = useAddAdminProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadAdminProductImageMutation();
  const [toast, setToast] = useState({ open: false, severity: "success", message: "" });
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    gender: "",
    images: "",
    size: "",
    colors: "",
    discount: "",
    stock: "1",
    brand: "",
    theme: "",
  });
  const [imagesList, setImagesList] = useState([]); // [{url, from:'url'|'uploaded', caption:'', alt:''}]
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(null);
  const genderOptions = ["men", "women", "kid"];
  const categoryOptions = [
    "Shirt",
    "T-Shirt",
    "Jeans",
    "Shoes",
    "Accessories",
    "Jacket",
    "Hoodie",
    "Saree",
    "Kurta",
  ];

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    if (name === 'images') {
      const urls = value.split(",").map((s) => s.trim()).filter(Boolean);
      const prevUploaded = imagesList.filter((i) => i.from === 'uploaded');
      const prevUrlMap = new Map(imagesList.filter((i)=>i.from==='url').map((i)=>[i.url, i]));
      const newUrlEntries = urls.map((u)=> prevUrlMap.get(u) || { url: u, from: 'url', caption: '', alt: '' });
      setImagesList([...newUrlEntries, ...prevUploaded]);
    }
    setNewProduct((p) => ({ ...p, [name]: value }));
  };

  const handleAddSubmit = async () => {
    try {
      const structured = imagesList.map((i, idx) => ({ url: i.url, caption: i.caption || "", alt: i.alt || "", order: idx }));
      const sizeArr = newProduct.size.split(",").map((s) => s.trim()).filter(Boolean);
      const colorArr = newProduct.colors.split(",").map((s) => s.trim()).filter(Boolean);
      const body = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim(),
        price: Number(newProduct.price),
        category: newProduct.category.trim(),
        subcategory: newProduct.subcategory.trim(),
        gender: newProduct.gender.trim(),
        images: structured, // backend accepts objects and normalizes
        size: sizeArr,
        colors: colorArr, // required by controller validation
        color: colorArr,  // persisted by schema (field name is `color`)
        discount: newProduct.discount === "" ? 0 : Number(newProduct.discount),
        supply: newProduct.stock === "" ? 1 : Number(newProduct.stock),
        brand: newProduct.brand.trim() || undefined,
        theme: newProduct.theme.trim() || undefined,
      };
      await addProduct({ body }).unwrap();
      setToast({ open: true, severity: "success", message: "Product added." });
      setAddOpen(false);
      setNewProduct({
        title: "", description: "", price: "", category: "", subcategory: "", gender: "",
        images: "", size: "", colors: "", discount: "", stock: "1", brand: "", theme: "",
      });
      setImagesList([]);
      refetch();
    } catch (error) {
      setToast({ open: true, severity: "error", message: error?.data?.msg || "Failed to add product." });
    }
  };

  const handleDeviceFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      try {
        const res = await uploadImage({ file }).unwrap();
        if (res?.url) setImagesList((prev)=> [...prev, { url: res.url, from: 'uploaded', caption: '', alt: '' }]);
      } catch (err) {
        setToast({ open: true, severity: "error", message: err?.data?.message || "Image upload failed" });
      }
    }
    // reset input value so same file can be selected again if needed
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverIndex(null);
    // Files
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) {
      for (const file of files) {
        try {
          const res = await uploadImage({ file }).unwrap();
          if (res?.url) setImagesList((prev)=> [...prev, { url: res.url, from: 'uploaded', caption: '', alt: '' }]);
        } catch (err) {
          setToast({ open: true, severity: "error", message: err?.data?.message || "Image upload failed" });
        }
      }
    }
    // URLs/text
    const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (uri) {
      const parts = uri.split(/\s|\n|,/).map((s) => s.trim()).filter(Boolean);
      if (parts.length) {
        const prevUploaded = imagesList.filter((i)=>i.from==='uploaded');
        const prevUrlMap = new Map(imagesList.filter((i)=>i.from==='url').map((i)=>[i.url, i]));
        const currentUrls = imagesList.filter((i)=>i.from==='url').map(i=>i.url);
        const merged = Array.from(new Set([...currentUrls, ...parts]));
        const newUrlEntries = merged.map((u)=> prevUrlMap.get(u) || { url: u, from: 'url', caption: '', alt: '' });
        const finalList = [...newUrlEntries, ...prevUploaded];
        setImagesList(finalList);
        setNewProduct((p) => ({ ...p, images: finalList.filter(i=>i.from==='url').map(i=>i.url).join(", ") }));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index) => {
    setImagesList((prev) => {
      const arr = prev.slice();
      arr.splice(index, 1);
      const urls = arr.filter(i=>i.from==='url').map(i=>i.url).join(", ");
      setNewProduct((p)=> ({ ...p, images: urls }));
      return arr;
    });
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleTileDragEnter = (index) => setDragOverIndex(index);
  const handleTileDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setImagesList((prev) => {
      const arr = prev.slice();
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, moved);
      const urls = arr.filter(i=>i.from==='url').map(i=>i.url).join(", ");
      setNewProduct((p)=> ({ ...p, images: urls }));
      return arr;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const updateImageMeta = (index, key, value) => {
    setImagesList((prev)=> {
      const arr = prev.slice();
      arr[index] = { ...arr[index], [key]: value };
      return arr;
    });
  };

  const handleTileKeyDown = (e, index) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        setImagesList((prev) => {
          const arr = prev.slice();
          const [moved] = arr.splice(index, 1);
          arr.splice(index - 1, 0, moved);
          const urls = arr.filter(i=>i.from==='url').map(i=>i.url).join(", ");
          setNewProduct((p)=> ({ ...p, images: urls }));
          return arr;
        });
        setFocusIndex(index - 1);
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setImagesList((prev) => {
        if (index >= prev.length - 1) return prev;
        const arr = prev.slice();
        const [moved] = arr.splice(index, 1);
        arr.splice(index + 1, 0, moved);
        const urls = arr.filter(i=>i.from==='url').map(i=>i.url).join(", ");
        setNewProduct((p)=> ({ ...p, images: urls }));
        return arr;
      });
      setFocusIndex(Math.min(imagesList.length - 1, index + 1));
    }
  };

  const handleUrlsPaste = (e) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;
    const parts = text.split(/\r?\n|,/).map((s)=>s.trim()).filter(Boolean);
    if (parts.length <= 1) return; // allow normal paste if single
    e.preventDefault();
    const prevUploaded = imagesList.filter((i)=>i.from==='uploaded');
    const prevUrlMap = new Map(imagesList.filter((i)=>i.from==='url').map((i)=>[i.url, i]));
    const currentUrls = imagesList.filter((i)=>i.from==='url').map(i=>i.url);
    const merged = Array.from(new Set([...currentUrls, ...parts]));
    const newUrlEntries = merged.map((u)=> prevUrlMap.get(u) || { url: u, from: 'url', caption: '', alt: '' });
    const finalList = [...newUrlEntries, ...prevUploaded];
    setImagesList(finalList);
    setNewProduct((p)=> ({ ...p, images: finalList.filter(i=>i.from==='url').map(i=>i.url).join(', ') }));
  };

  const products = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  
  // Enhanced search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  
  // Get unique values for filters
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueGenders = [...new Set(products.map(p => p.gender).filter(Boolean))];
  
  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    // Text search
    const matchesSearch = !q || [
      p.title,
      p.category,
      p.subcategory,
      p.brand,
      p.theme,
      p.gender,
      Array.isArray(p.color) ? p.color.join(", ") : p.color,
      p._id
    ].some((field) => (field || "").toString().toLowerCase().includes(q));
    
    // Category filter
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    
    // Gender filter
    const matchesGender = !genderFilter || p.gender === genderFilter;
    
    // Stock filter
    const matchesStock = !stockFilter || 
      (stockFilter === "in-stock" && (p.supply > 0)) ||
      (stockFilter === "out-of-stock" && (p.supply <= 0)) ||
      (stockFilter === "low-stock" && (p.supply > 0 && p.supply <= 5));
    
    return matchesSearch && matchesCategory && matchesGender && matchesStock;
  });
  
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setGenderFilter("");
    setStockFilter("");
  };

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
    <Box m="1.5rem 2.5rem" >
      <Box display="flex" alignItems="center" justifyContent="space-between" >
        <Header title="PRODUCTS" subtitle="See your list of products." />
        <Tooltip title="Add a new product" >
          <span>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add Product
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Enhanced Search and Filters */}
      <Box mt={3} mb={2}>
        <Card sx={{
          border: theme.palette.mode === 'dark' ? '0px solid gray' : '0px solid black', boxShadow: 4,
          p: 2, 
          backgroundColor:  theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.default,
          fontWeight: 'bold',
          color: theme.palette.mode === 'dark' ? 'white' : 'black',
         }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FilterIcon color="primary" />
            <Typography variant="h6" sx={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            fontWeight: 'bold',
          }}>
              Search & Filter Products
            </Typography>
            {(searchQuery || categoryFilter || genderFilter || stockFilter) && (
              <Chip
                label="Clear All"
                variant="outlined"
                size="small"
                deleteIcon={<ClearIcon />}
                onDelete={clearFilters}
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search by title, category, brand, theme, color, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Filter Row */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {uniqueCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={genderFilter}
                  label="Gender"
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <MenuItem value="">All Genders</MenuItem>
                  {uniqueGenders.map((gender) => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={stockFilter}
                  label="Stock Status"
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <MenuItem value="">All Stock</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock (≤5)</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Active Filters */}
          {(categoryFilter || genderFilter || stockFilter) && (
            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
                Active filters:
              </Typography>
              {categoryFilter && (
                <Chip
                  label={`Category: ${categoryFilter}`}
                  size="small"
                  onDelete={() => setCategoryFilter("")}
                  color="primary"
                  variant="outlined"
                />
              )}
              {genderFilter && (
                <Chip
                  label={`Gender: ${genderFilter}`}
                  size="small"
                  onDelete={() => setGenderFilter("")}
                  color="primary"
                  variant="outlined"
                />
              )}
              {stockFilter && (
                <Chip
                  label={`Stock: ${stockFilter.replace('-', ' ')}`}
                  size="small"
                  onDelete={() => setStockFilter("")}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Card>
      </Box>

      <Grid container spacing={3} mt={2}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Product
              product={product}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </Grid>
        ))}
        {filteredProducts.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" sx={{ color: 'text.secondary', mt: 4 }}>
              No products match your search.
            </Typography>
          </Grid>
        )}
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

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Add New Product
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Fill in required fields. Images can be added via URLs or uploaded from your device.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Title" name="title" value={newProduct.title} onChange={handleNewChange} helperText="Product title (required)" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required multiline rows={3} label="Description" name="description" value={newProduct.description} onChange={handleNewChange} helperText="Short description (required)" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={categoryOptions}
                value={newProduct.category}
                onInputChange={(_, val) => setNewProduct((p)=>({ ...p, category: val }))}
                renderInput={(params) => (
                  <TextField {...params} required label="Category" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Subcategory" name="subcategory" value={newProduct.subcategory} onChange={handleNewChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={genderOptions}
                value={newProduct.gender}
                onInputChange={(_, val) => setNewProduct((p)=>({ ...p, gender: val }))}
                renderInput={(params) => (
                  <TextField {...params} required label="Gender (men/women/kid)" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Price" name="price" type="number" value={newProduct.price} onChange={handleNewChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Discount (%)" name="discount" type="number" value={newProduct.discount} onChange={handleNewChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Stock (quantity)" name="stock" type="number" value={newProduct.stock} onChange={handleNewChange} helperText="Default 1. 0 means Out of Stock." />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Images</Typography>
              <TextField fullWidth label="Image URLs (comma separated)" name="images" value={newProduct.images} onChange={handleNewChange} onPaste={handleUrlsPaste} helperText="Paste multiple URLs (commas or new lines). Drag to reorder below." />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Button variant="outlined" component="label" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload from device'}
                  <input hidden accept="image/*" multiple type="file" onChange={handleDeviceFiles} />
                </Button>
              </Box>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  mt: 1.5,
                  p: 2,
                  border: '2px dashed',
                  borderColor: isDragOver ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  bgcolor: isDragOver ? 'action.hover' : 'transparent',
                }}
              >
                Drag & drop images or URLs here
              </Box>
              {imagesList.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                  {imagesList.map((img, idx) => (
                    <Box
                      key={`img-${idx}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e)=> e.preventDefault()}
                      onDragEnter={() => handleTileDragEnter(idx)}
                      onDrop={() => handleTileDrop(idx)}
                      tabIndex={0}
                      onFocus={() => setFocusIndex(idx)}
                      onKeyDown={(e)=> handleTileKeyDown(e, idx)}
                      sx={{ width: 160, borderRadius: 1, border: '2px solid', borderColor: (dragOverIndex===idx? 'primary.main' : 'rgba(0,0,0,0.08)'), p: 1, outline: (focusIndex===idx? '2px solid rgba(25,118,210,0.6)' : 'none') }}
                    >
                      <Box sx={{ position: 'relative', width: '100%', height: 84, borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                        <Box sx={{ position: 'absolute', top: 2, left: 2, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', borderRadius: 1, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DragIndicatorIcon fontSize="small" />
                          <Typography variant="caption">Drag</Typography>
                        </Box>
                        <img src={img.url} alt={img.alt || 'preview'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton size="small" onClick={() => removeImage(idx)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <TextField size="small" placeholder="Caption" value={img.caption} onChange={(e)=> updateImageMeta(idx, 'caption', e.target.value)} sx={{ mt: 1 }} fullWidth />
                      <TextField size="small" placeholder="Alt text" value={img.alt} onChange={(e)=> updateImageMeta(idx, 'alt', e.target.value)} sx={{ mt: 1 }} fullWidth />
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Sizes (comma separated)" name="size" value={newProduct.size} onChange={handleNewChange} helperText="Example: S, M, L, XL" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Colors (comma separated)" name="colors" value={newProduct.colors} onChange={handleNewChange} helperText="Example: red, blue, black" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Brand" name="brand" value={newProduct.brand} onChange={handleNewChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Theme" name="theme" value={newProduct.theme} onChange={handleNewChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={isAdding || isUploading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSubmit}
            disabled={
              isAdding || isUploading ||
              !newProduct.title.trim() ||
              !newProduct.description.trim() ||
              !newProduct.category.trim() ||
              !newProduct.subcategory.trim() ||
              !newProduct.gender.trim() ||
              !newProduct.price || Number(newProduct.price) <= 0 ||
              (imagesList.length === 0) ||
              (newProduct.size.split(',').map(s=>s.trim()).filter(Boolean).length === 0) ||
              (newProduct.colors.split(',').map(s=>s.trim()).filter(Boolean).length === 0) ||
              !newProduct.brand.trim() ||
              !newProduct.theme.trim()
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
