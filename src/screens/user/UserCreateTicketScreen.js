import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';
import { API_URL } from '../../config/api';

// Las 42 áreas oficiales de la base de datos de Presidencia Municipal
const AREAS_BD = [
  // Áreas Prioritarias (Atención inmediata)
  { id: 9, nombre: 'Oficial del Registro Familiar', encargado: 'Lic. Uriel Cornejo González', es_prioritaria: 1 },
  { id: 5, nombre: 'Predial', encargado: 'Lic. Deysi Barrera Couder', es_prioritaria: 1 },
  { id: 23, nombre: 'Seguridad Pública y Tránsito Municipal', encargado: 'Alberto Tovar Coronado', es_prioritaria: 1 },
  { id: 13, nombre: 'Tesorería Municipal', encargado: 'L.C. Norma Yeni García Olguín', es_prioritaria: 1 },
  // Demás Áreas
  { id: 32, nombre: 'Archivo', encargado: 'C. Liliana Cornejo González', es_prioritaria: 0 },
  { id: 41, nombre: 'Bibliotecas', encargado: 'Lic. Hortensia Monserrath Zúñiga Valdez', es_prioritaria: 0 },
  { id: 38, nombre: 'Catastro', encargado: 'Lic. Jesús Aldair Cornejo Quijano', es_prioritaria: 0 },
  { id: 11, nombre: 'CAYATAH', encargado: 'Ing. Efraín Pérez Porras', es_prioritaria: 0 },
  { id: 35, nombre: 'CGI (Centro Gerontológico Integral)', encargado: 'Mtra. Gabriela Cornejo Mota', es_prioritaria: 0 },
  { id: 8, nombre: 'Comunicación Social', encargado: 'Lic. Ari Hazel Flores Sánchez', es_prioritaria: 0 },
  { id: 28, nombre: 'Conciliador Municipal', encargado: 'Lic. Yanet López Ponce', es_prioritaria: 0 },
  { id: 24, nombre: 'Contraloría', encargado: 'Lic. Sergio Uribe González', es_prioritaria: 0 },
  { id: 20, nombre: 'Cultura', encargado: 'Lic. Gerardo Barrera López', es_prioritaria: 0 },
  { id: 37, nombre: 'Deportes', encargado: 'C. Pedro Carmelo Serrano Ríos', es_prioritaria: 0 },
  { id: 19, nombre: 'Desarrollo Agrícola', encargado: 'Prof. Francisco Corona García', es_prioritaria: 0 },
  { id: 17, nombre: 'Desarrollo Económico', encargado: 'Alan Omar Valdez Reyes', es_prioritaria: 0 },
  { id: 18, nombre: 'Desarrollo Pecuario', encargado: 'Lic. Alma Laura Mota Mera', es_prioritaria: 0 },
  { id: 29, nombre: 'DIF', encargado: 'Lic. Reyna Lucia Escamilla Cornejo', es_prioritaria: 0 },
  { id: 16, nombre: 'Dirección de Desarrollo Social', encargado: 'C. Erika Noguez Salvador', es_prioritaria: 0 },
  { id: 10, nombre: 'Dirección de Gobernación', encargado: 'C. Néstor Barrera Hernández', es_prioritaria: 0 },
  { id: 25, nombre: 'Dirección de Obras Públicas', encargado: 'Ing. Jesús Santiago Ríos', es_prioritaria: 0 },
  { id: 21, nombre: 'Dirección de Protección Civil', encargado: 'L.E. Irving Joel Blancas Hernández', es_prioritaria: 0 },
  { id: 42, nombre: 'Diversidad Sexo Genérica', encargado: 'TSU. Moisés Hernández Blancas', es_prioritaria: 0 },
  { id: 4, nombre: 'Ecología', encargado: 'Lic. Alma Nayeli Cruz Mayorga', es_prioritaria: 0 },
  { id: 6, nombre: 'Educación', encargado: 'Lic. Carlos Graillet Ortega', es_prioritaria: 0 },
  { id: 3, nombre: 'IMJUVE', encargado: 'Leonardo Hernández Cruz', es_prioritaria: 0 },
  { id: 27, nombre: 'Instancia de la Mujer', encargado: 'Lic. Yessica Citlalli Reyes Pérez', es_prioritaria: 0 },
  { id: 15, nombre: 'Jurídico', encargado: 'Lic. Alejandro Granados Estrada', es_prioritaria: 0 },
  { id: 36, nombre: 'Limpieza', encargado: 'C. Ana María Callejas Olvera', es_prioritaria: 0 },
  { id: 14, nombre: 'Oficial Mayor', encargado: 'Gerardo Corona García', es_prioritaria: 0 },
  { id: 31, nombre: 'Oficialía de Asamblea', encargado: 'Lic. Juan Carlos Ángeles García', es_prioritaria: 0 },
  { id: 34, nombre: 'Planeación', encargado: 'C. Bernardo Porras Bautista', es_prioritaria: 0 },
  { id: 12, nombre: 'Reglamentos y Espectáculos', encargado: 'TSU. Edgar Pérez Dorantes', es_prioritaria: 0 },
  { id: 40, nombre: 'Relaciones Internacionales y Atención al Migrante', encargado: 'Lic. Ana Isis Cruz Callejas', es_prioritaria: 0 },
  { id: 30, nombre: 'Salud', encargado: 'C.D.E.E. Servando Porras Cornejo', es_prioritaria: 0 },
  { id: 1, nombre: 'Secretaría General Municipal', encargado: 'Arq. Gumaro Sánchez Cuellar', es_prioritaria: 0 },
  { id: 2, nombre: 'Secretaría Técnica', encargado: 'Lic. David Contreras López', es_prioritaria: 0 },
  { id: 26, nombre: 'Servicios Públicos', encargado: 'C. Jaime Ortiz Sánchez', es_prioritaria: 0 },
  { id: 39, nombre: 'SIPINNA', encargado: 'Lic. Jhoselin Mota Quijano', es_prioritaria: 0 },
  { id: 7, nombre: 'Transparencia', encargado: 'Lic. Adriana Monroy Ángeles', es_prioritaria: 0 },
  { id: 33, nombre: 'Turismo', encargado: 'Lic. Estefanía Jocelyn Valdez Contreras', es_prioritaria: 0 },
  { id: 22, nombre: 'Unidad Básica de Rehabilitación', encargado: 'C. Leydy de los Ángeles Serrano Estrada', es_prioritaria: 0 },
];

