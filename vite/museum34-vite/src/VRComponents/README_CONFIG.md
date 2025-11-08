# 📋 Configuración de Modelos del Museo Virtual

## 📁 Archivo: `museumModelsConfig.js`

Este archivo centraliza toda la configuración de los modelos 3D, cuadros, podiums y lámparas del museo virtual.

---

## 🎯 Ventajas de usar este archivo

✅ **Centralizado**: Todos los modelos en un solo lugar
✅ **Fácil de editar**: Modificar posiciones sin tocar el código JSX
✅ **Organizado**: Separado por categorías (modelos3D, podiums, lamps, frames)
✅ **Escalable**: Agregar nuevos modelos es simple
✅ **Mantenible**: Cambios rápidos sin buscar en todo el código
✅ **Documentado**: Cada modelo tiene descripción

---

## 📖 Estructura del Archivo

```javascript
const museumModelsConfig = {
  models3D: [...],   // Modelos 3D principales
  podiums: [...],    // Pedestales
  lamps: [...],      // Lámparas
  frames: [...],     // Cuadros/Fotografías
};
```

---

## 🔧 Cómo Agregar un Nuevo Modelo 3D

### 1. Modelo 3D GLTF

```javascript
{
  id: 'mi_nuevo_modelo',              // ID único
  type: 'gltf',                        // Tipo de modelo
  model: '#mi_modelo',                 // Referencia al asset
  position: { x: 0, y: 1, z: 5 },     // Posición en el espacio
  rotation: { x: 0, y: 90, z: 0 },    // Rotación en grados
  scale: { x: 1, y: 1, z: 1 },        // Escala del modelo
  staticBody: true,                    // Colisión física
  description: 'Mi nuevo modelo',      // Descripción
}
```

Agrégalo al array `models3D`.

---

### 2. Cuadro/Fotografía (OBJ)

```javascript
{
  id: 'frame_nueva_foto',
  type: 'obj',
  objModel: '#recuadro-obj',           // Modelo del marco
  material: '#mi_foto',                // Textura de la foto
  position: { x: 5, y: 0, z: 12 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  staticBody: true,
  description: 'Mi nueva fotografía',
}
```

Agrégalo al array `frames`.

---

### 3. Podium

```javascript
{
  id: 'podium_nuevo',
  type: 'obj',
  objModel: '#podiums-obj',
  material: '#podiums-texture',
  position: { x: 7, y: 0, z: 8 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  staticBody: true,
}
```

Agrégalo al array `podiums`.

---

### 4. Lámpara

```javascript
{
  id: 'lamp_nueva',
  type: 'obj',
  objModel: '#lamps-obj',
  material: '#lamps-texture',
  position: { x: 8, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  staticBody: true,
}
```

Agrégalo al array `lamps`.

---

## 📐 Sistema de Coordenadas

```
        Z (Adelante)
        ↑
        |
        |
        └────→ X (Derecha)
       /
      /
     Y (Arriba)
```

- **X**: Izquierda (-) / Derecha (+)
- **Y**: Abajo (-) / Arriba (+)
- **Z**: Atrás (-) / Adelante (+)

---

## 🎨 Propiedades Importantes

### Position (Posición)
- Coordenadas en el espacio 3D
- `x`, `y`, `z` en metros

### Rotation (Rotación)
- Ángulos en grados
- `x`: Inclinar adelante/atrás (pitch)
- `y`: Girar izquierda/derecha (yaw)
- `z`: Rotar sobre el eje (roll)

### Scale (Escala)
- Tamaño del modelo
- `1` = Tamaño original
- `< 1` = Más pequeño
- `> 1` = Más grande

### Static Body
- `true`: El objeto tiene colisión física
- `false`: El jugador puede atravesarlo

---

## 🔍 Ejemplos de Uso Común

### Rotar un modelo 90° a la derecha
```javascript
rotation: { x: 0, y: 90, z: 0 }
```

### Rotar 180° (dar la vuelta)
```javascript
rotation: { x: 0, y: 180, z: 0 }
```

### Hacer un modelo más grande
```javascript
scale: { x: 2, y: 2, z: 2 }  // 2x el tamaño
```

### Hacer un modelo más pequeño
```javascript
scale: { x: 0.5, y: 0.5, z: 0.5 }  // Mitad del tamaño
```

### Elevar un modelo
```javascript
position: { x: 0, y: 2, z: 0 }  // 2 metros arriba
```

---

## 🛠️ Modificar Posiciones Existentes

1. Abre `museumModelsConfig.js`
2. Busca el modelo por su `id`
3. Modifica `position`, `rotation` o `scale`
4. Guarda el archivo
5. Los cambios se aplican automáticamente

---

## ⚠️ Consejos Importantes

✅ **IDs únicos**: Cada modelo debe tener un `id` diferente
✅ **Referencias correctas**: Verifica que `model`, `objModel` y `material` existan en los assets
✅ **Colisiones**: Usa `staticBody: true` para objetos sólidos
✅ **Prueba gradualmente**: Cambia una propiedad a la vez
✅ **Coordenadas lógicas**: Mantén los modelos dentro del museo (-20 a 20)

---

## 📊 Categorías Actuales

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **models3D** | 7 | Modelos 3D principales (Furina, Volcán, Catedral, etc.) |
| **podiums** | 10 | Pedestales para exposición |
| **lamps** | 4 | Lámparas de iluminación |
| **frames** | 12 | Cuadros y fotografías |

**Total**: 33 objetos configurables

---

## 🚀 Mejoras Futuras

Puedes extender el archivo agregando:

- `interactable: true/false` - Para objetos clickeables
- `animation: {...}` - Animaciones personalizadas
- `sound: "..."` - Sonidos al acercarse
- `metadata: {...}` - Información adicional
- `triggers: {...}` - Eventos especiales

---

## 📝 Ejemplo Completo

```javascript
{
  id: 'estatua_condor',
  type: 'gltf',
  model: '#condor_model',
  position: { x: -8, y: 1.5, z: 5 },
  rotation: { x: 0, y: 45, z: 0 },
  scale: { x: 1.2, y: 1.2, z: 1.2 },
  staticBody: true,
  description: 'Estatua del Cóndor Andino - Símbolo de libertad',
}
```

Este modelo:
- Se posiciona en las coordenadas (-8, 1.5, 5)
- Está rotado 45° a la derecha
- Es 20% más grande que el original
- Tiene colisión física
- Incluye descripción

---

## 💡 Tips de Debugging

Si un modelo no aparece:
1. ✅ Verifica que el asset esté cargado en `index.html`
2. ✅ Confirma que el `id` coincida con la referencia (`#nombre`)
3. ✅ Revisa la consola del navegador por errores
4. ✅ Verifica que las coordenadas estén dentro del museo
5. ✅ Asegúrate que `scale` no sea 0

---

¡Ahora puedes gestionar todos los modelos del museo de forma centralizada y eficiente! 🎨✨
