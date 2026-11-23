// Configuración de conexión al backend
// Detecta automáticamente la IP de la computadora desde donde el teléfono cargó la app
import { NativeModules } from 'react-native';

const getBackendUrl = () => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:\/]+)/);
      if (match && match[1]) {
        return `http://${match[1]}:3000`;
      }
    }
  } catch (e) {
    // ignorar error y usar fallback
  }

  // Fallback con la IP actual de la computadora (Wi-Fi)
  return 'http://192.168.1.113:3000';
};

export const API_URL = getBackendUrl();
export default API_URL;
