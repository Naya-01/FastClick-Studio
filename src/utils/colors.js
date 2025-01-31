export const COLORS = [
    '#004085',
    '#cc0000',
    '#009900',
    '#990099',
    '#ff6600',
    '#007a7a',
  ];

export const getColor = (index1, index2) => {
    const colorIndex = Math.max(index1, index2) % COLORS.length;
    return COLORS[colorIndex];
  };
