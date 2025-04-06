import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Layout from './components/Layout';
import ItemsPage from './pages/ItemsPage';
import ReceiveStockPage from './pages/ReceiveStockPage';
import BatchesPage from './pages/BatchesPage';
import ExpiringStockPage from './pages/ExpiringStockPage';
import MovementsPage from './pages/MovementsPage';
import IssueStockPage from './pages/IssueStockPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/receive" element={<ReceiveStockPage />} />
              <Route path="/issue" element={<IssueStockPage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/expiring" element={<ExpiringStockPage />} />
              <Route path="/movements" element={<MovementsPage />} />
              <Route path="/" element={<Navigate to="/items" replace />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
