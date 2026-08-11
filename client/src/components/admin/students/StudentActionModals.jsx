import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Mail, AlertTriangle } from 'lucide-react';

export const DeleteStudentModal = ({
  isOpen,
  onClose,
  studentToDelete,
  onConfirm
}) => {
  if (!isOpen || !studentToDelete) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Student Record?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete <span className="font-bold text-slate-800">{studentToDelete.name}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition shadow-2xs"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SendCredentialsModal = ({
  isOpen,
  onClose,
  studentForCredentials,
  sendingEmail,
  onConfirm
}) => {
  if (!isOpen || !studentForCredentials) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#004f90] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Email Login Credentials</h3>
            <p className="text-xs text-slate-500 mt-1">
              Send login ID and access password directly to <span className="font-bold text-slate-800">{studentForCredentials.email}</span>?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              disabled={sendingEmail}
              className="py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sendingEmail}
              className="py-2.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg cursor-pointer transition shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingEmail ? 'Sending...' : 'Send Email'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SendAllCredentialsModal = ({
  isOpen,
  onClose,
  targetCount,
  sendingEmail,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Email All Credentials</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dispatch credentials via automated email batch to all <span className="font-bold text-emerald-700">{targetCount}</span> filtered candidates?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              disabled={sendingEmail}
              className="py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sendingEmail}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingEmail ? 'Dispatching...' : 'Dispatch All'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
