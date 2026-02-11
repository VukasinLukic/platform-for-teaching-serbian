/**
 * Service for handling quiz data fetching.
 */

// Base path for quiz data
const QUIZ_DATA_PATH = '/data/quizzes';

/**
 * Fetches the list of available quizzes from the manifest file.
 * @returns {Promise<Array>} List of quiz metadata objects.
 */
export const getAvailableQuizzes = async () => {
  try {
    const response = await fetch(`${QUIZ_DATA_PATH}/manifest.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch quiz manifest');
    }
    const quizzes = await response.json();
    return quizzes;
  } catch (error) {
    console.error('Error fetching available quizzes:', error);
    return [];
  }
};

/**
 * Loads a specific quiz by its ID (filename without extension).
 * @param {string} quizId - The ID of the quiz to load.
 * @returns {Promise<Array>} The quiz data (array of questions).
 */
export const loadQuiz = async (quizId) => {
  try {
    // We need to find the filename from the manifest first to be safe, 
    // or we can just assume a convention. Let's assume convention for now but check manifest if needed.
    // For simplicity, we'll try to fetch directly based on ID.
    const response = await fetch(`${QUIZ_DATA_PATH}/${quizId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load quiz: ${quizId}`);
    }
    const quizData = await response.json();
    return quizData;
  } catch (error) {
    console.error(`Error loading quiz ${quizId}:`, error);
    throw error;
  }
};
