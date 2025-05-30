import axios from 'axios';

export async function createLog(description: string, userName: string) {
  try {
    await axios.post('/api/Logs', {
      description,
      userName,
    });
  } catch (error) {
    // Optionnel : afficher une erreur ou logger dans la console
    console.error('Failed to create log:', error);
  }
} 