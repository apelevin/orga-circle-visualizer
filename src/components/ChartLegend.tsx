
import React from 'react';
import * as d3 from 'd3';

interface ChartLegendProps {
  uniqueTypes: string[];
  colorScale: d3.ScaleOrdinal<string, string>;
}

const ChartLegend: React.FC<ChartLegendProps> = ({ uniqueTypes, colorScale }) => {
  return (
    <g
      className="legend"
      transform="translate(20, 20)"
    >
      {uniqueTypes.map((type, i) => (
        <g
          key={type}
          className="legend-item"
          transform={`translate(0, ${i * 25})`}
        >
          <rect
            width={15}
            height={15}
            rx={3}
            fill={colorScale(type)}
          />
          <text
            x={20}
            y={12}
            style={{
              fontSize: '12px',
              fontWeight: '500',
              fill: '#666'
            }}
          >
            {type}
          </text>
        </g>
      ))}
    </g>
  );
};

export default ChartLegend;
