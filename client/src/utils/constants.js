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
