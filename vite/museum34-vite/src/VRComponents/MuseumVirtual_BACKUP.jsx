import React, { useState, useEffect, useRef } from "react";
import { Entity, Scene } from "aframe-react";
import BottomMenu from "./BottomMenu.jsx";
import stepSound from "./audio/step-sound.ogg";
import clickSound from "./audio/click-sound.ogg";
import audio1 from "./audio/アドリブ-_instrumental_.ogg";

import Perfil from "./Perfil.jsx";
import Configuracion from "./Configuracion.jsx";
import Informacion from "./Informacion.jsx";

import models from '../models/index.js';
import museumModelsConfig from './museumModelsConfig.js';

import styled from "styled-components";

import AFrameControls from "./AFrameControls.jsx";
import "aframe";
import "aframe-physics-system";
import ModalInformation from "../components/DataModels/ModalInformation.jsx";

import TransitionAnimation from "./TransitionAnimation.jsx";
import api from "../api/axios.js";
import HelpBox from "./HelpBox.jsx";

const ModalContainer = styled.div`
  position: absolute;
  z-index: 9999;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 70%;
  background: #1e1f29;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #ff6666;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #ff3333;
  }
`;

const MusicButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e1f29, #3a3b46);
  border: 2px solid ${props => props.isMuted ? '#ff6666' : '#4CAF50'};
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StatsPanel = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, rgba(30, 31, 41, 0.9), rgba(58, 59, 70, 0.9));
  padding: 15px;
  border-radius: 10px;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 9998;
  border: 1px solid rgba(108, 238, 181, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  min-width: 200px;
`;

const HintBox = styled.div`
  position: fixed;
  bottom: 200px;
  right: 20px;
  background: linear-gradient(135deg, rgba(108, 238, 181, 0.95), rgba(78, 205, 196, 0.95));
  padding: 12px 18px;
  border-radius: 12px;
  color: #1e1f29;
  font-weight: 600;
  font-size: 14px;
  z-index: 9998;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: fadeInSlide 0.5s ease-out;
  max-width: 250px;
  
  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const TeleportButton = styled.button`
  background: linear-gradient(135deg, #6CEEB5, #4ECDC4);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  color: #1e1f29;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;
  box-shadow: 0 2px 8px rgba(108, 238, 181, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 238, 181, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MuseumVirtual = () => {
  // Estados principales
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contentDisplay, setContentDisplay] = useState("none");
  const [buttonText, setButtonText] = useState("Abrir Modal");
  const [idModal, setIdModal] = useState(0);
  const [museumTime, setMuseumTime] = useState(0);
  const [inModel, setInModel] = useState(false);

  // Configuración del usuario
  const [brillo, setBrillo] = useState(50);
  const [volumen, setVolumen] = useState(50);
  const [movimiento, setMovimiento] = useState(50);
  const [sensibilidad, setSensibilidad] = useState(50);
  const [userID, setUserID] = useState(null);
  const [conID, setConID] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Estados de secciones
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Estados de mejoras visuales
  const [showStats, setShowStats] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });
  const [fps, setFps] = useState(60);
  const [currentHint, setCurrentHint] = useState(0);
  const [showTeleportMenu, setShowTeleportMenu] = useState(false);

  // Refs
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const lastFrameTime = useRef(performance.now());

  // Variables calculadas
  const volumenNormalizado = volumen / 100;
  const aceleracion = 10 + (movimiento / 100) * 90;
  const brilloCSS = 0.5 + (brillo / 100);

  // ========== HELPERS ==========

  const playClickSound = () => {
    const clickAudio = new Audio(clickSound);
    clickAudio.volume = volumenNormalizado / 2;
    clickAudio.play().catch((error) => console.error("Error playing click sound:", error));
  };

  const closeAllSections = () => {
    setIsPerfilOpen(false);
    setIsConfigOpen(false);
    setIsInfoOpen(false);
  };

  const checkInteractionZone = (x, z) => {
    const zone = museumModelsConfig.interactionZones.find(zone => 
      x >= zone.bounds.xMin && x <= zone.bounds.xMax &&
      z >= zone.bounds.zMin && z <= zone.bounds.zMax
    );
    
    if (zone) {
      setButtonText(`Abrir modal: ${zone.name}`);
      setIdModal(zone.id);
      setInModel(true);
    } else {
      setIdModal(0);
      setInModel(false);
    }
  };

  const toggleModal = () => {
    playClickSound();
    setIsModalOpen((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const teleportTo = (x, y, z) => {
    if (playerRef.current) {
      playerRef.current.setAttribute('position', { x, y, z });
      playClickSound();
      setShowTeleportMenu(false);
    }
  };

  const toggleStats = () => {
    setShowStats((prev) => !prev);
  };

  const hints = [
    "💡 Usa WASD para moverte por el museo",
    "💡 Presiona Shift para correr más rápido",
    "💡 Presiona Espacio para saltar",
    "💡 Usa E para interactuar con las obras",
    "💡 Presiona P para ver tu perfil",
    "💡 Presiona C para configuración",
    "💡 Presiona T para teletransportarte",
    "💡 Presiona F para mostrar estadísticas",
  ];

  const teleportLocations = [
    { name: "Entrada", x: 0, y: 1.6, z: 0 },
    { name: "Sala Central", x: 0, y: 1.6, z: -15 },
    { name: "Galería Este", x: 15, y: 1.6, z: -10 },
    { name: "Galería Oeste", x: -15, y: 1.6, z: -10 },
    { name: "Sala Posterior", x: 0, y: 1.6, z: -30 },
  ];

  const handleConfigChange = (newConfig) => {
    if (newConfig.brillo !== undefined) setBrillo(newConfig.brillo);
    if (newConfig.volumen !== undefined) setVolumen(newConfig.volumen);
    if (newConfig.velocidad !== undefined) setMovimiento(newConfig.velocidad);
    if (newConfig.sensibilidad !== undefined) setSensibilidad(newConfig.sensibilidad);
  };

  const handleLoadScene = () => {
    playClickSound();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsLoaded(true);
      setContentDisplay("block");
    }, 3500);
  };

  // ========== EFFECTS ==========

  // Cargar configuración del usuario
  useEffect(() => {
    const storedUserID = localStorage.getItem("loggedIn");
    if (storedUserID) {
      setUserID(storedUserID);
      const fetchUsuario = async () => {
        try {
          const response = await api.get(`/usuarios/${storedUserID}`);
          const configID = response.data.configuracion;
          setConID(configID);
          
          if (configID === null) {
            setBrillo(50);
            setVolumen(50);
            setMovimiento(50);
            setSensibilidad(50);
          } else {
            const configResponse = await api.get(`/configuraciones/${configID}`);
            const { brillo, volumen, velocidad_movimiento, sensibilidad } = configResponse.data;
            setBrillo(brillo ?? 50);
            setVolumen(volumen ?? 50);
            setMovimiento(velocidad_movimiento ?? 50);
            setSensibilidad(sensibilidad ?? 50);
          }
        } catch (error) {
          console.error("Error al obtener el usuario:", error);
        }
      };
      fetchUsuario();
    }
  }, []);

  // Actualizar aceleración del jugador
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setAttribute("wasd-controls", `acceleration: ${aceleracion}`);
    }
  }, [aceleracion]);

  // Controlar bloqueo de controles cuando hay modales abiertos
  useEffect(() => {
    if (playerRef.current) {
      const playerEl = playerRef.current;
      if (isModalOpen || isPerfilOpen || isConfigOpen || isInfoOpen) {
        playerEl.setAttribute("wasd-controls", "enabled: false");
        playerEl.setAttribute("look-controls", "enabled: false");
        document.exitPointerLock();
      } else {
        playerEl.setAttribute("wasd-controls", `enabled: true; acceleration: ${aceleracion}`);
        playerEl.setAttribute("look-controls", "enabled: true; pointerLockEnabled: true");
      }
    }
  }, [isModalOpen, isPerfilOpen, isConfigOpen, isInfoOpen, aceleracion]);

  // Timer del museo
  useEffect(() => {
    const timer = setInterval(() => {
      setMuseumTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Detección de posición del jugador
  useEffect(() => {
    const waitForPlayerRef = async () => {
      while (!playerRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const playerEl = playerRef.current;

      const handlePositionUpdate = (event) => {
        const { x, z } = event.detail;
        const y = playerEl.getAttribute('position').y;
        setPlayerPosition({ x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) });
        checkInteractionZone(x, z);
      };

      const attachListener = () => {
        playerEl.addEventListener("position-updated", handlePositionUpdate);
      };

      if (playerEl.hasLoaded) {
        attachListener();
      } else {
        playerEl.addEventListener("loaded", attachListener);
      }

      return () => {
        playerEl.removeEventListener("loaded", attachListener);
        playerEl.removeEventListener("position-updated", handlePositionUpdate);
      };
    };

    waitForPlayerRef();
  }, []);

  // FPS Counter
  useEffect(() => {
    let animationFrameId;
    
    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      const currentFps = Math.round(1000 / delta);
      setFps(currentFps);
      lastFrameTime.current = now;
      animationFrameId = requestAnimationFrame(updateFPS);
    };

    if (showStats) {
      animationFrameId = requestAnimationFrame(updateFPS);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [showStats]);

  // Sistema de hints rotativos
  useEffect(() => {
    const hintInterval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
    }, 8000);

    return () => clearInterval(hintInterval);
  }, []);

  // Sistema de sonido de pasos
  useEffect(() => {
    let isMoving = false;
    const audio = new Audio(stepSound);
    audio.volume = volumenNormalizado / 2;
    audio.loop = true;
    let keysPressed = new Set();
    let jumpTimeout;

    const startSound = () => {
      if (audio.paused) {
        audio.play().catch((error) => console.error("Error playing sound:", error));
      }
    };

    const stopSound = () => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    const adjustPlaybackRate = (rate) => {
      audio.playbackRate = rate;
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.add(key);
        if (keysPressed.size > 0 && !isMoving) {
          startSound();
          isMoving = true;
        }
      }

      if (key === " ") {
        stopSound();
        clearTimeout(jumpTimeout);
        jumpTimeout = setTimeout(() => {
          if (keysPressed.size > 0) {
            startSound();
          }
        }, 1000);
      }

      if (key === "shift") {
        adjustPlaybackRate(1.5);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();

      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.delete(key);
        if (keysPressed.size === 0) {
          isMoving = false;
          stopSound();
        }
      }

      if (key === "shift") {
        adjustPlaybackRate(1.0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearTimeout(jumpTimeout);
    };
  }, [volumenNormalizado]);

  // Tecla E para abrir modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (inModel && (event.key === 'e' || event.key === 'E') && !isModalOpen) {
        playClickSound();
        setIsModalOpen(true);
      }
      
      // F para mostrar/ocultar estadísticas
      if (event.key === 'f' || event.key === 'F') {
        setShowStats((prev) => !prev);
      }
      
      // T para menú de teletransporte
      if (event.key === 't' || event.key === 'T') {
        setShowTeleportMenu((prev) => !prev);
      }
      
      // M para mutear/desmutear
      if (event.key === 'm' || event.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inModel, isModalOpen, volumenNormalizado]);

  // Animación CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(108, 238, 181, 0.7);
        }
        50% {
          box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 15px rgba(108, 238, 181, 0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ========== RENDER ==========

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", position: "relative" }}>
      <AFrameControls />
      <HelpBox />

      {/* Botón de música flotante */}
      {isLoaded && (
        <MusicButton 
          onClick={toggleMute} 
          isMuted={isMuted}
          title={isMuted ? "Activar música" : "Silenciar música"}
        >
          {isMuted ? "🔇" : "🔊"}
        </MusicButton>
      )}

      {/* Panel de estadísticas */}
      {isLoaded && showStats && (
        <StatsPanel>
          <div style={{ marginBottom: '10px', borderBottom: '1px solid rgba(108, 238, 181, 0.3)', paddingBottom: '8px' }}>
            <strong style={{ color: '#6CEEB5' }}>📊 ESTADÍSTICAS</strong>
          </div>
          <div style={{ lineHeight: '1.6' }}>
            <div>FPS: <span style={{ color: fps > 50 ? '#6CEEB5' : fps > 30 ? '#FFD700' : '#ff6666' }}>{fps}</span></div>
            <div style={{ marginTop: '8px', color: '#6CEEB5' }}>POSICIÓN:</div>
            <div>X: {playerPosition.x}</div>
            <div>Y: {playerPosition.y}</div>
            <div>Z: {playerPosition.z}</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
              Presiona F para ocultar
            </div>
          </div>
        </StatsPanel>
      )}

      {/* Sistema de hints */}
      {isLoaded && (
        <HintBox>
          {hints[currentHint]}
        </HintBox>
      )}

      {/* Menú de teletransporte */}
      {isLoaded && showTeleportMenu && (
        <ModalContainer style={{ width: '400px', height: 'auto', maxHeight: '500px' }}>
          <div style={{ color: '#fff' }}>
            <h2 style={{ marginBottom: '20px', color: '#6CEEB5' }}>🌀 Teletransporte Rápido</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teleportLocations.map((location, index) => (
                <TeleportButton 
                  key={index}
                  onClick={() => teleportTo(location.x, location.y, location.z)}
                >
                  📍 {location.name}
                </TeleportButton>
              ))}
            </div>
            <div style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Presiona <strong>T</strong> para cerrar
            </div>
          </div>
          <CloseButton onClick={() => setShowTeleportMenu(false)}>✖</CloseButton>
        </ModalContainer>
      )}

      {isLoaded && (
        <BottomMenu
          setActiveSection={(section) => {
            closeAllSections();
            if (section === "perfil") setIsPerfilOpen(true);
            if (section === "config") setIsConfigOpen(true);
            if (section === "info") setIsInfoOpen(true);
          }}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
      )}

      {isModalOpen && (
        <ModalInformation
          isOpen={isModalOpen}
          id={idModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isPerfilOpen && (
        <ModalContainer>
          <Perfil museumTime={museumTime} onClose={closeAllSections} />
          <CloseButton onClick={closeAllSections}>✖</CloseButton>
        </ModalContainer>
      )}

      {isConfigOpen && (
        <ModalContainer>
          <Configuracion
            brillo={brillo}
            volumen={volumen}
            velocidad={movimiento}
            sensibilidad={sensibilidad}
            configID={conID}
            userID={userID}
            onConfigChange={handleConfigChange}
            onConfigIdChange={setConID}
          />
          <CloseButton onClick={closeAllSections}>✖</CloseButton>
        </ModalContainer>
      )}

      {isInfoOpen && (
        <ModalContainer>
          <Informacion />
          <CloseButton onClick={closeAllSections}>✖</CloseButton>
        </ModalContainer>
      )}

      {isLoaded && inModel && (
        <div
          style={{
            position: "fixed",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(40, 40, 50, 0.95))",
            padding: "15px 25px",
            borderRadius: "15px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.5)",
            border: "2px solid rgba(108, 238, 181, 0.5)",
            backdropFilter: "blur(10px)",
            animation: "slideUp 0.3s ease-out, pulse 2s infinite",
          }}
        >
          <button
            onClick={toggleModal}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              background: isModalOpen 
                ? "linear-gradient(135deg, #FF5C5C, #FF3333)" 
                : "linear-gradient(135deg, #6CEEB5, #4ECDC4)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: isModalOpen 
                ? "0 4px 12px rgba(255, 92, 92, 0.4)" 
                : "0 4px 12px rgba(108, 238, 181, 0.4)",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = isModalOpen 
                ? "0 6px 16px rgba(255, 92, 92, 0.6)" 
                : "0 6px 16px rgba(108, 238, 181, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = isModalOpen 
                ? "0 4px 12px rgba(255, 92, 92, 0.4)" 
                : "0 4px 12px rgba(108, 238, 181, 0.4)";
            }}
          >
            <span style={{ fontSize: "18px" }}>{isModalOpen ? "✖" : "📖"}</span>
            {isModalOpen ? "Cerrar Modal" : buttonText}
          </button>
          <div style={{
            marginTop: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
            fontStyle: "italic"
          }}>
            Presiona <strong style={{ color: "#6CEEB5" }}>E</strong> para abrir
          </div>
        </div>
      )}

      {!isLoaded && !isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "#000",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <h1>Museo Virtual</h1>
          <button
            onClick={handleLoadScene}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              backgroundColor: "#6CEEB5",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Iniciar Experiencia
          </button>
        </div>
      )}

      {isLoading && <TransitionAnimation />}

      {isLoaded && (
        <div style={{ filter: `brightness(${brilloCSS})`, height: "100%", width: "100%" }}>
          <Scene 
            style={{ display: contentDisplay }} 
            physics="driver: local; gravity: 0 0 0"
            fog="type: linear; color: #1a1a2e; near: 10; far: 50"
          >
            <a-assets>
              <a-mixin id="checkpoint"></a-mixin>
              <a-mixin id="checkpoint-hovered" color="#6CEEB5"></a-mixin>

              <img id="sky_sphere-texture" src={models.sky_sphere}></img>

              {/* Assets desde configuración */}
              {museumModelsConfig.assets.models3D.map((asset) => (
                <a-asset-item key={asset.id} id={asset.id} src={models[asset.key]}></a-asset-item>
              ))}

              {museumModelsConfig.assets.objModels.map((asset) => (
                <a-asset-item key={asset.id} id={asset.id} src={models[asset.key]}></a-asset-item>
              ))}

              {museumModelsConfig.assets.textures.map((asset) => (
                <img key={asset.id} id={asset.id} src={models[asset.key]}></img>
              ))}

              <a-sound
                src={audio1}
                autoplay="true"
                loop="true"
                position="1 1 0"
                volume={isMuted ? 0 : volumenNormalizado}
              ></a-sound>

              <a-asset-item id="floor-obj" src={models.floor}></a-asset-item>
              <img id="floor-texture" src={models.floorTexture} alt="" />
              <img id="floor_normal-texture" src={models.floorNormalTexture} alt="" />
              <a-asset-item id="main_museum" src={models.main_museum}></a-asset-item>
            </a-assets>

            <a-sky src="#sky_sphere-texture"></a-sky>

            {/* Partículas flotantes decorativas */}
            {[...Array(15)].map((_, i) => (
              <Entity
                key={`particle-${i}`}
                geometry="primitive: sphere; radius: 0.05"
                material={`color: #6CEEB5; emissive: #6CEEB5; emissiveIntensity: 0.5; opacity: 0.6; transparent: true`}
                position={`${(Math.random() - 0.5) * 40} ${Math.random() * 5 + 1} ${(Math.random() - 0.5) * 40}`}
                animation={`property: position; to: ${(Math.random() - 0.5) * 40} ${Math.random() * 5 + 3} ${(Math.random() - 0.5) * 40}; loop: true; dir: alternate; dur: ${3000 + Math.random() * 4000}; easing: easeInOutSine`}
              />
            ))}

            {/* Museo principal SIN colisión para poder caminar libremente */}
            <Entity
              gltf-model="#main_museum"
              position="0 0 0"
              rotation="0 0 0"
              scale="1 1 1"
            ></Entity>

            {/* Modelos 3D desde configuración CON colisión */}
            {museumModelsConfig.models3D.map((model) => (
              <Entity
                key={model.id}
                gltf-model={model.model}
                position={`${model.position.x} ${model.position.y} ${model.position.z}`}
                rotation={`${model.rotation.x} ${model.rotation.y} ${model.rotation.z}`}
                scale={`${model.scale.x} ${model.scale.y} ${model.scale.z}`}
                static-body="shape: box"
              />
            ))}

            {/* Podiums desde configuración CON colisión */}
            {museumModelsConfig.podiums.map((podium) => (
              <Entity
                key={podium.id}
                obj-model={`obj: ${podium.objModel}`}
                material={`src: ${podium.material}`}
                position={`${podium.position.x} ${podium.position.y} ${podium.position.z}`}
                rotation={`${podium.rotation.x} ${podium.rotation.y} ${podium.rotation.z}`}
                static-body="shape: box"
              />
            ))}

            {/* Lámparas desde configuración (sin colisión, son decorativas en el techo) */}
            {museumModelsConfig.lamps.map((lamp) => (
              <Entity
                key={lamp.id}
                obj-model={`obj: ${lamp.objModel}`}
                material={`src: ${lamp.material}`}
                position={`${lamp.position.x} ${lamp.position.y} ${lamp.position.z}`}
                rotation={`${lamp.rotation.x} ${lamp.rotation.y} ${lamp.rotation.z}`}
                scale={`${lamp.scale.x} ${lamp.scale.y} ${lamp.scale.z}`}
              />
            ))}

            {/* Cuadros desde configuración (sin colisión, están en las paredes) */}
            {museumModelsConfig.frames.map((frame) => (
              <Entity
                key={frame.id}
                obj-model={`obj: ${frame.objModel}`}
                material={`src: ${frame.material}`}
                position={`${frame.position.x} ${frame.position.y} ${frame.position.z}`}
                rotation={`${frame.rotation.x} ${frame.rotation.y} ${frame.rotation.z}`}
                scale={`${frame.scale.x} ${frame.scale.y} ${frame.scale.z}`}
              />
            ))}

            {/* Sistema de Iluminación desde configuración */}
            
            {/* Luz Ambiental */}
            <Entity 
              light={`type: ${museumModelsConfig.lights.ambient.type}; color: ${museumModelsConfig.lights.ambient.color}; intensity: ${museumModelsConfig.lights.ambient.intensity}`}
            />

            {/* Luces Direccionales */}
            {museumModelsConfig.lights.directional.map((light) => (
              <Entity
                key={light.id}
                light={`type: ${light.type}; color: ${light.color}; intensity: ${light.intensity}`}
                position={`${light.position.x} ${light.position.y} ${light.position.z}`}
              />
            ))}

            {/* Luces Puntuales */}
            {museumModelsConfig.lights.point.map((light) => (
              <a-light
                key={light.id}
                type="point"
                color={light.color}
                intensity={light.intensity}
                position={`${light.position.x} ${light.position.y} ${light.position.z}`}
                distance={light.distance || 0}
              />
            ))}

            {/* Luces Spot */}
            {museumModelsConfig.lights.spot.map((light) => (
              <a-light
                key={light.id}
                type="point"
                color={light.color}
                intensity={light.intensity}
                position={`${light.position.x} ${light.position.y} ${light.position.z}`}
                distance={light.distance}
              />
            ))}

            {/* Elementos Decorativos CON colisión */}
            
            {/* Esferas decorativas */}
            {museumModelsConfig.decorations.spheres.map((sphere) => (
              <Entity
                key={sphere.id}
                geometry={`primitive: sphere; radius: ${sphere.radius}`}
                material={`color: ${sphere.color}; metalness: ${sphere.metalness}; roughness: ${sphere.roughness}`}
                position={`${sphere.position.x} ${sphere.position.y} ${sphere.position.z}`}
                static-body="shape: sphere"
              />
            ))}

            {/* Cajas decorativas (pedestales) */}
            {museumModelsConfig.decorations.boxes.map((box) => (
              <Entity
                key={box.id}
                geometry={`primitive: box; width: ${box.size.x}; height: ${box.size.y}; depth: ${box.size.z}`}
                material={`color: ${box.color}; roughness: ${box.roughness}`}
                position={`${box.position.x} ${box.position.y} ${box.position.z}`}
                static-body="shape: box"
              />
            ))}

            {/* Cilindros decorativos (columnas) */}
            {museumModelsConfig.decorations.cylinders.map((cylinder) => (
              <Entity
                key={cylinder.id}
                geometry={`primitive: cylinder; radius: ${cylinder.radius}; height: ${cylinder.height}`}
                material={`color: ${cylinder.color}; metalness: ${cylinder.metalness}`}
                position={`${cylinder.position.x} ${cylinder.position.y} ${cylinder.position.z}`}
                static-body="shape: cylinder"
              />
            ))}

            {/* Jugador con física kinematic */}
            <a-entity
              id="player"
              ref={playerRef}
              camera={`fov: ${sensibilidad}`}
              look-controls="pointerLockEnabled: true;"
              wasd-controls={`acceleration: ${aceleracion}`}
              run-controls={`normalSpeed: ${aceleracion}; runSpeed: ${aceleracion * 1.5}`}
              jump-controls
              position="0 1.6 0"
              kinematic-body="radius: 0.4"
              log-position
            ></a-entity>
          </Scene>
        </div>
      )}
    </div>
  );
};

export default MuseumVirtual;
