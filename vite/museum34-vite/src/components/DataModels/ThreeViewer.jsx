import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ThreeViewer = ({ path, handData, scale_, bright_ }) => {
  const viewerRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const lightRef = useRef(null);
  const isImageFrameRef = useRef(false); // Referencia para saber si es imagen

  const [initialLeftZ, setInitialLeftZ] = useState(null);
  const [initialRightX, setInitialRightX] = useState(null);
  const [initialRightY, setInitialRightY] = useState(null);

  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Reiniciar estados al cargar nuevo modelo
    setIsLoading(true);
    setLoadError(false);

    const scene = new THREE.Scene();
    // Fondo con gradiente más claro para mejor contraste
    scene.background = new THREE.Color(0x2a2a3e);
    // Agregar niebla sutil para profundidad
    scene.fog = new THREE.Fog(0x2a2a3e, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Mejorar rendering para evitar modelos oscuros
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // Aumentar exposición
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    
    viewerRef.current.appendChild(renderer.domElement);

    // Sistema de iluminación mejorado para evitar modelos negros
    // Luz ambiental más intensa
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Luz hemisférica para iluminación natural
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Luz de relleno desde la izquierda
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight1.position.set(-5, 3, -5);
    scene.add(fillLight1);

    // Luz de relleno desde atrás
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight2.position.set(0, 3, -5);
    scene.add(fillLight2);

    // Luz puntual para resaltar detalles
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
    
    lightRef.current = directionalLight;
    
    // Modelo 3D
    const loader = new GLTFLoader();
    let model;
    let modelCenter = new THREE.Vector3(); // Centro del modelo para rotación
    let isImageFrame = false; // Detectar si es un cuadro/imagen
    
    // Validar que la ruta sea válida antes de cargar
    if (!path || path.includes('example.com') || path === '') {
      console.warn('Ruta de modelo no válida:', path);
      setIsLoading(false);
      setLoadError(true);
      // No hacer el loader.load, pero continuar para configurar el cleanup
    } else {
      // Solo cargar si la ruta es válida
      loader.load(
      path,
      (gltf) => {
        setIsLoading(false);
        setLoadError(false);
        model = gltf.scene;
        
        // Procesar materiales para evitar modelos negros
        model.traverse((child) => {
          if (child.isMesh) {
            // Asegurar que el material reciba luz
            if (child.material) {
              // Si el material es un array
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  mat.needsUpdate = true;
                  // Ajustar propiedades para mejor visibilidad
                  if (mat.color && mat.color.r === 0 && mat.color.g === 0 && mat.color.b === 0) {
                    mat.color.setHex(0x808080); // Gris si es completamente negro
                  }
                  mat.flatShading = false;
                  mat.metalness = mat.metalness || 0.1;
                  mat.roughness = mat.roughness || 0.7;
                });
              } else {
                child.material.needsUpdate = true;
                // Ajustar propiedades para mejor visibilidad
                if (child.material.color && 
                    child.material.color.r === 0 && 
                    child.material.color.g === 0 && 
                    child.material.color.b === 0) {
                  child.material.color.setHex(0x808080); // Gris si es completamente negro
                }
                child.material.flatShading = false;
                if (child.material.metalness !== undefined) {
                  child.material.metalness = child.material.metalness || 0.1;
                }
                if (child.material.roughness !== undefined) {
                  child.material.roughness = child.material.roughness || 0.7;
                }
              }
            }
            
            // Habilitar recepción y proyección de sombras
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(model);

        // Calcular el bounding box del modelo
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Guardar el centro para rotación
        modelCenter.copy(center);

        // Detectar si es un cuadro/imagen (proporción ancho > profundidad)
        isImageFrame = size.z < size.x * 0.3; // Si la profundidad es < 30% del ancho

        // Centrar el modelo
        model.position.sub(center);

        // Calcular la escala óptima para ajustar al visor
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3; // Tamaño objetivo en el visor
        const optimalScale = targetSize / maxDim;

        // Aplicar escala óptima
        model.scale.set(optimalScale, optimalScale, optimalScale);

        // Para imágenes/cuadros: orientar hacia el usuario
        if (isImageFrame) {
          model.rotation.y = 0; // Frente al usuario
          model.rotation.x = 0; // Vertical
          model.rotation.z = 0;
          isImageFrameRef.current = true; // Guardar en ref
        } else {
          isImageFrameRef.current = false;
        }

        // Ajustar posición de la cámara según el tamaño del modelo
        const distance = maxDim * 1.5;
        camera.position.z = Math.max(3, Math.min(8, distance));

        modelRef.current = model; 
      },
      (progress) => {
        // Progreso de carga silencioso (sin console.log para evitar spam)
        // Si necesitas ver el progreso, descomenta la siguiente línea:
        // console.log(`Cargando: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error(`Error cargando modelo desde la ruta: ${path}`, error);
        setIsLoading(false);
        setLoadError(true);
      }
    
    );
    } // Cierre del else

    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event) => {
      if (!isDragging || !model) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      if (isImageFrame) {
        // Para imágenes: solo rotación horizontal (eje Y)
        model.rotation.y += deltaMove.x * 0.01;
      } else {
        // Para modelos 3D: rotación libre alrededor del centro
        model.rotation.y += deltaMove.x * 0.01;
        model.rotation.x += deltaMove.y * 0.01;
      }
    

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
      /*
      model.rotation.y = 0;
      model.rotation.x = 0;
      */
      };
    

    //No se descartan las funciones ya establecidas
    const onWheel = (event) => {
      event.preventDefault();
      // Zoom más suave y con límites dinámicos
      const zoomSpeed = 0.003;
      const minDistance = 2;
      const maxDistance = 10;
      camera.position.z = Math.max(minDistance, Math.min(maxDistance, camera.position.z + event.deltaY * zoomSpeed));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);



    // Hacer que el renderer y la cámara se ajusten al tamaño del contenedor dinámicamente
    const onResize = () => {
      if (!viewerRef.current) return;
      const width = viewerRef.current.clientWidth;
      const height = viewerRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    // Luz que sigue a la cámara para iluminación consistente
    const cameraLight = new THREE.PointLight(0xffffff, 0.8, 50);
    camera.add(cameraLight);
    scene.add(camera);

    // Render loop mejorado
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Actualizar posición de luz direccional para seguir el modelo
      if (model && directionalLight) {
        const lightOffset = new THREE.Vector3(3, 3, 3);
        directionalLight.position.copy(camera.position).add(lightOffset);
        directionalLight.lookAt(model.position);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      
      if (viewerRef.current && renderer.domElement.parentNode === viewerRef.current) {
        viewerRef.current.removeChild(renderer.domElement);
      }
      
      // Limpiar recursos de Three.js
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
      
      renderer.dispose();
      scene.clear();
    };
  }, [path, scale_]);
  useEffect(() => {
    if (lightRef.current) {
      const normalizedBrightness = Math.max(0, Math.min(100, bright_)) / 100;
      lightRef.current.intensity = normalizedBrightness * 1.5; // Ajusta el valor base a tu preferencia
    }
  }, [bright_]);


  function transformNumber(num) {
    const clampedNum = Math.max(-9, Math.min(-2, num));
    const transformedNum = 10 + clampedNum;
    return transformedNum;
  }

  function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
  function lerp(current, target, alpha) {
    return current * (1 - alpha) + target * alpha;
  }
  function scaleAndStabilize(number, inMin, inMax, outMin, outMax) {
    const scaledValue = (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  
    // Redondeo para evitar fluctuaciones excesivas
    return Math.round(scaledValue * 100) / 100;  // Redondeo a 2 decimales
  }
  useEffect(() => {
    const { leftGrabbing, leftFingers, rightGrabbing, rightFingers } = handData;

    if (leftGrabbing && cameraRef.current) {
      const targetPos = scaleAndStabilize(leftFingers[0].z, -0.0000009, -0.0000002, 2, 5);
      cameraRef.current.position.z = lerp(cameraRef.current.position.z, targetPos, 0.1); // Alpha controla la suavidad
    }

    if(rightGrabbing && cameraRef.current){
      if (!isDraggingRight) {
        setInitialRightX(rightFingers[0].x);
        setInitialRightY(rightFingers[0].y);
        setIsDraggingRight(true);
      }
      const dedoIX = scaleAndStabilize(initialRightX, 0, 1, -30, 30);
      const dedoIY = scaleAndStabilize(initialRightY, 0, 1, -23, 23);

      const dedoX = lerp(dedoIX, scaleAndStabilize(rightFingers[0].x, 0, 1, -30, 30), 0.1);
      const dedoY = lerp(dedoIY, scaleAndStabilize(rightFingers[0].y, 0, 1, -23, 23), 0.1);
      

      
      const deltaMoveX = dedoX - dedoIX;
      const deltaMoveY = dedoY - dedoIY;


      const targetRotationY = modelRef.current.rotation.y + deltaMoveX * 20 // Eje Y (izquierda-derecha)
      const targetRotationX = modelRef.current.rotation.x + deltaMoveY * 20 // Eje X (arriba-abajo)

      modelRef.current.rotation.y = lerp(modelRef.current.rotation.y, targetRotationY, 0.1);
      modelRef.current.rotation.x = lerp(modelRef.current.rotation.x, targetRotationX, 0.1);


      setInitialRightX(rightFingers[0].x);
      setInitialRightY(rightFingers[0].y);

    } else{
      setIsDraggingRight(false);
    }



  }, [JSON.stringify(handData), initialRightX, initialRightY]);
  


  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={viewerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      />
      
      {/* Indicador de carga */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0, 0, 0, 0.8)",
          padding: "20px 30px",
          borderRadius: "15px",
          color: "white",
          fontSize: "14px",
          fontWeight: "500",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}>
          <div style={{
            width: "30px",
            height: "30px",
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderTop: "3px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <span>Cargando modelo...</span>
        </div>
      )}

      {/* Indicador de error */}
      {loadError && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(220, 38, 38, 0.9)",
          padding: "20px 30px",
          borderRadius: "15px",
          color: "white",
          fontSize: "13px",
          fontWeight: "500",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          maxWidth: "80%",
          wordBreak: "break-word",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>❌</div>
          <div style={{ fontWeight: "600", marginBottom: "8px" }}>Error al cargar el modelo</div>
          <small style={{ fontSize: "11px", opacity: 0.9, display: "block", marginBottom: "5px" }}>
            Verifica que la ruta sea correcta:
          </small>
          <code style={{ 
            fontSize: "10px", 
            opacity: 0.8, 
            background: "rgba(0,0,0,0.3)", 
            padding: "4px 8px", 
            borderRadius: "4px",
            display: "block",
            marginTop: "5px",
          }}>
            {path}
          </code>
        </div>
      )}
      
      {/* Indicador de tipo de modelo */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "6px 12px",
        borderRadius: "15px",
        color: "white",
        fontSize: "11px",
        fontWeight: "600",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        {isImageFrameRef.current ? "🖼️ Imagen" : "🎨 Modelo 3D"}
      </div>
      {/* Controles visuales */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.6)",
        padding: "8px 16px",
        borderRadius: "20px",
        color: "white",
        fontSize: "12px",
        backdropFilter: "blur(5px)",
        display: "flex",
        gap: "15px",
        alignItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}>
        <span>Click + Arrastrar: {isImageFrameRef.current ? "Rotar horizontal" : "Rotar"}</span>
        <span>Scroll: Zoom</span>
      </div>
    </div>
  );
};

export default ThreeViewer;
