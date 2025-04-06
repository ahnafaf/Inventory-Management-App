import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { itemsApi } from '../services/api';

function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // Handle dialog open/close
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem({ name: '', sku: '', description: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if name is provided
      if (!newItem.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Item name is required',
          severity: 'error'
        });
        return;
      }

      await itemsApi.create(newItem);
      handleCloseDialog();
      await fetchItems(); // Refresh the items list
      setSnackbar({
        open: true,
        message: 'Item created successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating item:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to create item',
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Items</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Item
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading items...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No items found. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku || '-'}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Item Name"
              type="text"
              fullWidth
              required
              value={newItem.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="sku"
              label="SKU (Optional)"
              type="text"
              fullWidth
              value={newItem.sku}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={newItem.description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Add Item</Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default ItemsPage;