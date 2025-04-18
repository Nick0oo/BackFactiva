export default () => ({
  mail: {
    mailHost: process.env.MAIL_HOST,
    mailPort: parseInt(process.env.MAIL_PORT || '2525', 10),
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    mailfrom: process.env.MAIL_FROM || '"Soporte" <soporte@tuapp.com>',
  },
});
