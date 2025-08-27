import React from "react";
import { Box, Typography, Button, Stack, Grid, Card, CardContent, CardActions, Divider, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Tooltip, IconButton, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Header from "@components/Header";
import { useGetAdminOrdersQuery, useVerifyAdminOrderMutation, useConfirmAdminOrderMutation, useDeliverAdminOrderMutation, useRefundAdminOrderMutation, useDeleteAdminOrderMutation, usePackAdminOrderMutation, useUpdateAdminOrderCourierMutation, useUploadAdminOrderCourierLogoMutation } from "@state/api";

const Orders = () => {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery(undefined, { refetchOnMountOrArgChange: true });
  const [verifyAdminOrder, { isLoading: isVerifying }] = useVerifyAdminOrderMutation();
  const [confirmAdminOrder, { isLoading: isConfirming }] = useConfirmAdminOrderMutation();
  const [deliverAdminOrder, { isLoading: isDelivering }] = useDeliverAdminOrderMutation();
  const [refundAdminOrder, { isLoading: isRefunding }] = useRefundAdminOrderMutation();
  const [deleteAdminOrder, { isLoading: isDeleting }] = useDeleteAdminOrderMutation();
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundOrderRow, setRefundOrderRow] = React.useState(null);
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundError, setRefundError] = React.useState("");
  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'info' });
  const [courierOpen, setCourierOpen] = React.useState(false);
  const [courierRow, setCourierRow] = React.useState(null);
  const [carrier, setCarrier] = React.useState("");
  const [carrierUrl, setCarrierUrl] = React.useState("");
  const [courierPhone, setCourierPhone] = React.useState("");
  const [courierLogoUrl, setCourierLogoUrl] = React.useState("");
  const [courierErr, setCourierErr] = React.useState("");
  const [preset, setPreset] = React.useState("");
  const [logoFile, setLogoFile] = React.useState(null);
  // Per-row state to avoid global side-effects when packing
  const [packingIds, setPackingIds] = React.useState(new Set());
  const [packedOverride, setPackedOverride] = React.useState({}); // { [orderId]: isoDate }
  const showToast = (message, severity = 'info') => setToast({ open: true, message, severity });
  const closeToast = (_, reason) => { if (reason === 'clickaway') return; setToast((t) => ({ ...t, open: false })); };

  const rows = Array.isArray(data?.orders) ? data.orders : [];

  // Helpers
  const maskPhone = (p) => {
    if (!p) return '';
    const digits = String(p).replace(/\D/g, '');
    if (digits.length <= 4) return '*'.repeat(Math.max(0, digits.length - 2)) + digits.slice(-2);
    return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
  };

  const isHttpUrl = (u) => typeof u === 'string' && /^https?:\/\//i.test(u);

  const getUserText = (row) => {
    const u = row?.userId;
    if (!u) return "-";
    const first = u.first_name || u.firstName || "";
    const last = u.last_name || u.lastName || "";
    const email = u.email || "";
    return (first || last) ? `${first} ${last}`.trim() : email || u._id || "-";
  };

  const [packAdminOrder, { isLoading: isPacking }] = usePackAdminOrderMutation();
  const [updateCourier, { isLoading: isUpdatingCourier }] = useUpdateAdminOrderCourierMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadAdminOrderCourierLogoMutation();

  const handlePack = async (row) => {
    try {
      if (!row.isVerified) return showToast('Verify order before packing', 'warning');
      if (row.packedAt || packedOverride[row._id]) return showToast('Order already packed', 'info');
      const notes = window.prompt('Add packing notes (optional):', '');
      // optimistic: mark only this row as packed locally
      const nowIso = new Date().toISOString();
      setPackedOverride((prev) => ({ ...prev, [row._id]: nowIso }));
      setPackingIds((prev) => {
        const next = new Set(prev);
        next.add(row._id);
        return next;
      });
      await packAdminOrder({ id: row._id, adminNotes: notes || undefined }).unwrap();
      showToast('Order marked as packed', 'success');
      refetch();
    } catch (e) {
      console.error('Failed to mark packed', e);
      showToast(e?.data?.msg || e?.message || 'Failed to mark packed', 'error');
      // rollback optimistic state for this row
      setPackedOverride((prev) => {
        const { [row._id]: _omit, ...rest } = prev || {};
        return rest;
      });
    } finally {
      setPackingIds((prev) => {
        const next = new Set(prev);
        next.delete(row._id);
        return next;
      });
    }
  };

  const openCourier = (row) => {
    setCourierRow(row);
    setCarrier(row?.carrier || '');
    setCarrierUrl(row?.carrierUrl || '');
    setCourierPhone(row?.courierPhone || '');
    setCourierLogoUrl(row?.courierLogoUrl || '');
    setCourierErr('');
    setPreset('');
    setLogoFile(null);
    setCourierOpen(true);
  };

  const submitCourier = async () => {
    try {
      setCourierErr('');
      if (carrierUrl && !isHttpUrl(carrierUrl)) return setCourierErr('Carrier URL must start with http or https');
      if (courierLogoUrl && !isHttpUrl(courierLogoUrl)) return setCourierErr('Logo URL must start with http or https');
      await updateCourier({ id: courierRow._id, carrier: carrier || undefined, carrierUrl: carrierUrl || undefined, courierPhone: courierPhone || undefined, courierLogoUrl: courierLogoUrl || undefined }).unwrap();
      setCourierOpen(false);
      showToast('Courier info updated', 'success');
      refetch();
    } catch (e) {
      console.error('Failed to update courier', e);
      setCourierErr(e?.data?.msg || e?.message || 'Failed to update courier');
      showToast(e?.data?.msg || e?.message || 'Failed to update courier', 'error');
    }
  };

  const presets = [
    { name: 'Select preset', url: '' },
    { name: 'Delhivery', url: 'https://www.delhivery.com/' },
    { name: 'Bluedart', url: 'https://www.bluedart.com/' },
    { name: 'DTDC', url: 'https://www.dtdc.in/' },
    { name: 'XpressBees', url: 'https://www.xpressbees.com/' },
    { name: 'Ecom Express', url: 'https://www.ecomexpress.in/' },
    { name: 'India Post', url: 'https://www.indiapost.gov.in/' },
  ];

  const onPresetChange = (val) => {
    setPreset(val);
    const p = presets.find(p => p.name === val);
    if (!p) return;
    // set carrier; do not override if user already typed a different name
    if (!carrier) setCarrier(p.name);
    if (!carrierUrl) setCarrierUrl(p.url);
  };

  const onSelectLogoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    if (!courierRow || !courierRow._id) return;
    try {
      const res = await uploadLogo({ id: courierRow._id, file }).unwrap();
      if (res && res.url) {
        setCourierLogoUrl(res.url);
        showToast('Logo uploaded', 'success');
        // reflect ASAP in list
        refetch();
      } else {
        showToast('Logo uploaded but no URL returned', 'warning');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showToast(err?.data?.msg || err?.message || 'Failed to upload logo', 'error');
    }
  };

  const handleDeliver = async (row) => {
    try {
      if (row.status === 'cancelled') return showToast('Cannot deliver a cancelled order', 'warning');
      if (row.deliveryStatus === 'delivered' || row.status === 'completed') {
        return showToast('Order already delivered', 'info');
      }
      if (row.deliveryStatus !== 'shipped') {
        return showToast('Confirm (ship) the order before marking delivered', 'warning');
      }
      const notes = window.prompt("Add delivery notes (optional):", "");
      await deliverAdminOrder({ id: row._id, adminNotes: notes || undefined }).unwrap();
      showToast('Order marked as delivered', 'success');
      refetch();
    } catch (e) {
      console.error("Failed to mark delivered", e);
      showToast(e?.data?.msg || e?.message || 'Failed to mark delivered', 'error');
    }
  };

  const openRefundModal = (row) => {
    if (!row || !row._id) return;
    const isRefunded = String(row.paymentStatus) === 'refunded' || (String(row.status) === 'cancelled' && String(row.adminNotes || '').toLowerCase().includes('refund'));
    if (isRefunded) return showToast('Order already refunded.', 'info');
    if (row.status === 'cancelled') {
      return showToast('Order already cancelled.', 'info');
    }
    if (row.paymentStatus !== 'paid') {
      const proceed = window.confirm('This order is not marked as paid. Proceed to attempt refund anyway?');
      if (!proceed) return;
    }
    setRefundOrderRow(row);
    setRefundAmount("");
    setRefundError("");
    setRefundOpen(true);
  };

  const submitRefund = async () => {
    try {
      setRefundError("");
      const raw = (refundAmount || "").trim();
      const amount = raw === "" ? undefined : Number(raw);
      if (amount !== undefined) {
        if (Number.isNaN(amount)) {
          setRefundError('Amount must be a number.');
          return;
        }
        if (amount <= 0) {
          setRefundError('Amount must be greater than 0.');
          return;
        }
      }
      await refundAdminOrder({ id: refundOrderRow._id, amount }).unwrap();
      setRefundOpen(false);
      setRefundOrderRow(null);
      setRefundAmount("");
      setRefundError("");
      showToast('Refund processed successfully', 'success');
      refetch();
    } catch (e) {
      console.error('Refund failed', e);
      const msg = e?.data?.msg || e?.error || e?.message || 'Refund failed';
      setRefundError(String(msg));
      showToast(String(msg), 'error');
    }
  };

  const handleVerify = async (row) => {
    try {
      const notes = window.prompt("Add admin notes (optional):", "");
      await verifyAdminOrder({ id: row._id, adminNotes: notes || undefined }).unwrap();
      showToast('Order verified', 'success');
      refetch();
    } catch (e) {
      console.error("Failed to verify order", e);
      showToast('Failed to verify order', 'error');
    }
  };

  const handleConfirm = async (row) => {
    try {
      if (!row.isVerified) {
        return showToast('Verify order before confirming for delivery', 'warning');
      }
      const tracking = window.prompt("Tracking number (optional):", row.trackingNumber || "");
      await confirmAdminOrder({ id: row._id, trackingNumber: tracking || undefined }).unwrap();
      showToast('Order confirmed for delivery', 'success');
      refetch();
    } catch (e) {
      console.error("Failed to confirm order for delivery", e);
      showToast('Failed to confirm order for delivery', 'error');
    }
  };

  //

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="ORDERS" subtitle="All product orders" />
      {isError ? (
        <Typography color="error" mt={2}>Failed to load orders.</Typography>
      ) : (
        <Box>
          {isLoading ? (
            <Typography mt={2}>Loading orders...</Typography>
          ) : rows.length === 0 ? (
            <Typography mt={2}>No orders found.</Typography>
          ) : (
            <Grid container spacing={3} mt={2}>
              {rows.map((row) => {
                const packedAtVal = row.packedAt || packedOverride[row._id];
                const canVerify = !row.isVerified && row.status !== 'cancelled';
                const canConfirm = row.isVerified && !['shipped', 'delivered'].includes(row.deliveryStatus) && row.status !== 'cancelled';
                const canPack = row.isVerified && !packedAtVal && row.status !== 'cancelled';
                const canDeliver = row.deliveryStatus === 'shipped' && row.status !== 'cancelled' && row.deliveryStatus !== 'delivered';
                const orderDate = row.orderDate || row.createdAt;
                const isRefunded = String(row.paymentStatus) === 'refunded' || (String(row.status) === 'cancelled' && String(row.adminNotes || '').toLowerCase().includes('refund'));
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={row._id}>
                    <Card
                      sx={{
                        position: 'relative',
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.alt : "#87A6A8",
                        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "#D9DEDD",
                        border: theme.palette.mode === 'dark' ? '1px solid transparent' : `1px solid ${theme.palette.neutral[200]}`,
                        borderRadius: "1rem",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        height: '100%',
                        // width: '18rem',
                        display: 'flex',
                        flexDirection: 'column',
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
                        },
                        ...(isRefunded ? {
                          opacity: 0.8,
                          filter: 'grayscale(0.15)',
                          borderStyle: 'dashed',
                        } : {}),
                      }}
                    >
                      {/* Delete icon (top-right) */}
                      <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                        <Tooltip title="Delete order" arrow>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                const ok = window.confirm('Delete this order? This action cannot be undone.');
                                if (!ok) return;
                                try {
                                  await deleteAdminOrder({ id: row._id }).unwrap();
                                  showToast('Order deleted', 'success');
                                  refetch();
                                } catch (e) {
                                  showToast(e?.data?.msg || e?.message || 'Failed to delete order', 'error');
                                }
                              }}
                              disabled={isDeleting}
                              sx={{
                                bgcolor: 'rgba(244, 67, 54, 0.08)',
                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.18)' },
                                borderRadius: '8px',
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            color: theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[900]
                          }}
                        >
                          {row._id}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={0.5} sx={{ color: theme.palette.mode === "dark" ? theme.palette.grey[200] : theme.palette.grey[800], fontWeight: 600  }}>
                          <Typography variant="body2">
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944' , fontWeight: 600 }}>User: </Box>
                            {getUserText(row)}
                          </Typography>
                          <Typography variant="body2">
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Items: </Box>
                            {Array.isArray(row.orderItems) ? row.orderItems.length : 0}
                          </Typography>
                          <Typography variant="body2">
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Total: </Box>
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>{Number(row.totalAmount || 0).toFixed(2)}</Box>
                          </Typography>
                          <Typography variant="body2">
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Address: </Box>
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>{row.shippingAddress || '-'}</Box>
                          </Typography>
                          <Typography variant="body2">
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Date: </Box>
                            <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>{orderDate ? new Date(orderDate).toLocaleString() : '-'}</Box>
                          </Typography>
                          {row.trackingNumber ? (
                            <Typography variant="body2">
                              <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Tracking: </Box>
                              <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>{row.trackingNumber}</Box>
                            </Typography>
                          ) : null}
                          {packedAtVal ? (
                            <Typography variant="body2">
                              <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Packed At: </Box>
                              <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>{new Date(packedAtVal).toLocaleString()}</Box>
                            </Typography>
                          ) : null}
                          {(row.carrier || row.courierPhone || row.courierLogoUrl) ? (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Courier:</Box>
                                {row.courierLogoUrl ? (
                                  <Box component="img" src={row.courierLogoUrl} alt="courier logo" sx={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 0.5, border: '1px solid rgba(0,0,0,0.06)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : null}
                                {row.carrierUrl ? (
                                  <a href={row.carrierUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                    {row.carrier || row.carrierUrl}
                                  </a>
                                ) : (
                                  <span>{row.carrier || '-'}</span>
                                )}
                              </Typography>
                              {row.courierPhone ? (
                                <Typography variant="body2">
                                  <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Phone: </Box>
                                  {maskPhone(row.courierPhone)}
                                </Typography>
                              ) : null}
                            </Box>
                          ) : null}
                          {row.adminNotes ? (
                            <Typography variant="body2">
                              <Box component="span" sx={{ color: theme.palette.mode === "dark" ? theme.palette.secondary[300] : '#032944', fontWeight: 600 }}>Notes: </Box>
                              <span style={{ whiteSpace: 'pre-wrap' }}>{row.adminNotes}</span>
                            </Typography>
                          ) : null}
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2"><Box component="span" sx={{ fontWeight: 700 }}>Verified:</Box> {row.isVerified ? 'Yes' : 'No'}</Typography>
                            <Typography variant="body2"><Box component="span" sx={{ fontWeight: 700 }}>Payment:</Box> {String(row.paymentStatus || 'unpaid')}</Typography>
                            <Typography variant="body2"><Box component="span" sx={{ fontWeight: 700 }}>Status:</Box> {String(row.status || 'pending')}</Typography>
                            <Typography variant="body2"><Box component="span" sx={{ fontWeight: 700 }}>Delivery:</Box> {String(row.deliveryStatus || 'pending')}</Typography>
                          </Stack>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, width: '100%' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ px: 1.2, py: 0.5, width: '100%', fontSize: 12, borderRadius: 1.2, color: theme.palette.mode === "dark" ? "#0AC2F5" : "#033645", borderColor: theme.palette.mode === "dark" ? "#0AC2F5" : "#033645" }}
                            disabled={!canVerify || isVerifying}
                            onClick={() => handleVerify(row)}
                          >
                            VERIFY
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ px: 1.2, py: 0.5, width: '100%', fontSize: 12, borderRadius: 1.2 }}
                            disabled={!canConfirm || isConfirming}
                            onClick={() => handleConfirm(row)}
                          >
                            CONFIRM
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            sx={{ px: 1.2, py: 0.5, width: '100%', fontSize: 12, borderRadius: 1.2 }}
                            disabled={!canPack || packingIds.has(row._id)}
                            onClick={() => handlePack(row)}
                          >
                            {packingIds.has(row._id) ? 'PACKING...' : 'MARK PACKED'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ px: 1.2, py: 0.5, width: '100%', fontSize: 12, borderRadius: 1.2 }}
                            onClick={() => openCourier(row)}
                          >
                            UPDATE COURIER
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            sx={{ px: 1.2, py: 0.5, width: '100%', fontSize: 12, borderRadius: 1.2 }}
                            disabled={!canDeliver || isDelivering}
                            onClick={() => handleDeliver(row)}
                          >
                            MARK DELIVERED
                          </Button>
                          <Tooltip title={isRefunded ? "Already refunded" : "Initiate refund"} disableHoverListener={!isRefunded} arrow>
                            <span>
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                sx={{
                                  px: 1.2,
                                  py: 0.5,
                                  width: '100%',
                                  fontSize: 12,
                                  borderRadius: 1.2,
                                  // Keep visual consistency even when disabled
                                  '&.Mui-disabled': {
                                    color: theme.palette.getContrastText(theme.palette.warning.main),
                                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.main,
                                    opacity: 0.5,
                                  },
                                }}
                                disabled={isRefunded || isRefunding}
                                onClick={() => openRefundModal(row)}
                              >
                                {isRefunded ? 'REFUNDED' : 'REFUND'}
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
              </Grid>
          )}
        </Box>
      )}

      {/* Refund Modal */}
      <Dialog open={refundOpen} onClose={() => (!isRefunding && setRefundOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Refund Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Enter refund amount in INR (leave blank for full refund)
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (INR)"
            type="number"
            fullWidth
            inputProps={{ step: "0.01", min: "0" }}
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            error={Boolean(refundError)}
            helperText={refundError || ""}
            disabled={isRefunding}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundOpen(false)} disabled={isRefunding}>Cancel</Button>
          <Button onClick={submitRefund} variant="contained" disabled={isRefunding}>
            {isRefunding ? <><CircularProgress size={16} style={{ marginRight: 8 }} /> Processing...</> : 'Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Courier Modal */}
      <Dialog open={courierOpen} onClose={() => (!isUpdatingCourier && setCourierOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Update Courier</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <FormControl fullWidth>
              <InputLabel id="preset-label">Carrier Preset</InputLabel>
              <Select
                labelId="preset-label"
                label="Carrier Preset"
                value={preset}
                onChange={(e) => onPresetChange(e.target.value)}
              >
                {presets.map(p => (
                  <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Courier Name" value={carrier} onChange={(e) => setCarrier(e.target.value)} fullWidth />
            <TextField label="Tracking/Carrier URL" value={carrierUrl} onChange={(e) => setCarrierUrl(e.target.value)} fullWidth placeholder="https://..." />
            <TextField label="Courier Phone" value={courierPhone} onChange={(e) => setCourierPhone(e.target.value)} fullWidth placeholder="+91 98-7654-3210" />
            <TextField label="Courier Logo URL" value={courierLogoUrl} onChange={(e) => setCourierLogoUrl(e.target.value)} fullWidth placeholder="https://cdn.example.com/logo.png" />
            <Box>
              <Button component="label" variant="outlined" size="small" disabled={isUploadingLogo || !courierRow}>
                {isUploadingLogo ? <><CircularProgress size={14} style={{ marginRight: 8 }} /> Uploading...</> : 'Upload Logo File'}
                <input type="file" accept="image/*" hidden onChange={onSelectLogoFile} />
              </Button>
              {logoFile ? (
                <Typography variant="caption" sx={{ ml: 1 }}>{logoFile.name}</Typography>
              ) : null}
            </Box>
            {courierErr ? <Alert severity="error">{courierErr}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourierOpen(false)} disabled={isUpdatingCourier}>Cancel</Button>
          <Button onClick={submitCourier} variant="contained" disabled={isUpdatingCourier}>
            {isUpdatingCourier ? <><CircularProgress size={16} style={{ marginRight: 8 }} /> Saving...</> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
