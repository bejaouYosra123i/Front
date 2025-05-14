import axios from 'axios';
import { HOST_API_KEY } from '../utils/globalConfig';

const API_URL = HOST_API_KEY;

export const investmentFormService = {
  async deleteForm(id: number, password: string) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié. Veuillez vous connecter.');
      }
      await axios.post(`${API_URL}/InvestmentForm/${id}/delete-with-password`, { password }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return true;
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Mot de passe incorrect.');
          case 403:
            throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          case 404:
            throw new Error('Le formulaire d\'investissement n\'a pas été trouvé.');
          default:
            throw new Error('Une erreur est survenue lors de la suppression du formulaire.');
        }
      }
      throw new Error('Erreur de connexion au serveur.');
    }
  }
};
