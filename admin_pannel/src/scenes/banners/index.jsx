import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { getApiBase } from '@utils/apiBase';

const apiBase = getApiBase();

const Banners = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    page: 'home',
    position: 'hero',
    imageUrl: '',
    heading: '',
    description: '',
    linkText: 'Shop Now',
    linkUrl: '/',
    active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }), [token]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/banners`, { headers, credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load banners');
      setList(json.data || []);
    } catch (e) {
      alert(`Load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const pageOptions = [
    { value: 'home', label: 'Home' },
    { value: 'women', label: 'Women' },
    { value: 'men', label: 'Men' },
    { value: 'kids', label: 'Kids' },
  ];

  const positionOptions = {
    home: [
      { value: 'hero', label: 'Hero (Top)' },
      { value: 'new-arrivals', label: 'New Arrivals' },
      { value: 'featured', label: 'Featured' },
      { value: 'men-promo', label: 'Men Promo' },
    ],
    women: [ { value: 'featured', label: 'Featured' } ],
    men: [ { value: 'featured', label: 'Featured' } ],
    kids: [ { value: 'featured', label: 'Featured' } ],
  };

  const currentPositions = positionOptions[form.page] || positionOptions.home;

  const handleTestFetch = async () => {
    const url = `${apiBase}/clients/banners?page=${encodeURIComponent(form.page)}&position=${encodeURIComponent(form.position)}&active=true`;
    try {
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      alert(`Client fetch: ${res.status} — ${json?.data?.length ?? 0} item(s) for ${form.page}/${form.position}`);
    } catch (e) {
      alert('Client test fetch failed');
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return alert('Select an image file first');
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await fetch(`${apiBase}/admin/banners/upload`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: fd,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || 'Upload failed');
      setForm((f) => ({ ...f, imageUrl: json.url }));
      alert('Image uploaded');
    } catch (e) {
      alert(e.message || 'Upload failed');
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.imageUrl || !form.heading) return alert('Image and Heading are required');
      const res = await fetch(`${apiBase}/admin/banners`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || 'Create failed');
      setForm({ page: 'home', position: 'hero', imageUrl: '', heading: '', description: '', linkText: 'Shop Now', linkUrl: '/', active: true });
      setImageFile(null);
      await fetchList();
      alert('Banner created');
    } catch (e) {
      alert(e.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`${apiBase}/admin/banners/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || 'Delete failed');
      await fetchList();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={2}>Banners</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Create / Upload" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Select fullWidth value={form.page} onChange={(e) => setForm({ ...form, page: String(e.target.value), position: (positionOptions[String(e.target.value)]?.[0]?.value) || 'hero' })}>
                    {pageOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  <Select fullWidth value={form.position} onChange={(e) => setForm({ ...form, position: String(e.target.value) })}>
                    {currentPositions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" component="label">
                    Choose Image
                    <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  </Button>
                  <Button variant="contained" onClick={handleUpload}>Upload</Button>
                </Stack>
                <TextField label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
                <TextField label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} fullWidth />
                <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
                <Stack direction="row" spacing={2}>
                  <TextField label="Link Text" value={form.linkText} onChange={(e) => setForm({ ...form, linkText: e.target.value })} fullWidth />
                  <TextField label="Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} fullWidth />
                </Stack>
                <Select value={form.active ? 'true' : 'false'} onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}>
                  <MenuItem value={'true'}>Active</MenuItem>
                  <MenuItem value={'false'}>Inactive</MenuItem>
                </Select>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={handleTestFetch}>Test Fetch</Button>
                  <Button variant="contained" onClick={handleCreate}>Create Banner</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="Existing Banners" subheader={loading ? 'Loading...' : `${list.length} items`} />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {list.map((b) => (
                  <Box key={b._id} display="flex" alignItems="center" gap={2}>
                    <img src={b.imageUrl} alt={b.heading} style={{ width: 96, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                    <Box flex={1}>
                      <Typography variant="subtitle1">{b.page} / {b.position}</Typography>
                      <Typography variant="body2">{b.heading}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.linkText} → {b.linkUrl}</Typography>
                    </Box>
                    <IconButton color="error" onClick={() => handleDelete(b._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                {list.length === 0 && !loading && (
                  <Typography variant="body2" color="text.secondary">No banners yet.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Banners;
