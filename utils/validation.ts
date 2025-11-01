export interface PasswordValidationResult {
  valid: boolean;
  criteria: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const result: PasswordValidationResult = {
    valid: true,
    criteria: {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  };

  // The password is valid if all criteria are met
  result.valid = Object.values(result.criteria).every(Boolean);

  return result;
};
