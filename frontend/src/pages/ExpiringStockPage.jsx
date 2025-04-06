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
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { stockApi } from '../services/api';

function ExpiringStockPage() {
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  // Load expiring batches on component mount and when days change
  useEffect(() => {
    fetchExpiringBatches();
  }, []);

  // Fetch expiring batches from API
  const fetchExpiringBatches = async (daysToExpiry = days) => {
    try {
      setLoading(true);
      const data = await stockApi.getExpiringBatches(daysToExpiry);
      setExpiringBatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load expiring batches. Please try again.');
      console.error('Error fetching expiring batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle days input change
  const handleDaysChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDays(value);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    fetchExpiringBatches(days);
  };

  // Calculate days left for expiry
  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine severity based on days left
  const getSeverity = (daysLeft) => {
    if (daysLeft <= 7) return 'error';
    if (daysLeft <= 14) return 'warning';
    return 'info';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Expiring Stock</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TextField
          label="Days Until Expiry"
          type="number"
          value={days}
          onChange={handleDaysChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">days</InputAdornment>,
            inputProps: { min: 1 }
          }}
          sx={{ width: 180, mr: 2 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      
      {loading ? (
        <Typography>Loading expiring batches...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Current Quantity</TableCell>
                <TableCell align="center">Days Left</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expiringBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No expiring stock found within the next {days} days.
                  </TableCell>
                </TableRow>
              ) : (
                expiringBatches.map((batch) => {
                  const daysLeft = calculateDaysLeft(batch.expiry_date);
                  const severity = getSeverity(daysLeft);
                  
                  return (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.item_name}</TableCell>
                      <TableCell>{batch.batch_number}</TableCell>
                      <TableCell>{new Date(batch.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>{batch.current_quantity}</TableCell>
                      <TableCell align="center">
                        <Alert 
                          severity={severity} 
                          sx={{ 
                            display: 'inline-flex',
                            py: 0,
                            '& .MuiAlert-message': { p: 0 }
                          }}
                        >
                          {daysLeft}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ExpiringStockPage;