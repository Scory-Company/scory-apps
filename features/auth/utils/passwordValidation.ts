export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 1=weak, 2=fair, 3=good, 4=strong)
  labelKey: 'veryWeak' | 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  feedbackKeys: string[];
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function checkPasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      labelKey: 'veryWeak',
      color: '#E53E3E',
      feedbackKeys: [],
    };
  }

  const criteria = checkPasswordCriteria(password);
  const feedbackKeys: string[] = [];

  // Count how many criteria are met
  let score = 0;

  if (criteria.minLength) score++;
  else feedbackKeys.push('auth.passwordCriteria.minLength');

  if (criteria.hasUpperCase) score++;
  else feedbackKeys.push('auth.passwordCriteria.uppercase');

  if (criteria.hasLowerCase) score++;
  else feedbackKeys.push('auth.passwordCriteria.lowercase');

  if (criteria.hasNumber) score++;
  else feedbackKeys.push('auth.passwordCriteria.number');

  if (criteria.hasSpecialChar) score++;
  else feedbackKeys.push('auth.passwordCriteria.special');

  // Adjust score based on length bonus
  if (password.length >= 12) score = Math.min(5, score + 1);

  // Map score to strength levels
  let labelKey: PasswordStrength['labelKey'];
  let color: string;

  if (score === 0) {
    labelKey = 'veryWeak';
    color = '#E53E3E'; // red
  } else if (score <= 2) {
    labelKey = 'weak';
    color = '#F56565'; // light red
  } else if (score === 3) {
    labelKey = 'fair';
    color = '#ED8936'; // orange
  } else if (score === 4) {
    labelKey = 'good';
    color = '#48BB78'; // green
  } else {
    labelKey = 'strong';
    color = '#38A169'; // dark green
  }

  return {
    score: Math.min(4, score),
    labelKey,
    color,
    feedbackKeys,
  };
}

export function isPasswordStrong(password: string): boolean {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 3; // Good or Strong
}
