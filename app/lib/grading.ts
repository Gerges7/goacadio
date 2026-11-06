/** Grading systems are deliberately kept separate: no universal 4.0 conversion exists. */
export type GradeEntry = { grade: string; points: number; minimumPercent?: number };
export type GradeSystem = 'general-example' | 'mti';

// University-specific example preserved for students using the previous tool.
export const GENERAL_EXAMPLE: readonly GradeEntry[] = [
  {grade:'A',points:4.0}, {grade:'A-',points:3.7}, {grade:'B+',points:3.3},
  {grade:'B',points:3.0}, {grade:'B-',points:2.7}, {grade:'C+',points:2.3},
  {grade:'C',points:2.0}, {grade:'C-',points:1.7}, {grade:'D+',points:1.3},
  {grade:'D',points:1.0}, {grade:'F',points:0},
];

/** MTI scale transcribed from the two photographed academic-regulations pages supplied by the site owner. */
export const MTI_GRADES: readonly GradeEntry[] = [
  {grade:'A+', points:4.0,minimumPercent:95},
  {grade:'A', points:3.8,minimumPercent:90},
  {grade:'A-', points:3.6,minimumPercent:85},
  {grade:'B+', points:3.4,minimumPercent:82},
  {grade:'B', points:3.2,minimumPercent:79},
  {grade:'B-', points:3.0,minimumPercent:75},
  {grade:'C+', points:2.8,minimumPercent:72},
  {grade:'C', points:2.6,minimumPercent:69},
  {grade:'C-', points:2.4,minimumPercent:65},
  {grade:'D+', points:2.2,minimumPercent:60},
  {grade:'D', points:2.0,minimumPercent:50},
  {grade:'F', points:0,minimumPercent:0},
];

export function getGrades(system:GradeSystem):readonly GradeEntry[] {
  return system==='mti'?MTI_GRADES:GENERAL_EXAMPLE;
}

/** Inclusive lower bounds, exclusive upper bounds, except 100 is inclusive. */
export function gradeFromPercentage(value:number): GradeEntry|null {
  if(!Number.isFinite(value)||value<0||value>100) return null;
  return MTI_GRADES.find(entry=>value >= (entry.minimumPercent??0)) ?? null;
}

export type MtiOverallGrade = { ar:string; en:string };
export function mtiOverallGrade(gpa:number):MtiOverallGrade|null {
  if(!Number.isFinite(gpa)||gpa<0||gpa>4) return null;
  if(gpa<1.6)return {ar:'ضعيف جدًا',en:'Very weak'};
  if(gpa<2.0)return {ar:'ضعيف',en:'Weak'};
  if(gpa<2.4)return {ar:'مقبول',en:'Pass'};
  if(gpa<3.0)return {ar:'جيد',en:'Good'};
  if(gpa<3.6)return {ar:'جيد جدًا',en:'Very good'};
  return {ar:'ممتاز',en:'Excellent'};
}
