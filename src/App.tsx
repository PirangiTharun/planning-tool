import './App.css'
import PlanningPokerApp from './components/PlanningPokerApp'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0284c7',
      light: '#0284c714',
    },
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
      dark: '#c8e6c9',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'sans-serif',
    ].join(','),
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlanningPokerApp />
    </ThemeProvider>
  )
}

export default App
