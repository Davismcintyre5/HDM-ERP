import { Outlet } from 'react-router-dom';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SparkleButton from '../ai/SparkleButton';
import AIChatWidget from '../ai/AIChatWidget';

const AppLayout = () => (
  <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <TitleBar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
    <SparkleButton />
    <AIChatWidget />
  </div>
);

export default AppLayout;