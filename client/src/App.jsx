import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { SidebarProvider } from './context/SidebarContext';
import { AIProvider } from './context/AIContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import LegalOverlay from './components/public/LegalOverlay';
import ContactOverlay from './components/public/ContactOverlay';
import { useApp } from './context/AppContext';
import AppRouter from './router';

const GlobalOverlays = () => {
  const { legalOpen, legalContent, closeLegal, contactOpen, closeContact, openContact } = useApp();
  return (
    <>
      <LegalOverlay open={!!legalOpen} onClose={closeLegal} title={legalOpen || ''} content={legalContent} />
      <ContactOverlay open={contactOpen} onClose={closeContact} config={{}} />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <TenantProvider>
              <SidebarProvider>
                <AIProvider>
                  <AppRouter />
                  <GlobalOverlays />
                </AIProvider>
              </SidebarProvider>
            </TenantProvider>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;