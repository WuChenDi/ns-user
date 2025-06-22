const listenPort = process.env.IM_PORT || 3000;
const listenHost = process.env.IM_HOST || '0.0.0.0';
const serverName = process.env.IM_SERVER_NAME || 'localhost';
const mailUrl = process.env.IM_MAIL_URL || 'localhost';
const version = '0.0.1';

export { listenHost, listenPort, serverName, mailUrl, version };
