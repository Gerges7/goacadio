/** Grading rules are selected by points, not by university name. */
export type GradeEntry = { grade: string; points: number; minimumPercent?: number };
export type GradeSystem = 'four-point-standard' | 'four-point-a-plus' | 'custom';

export const FOUR_POINT_STANDARD: readonly GradeEntry[] = [
  {grade:'A',points:4.0}, {grade:'A-',points:3.7}, {grade:'B+',points:3.3},
  {grade:'B',points:3.0}, {grade:'B-',points:2.7}, {grade:'C+',points:2.3},
  {grade:'C',points:2.0}, {grade:'C-',points:1.7}, {grade:'D+',points:1.3},
  {grade:'D',points:1.0}, {grade:'F',points:0},
];

/** A 4.0 system that also defines percentage thresholds and A+ grades. */
export const FOUR_POINT_A_PLUS: readonly GradeEntry[] = [
  {grade:'A+', points:4.0, minimumPercent:95},
  {grade:'A', points:3.8, minimumPercent:90},
  {grade:'A-', points:3.6, minimumPercent:85},
  {grade:'B+', points:3.4, minimumPercent:82},
  {grade:'B', points:3.2, minimumPercent:79},
  {grade:'B-', points:3.0, minimumPercent:75},
  {grade:'C+', points:2.8, minimumPercent:72},
  {grade:'C', points:2.6, minimumPercent:69},
  {grade:'C-', points:2.4, minimumPercent:65},
  {grade:'D+', points:2.2, minimumPercent:60},
  {grade:'D', points:2.0, minimumPercent:50},
  {grade:'F', points:0, minimumPercent:0},
];

export const GRADING_SYSTEMS: readonly { id:GradeSystem; ar:string; en:string; max:number }[] = [
  {id:'four-point-standard', ar:'سلم 4.0 — A = 4.00، B+ = 3.30', en:'4.0 scale — A = 4.00, B+ = 3.30', max:4},
  {id:'four-point-a-plus', ar:'سلم 4.0 — A+ = 4.00، A = 3.80', en:'4.0 scale — A+ = 4.00, A = 3.80', max:4},
  {id:'custom', ar:'سلم مخصص — أدخل نقاط التقديرات', en:'Custom scale — set grade points', max:5},
];

export function getGrades(system:GradeSystem, custom:readonly GradeEntry[] = FOUR_POINT_STANDARD):readonly GradeEntry[] {
  if(system==='four-point-a-plus') return FOUR_POINT_A_PLUS;
  if(system==='custom') return custom;
  return FOUR_POINT_STANDARD;
}

/** Inclusive lower boundaries and inclusive maximum 100%. */
export function gradeFromPercentage(value:number): GradeEntry|null {
  if(!Number.isFinite(value)||value<0||value>100) return null;
  return FOUR_POINT_A_PLUS.find(entry=>value >= (entry.minimumPercent??0)) ?? null;
}

export type OverallGrade = { ar:string; en:string };
/** One specific overall-classification table; not assumed universal for all institutions. */
export function overallGradeForFourPointAPlus(gpa:number):OverallGrade|null {
  if(!Number.isFinite(gpa)||gpa<0||gpa>4) return null;
  if(gpa<1.6)return {ar:'ضعيف جدًا',en:'Very weak'};
  if(gpa<2.0)return {ar:'ضعيف',en:'Weak'};
  if(gpa<2.4)return {ar:'مقبول',en:'Pass'};
  if(gpa<3.0)return {ar:'جيد',en:'Good'};
  if(gpa<3.6)return {ar:'جيد جدًا',en:'Very good'};
  return {ar:'ممتاز',en:'Excellent'};
}
