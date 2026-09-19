export const AppRoutes = {
  splash: '/',
  login: '/login',
  register: '/register',
  home: '/home',
  favorites: '/favorites',
  history: '/history',
  roulette: (categoria) => `/roulette/${categoria}`,
  rouletteResult: (categoria) => `/roulette/${categoria}/result`,
  recipeDetail: (id) => `/recipe/${id}`,
};