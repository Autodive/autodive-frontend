import dayjs from 'dayjs';

export default async (app) => {
  const i18n = await import('@/language');
  app.use(i18n.default);
}
