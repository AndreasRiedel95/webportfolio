export const math = {
  lerp: (a, b, n) => {
    return (1 - n) * a + n * b;
  },
  norm: (value, min, max) => {
    return (value - min) / (max - min);
  },
};

export const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};
