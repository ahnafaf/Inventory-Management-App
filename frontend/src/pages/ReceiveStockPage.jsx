import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { itemsApi, stockApi } from '../services/api';

function ReceiveStockPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    batchNumber: '',
    quantity: '',
    expiryDate: null,
    reference: '',
    notes: ''
  });

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, expiryDate: date }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.itemId) {
        setSnackbar({
          open: true,
          message: 'Please select an item',
          severity: 'error'
        });
        return;
      }
      
      if (!formData.batchNumber.trim()) {
        setSnackbar({
          open: true,
          message: 'Batch number is required',
          severity: 'error'
        });
        return;
      }
      
      if (!formData.quantity || formData.quantity <= 0) {
        setSnackbar({
          open: true,
          message: 'Quantity must be a positive number',
          severity: 'error'
        });
        return;
      }

      // Prepare data for API
      const receiveData = {
        itemId: formData.itemId,
        batchNumber: formData.batchNumber,
        quantity: parseInt(formData.quantity, 10),
        expiryDate: formData.expiryDate ? formData.expiryDate.format('YYYY-MM-DD') : null,
        reference: formData.reference,
        notes: formData.notes
      };
      
      // Call API to receive stock
      await stockApi.receiveStock(receiveData);
      
      // Reset form
      setFormData({
        itemId: '',
        batchNumber: '',
        quantity: '',
        expiryDate: null,
        reference: '',
        notes: ''
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Stock received successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error receiving stock:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to receive stock',
        severity: 'error'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Receive Stock</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Item</InputLabel>
                  <Select
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleInputChange}
                    label="Item"
                    disabled={loading || items.length === 0}
                  >
                    {items.map(item => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name} {item.sku ? `(${item.sku})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="batchNumber"
                  label="Batch Number"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Expiry Date (Optional)"
                  value={formData.expiryDate}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={dayjs()}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="reference"
                  label="Reference (Optional)"
                  value={formData.reference}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading}
                >
                  Receive Stock
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default ReceiveStockPage;