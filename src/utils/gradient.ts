export const getGradientPoints = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360;
  const radians = ((normalized - 90) * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  return {
    x1: 0.5 - x / 2,
    y1: 0.5 - y / 2,
    x2: 0.5 + x / 2,
    y2: 0.5 + y / 2,
  };
};
