import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button with destructive styling */
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              danger
                ? 'bg-red-50 text-red-600 ring-red-200'
                : 'bg-amber-50 text-amber-600 ring-amber-200',
            ].join(' ')}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="pt-1 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'primary' : 'dark'}
            onClick={onConfirm}
            loading={loading}
            className={danger ? '!bg-red-600 hover:!bg-red-700' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
