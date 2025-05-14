export const authService = {
  // Exemple de fonction pour récupérer le rôle de l’utilisateur courant (à adapter selon ton système d’authentification)
  async getCurrentUserRole(): Promise<string> {
    const token = localStorage.getItem("token");
    if (!token) return "USER"; // ou une autre valeur par défaut
    // Exemple fictif : on appelle une API (à adapter selon ton système d’authentification) pour récupérer le rôle de l’utilisateur courant.
    // (Par exemple, via un endpoint /api/users/me qui renvoie { role: "MANAGER" } ou { role: "USER" }.)
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    // Par exemple, on peut extraire le rôle depuis le token JWT stocké (localStorage) ou faire un appel API (ex. /api/users/me) pour récupérer les infos de l’utilisateur courant.
    // Ici, on simule un appel (à remplacer par ton appel réel) :
    // const token = localStorage.getItem("token");
    // if (!token) return "USER"; // ou une autre valeur par défaut
    // (exemple fictif) : const response = await axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    // return response.data.role; // (exemple fictif)
    return "MANAGER"; // (simulation, à remplacer par ton appel réel)
  }
}; 