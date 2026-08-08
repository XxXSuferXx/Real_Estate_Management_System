import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

export interface PasswordStrengthResult {
  score: number;
  isStrongEnough: boolean;
  warning: string;
  suggestions: string[];
}

const MIN_ACCEPTABLE_SCORE = 3;

export const checkPasswordStrength = (
  password: string,
  userInputs: string[] = []
): PasswordStrengthResult => {
  const zxcvbn = new ZxcvbnFactory({
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
      userInputs,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    translations: zxcvbnEnPackage.translations,
  });

  const result = zxcvbn.check(password);

  return {
    score: result.score,
    isStrongEnough: result.score >= MIN_ACCEPTABLE_SCORE,
    warning: result.feedback.warning || '',
    suggestions: result.feedback.suggestions || [],
  };
};