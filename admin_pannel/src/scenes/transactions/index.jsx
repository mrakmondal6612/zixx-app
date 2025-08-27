import React, { useMemo, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "@components/Header";
import { useGetAdminTransactionsQuery } from '@state/api';
import DataGridCustomToolbar from "@components/DataGridCustomToolbar";

const Transactions = () => {
  const theme = useTheme();
  // values to be sent to the backend
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useGetAdminTransactionsQuery(
    { page, pageSize, sort: JSON.stringify(sort || {}), search },
    { refetchOnMountOrArgChange: true }
  );

  // Use only API data; no dummy fallback
  const rows = useMemo(() => {
    if (!data || !Array.isArray(data.transactions)) return [];
    return data.transactions;
  }, [data]);
  const totalRows = useMemo(() => {
    if (data && typeof data.total === 'number') return data.total;
    return rows.length;
  }, [data, rows]);
  const columns = [
    {
      field: "_id",
      headerName: "ID",
      flex: 1,
    },
    {
      field: "userId",
      headerName: "User ID",
      flex: 1,
    },

    {
      field: "createdAt",
      headerName: "CreatedAt",
      flex: 1,
    },

    {
      field: "products",
      headerName: "# of Products",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => params.value.length,
    },
    {
      field: "cost",
      headerName: "Cost",
      flex: 1,
      renderCell: (params) => `$${Number(params.value).toFixed(2)}`,
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="TRANSACTIONS" subtitle="Entire list of Transactions" />
      <Box
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },

          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,

            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },

          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,

            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={isLoading}
          getRowId={(row) => row._id}
          rows={rows}
          columns={columns}
          rowCount={totalRows}
          rowsPerPageOptions={[20, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSortModelChange={(newSortModel) => setSort(Array.isArray(newSortModel) ? (newSortModel[0] || {}) : {})}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{
            toolbar: { searchInput, setSearchInput, setSearch },
          }}
        />
        {!isLoading && !error && rows.length === 0 && (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="body2" color="text.secondary">No transactions found.</Typography>
          </Box>
        )}
        {error && (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="body2" color="error.main">Failed to load transactions.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Transactions;
