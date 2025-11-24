import React, { useState, useEffect, useRef, useMemo } from "react";
import { Entity, Scene } from "aframe-react";
import BottomMenu from "./BottomMenu.jsx";
import stepSound from "./audio/step-sound.ogg";
import clickSound from "./audio/click-sound.ogg";
import audio1 from "./audio/アドリブ-_instrumental_.ogg";

import Perfil from "./Perfil.jsx";
import Configuracion from "./Configuracion.jsx";
import Informacion from "./Informacion.jsx";

import models from '../models/index.js';

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

const MuseumVirtual = () => {
  // ========== CONFIGURACIÓN DEL MUSEO ==========
  
  // Configuración de zonas de interacción
  const INTERACTION_ZONES = useMemo(() => [
    // Imágenes del muro norte
    { id: 1, name: 'Imagen del Cañon del Colca', bounds: { xMin: -6, xMax: -2, zMin: -15, zMax: -11 } },
    { id: 2, name: 'Imagen de la plaza de armas', bounds: { xMin: -3, xMax: 0, zMin: -15, zMax: -11 } },
    { id: 3, name: 'Imagen de la campiña y Misti', bounds: { xMin: -0.5, xMax: 2.5, zMin: -15, zMax: -11 } },
    { id: 4, name: 'Imagen alternativa de la plaza', bounds: { xMin: 1.5, xMax: 4.5, zMin: -15, zMax: -11 } },
    // Imágenes del muro sur
    { id: 5, name: 'Imagen del mirador', bounds: { xMin: 3, xMax: 6.5, zMin: 11, zMax: 15 } },
    { id: 6, name: 'Imagen del volcán Misti', bounds: { xMin: 0.5, xMax: 4, zMin: 11, zMax: 15 } },
    { id: 7, name: 'Imagen de la catedral', bounds: { xMin: -1.5, xMax: 1.5, zMin: 11, zMax: 15 } },
    { id: 8, name: 'Imagen de la campiña', bounds: { xMin: -4, xMax: 1, zMin: 11, zMax: 15 } },
    { id: 9, name: 'Imagen de las canteras de sillar', bounds: { xMin: -6.5, xMax: -3, zMin: 11, zMax: 15 } },
    // Imágenes del muro este
    { id: 10, name: 'Imagen del rocoto relleno', bounds: { xMin: 9.5, xMax: 14, zMin: -0.5, zMax: 2.5 } },
    // Imágenes del muro oeste
    { id: 11, name: 'Imagen lateral de las canteras de sillar', bounds: { xMin: -11.5, xMax: -8.5, zMin: -0.5, zMax: 2.5 } },
    { id: 12, name: 'Imagen lateral de la cantera', bounds: { xMin: -15, xMax: -10.5, zMin: -0.5, zMax: 2.5 } },
    // Modelos 3D del lado este
    { id: 13, name: 'Modelo 3D de la catedral', bounds: { xMin: 6, xMax: 11, zMin: -7.5, zMax: -2 } },
    { id: 14, name: 'Modelo 3D del águila', bounds: { xMin: 6, xMax: 11, zMin: 1.5, zMax: 6 } },
    { id: 15, name: 'Modelo 3D del burro', bounds: { xMin: 6, xMax: 11, zMin: 5, zMax: 9 } },
    { id: 16, name: 'Modelo 3D de la mujer', bounds: { xMin: 6, xMax: 11, zMin: 7, zMax: 11 } },
    { id: 17, name: 'Modelo 3D del hombre', bounds: { xMin: 6, xMax: 11, zMin: 9.5, zMax: 13.5 } },
    // Modelos 3D del lado oeste
    { id: 18, name: 'Modelo 3D del portal', bounds: { xMin: -11, xMax: -6.5, zMin: 8, zMax: 13 } },
    { id: 19, name: 'Modelo 3D de Furina', bounds: { xMin: -11, xMax: -6.5, zMin: -11, zMax: -7 } },
    { id: 20, name: 'Modelo 3D del Misti', bounds: { xMin: -11, xMax: -6.5, zMin: -14, zMax: -10 } },
  ], []);

  // Configuración de modelos 3D
  const MODELS_3D = useMemo(() => [
    { id: 'furina', model: '#furina', pos: '-10 0.7 -9', rot: '0 90 0', scale: '1.3 1.3 1.3' },
    { id: 'volcan', model: '#volcan', pos: '-10.2 0.6 -12', rot: '0 0 0', scale: '0.015 0.015 0.015' },
    { id: 'catedral', model: '#catedral', pos: '10 1.8 -5', rot: '0 180 0', scale: '3 3 3' },
    { id: 'donkey_sillar', model: '#donkey_sillar_polycam', pos: '9.2 0.99 7', rot: '0 0 0', scale: '2 2 2' },
    { id: 'eagle_sillar', model: '#eagle_sillar_polycam', pos: '9.7 1.2 4', rot: '0 0 0', scale: '2 2 2' },
    { id: 'barroco_andino', model: '#barroco_andino', pos: '-9.7 1.7 10', rot: '0 270 0', scale: '0.6 0.6 0.6' },
    { id: 'sillar_plycam', model: '#sillar_plycam_1', pos: '9.5 1.6 11', rot: '0 180 0', scale: '4 4 4' },
  ], []);

  // Configuración de pedestales
  const PODIUMS = useMemo(() => [
    { id: 1, pos: '13 0 12.1' }, { id: 2, pos: '10 0 12.1' },
    { id: 3, pos: '-13 0 12.1' }, { id: 4, pos: '-10 0 12.1' },
    { id: 5, pos: '-5 0 6' }, { id: 6, pos: '-5 0 10' },
    { id: 7, pos: '0 0 6' }, { id: 8, pos: '0 0 10' },
    { id: 9, pos: '5 0 6' }, { id: 10, pos: '5 0 10' },
  ], []);

  // Configuración de lámparas
  const LAMPS = useMemo(() => [
    { id: 1, pos: '12 0 -12' }, { id: 2, pos: '0 0 0' },
    { id: 3, pos: '-12.7 0 -12' }, { id: 4, pos: '-10 0 -12' },
  ], []);

  // Configuración de cuadros
  const FRAMES = useMemo(() => [
    { id: 'sillar3', material: '#sillarPhoto3', pos: '-7.2 0 0', scale: '1 1 1' },
    { id: 'sillar2', material: '#sillarPhoto2', pos: '-6.2 -0.2 0', scale: '0.7 1.1 1' },
    { id: 'rocoto', material: '#rocotoPhoto', pos: '18.8 -0.2 0', scale: '1.21 1.1 1' },
    { id: 'sillar', material: '#sillarPhoto', pos: '1 0 12', scale: '1 1 1' },
    { id: 'volcan2', material: '#volcanPhoto2', pos: '3.3 0 12', scale: '1 1 1' },
    { id: 'catedral', material: '#catedralPhoto', pos: '5.6 0 12', scale: '1 1 1' },
    { id: 'volcan', material: '#volcanPhoto', pos: '7.9 0 12', scale: '1 1 1' },
    { id: 'mirador', material: '#miradorPhoto', pos: '10.2 0 12', scale: '1 1 1' },
    { id: 'moonlight', material: '#moonlight-texture', pos: '-7.2 0 -12', rot: '0 180 0', scale: '1 1 1' },
    { id: 'valle', material: '#vallePhoto', pos: '-4.9 0 -12', rot: '0 180 0', scale: '1 1 1' },
    { id: 'valle2', material: '#vallePhoto2', pos: '-9.5 0 -12', rot: '0 180 0', scale: '1 1 1' },
    { id: 'plaza2', material: '#plazaPhoto2', pos: '-2.6 0 -12', rot: '0 180 0', scale: '1 1 1' },
  ], []);

  // Configuración de luces puntuales
  const POINT_LIGHTS = useMemo(() => [
    { id: 1, color: '#FFF', intensity: 1.2, pos: '-10 3.5 -12' },
    { id: 2, color: '#FFF', intensity: 1.2, pos: '10 3.5 -12' },
    { id: 3, color: '#FFF', intensity: 1.0, pos: '0 3.5 12' },
    { id: 4, color: '#FFF', intensity: 1.0, pos: '-10 3.5 10' },
    { id: 5, color: '#FFF', intensity: 1.0, pos: '10 3.5 10' },
    { id: 6, color: '#FFF', intensity: 0.8, pos: '-14 3 0' },
    { id: 7, color: '#FFF', intensity: 0.8, pos: '14 3 0' },
    { id: 8, color: '#FFF', intensity: 1.5, pos: '10 4 -5' },
    { id: 9, color: '#FFF', intensity: 1.5, pos: '-10 4 10' },
    { id: 10, color: '#FFF', intensity: 1.2, pos: '-10 3 -9' },
    { id: 11, color: '#FFF', intensity: 1.0, pos: '0 5 0' },
    { id: 12, color: '#FFF', intensity: 0.7, pos: '12 2.5 -10' },
    { id: 13, color: '#FFF', intensity: 0.7, pos: '-12 2.5 -10' },
    { id: 14, color: '#FFF', intensity: 0.7, pos: '12 2.5 10' },
    { id: 15, color: '#FFF', intensity: 0.7, pos: '-12 2.5 10' },
  ], []);

  // Configuración de luces spotlight
  const SPOT_LIGHTS = useMemo(() => [
    { id: 1, color: '#FFF', intensity: 2, pos: '-4 4 -12', distance: 8 },
    { id: 2, color: '#FFF', intensity: 2, pos: '4 4 -12', distance: 8 },
    { id: 3, color: '#FFF', intensity: 2, pos: '-4 4 12', distance: 8 },
    { id: 4, color: '#FFF', intensity: 2, pos: '4 4 12', distance: 8 },
  ], []);

  // ========== ESTADOS ==========
  
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

  // Refs
  const playerRef = useRef(null);
  const audioRef = useRef(null);

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
    const zone = INTERACTION_ZONES.find(zone => 
      x >= zone.bounds.xMin && x <= zone.bounds.xMax &&
      z >= zone.bounds.zMin && z <= zone.bounds.zMax
    );
    
    if (zone) {
      setButtonText(`Abrir ${zone.name}`);
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
            background: "rgba(30, 31, 41, 0.95)",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
            border: "2px solid #6CEEB5",
            backdropFilter: "blur(10px)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <button
            onClick={toggleModal}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              background: isModalOpen 
                ? "#FF5C5C" 
                : "#6CEEB5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }}
          >
            {isModalOpen ? "Cerrar" : buttonText}
          </button>
          <div style={{
            marginTop: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
          }}>
            Presiona <strong style={{ color: "#6CEEB5" }}>E</strong> para {isModalOpen ? "cerrar" : "abrir"}
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
          <Scene style={{ display: contentDisplay }} physics="driver: local; gravity: 0 0 0">
            <a-assets>
              <a-mixin id="checkpoint"></a-mixin>
              <a-mixin id="checkpoint-hovered" color="#6CEEB5"></a-mixin>

              <img id="sky_sphere-texture" src={models.sky_sphere}></img>

              {/* Assets de modelos 3D */}
              <a-asset-item id="furina" src={models.furina}></a-asset-item>
              <a-asset-item id="volcan" src={models.volcan}></a-asset-item>
              <a-asset-item id="catedral" src={models.catedral}></a-asset-item>
              <a-asset-item id="donkey_sillar_polycam" src={models.donkey_sillar_polycam}></a-asset-item>
              <a-asset-item id="eagle_sillar_polycam" src={models.eagle_sillar_polycam}></a-asset-item>
              <a-asset-item id="barroco_andino" src={models.barroco_andino}></a-asset-item>
              <a-asset-item id="sillar_plycam_1" src={models.sillar_plycam_1}></a-asset-item>

              {/* Assets de texturas */}
              <img id="podiums-texture" src={models.podiumsTexture}></img>
              <img id="lamps-texture" src={models.lampsTexture}></img>
              <img id="moonlight-texture" src={models.moonlightTexture}></img>
              <img id="catedralPhoto" src={models.catedralPhoto}></img>
              <img id="volcanPhoto" src={models.volcanPhoto}></img>
              <img id="miradorPhoto" src={models.miradorPhoto}></img>
              <img id="volcanPhoto2" src={models.volcanPhoto2}></img>
              <img id="plazaPhoto" src={models.plazaPhoto}></img>
              <img id="sillarPhoto" src={models.sillarPhoto}></img>
              <img id="rocotoPhoto" src={models.rocotoPhoto}></img>
              <img id="plazaPhoto2" src={models.plazaPhoto2}></img>
              <img id="sillarPhoto2" src={models.sillarPhoto2}></img>
              <img id="sillarPhoto3" src={models.sillarPhoto3}></img>
              <img id="vallePhoto" src={models.vallePhoto}></img>
              <img id="vallePhoto2" src={models.vallePhoto2}></img>

              {/* Assets de objetos */}
              <a-asset-item id="podiums-obj" src={models.podiumsModel}></a-asset-item>
              <a-asset-item id="lamps-obj" src={models.lampsModel}></a-asset-item>
              <a-asset-item id="recuadro-obj" src={models.recuadroModel}></a-asset-item>

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

            {/* Museo principal SIN colisión */}
            <Entity
              gltf-model="#main_museum"
              position="0 0 0"
              rotation="0 0 0"
              scale="1 1 1"
            ></Entity>

            {/* Modelos 3D CON colisión */}
            {MODELS_3D.map((model) => (
              <Entity
                key={model.id}
                gltf-model={model.model}
                position={model.pos}
                rotation={model.rot}
                scale={model.scale}
                static-body="shape: box"
              />
            ))}

            {/* Pedestales CON colisión */}
            {PODIUMS.map((podium) => (
              <Entity
                key={`podium-${podium.id}`}
                obj-model="obj: #podiums-obj"
                material="src: #podiums-texture"
                position={podium.pos}
                rotation="0 0 0"
                static-body="shape: box"
              />
            ))}

            {/* Lámparas decorativas */}
            {LAMPS.map((lamp) => (
              <Entity
                key={`lamp-${lamp.id}`}
                obj-model="obj: #lamps-obj"
                material="src: #lamps-texture"
                position={lamp.pos}
                rotation="0 0 0"
                scale="1 1 1"
              />
            ))}

            {/* Cuadros en las paredes */}
            {FRAMES.map((frame) => (
              <Entity
                key={`frame-${frame.id}`}
                obj-model="obj: #recuadro-obj"
                material={`src: ${frame.material}`}
                position={frame.pos}
                rotation={frame.rot || '0 0 0'}
                scale={frame.scale}
              />
            ))}

            {/* Sistema de Iluminación */}
            
            {/* Luz Ambiental */}
            <Entity light="type: ambient; color: #FFF; intensity: 0.6" />

            {/* Luces Direccionales */}
            <Entity light="type: directional; color: #FFF; intensity: 0.5" position="2 20 0" />
            <Entity light="type: directional; color: #FFF; intensity: 1" position="2 4 -3" />

            {/* Luces Puntuales */}
            {POINT_LIGHTS.map((light) => (
              <a-light
                key={`point-${light.id}`}
                type="point"
                color={light.color}
                intensity={light.intensity}
                position={light.pos}
              />
            ))}

            {/* Luces Spot */}
            {SPOT_LIGHTS.map((light) => (
              <a-light
                key={`spot-${light.id}`}
                type="point"
                color={light.color}
                intensity={light.intensity}
                position={light.pos}
                distance={light.distance}
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
