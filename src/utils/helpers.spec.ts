import Helpers from './helpers';
import * as md5 from 'md5';

describe('Helpers', () => {
  describe('hashPassword', () => {
    it('should hash the password correctly', () => {
      const password = 'testpassword';
      const passwordSecret = 'testsecret';
      process.env.PASSWORD_SECRET = passwordSecret;

      const expectedHash = md5(md5(password) + passwordSecret);
      expect(Helpers.hashPassword(password)).toEqual(expectedHash);
    });

    it('should produce the same hash for the same password', () => {
      const password = 'testpassword';
      process.env.PASSWORD_SECRET = 'testsecret';

      const hash1 = Helpers.hashPassword(password);
      const hash2 = Helpers.hashPassword(password);

      expect(hash1).toEqual(hash2);
    });
  });

  describe('isValidDate', () => {
    it('should return true for a valid ISO 8601 date string', () => {
      const validDateString = '2024-09-09T12:00:00Z';
      expect(Helpers.isValidDate(validDateString)).toBe(true);
    });

    it('should return false for an invalid ISO 8601 date string', () => {
      const invalidDateString = 'invalid-date-string';
      expect(Helpers.isValidDate(invalidDateString)).toBe(false);
    });

    it('should return false for a malformed ISO 8601 date string', () => {
      const malformedDateString = '2024-09-09T12:00:00';
      expect(Helpers.isValidDate(malformedDateString)).toBe(false);
    });

    it('should return false for a date string that does not parse into a valid date', () => {
      const invalidDate = '2024-02-30T12:00:00Z5757757575';
      expect(Helpers.isValidDate(invalidDate)).toBe(false);
    });
  });
});
