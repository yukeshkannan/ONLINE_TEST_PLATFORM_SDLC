export const DEPARTMENTS = [];

export const BATCH_TRACKS = [];

export const normalizeBatch = (rawBatch) => {
  if (!rawBatch) return '';
  return rawBatch.toString().trim();
};

export const normalizeDept = (rawDept) => {
  if (!rawDept) return 'CSE';
  const clean = rawDept.toString().trim().toLowerCase();
  
  if (clean === 'cse' || clean.includes('computer')) return 'CSE';
  if (clean === 'it' || clean.includes('information')) return 'IT';
  if (clean === 'aids' || clean.includes('data') || clean.includes('artificial')) return 'AIDS';
  if (clean === 'ece' || clean.includes('electronics')) return 'ECE';
  if (clean === 'eee' || clean.includes('electrical')) return 'EEE';
  if (clean === 'mech' || clean.includes('mechanical')) return 'MECH';
  if (clean === 'civil') return 'CIVIL';
  
  return 'CSE';
};

export const getDeptColor = (dept) => {
  switch (dept) {
    case 'CSE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'AIDS':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'ECE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'EEE':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'MECH':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CIVIL':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
