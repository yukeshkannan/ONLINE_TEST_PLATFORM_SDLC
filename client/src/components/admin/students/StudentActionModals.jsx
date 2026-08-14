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
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-poppins">Delete Student Record?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">{studentToDelete.name}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl cursor-pointer transition shadow-sm font-bold flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Delete</span>
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
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#004f90] flex items-center justify-center mx-auto shadow-xs">
            <Mail className="w-6 h-6 text-[#004f90]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-poppins">Email Login Credentials</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Send login ID and access password directly to <br />
              <span className="font-bold text-slate-800 font-mono">{studentForCredentials.email}</span>?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              disabled={sendingEmail}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sendingEmail}
              className="py-2.5 px-4 bg-[#004f90] hover:bg-[#003c6e] active:bg-[#002f57] text-white rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
            >
              <Send className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-white">{sendingEmail ? 'Sending...' : 'Send Email'}</span>
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
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Send className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-poppins">Email All Credentials</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dispatch credentials via automated email batch to all <span className="font-bold text-emerald-700">{targetCount}</span> filtered candidates?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              disabled={sendingEmail}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sendingEmail}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
            >
              <Send className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-white">{sendingEmail ? 'Dispatching...' : 'Dispatch All'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
