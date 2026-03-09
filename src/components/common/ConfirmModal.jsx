import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm'} size="sm">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed pt-2">
                        {message || 'Are you sure?'}
                    </p>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        No, go back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                    >
                        Yes, confirm
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
