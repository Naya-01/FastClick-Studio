export const COLORS = [
    '#004085',
    '#cc0000',
    '#009900',
    '#990099',
    '#ff6600',
    '#007a7a',
  ];

export const COLORS_LEGEND = {
    low: { background: '#cce5ff', border: '#004085' },
    medium: { background: '#ffe799', border: '#ffcf33' },
    high: { background: '#e77e88', border: '#ff3300' },
  };

export const getColor = (index1, index2) => {
    const colorIndex = Math.max(index1, index2) % COLORS.length;
    return COLORS[colorIndex];
  };

export const getLiveColor = () => {
    return '#cce5ff';
  };

export const getLiveBorderColor = () => {
    return '#004085';
  };



export const getAddColor = () => {
    return '#d4edda';
  }

export const getAddBorderColor = () => {
    return '#28a745';
  }

export const getEdgeColor = () => {
    return '#004085';
  }

export const getNodeColorByCount = (count, low, medium) => {
  if (count < low) {
    return COLORS_LEGEND.low;
  } else if (count <= medium) {
    return COLORS_LEGEND.medium;
  } else {
    return COLORS_LEGEND.high;
  }
};
  