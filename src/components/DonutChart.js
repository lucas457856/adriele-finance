import { View } from 'react-native';
import Svg, { Circle, G, Path, Text } from 'react-native-svg';

export default function DonutChart({ data = [], size = 150 }) {
  const radius = size / 2;
  const center = size / 2;

  const safeData = data.map(item => ({
    value: Number(item.valor ?? item.value) || 0,
    color: item.cor ?? item.color ?? '#888',
  }));

  const total = safeData.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return <View />;
  }

  let startAngle = -Math.PI / 2;

  const arcs = safeData
    .filter(item => item.value > 0)
    .map((item) => {
      const angle = (item.value / total) * Math.PI * 2;

      // Caso especial: 100%
      if (angle >= Math.PI * 2 - 0.001) {
        return {
          fullCircle: true,
          color: item.color,
          textX: center,
          textY: center,
          percent: 100,
        };
      }

      const endAngle = startAngle + angle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);

      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      const midAngle = startAngle + angle / 2;

      const textRadius = radius * 0.7;

      const textX = center + textRadius * Math.cos(midAngle);
      const textY = center + textRadius * Math.sin(midAngle);

      const percent = Math.round((item.value / total) * 100);

      startAngle = endAngle;

      return {
        fullCircle: false,
        path,
        color: item.color,
        textX,
        textY,
        percent,
      };
    });

  return (
    <View>
      <Svg width={size} height={size}>
        <G>
          {arcs.map((arc, index) =>
            arc.fullCircle ? (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill={arc.color}
              />
            ) : (
              <Path
                key={index}
                d={arc.path}
                fill={arc.color}
              />
            )
          )}

          {arcs.map((arc, index) => (
            <Text
              key={`text-${index}`}
              x={arc.textX}
              y={arc.textY}
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {arc.percent}%
            </Text>
          ))}
        </G>
      </Svg>
    </View>
  );
}