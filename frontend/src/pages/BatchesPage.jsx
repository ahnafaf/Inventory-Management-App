import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { stockApi, itemsApi } from '../services/api';

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    itemId: '',
    batchNumber: '',
    hasStock: true,
    sortBy: 'expiry_date',
    sortDirection: 'asc'
  });

  // Load data on component mount
  useEffect(() => {
    fetchItems();
    fetchBatches();
  }, []);

  // Fetch items for the filter dropdown
  const fetchItems = async () => {
    try {
      const data = await itemsApi.getAll();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  // Fetch batches with optional filters
  const fetchBatches = async (filterParams = filters) => {
    try {
      setLoading(true);
      
      // Remove empty filter values
      const cleanedFilters = {};
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] !== '') {
          cleanedFilters[key] = filterParams[key];
        }
      });
      
      const data = await stockApi.getBatches(cleanedFilters);
      setBatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load batches. Please try again.');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search button click
  const handleSearch = () => {
    fetchBatches(filters);
  };

  // Handle reset filters
  const handleReset = () => {
    const defaultFilters = {
      itemId: '',
      batchNumber: '',
      hasStock: true,
      sortBy: 'expiry_date',
      sortDirection: 'asc'
    };
    setFilters(defaultFilters);
    fetchBatches(defaultFilters);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Stock Batches</Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                name="itemId"
                value={filters.itemId}
                onChange={handleFilterChange}
                label="Item"
              >
                <MenuItem value="">All Items</MenuItem>
                {items.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} {item.sku ? `(${item.sku})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              name="batchNumber"
              label="Batch Number"
              value={filters.batchNumber}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                name="hasStock"
                value={filters.hasStock}
                onChange={handleFilterChange}
                label="Stock Status"
              >
                <MenuItem value={true}>Has Stock</MenuItem>
                <MenuItem value={false}>Out of Stock</MenuItem>
                <MenuItem value="">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                label="Sort By"
              >
                <MenuItem value="expiry_date">Expiry Date</MenuItem>
                <MenuItem value="created_at">Created Date</MenuItem>
                <MenuItem value="batch_number">Batch Number</MenuItem>
                <MenuItem value="current_quantity">Current Quantity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                name="sortDirection"
                value={filters.sortDirection}
                onChange={handleFilterChange}
                label="Sort Direction"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Batches Table */}
      {loading ? (
        <Typography>Loading batches...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Initial Quantity</TableCell>
                <TableCell>Current Quantity</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No batches found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.id}</TableCell>
                    <TableCell>{batch.item_name}</TableCell>
                    <TableCell>{batch.item_sku || '-'}</TableCell>
                    <TableCell>{batch.batch_number}</TableCell>
                    <TableCell>
                      {batch.expiry_date 
                        ? new Date(batch.expiry_date).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{batch.initial_quantity}</TableCell>
                    <TableCell>{batch.current_quantity}</TableCell>
                    <TableCell>
                      {new Date(batch.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default BatchesPage;