import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegistrationPage from '../pages/public/RegistrationPage';
import PricingPage from '../pages/public/PricingPage';
import FAQPage from '../pages/public/FAQPage';
import HelpPage from '../pages/public/HelpPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import ActivationPage from '../pages/public/ActivationPage';
import CheckoutPage from '../pages/public/CheckoutPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/public/TermsOfServicePage';
import LicensePage from '../pages/public/LicensePage';
import CookiePolicyPage from '../pages/public/CookiePolicyPage';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/dashboard/DashboardPage';
import FinancePage from '../pages/finance/FinancePage';
import HRPage from '../pages/hr/HRPage';
import SalesPage from '../pages/sales/SalesPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import SupplyChainPage from '../pages/supplyChain/SupplyChainPage';
import ManufacturingPage from '../pages/manufacturing/ManufacturingPage';
import OrdersPage from '../pages/orders/OrdersPage';
import ContactsPage from '../pages/contacts/ContactsPage';
import ProductsPage from '../pages/products/ProductsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import CommunicationsPage from '../pages/communications/CommunicationsPage';
import CRMPage from '../pages/crm/CRMPage';
import ProjectsPage from '../pages/projects/ProjectsPage';
import AssetsPage from '../pages/assets/AssetsPage';


const AppRouter = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/faqs" element={<FAQPage />} />
    <Route path="/help" element={<HelpPage />} />
    <Route path="/activate" element={<ActivationPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
    <Route path="/legal/terms" element={<TermsOfServicePage />} />
    <Route path="/legal/license" element={<LicensePage />} />
    <Route path="/legal/cookies" element={<CookiePolicyPage />} />

    {/* Protected tenant routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/finance/*" element={<FinancePage />} />
        <Route path="/hr/*" element={<HRPage />} />
        <Route path="/sales/*" element={<SalesPage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/inventory/*" element={<InventoryPage />} />
        <Route path="/supply-chain/*" element={<SupplyChainPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/manufacturing/*" element={<ManufacturingPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/communications" element={<CommunicationsPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;