import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatWidget from '../ai/AIChatWidget';
import TitleBar from './TitleBar';

const isElectron = window.electronAPI?.isElectron || new URLSearchParams(window.location.search).get('electron') === 'true';

const AppLayout = () => (
  <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    {isElectron && <TitleBar />}
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
    <AIChatWidget />
  </div>
);

export default AppLayout;