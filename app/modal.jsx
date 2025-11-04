import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 items-center justify-center p-5 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Text className={`text-2xl font-pbold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
        This is a modal
      </Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text className={`text-primary ${isDark ? 'text-primary-100' : 'text-primary'}`}>
          Go to home screen
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});


