import { Hono } from 'hono';
import '@/global';
import {
  homeRoute,
  installRoute,
  clientRoute,
  loginRoute,
  logoutRoute,
  deviceRoute,
  sessionRoute,
  consentRoute,
  registerRoute,
  settingRoute,
  verifyEmailRoute,
  forgotPasswordRoute,
  resetPasswordRoute
} from './routes';
import { adminRoute } from './routes/admin';
import { logger as accesslog } from 'hono/logger';

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

// type Bindings = {
//   MY_KV: KVNamespace
//   DB: D1Database
// }

// const app = new Hono<{ Bindings: Bindings }>();
const app = new Hono();

app.use(accesslog(customLogger));

/* server */
app.route('/', homeRoute);
app.route('/install', installRoute);
app.route('/client', clientRoute);
app.route('/account/login', loginRoute);
app.route('/account/logout', logoutRoute);
app.route('/account/register', registerRoute);
app.route('/account/setting', settingRoute);
app.route('/account/consent', consentRoute);
app.route('/account/session', sessionRoute);
app.route('/account/verify-email', verifyEmailRoute);
app.route('/account/forgot-password', forgotPasswordRoute);
app.route('/account/reset-password', resetPasswordRoute);
app.route('/admin', adminRoute);

export default app;
