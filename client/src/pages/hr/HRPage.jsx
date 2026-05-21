import { useState } from 'react';
import EmployeesTab from '../../components/hr/EmployeesTab';
import AttendanceTab from '../../components/hr/AttendanceTab';
import LeaveTab from '../../components/hr/LeaveTab';
import PayrollTab from '../../components/hr/PayrollTab';
import RecruitmentTab from '../../components/hr/RecruitmentTab';
import { Users, Clock, Calendar, Banknote, Briefcase } from 'lucide-react';

const tabs = [
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'leave', label: 'Leave', icon: Calendar },
  { key: 'payroll', label: 'Payroll', icon: Banknote },
  { key: 'recruitment', label: 'Recruitment', icon: Briefcase },
];

const HRPage = () => {
  const [active, setActive] = useState('employees');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Human Resources</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
      {active === 'employees' && <EmployeesTab />}
      {active === 'attendance' && <AttendanceTab />}
      {active === 'leave' && <LeaveTab />}
      {active === 'payroll' && <PayrollTab />}
      {active === 'recruitment' && <RecruitmentTab />}
    </div>
  );
};

export default HRPage;