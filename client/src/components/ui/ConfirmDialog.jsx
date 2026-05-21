import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Delete', variant = 'danger' }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);
export default ConfirmDialog;