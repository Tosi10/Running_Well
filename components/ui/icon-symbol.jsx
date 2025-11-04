// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock.fill': 'access-time',
  'chart.bar.fill': 'bar-chart',
  'person.fill': 'person',
  'chevron.left': 'chevron-left',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'flag.fill': 'flag',
  'trophy.fill': 'trophy', // Will use MaterialCommunityIcons
  'gearshape.fill': 'settings',
};

// Icons that need MaterialCommunityIcons
const COMMUNITY_ICONS = ['trophy.fill'];

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}) {
  const iconName = MAPPING[name] || 'help';
  
  // Use MaterialCommunityIcons for specific icons
  if (COMMUNITY_ICONS.includes(name)) {
    return <MaterialCommunityIcons color={color} size={size} name={iconName} style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}


