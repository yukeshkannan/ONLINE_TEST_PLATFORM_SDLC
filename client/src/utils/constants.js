export const DEPARTMENTS = [
  'CSE',
  'IT',
  'AIDS',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL'
];

export const BATCH_TRACKS = [
  'Web Design',
  'UI/UX',
  'SolidWorks',
  'AutoCAD'
];

export const normalizeBatch = (rawBatch) => {
  if (!rawBatch) return 'Web Design';
  const clean = rawBatch.toString().trim().toLowerCase();
  
  if (clean.includes('web')) return 'Web Design';
  if (clean.includes('ui') || clean.includes('ux')) return 'UI/UX';
  if (clean.includes('solid')) return 'SolidWorks';
  if (clean.includes('cad') || clean.includes('auto')) return 'AutoCAD';
  
  return 'Web Design';
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
