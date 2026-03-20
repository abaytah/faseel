import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { searchKnowledgeBase } from '../data/knowledge-base';

export const assistantRouter = router({
  ask: publicProcedure
    .input(
      z.object({
        question: z.string().min(1).max(1000),
        language: z.enum(['ar', 'en']).default('ar'),
      }),
    )
    .mutation(async ({ input }) => {
      const { question, language } = input;

      const results = searchKnowledgeBase(question, language);

      if (results.length === 0) {
        return {
          answer:
            language === 'ar'
              ? 'لم أجد إجابة محددة لسؤالك. يمكنك التواصل مع الدعم أو زيارة موقع إيجار: ejar.sa'
              : 'I could not find a specific answer to your question. You can contact support or visit the Ejar website: ejar.sa',
          source: null,
          relatedQuestions: getDefaultSuggestions(language),
        };
      }

      const bestMatch = results[0]!;
      const entry = bestMatch.entry;

      // Get up to 3 related questions (excluding the matched one)
      const relatedQuestions = results
        .slice(1, 4)
        .map((r) => (language === 'ar' ? r.entry.questionAr : r.entry.questionEn));

      return {
        answer: language === 'ar' ? entry.answerAr : entry.answerEn,
        source: entry.source,
        relatedQuestions,
      };
    }),
});

function getDefaultSuggestions(language: 'ar' | 'en'): string[] {
  if (language === 'ar') {
    return ['من يدفع تكاليف الصيانة؟', 'كيف أسجل عقدي في إيجار؟', 'ما هي حقوق المستأجر؟'];
  }
  return [
    'Who pays for maintenance?',
    'How do I register my contract on Ejar?',
    'What are tenant rights?',
  ];
}
