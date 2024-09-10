import * as md5 from 'md5';

export default class Helpers {
  static hashPassword = (password: string): string =>
    md5(md5(password) + process.env.PASSWORD_SECRET);

  static isValidDate(dateString: string): boolean {
    const iso8601Pattern =
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)$/;

    if (!iso8601Pattern.test(dateString)) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
