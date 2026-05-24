import { X } from 'lucide-react';

const LegalOverlay = ({ open, onClose, title, content }) => {
  if (!open) return null;

  // Split content by numbered sections
  const sections = content
    ? content.split(/\d+\.\s+/).filter(Boolean).map((s, i) => ({
        number: i + 1,
        title: s.split('\n')[0],
        body: s.split('\n').slice(1).join('\n').trim()
      }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-gray-700 dark:text-gray-300">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div key={section.number} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {section.number}. {section.title}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content || 'No content available.'}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalOverlay;