import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

const MinutesForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });
  const textareaClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  const addActionItem = () => update('actionItems', [...(content.actionItems || []), { task: '', responsible: '', deadline: '' }]);
  const removeActionItem = (i) => update('actionItems', content.actionItems.filter((_, idx) => idx !== i));
  const updateActionItem = (i, f, v) => update('actionItems', content.actionItems.map((item, idx) => idx === i ? { ...item, [f]: v } : item));

  return (
    <div className="space-y-3">
      <div><label className={labelClass}>Meeting Type</label>
        <select value={content.meetingType || 'department'} onChange={e => update('meetingType', e.target.value)} className={selectClass}>
          <option value="board">Board</option><option value="management">Management</option><option value="department">Department</option><option value="committee">Committee</option><option value="project">Project</option><option value="agm">AGM</option>
        </select>
      </div>
      <Input label="Meeting Title *" value={content.meetingTitle || ''} onChange={e => update('meetingTitle', e.target.value)} required />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Date" type="date" value={content.date || ''} onChange={e => update('date', e.target.value)} />
        <Input label="Start Time" type="time" value={content.startTime || ''} onChange={e => update('startTime', e.target.value)} />
        <Input label="End Time" type="time" value={content.endTime || ''} onChange={e => update('endTime', e.target.value)} />
      </div>
      <Input label="Venue" value={content.venue || ''} onChange={e => update('venue', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Chairperson" value={content.chairperson || ''} onChange={e => update('chairperson', e.target.value)} />
        <Input label="Secretary" value={content.secretary || ''} onChange={e => update('secretary', e.target.value)} />
      </div>
      <div><label className={labelClass}>Attendees</label><textarea value={content.attendees || ''} onChange={e => update('attendees', e.target.value)} rows={2} placeholder="One per line" className={textareaClass} /></div>
      <div><label className={labelClass}>Apologies</label><textarea value={content.apologies || ''} onChange={e => update('apologies', e.target.value)} rows={2} placeholder="One per line" className={textareaClass} /></div>
      <div><label className={labelClass}>Agenda</label><textarea value={content.agenda || ''} onChange={e => update('agenda', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Discussions</label><textarea value={content.discussions || ''} onChange={e => update('discussions', e.target.value)} rows={4} className={textareaClass} /></div>
      <div><label className={labelClass}>Decisions</label><textarea value={content.decisions || ''} onChange={e => update('decisions', e.target.value)} rows={3} className={textareaClass} /></div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Action Items</label>
          <Button size="sm" variant="ghost" onClick={addActionItem}><Plus size={12} className="mr-1" /> Add</Button>
        </div>
        {(content.actionItems || []).map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-start p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="col-span-5"><Input label="Task" value={item.task || ''} onChange={e => updateActionItem(i, 'task', e.target.value)} /></div>
            <div className="col-span-3"><Input label="Responsible" value={item.responsible || ''} onChange={e => updateActionItem(i, 'responsible', e.target.value)} /></div>
            <div className="col-span-3"><Input label="Deadline" type="date" value={item.deadline || ''} onChange={e => updateActionItem(i, 'deadline', e.target.value)} /></div>
            <div className="col-span-1 flex items-end pb-1 justify-center"><button onClick={() => removeActionItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></div>
          </div>
        ))}
      </div>
      <Input label="Next Meeting Date" type="date" value={content.nextMeetingDate || ''} onChange={e => update('nextMeetingDate', e.target.value)} />
      <div><label className={labelClass}>Tentative Agenda for Next Meeting</label><textarea value={content.nextMeetingAgenda || ''} onChange={e => update('nextMeetingAgenda', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Distribution</label>
        <select value={content.distribution || 'attendees'} onChange={e => update('distribution', e.target.value)} className={selectClass}>
          <option value="attendees">Attendees Only</option><option value="all-staff">All Staff</option><option value="board">Board</option>
        </select>
      </div>
    </div>
  );
};

export default MinutesForm;