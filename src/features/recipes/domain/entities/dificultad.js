export const Dificultad = {
  facil: 'facil',
  media: 'media',
  dificil: 'dificil',
};

Dificultad.values = [Dificultad.facil, Dificultad.media, Dificultad.dificil];

Dificultad.fromStorage = (value) => {
  return Dificultad.values.find((d) => d === value) || Dificultad.media;
};

Object.defineProperty(Dificultad, 'labels', {
  value: {
    [Dificultad.facil]: 'Fácil',
    [Dificultad.media]: 'Media',
    [Dificultad.dificil]: 'Difícil',
  },
});

// Extensión para obtener label
Dificultad.getLabel = (d) => Dificultad.labels[d] || 'Media';