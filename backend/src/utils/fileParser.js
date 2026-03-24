// Helper to convert roman numerals to integers for semester parsing
const romanToInt = (roman) => {
  const map = { i: 1, v: 5, x: 10 };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const curr = map[roman[i]];
    const next = map[roman[i + 1]];
    if (next && curr < next) {
      result += next - curr;
      i++;
    } else {
      result += curr;
    }
  }
  return result;
};

/**
 * Basic heuristic parser for curriculum text.
 * Expects text that looks vaguely like:
 * Semester I
 * CS201 Data Structures 4
 * CS202 DBMS Theory 3
 * AI301 Artificial Intelligence Lab 2
 * SEMESTER II
 * ...
 */
export const parseCurriculumText = (rawText) => {
  const lines = rawText.split(/\r?\n/);
  
  // Return an object grouped by semester
  const semestersData = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []
  };
  
  // Default to semester 1 if no headers are found initially
  let currentSemester = 1;

  // General regex to capture a standard Subject format:
  // [word with numbers] [some text] [single digit at the end]
  // e.g., "CS201 Data Structures 4" -> code: CS201, name: Data Structures, credits: 4
  const subjectRegex = /^([A-Z0-9]{3,8})\s+(.+?)\s+(\d+(?:\.\d+)?)$/i;

  // Regex to detect semester headers (e.g. "Semester 1", "Semester-I", "SEM: III")
  const semHeaderRegex = /(?:semester|sem)\s*[-:]?\s*([1-8]|i{1,3}|iv|v|vi|vii|viii)(?!\w)/i;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if the line is a semester header
    const semMatch = trimmed.match(semHeaderRegex);
    if (semMatch) {
      const val = semMatch[1].toLowerCase();
      if (/^[1-8]$/.test(val)) {
        currentSemester = parseInt(val, 10);
      } else {
        currentSemester = romanToInt(val);
      }
      continue; // Move to next line
    }

    const match = trimmed.match(subjectRegex);
    if (match) {
      const code = match[1].toUpperCase();
      const rawName = match[2].trim();
      const credits = parseFloat(match[3]);
      
      const isLab = rawName.toLowerCase().includes('lab') || rawName.toLowerCase().includes('practical');
      
      semestersData[currentSemester].push({
        code,
        name: rawName,
        type: isLab ? 'lab' : 'theory',
        credits: credits,
        hoursPerWeek: isLab ? credits * 2 : credits,
      });
    } else {
        // Fallback for simple tab-separated or heavily spaced columns
        const parts = trimmed.split(/\s{2,}|\t/);
        if (parts.length >= 3) {
            const potentialCode = parts[0].trim().toUpperCase();
            if (/^[A-Z0-9]{3,8}$/.test(potentialCode)) {
                // Looks like it could be a code
                const potentialCredits = parseFloat(parts[parts.length - 1]);
                if (!isNaN(potentialCredits)) {
                    const rawName = parts.slice(1, -1).join(' ').trim();
                    const isLab = rawName.toLowerCase().includes('lab') || rawName.toLowerCase().includes('practical');
                    semestersData[currentSemester].push({
                        code: potentialCode,
                        name: rawName,
                        type: isLab ? 'lab' : 'theory',
                        credits: potentialCredits,
                        hoursPerWeek: isLab ? potentialCredits * 2 : potentialCredits,
                    });
                }
            }
        }
    }
  }

  // Filter out empty semesters and return a clean array of objects
  const finalResult = [];
  for (let sem = 1; sem <= 8; sem++) {
    if (semestersData[sem].length > 0) {
      finalResult.push({
        semester: sem,
        subjects: semestersData[sem]
      });
    }
  }

  return finalResult;
};