// Las 9 categorías oficiales de la base de datos
const CATEGORIAS_BD = [
  { id: 1, nombre: 'Activación de paqueterías', descripcion: 'Activación de Office, licencias, sistema operativo' },
  { id: 2, nombre: 'Atasco de impresión', descripcion: 'Papel atascado o errores de impresión' },
  { id: 3, nombre: 'Relleno / Cambio de tintas', descripcion: 'Relleno o cambio de tintas y consumibles' },
  { id: 4, nombre: 'Falla de hardware', descripcion: 'Equipo dañado, pantalla rota, componentes quemados' },
  { id: 5, nombre: 'Falla de red / internet', descripcion: 'Sin conexión, adaptador dañado, cable roto' },
  { id: 6, nombre: 'Mantenimiento preventivo', descripcion: 'Limpieza y revisión general del equipo' },
  { id: 7, nombre: 'Soporte a documentos', descripcion: 'Apoyo con archivos Excel, Word, documentos corruptos' },
  { id: 8, nombre: 'Instalación de software', descripcion: 'Instalación o actualización de programas' },
  { id: 9, nombre: 'Otro', descripcion: 'Otra falla no categorizada' },
];

export default function UserCreateTicketScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [areas, setAreas] = useState(AREAS_BD);
  const [categorias, setCategorias] = useState(CATEGORIAS_BD);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [tipoIntervencion, setTipoIntervencion] = useState('in_situ');
  const [descripcion, setDescripcion] = useState('');

  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [busquedaArea, setBusquedaArea] = useState('');

  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      const u = userStr ? JSON.parse(userStr) : null;
      setUsuario(u);

      // Preseleccionar el área del usuario si existe en AREAS_BD
      if (u) {
        const areaMatch = AREAS_BD.find(
          (a) =>
            a.id === u.area_id ||
            (u.area_nombre && a.nombre?.toLowerCase() === u.area_nombre?.toLowerCase())
        );
        if (areaMatch) setSelectedArea(areaMatch);
      }

      // Intentar cargar áreas y categorías frescas desde la API
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const [resAreas, resCats] = await Promise.all([
        fetch(`${API_URL}/api/areas`, { headers, signal: controller.signal })
          .then((r) => r.json())
          .catch(() => null),
        fetch(`${API_URL}/api/categorias`, { headers, signal: controller.signal })
          .then((r) => r.json())
          .catch(() => null),
      ]);
      clearTimeout(timeoutId);

      if (resAreas && resAreas.status === 'ok' && Array.isArray(resAreas.data) && resAreas.data.length > 0) {
        setAreas(resAreas.data);
        await AsyncStorage.setItem('cached_areas', JSON.stringify(resAreas.data));
        if (u) {
          const areaMatch = resAreas.data.find(
            (a) =>
              a.id === u.area_id ||
              (u.area_nombre && a.nombre?.toLowerCase() === u.area_nombre?.toLowerCase())
          );
          if (areaMatch) setSelectedArea(areaMatch);
        }
      }

      if (resCats && resCats.status === 'ok' && Array.isArray(resCats.data) && resCats.data.length > 0) {
        setCategorias(resCats.data);
        await AsyncStorage.setItem('cached_categorias', JSON.stringify(resCats.data));
      }
    } catch (e) {
      console.log('UserCreateTicket usando datos locales:', e);
    }
  };

  const getCategoryIcon = (nombre) => {
    const n = (nombre || '').toLowerCase();
    if (n.includes('impres') || n.includes('tinta') || n.includes('papel') || n.includes('atasco')) return '🖨️';
    if (n.includes('hardware') || n.includes('equipo') || n.includes('computadora')) return '💻';
    if (n.includes('red') || n.includes('internet') || n.includes('conexi')) return '🌐';
    if (n.includes('software') || n.includes('programa') || n.includes('paqueter') || n.includes('office')) return '📄';
    if (n.includes('mantenimiento')) return '🧹';
    if (n.includes('documento')) return '📁';
    return '🔧';
  };

  const handleEnviarTicket = async () => {
    if (!selectedArea) {
      Alert.alert('Falta información', 'Por favor selecciona el área donde ocurre la falla.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Falta descripción', 'Por favor escribe qué problema o falla técnica tienes.');
      return;
    }

    setEnviando(true);
    const esPrioritaria = selectedArea.es_prioritaria == 1 || String(selectedArea.es_prioritaria) === '1';
    const prioridadEsperada = esPrioritaria ? 'alta' : 'normal';

    try {
      const token = await AsyncStorage.getItem('token');
      const body = {
        area_id: selectedArea.id,
        categoria_id: selectedCategoria ? selectedCategoria.id : null,
        descripcion: descripcion.trim(),
        tipo_intervencion: tipoIntervencion,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.status === 'ok' && data.ticket) {
        const ticketId = data.ticket.id;
        const prioridadFinal = data.ticket.prioridad || prioridadEsperada;

        // Guardar de inmediato en el caché local de tickets para que aparezca consecutivo
        try {
          const cached = await AsyncStorage.getItem('cached_user_tickets');
          const lista = cached ? JSON.parse(cached) : [];
          const nuevoObj = {
            id: ticketId,
            folio: `TCK-${String(ticketId).padStart(3, '0')}`,
            area_id: selectedArea.id,
            area_nombre: selectedArea.nombre || 'Área Municipal',
            categoria_id: selectedCategoria?.id || null,
            categoria_nombre: selectedCategoria?.nombre || 'Soporte General',
            descripcion: descripcion.trim(),
            tipo_intervencion: tipoIntervencion,
            estado: 'abierto',
            prioridad: prioridadFinal,
            created_at: new Date().toISOString(),
            fecha_creacion: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          };
          const filtrada = lista.filter((t) => t.id !== ticketId);
          filtrada.unshift(nuevoObj);
          await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(filtrada));
        } catch (e) {}

        Alert.alert(
          '¡Reporte Levantado con Éxito!',
          `Tu ticket #${ticketId} ha sido registrado.\nÁrea: ${selectedArea.nombre}\nPrioridad: ${prioridadFinal === 'alta' ? '🔥 ALTA (Área Prioritaria)' : 'NORMAL'}\n\nUn técnico de Sistemas revisará tu solicitud pronto.`,
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
        return;
      } else {
        throw new Error(data.message || 'Error en servidor');
      }
    } catch (error) {
      console.log('Guardando ticket local con consecutivo:', error);

      // Calcular número de ticket ESTRICTAMENTE CONSECUTIVO
      try {
        const cached = await AsyncStorage.getItem('cached_user_tickets');
        const lista = cached ? JSON.parse(cached) : [];
        const maxId = lista.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
        const nuevoId = maxId > 0 ? maxId + 1 : 1;

        const nuevoTicket = {
          id: nuevoId,
          folio: `TCK-${String(nuevoId).padStart(3, '0')}`,
          area_id: selectedArea.id,
          area_nombre: selectedArea.nombre || 'Área Municipal',
          categoria_id: selectedCategoria?.id || null,
          categoria_nombre: selectedCategoria?.nombre || 'Soporte General',
          descripcion: descripcion.trim(),
          tipo_intervencion: tipoIntervencion,
          estado: 'abierto',
          prioridad: prioridadEsperada,
          created_at: new Date().toISOString(),
          fecha_creacion: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        };

        lista.unshift(nuevoTicket);
        await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(lista));

        Alert.alert(
          '¡Reporte Levantado con Éxito!',
          `Tu ticket #${nuevoId} ha sido registrado.\nÁrea: ${selectedArea.nombre}\nPrioridad: ${prioridadEsperada === 'alta' ? '🔥 ALTA (Área Prioritaria)' : 'NORMAL'}\n\nUn técnico de Sistemas revisará tu solicitud.`,
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } catch (err) {
        Alert.alert('Error', 'No se pudo guardar el reporte.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const areasFiltradas = areas.filter((a) => {
    const texto = busquedaArea.toLowerCase().trim();
    if (!texto) return true;
    return (
      (a.nombre || '').toLowerCase().includes(texto) ||
      (a.encargado || '').toLowerCase().includes(texto)
    );
  });

  const esAreaSeleccionadaPrioritaria =
    selectedArea &&
    (selectedArea.es_prioritaria == 1 || String(selectedArea.es_prioritaria) === '1');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Reportar Falla Técnica"
        onMenuPress={() => navigation.goBack()}
        onHomePress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerSubtitle}>
          Completa los datos de tu reporte para que el personal de Sistemas te atienda lo antes posible.
        </Text>

        <View style={styles.formCard}>
          {/* 1. Área del solicitante */}
          <Text style={styles.sectionLabel}>1. Tu Área / Departamento *</Text>
          <TouchableOpacity
            style={[
              styles.pickerSelector,
              esAreaSeleccionadaPrioritaria && styles.pickerSelectorPrioritaria,
            ]}
            onPress={() => setModalAreaVisible(true)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={[
                  styles.pickerText,
                  !selectedArea && { color: COLORS.textSecondary },
                  esAreaSeleccionadaPrioritaria && { color: '#B91C1C', fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {selectedArea ? `🏢 ${selectedArea.nombre}` : 'Selecciona tu área...'}
              </Text>
              {esAreaSeleccionadaPrioritaria && (
                <Text style={styles.badgePrioridadInline}>🔥 ALTA PRIORIDAD</Text>
              )}
            </View>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Cambiar ▼</Text>
          </TouchableOpacity>

          {selectedArea ? (
            esAreaSeleccionadaPrioritaria ? (
              <View style={styles.helperPrioritariaBox}>
                <Text style={styles.helperPrioritariaText}>
                  ⚡ <Text style={{ fontWeight: '700' }}>Área Prioritaria:</Text> Este reporte tendrá prioridad ALTA de atención por normativa municipal.
                </Text>
              </View>
            ) : (
              <Text style={styles.fieldHelper}>
                📍 Toca arriba si la falla se encuentra en otra oficina o departamento.
              </Text>
            )
          ) : (
            <Text style={styles.fieldHelper}>
              📋 Toca para elegir el área donde ocurre la falla técnica.
            </Text>
          )}

          {/* 2. ¿Qué tipo de problema es? (Categorías de la BD) */}
          <Text style={[styles.sectionLabel, { marginTop: 18 }]}>
            2. ¿Qué servicio o equipo falla? *
          </Text>
          <Text style={styles.categorySubtext}>
            Selecciona la opción que mejor describa tu problema:
          </Text>

          <View style={styles.categoriesGrid}>
            {categorias.map((cat) => {
              const isSelected = selectedCategoria?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setSelectedCategoria(isSelected ? null : cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{getCategoryIcon(cat.nombre)}</Text>
                  <Text
                    style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}
                    numberOfLines={2}
                  >
                    {cat.nombre}
                  </Text>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Tipo de Atención Requerida */}
          <Text style={[styles.sectionLabel, { marginTop: 18 }]}>
            3. ¿Dónde requieres la atención?
          </Text>
          <View style={styles.intervencionRow}>
            <TouchableOpacity
              style={[
                styles.intervencionBtn,
                tipoIntervencion === 'in_situ' && styles.intervencionBtnActive,
              ]}
              onPress={() => setTipoIntervencion('in_situ')}
              activeOpacity={0.8}
            >
              <Text style={styles.intervencionEmoji}>🏃</Text>
              <Text
                style={[
                  styles.intervencionText,
                  tipoIntervencion === 'in_situ' && styles.intervencionTextActive,
                ]}
              >
                En mi oficina
              </Text>
              <Text style={styles.intervencionSub}>El técnico viene a tu lugar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.intervencionBtn,
                tipoIntervencion === 'traslado_centro' && styles.intervencionBtnActive,
              ]}
              onPress={() => setTipoIntervencion('traslado_centro')}
              activeOpacity={0.8}
            >
              <Text style={styles.intervencionEmoji}>📦</Text>
              <Text
                style={[
                  styles.intervencionText,
                  tipoIntervencion === 'traslado_centro' && styles.intervencionTextActive,
                ]}
              >
                Llevar a Sistemas
              </Text>
              <Text style={styles.intervencionSub}>Llevarás el equipo al centro</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Descripción clara del problema */}
          <Text style={[styles.sectionLabel, { marginTop: 18 }]}>
            4. Describe la falla detalladamente *
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej. La impresora no jala el papel, marca error y parpadea un foco naranja. Ya intentamos reiniciar el equipo y persiste."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Botón de Enviar Reporte */}
          <TouchableOpacity
            style={[styles.submitBtn, enviando && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleEnviarTicket}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>➕ Enviar Reporte de Falla</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Seleccionar Área (Con todas las 42 áreas y marcas de prioridad) */}
      <Modal visible={modalAreaVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Seleccionar Área / Oficina</Text>
              <Text style={styles.modalSubtitle}>
                {areasFiltradas.length} de {areas.length} áreas registradas
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setModalAreaVisible(false);
                setBusquedaArea('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalClose}>Cerrar ✕</Text>
            </TouchableOpacity>
          </View>

          {/* Buscador de áreas */}
          <View style={styles.modalSearchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar área o encargado..."
              placeholderTextColor={COLORS.textSecondary}
              value={busquedaArea}
              onChangeText={setBusquedaArea}
              autoCorrect={false}
            />
            {busquedaArea.length > 0 && (
              <TouchableOpacity onPress={() => setBusquedaArea('')}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={areasFiltradas}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const esPrio = item.es_prioritaria == 1 || String(item.es_prioritaria) === '1';
              const estaSeleccionada = selectedArea?.id === item.id;

              return (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    esPrio && styles.modalItemPrioritaria,
                    estaSeleccionada && styles.modalItemSeleccionada,
                  ]}
                  onPress={() => {
                    setSelectedArea(item);
                    setModalAreaVisible(false);
                    setBusquedaArea('');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={styles.itemTitleRow}>
                      <Text
                        style={[
                          styles.modalItemText,
                          esPrio && styles.modalItemTextPrioritaria,
                          estaSeleccionada && { color: COLORS.primary },
                        ]}
                      >
                        {item.nombre}
                      </Text>
                    </View>
                    {item.encargado ? (
                      <Text style={styles.modalItemSub}>👤 {item.encargado}</Text>
                    ) : null}
                  </View>

                  {esPrio ? (
                    <View style={styles.badgePrioContainer}>
                      <Text style={styles.modalPrioritaria}>🔥 PRIORITARIA</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={{ color: COLORS.textSecondary }}>
                  No se encontraron áreas con "{busquedaArea}"
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: SIZES.md,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  headerSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  sectionLabel: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  categorySubtext: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  pickerSelector: {
    backgroundColor: COLORS.inputBg,
    minHeight: 52,
    borderRadius: SIZES.radiusSm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#C0D5FC',
  },
  pickerSelectorPrioritaria: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  pickerText: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  badgePrioridadInline: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '800',
    marginTop: 2,
  },
  helperPrioritariaBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: SIZES.radiusSm,
    padding: 10,
    marginTop: 8,
  },
  helperPrioritariaText: {
    fontSize: SIZES.small,
    color: '#991B1B',
    lineHeight: 18,
  },
  fieldHelper: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusSm,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#D6E4FF',
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F0FE',
  },
  categoryEmoji: { fontSize: 26, marginBottom: 4 },
  categoryTitle: {
    fontSize: 12,
    color: COLORS.textDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTitleSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 8,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  intervencionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intervencionBtn: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D6E4FF',
  },
  intervencionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  intervencionEmoji: { fontSize: 22, marginBottom: 2 },
  intervencionText: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  intervencionTextActive: {
    color: COLORS.textWhite,
  },
  intervencionSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusSm,
    padding: 14,
    fontSize: SIZES.body,
    color: COLORS.textDark,
    height: 110,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#C0D5FC',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...SHADOWS.medium,
  },
  submitBtnText: {
    color: COLORS.textWhite,
    fontSize: SIZES.body,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  modalTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary },
  modalSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  modalClose: { fontSize: SIZES.caption, color: COLORS.danger, fontWeight: '700' },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.textDark },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FF',
  },
  modalItemPrioritaria: {
    backgroundColor: '#FFF7F7',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  modalItemSeleccionada: {
    backgroundColor: '#EEF4FF',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalItemText: { fontSize: SIZES.body, color: COLORS.textDark, fontWeight: '600' },
  modalItemTextPrioritaria: { color: '#B91C1C', fontWeight: '700' },
  modalItemSub: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 3 },
  badgePrioContainer: {
    marginLeft: 6,
  },
  modalPrioritaria: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
