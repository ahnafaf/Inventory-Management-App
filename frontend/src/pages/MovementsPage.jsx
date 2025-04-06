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
  Grid,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { stockApi, itemsApi } from '../services/api';

function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    itemId: '',
    movementType: '',
    startDate: null,
    endDate: null,
    sortBy: 'created_at',
    sortDirection: 'desc'
  });

  // Load data on component mount
  useEffect(() => {
    fetchItems();
    fetchMovements();
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

  // Fetch movements with optional filters
  const fetchMovements = async (filterParams = filters) => {
    try {
      setLoading(true);
      
      // Remove empty filter values and format dates
      const cleanedFilters = {};
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] !== '' && filterParams[key] !== null) {
          if (key === 'startDate' || key === 'endDate') {
            cleanedFilters[key] = dayjs(filterParams[key]).format('YYYY-MM-DD');
          } else {
            cleanedFilters[key] = filterParams[key];
          }
        }
      });
      
      const data = await stockApi.getMovements(cleanedFilters);
      setMovements(data);
      setError(null);
    } catch (err) {
      setError('Failed to load movements. Please try again.');
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search button click
  const handleSearch = () => {
    fetchMovements(filters);
  };

  // Handle reset filters
  const handleReset = () => {
    const defaultFilters = {
      itemId: '',
      movementType: '',
      startDate: null,
      endDate: null,
      sortBy: 'created_at',
      sortDirection: 'desc'
    };
    setFilters(defaultFilters);
    fetchMovements(defaultFilters);
  };

  // Get chip color based on movement type
  const getMovementChipColor = (type) => {
    switch (type) {
      case 'receive':
        return 'success';
      case 'issue':
        return 'primary';
      case 'adjust':
        return 'info';
      case 'write_off':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Stock Movements</Typography>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Movement Type</InputLabel>
                <Select
                  name="movementType"
                  value={filters.movementType}
                  onChange={handleFilterChange}
                  label="Movement Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="receive">Receive</MenuItem>
                  <MenuItem value="issue">Issue</MenuItem>
                  <MenuItem value="adjust">Adjust</MenuItem>
                  <MenuItem value="write_off">Write Off</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={filters.startDate}
              />
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
                  <MenuItem value="created_at">Date</MenuItem>
                  <MenuItem value="movement_type">Movement Type</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
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
        
        {/* Movements Table */}
        {loading ? (
          <Typography>Loading movements...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Batch Number</TableCell>
                  <TableCell>Movement Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No movements found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.id}</TableCell>
                      <TableCell>{new Date(movement.created_at).toLocaleString()}</TableCell>
                      <TableCell>{movement.item_name}</TableCell>
                      <TableCell>{movement.batch_number}</TableCell>
                      <TableCell>
                        <Chip 
                          label={movement.movement_type.replace('_', ' ')} 
                          color={getMovementChipColor(movement.movement_type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.reference || '-'}</TableCell>
                      <TableCell>{movement.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default MovementsPage;