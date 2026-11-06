import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('tools', './routes/tools.tsx'),
  route('tools/gpa-calculator', './routes/gpa-calculator.tsx'),
  route('tools/focus-timer', './routes/focus-timer.tsx'),
  route('tools/cv-builder', './routes/cv-builder.tsx'),
  route('dashboard', './routes/dashboard.tsx'),
  route('planner', './routes/planner.tsx'),
  route('study-stats', './routes/study-stats.tsx'),
  route('ai-study', './routes/ai-study.tsx'),
  route('api/ai-study', './routes/api.ai-study.ts'),
  route('universities', './routes/universities.tsx'),
  route('services', './routes/services.tsx'),
  route('privacy', './routes/privacy.tsx'),
  route('auth', './routes/auth.tsx'),
  route('admin', './routes/admin.tsx'),
] satisfies RouteConfig;
