import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { stockApi } from '../services/api';

function IssueStockPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    batchId: '',
    quantity: '',
    reference: '',
    notes: ''
  });

  // Load batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch batches with stock
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getBatches({ hasStock: true });
      setBatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load batches. Please try again.');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle batch selection
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFormData(prev => ({ ...prev, batchId }));
    
    // Find the selected batch details
    const batch = batches.find(b => b.id === batchId);
    setSelectedBatch(batch || null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.batchId) {
        setSnackbar({
          open: true,
          message: 'Please select a batch',
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
      
      // Check if requested quantity is available
      if (selectedBatch && parseInt(formData.quantity) > selectedBatch.current_quantity) {
        setSnackbar({
          open: true,
          message: `Not enough stock available. Only ${selectedBatch.current_quantity} units available.`,
          severity: 'error'
        });
        return;
      }

      // Prepare data for API
      const issueData = {
        batchId: formData.batchId,
        quantity: parseInt(formData.quantity, 10),
        reference: formData.reference,
        notes: formData.notes
      };
      
      // Call API to issue stock
      await stockApi.issueStock(issueData);
      
      // Reset form
      setFormData({
        batchId: '',
        quantity: '',
        reference: '',
        notes: ''
      });
      setSelectedBatch(null);
      
      // Refresh batches list
      await fetchBatches();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Stock issued successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error issuing stock:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to issue stock',
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Issue Stock</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Batch</InputLabel>
                <Select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleBatchChange}
                  label="Batch"
                  disabled={loading || batches.length === 0}
                >
                  {batches.map(batch => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.item_name} - Batch {batch.batch_number} - {batch.current_quantity} units available
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Show selected batch details */}
            {selectedBatch && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Selected Batch Details</Typography>
                    <Typography><strong>Item:</strong> {selectedBatch.item_name}</Typography>
                    <Typography><strong>SKU:</strong> {selectedBatch.item_sku || 'N/A'}</Typography>
                    <Typography><strong>Batch Number:</strong> {selectedBatch.batch_number}</Typography>
                    <Typography><strong>Available Quantity:</strong> {selectedBatch.current_quantity}</Typography>
                    <Typography><strong>Expiry Date:</strong> {selectedBatch.expiry_date ? new Date(selectedBatch.expiry_date).toLocaleDateString() : 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="quantity"
                label="Quantity to Issue"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ 
                  min: 1,
                  max: selectedBatch?.current_quantity || 9999
                }}
                helperText={selectedBatch ? `Max available: ${selectedBatch.current_quantity}` : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="reference"
                label="Reference (Optional)"
                value={formData.reference}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., Order number, Customer name, etc."
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
                placeholder="Additional details about this stock issue"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={loading || !selectedBatch}
              >
                Issue Stock
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
  );
}

export default IssueStockPage;