/**
 * Universal Question Document Parser
 * Parses TXT and PDF extracted text into structured MCQ question objects.
 * Handles diverse formats:
 * - Numbered questions (1. / Q1. / Question 1:)
 * - Lettered options (A. / (A) / [A] / a) / 1.)
 * - Inline multi-options on the same line (A. ... B. ... C. ... D. ...)
 * - Answer key lines (Answer: A / Ans: B / Correct Answer: C / Key: D)
 * - Automatic noise / header / footer filtration
 */

export const parseTextToQuestions = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Split into lines and trim whitespace
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (rawLines.length === 0) return [];

  const parsedQuestions = [];
  let currentQuestion = null;

  // Check if a line is pure document noise, header, footer, or page number
  const isNoiseLine = (line) => {
    if (/^page\s*\d+(\s*(of|\/)\s*\d+)?$/i.test(line)) return true;
    if (/^---\s*page\s*\d+\s*---$/i.test(line)) return true;
    if (/^(online\s+)?(mcq|test|examination|assessment)\s+(paper|platform|portal)?$/i.test(line)) return true;
    if (/^(total\s+marks|time\s+allowed|duration|maximum\s+marks)[\s\:\-\d\w]+$/i.test(line)) return true;
    if (/^(instructions|guidelines|all\s+the\s+best|good\s+luck)[\s\:\.\!]*$/i.test(line)) return true;
    return false;
  };

  // Check and extract answer keys (e.g., Answer: A, Ans: (B), Correct: C, Key - D)
  const extractAnswerKey = (line) => {
    const ansMatch = line.match(/^(?:(?:correct\s*)?ans(?:wer)?|key)[\s\:\-\.]*(?:option\s*)?\(?([A-Da-d1-4])\)?/i);
    if (ansMatch) {
      let val = ansMatch[1].toUpperCase();
      if (val === '1') val = 'A';
      if (val === '2') val = 'B';
      if (val === '3') val = 'C';
      if (val === '4') val = 'D';
      return ['A', 'B', 'C', 'D'].includes(val) ? val : null;
    }
    return null;
  };

  // Check if line contains multiple options horizontally (e.g., "A. Option 1   B. Option 2   C. Option 3   D. Option 4")
  const parseInlineOptions = (line) => {
    const inlineRegex = /(?:^|[\s\t]+)(?:\(?([A-Da-d1-4])[\)\.\:\-\]]|\[([A-Da-d1-4])\])\s*([^\(A-Da-d1-4\n\r]+?)(?=(?:[\s\t]+(?:\(?[A-Da-d1-4][\)\.\:\-\]]|\[[A-Da-d1-4]\]))|$)/g;
    const matches = [];
    let match;
    while ((match = inlineRegex.exec(line)) !== null) {
      let label = (match[1] || match[2]).toUpperCase();
      if (label === '1') label = 'A';
      if (label === '2') label = 'B';
      if (label === '3') label = 'C';
      if (label === '4') label = 'D';
      const optText = (match[3] || '').trim();
      if (['A', 'B', 'C', 'D'].includes(label) && optText) {
        matches.push({ label, text: optText });
      }
    }
    return matches;
  };

  // Check if line is a single option (e.g. "A) Option text" or "(B) Option text" or "a. Option text")
  const parseSingleOption = (line) => {
    const singleOptMatch = line.match(/^(?:\(?([A-Da-d1-4])[\)\.\:\-\]]|\[([A-Da-d1-4])\])\s*(.*)$/);
    if (singleOptMatch) {
      let label = (singleOptMatch[1] || singleOptMatch[2]).toUpperCase();
      if (label === '1') label = 'A';
      if (label === '2') label = 'B';
      if (label === '3') label = 'C';
      if (label === '4') label = 'D';
      const optText = (singleOptMatch[3] || '').trim();
      if (['A', 'B', 'C', 'D'].includes(label)) {
        return { label, text: optText };
      }
    }
    return null;
  };

  // Check if line indicates the start of a question
  const isQuestionHeader = (line) => {
    return /^(?:question|q)?\s*\d+[\s\.\)\:\-]+/i.test(line) || /^question\s*\:\s*/i.test(line);
  };

  const createNewQuestion = (headerLine) => {
    let cleanText = headerLine
      .replace(/^(?:question|q)?\s*\d+[\s\.\)\:\-]+/i, '')
      .replace(/^question\s*\:\s*/i, '')
      .trim();

    return {
      questionText: cleanText,
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' }
      ],
      correctAnswer: 'A',
      marks: 1
    };
  };

  const finalizeQuestion = (q) => {
    if (!q) return null;
    const hasText = !!q.questionText && q.questionText.trim().length > 0;
    const optA = q.options.find(o => o.label === 'A')?.text.trim() || '';
    const optB = q.options.find(o => o.label === 'B')?.text.trim() || '';

    // Must have question text and at least valid options A and B
    if (hasText && optA && optB) {
      const selected = q.options.find(o => o.label === q.correctAnswer);
      if (!selected || !selected.text.trim()) {
        q.correctAnswer = 'A';
      }
      return q;
    }
    return null;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (isNoiseLine(line)) continue;

    // 1. Answer key line
    const ansKey = extractAnswerKey(line);
    if (ansKey) {
      if (currentQuestion) {
        currentQuestion.correctAnswer = ansKey;
      }
      continue;
    }

    // 2. Inline multi-options on one line
    const inlineOpts = parseInlineOptions(line);
    if (inlineOpts.length >= 2 && currentQuestion) {
      inlineOpts.forEach(opt => {
        const target = currentQuestion.options.find(o => o.label === opt.label);
        if (target) target.text = opt.text;
      });
      continue;
    }

    // 3. Single option line
    const singleOpt = parseSingleOption(line);
    if (singleOpt && currentQuestion) {
      const target = currentQuestion.options.find(o => o.label === singleOpt.label);
      if (target) {
        target.text = singleOpt.text;
      }
      continue;
    }

    // 4. Question header line
    if (isQuestionHeader(line)) {
      const finalized = finalizeQuestion(currentQuestion);
      if (finalized) {
        parsedQuestions.push(finalized);
      }
      currentQuestion = createNewQuestion(line);
      continue;
    }

    // 5. Continuation lines
    if (!currentQuestion) {
      currentQuestion = createNewQuestion(line);
    } else {
      const optA = currentQuestion.options.find(o => o.label === 'A')?.text.trim();
      const optB = currentQuestion.options.find(o => o.label === 'B')?.text.trim();
      const optC = currentQuestion.options.find(o => o.label === 'C')?.text.trim();
      const optD = currentQuestion.options.find(o => o.label === 'D')?.text.trim();

      if (optD) {
        // All 4 options already filled; treat as new unnumbered question
        const finalized = finalizeQuestion(currentQuestion);
        if (finalized) parsedQuestions.push(finalized);
        currentQuestion = createNewQuestion(line);
      } else if (optA || optB || optC) {
        // Append text to the latest active option
        const lastOpt = currentQuestion.options.slice().reverse().find(o => o.text.trim() !== '');
        if (lastOpt) {
          lastOpt.text += ' ' + line;
        }
      } else {
        // Append text to question statement
        currentQuestion.questionText += ' ' + line;
      }
    }
  }

  // Finalize last question
  const lastFinalized = finalizeQuestion(currentQuestion);
  if (lastFinalized) {
    parsedQuestions.push(lastFinalized);
  }

  return parsedQuestions;
};
