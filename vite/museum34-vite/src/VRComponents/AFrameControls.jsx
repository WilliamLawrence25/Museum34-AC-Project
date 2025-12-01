import React, { useEffect } from "react";
import "aframe";

const AFrameControls = () => {
  useEffect(() => {
    /* global AFRAME */

    // Run Controls
    AFRAME.registerComponent("run-controls", {
      schema: {
        normalSpeed: { type: "number", default: 10 },
        runSpeed: { type: "number", default: 50 },
      },
      init: function () {
        const el = this.el;
        const data = this.data;

        window.addEventListener("keydown", function (event) {
          if (event.key === "Shift") {
            el.setAttribute("wasd-controls", `acceleration: ${data.runSpeed}`);
          }
        });

        window.addEventListener("keyup", function (event) {
          if (event.key === "Shift") {
            el.setAttribute("wasd-controls", `acceleration: ${data.normalSpeed}`);
          }
        });
      },
    });

    // Jump Controls
    AFRAME.registerComponent("jump-controls", {
      schema: {
        jumpHeight: { type: "number", default: 5 },
        gravity: { type: "number", default: -9.8 },
      },
      init: function () {
        this.velocityY = 0;
        this.isJumping = false;
        this.groundLevel = this.el.object3D.position.y;

        window.addEventListener("keydown", (event) => {
          if (event.code === "Space" && !this.isJumping) {
            console.log("saltando!!!");
            this.isJumping = true;
            this.velocityY = this.data.jumpHeight;
          }
        });
      },
      tick: function (time, timeDelta) {
        const position = this.el.object3D.position;
        if (this.isJumping) {
          position.y += this.velocityY * (timeDelta / 1000);
          this.velocityY += this.data.gravity * (timeDelta / 1000);
          if (position.y <= this.groundLevel) {
            position.y = this.groundLevel;
            this.isJumping = false;
            this.velocityY = 0;
          }
        }
      },
    });

    // Log Position
    AFRAME.registerComponent("log-position", {
      tick: function () {
        const position = this.el.object3D.position;
        const positionData = {
          x: position.x.toFixed(2),
          y: position.y.toFixed(2),
          z: position.z.toFixed(2),
        };
        this.el.emit("position-updated", positionData);
      },
    });

    // Custom Look Controls
    AFRAME.registerComponent("custom-look-controls", {
      init: function () {
        this.lookControls = this.el.components["look-controls"];
        this.mouseSensitivity = 1; // Ajusta sensibilidad
        this.originalMouseMove = this.lookControls.onMouseMove.bind(
          this.lookControls
        );
        this.lookControls.onMouseMove = this.onMouseMove.bind(this);
      },
      onMouseMove: function (event) {
        event.movementX *= this.mouseSensitivity;
        event.movementY *= this.mouseSensitivity;
        this.originalMouseMove(event);
      },
    });
  }, []);

  return null; // No renderiza nada visualmente
};

// === SISTEMA DE LÍMITES BASADO EN LAS 12 NUEVAS LÍNEAS ROJAS ===
AFRAME.registerComponent("museum-boundaries", {
  tick: function () {
    const pos = this.el.object3D.position;

    // 1. PARED ESTE (Línea 1)
    // x = 14, z en [-2, 2]
    if (pos.x > 14 && pos.z >= -2 && pos.z <= 2) pos.x = 14;

    // 2. ESQUINA SUPERIOR DERECHA (Líneas 2 + 3)
    // Línea 2: z = 1.7, x en [8.55, 14.05]
    // Línea 3: x = 8, z en [2, 14]
    if (pos.x > 11.3 && pos.z > 2) {
      if (pos.x > 11.3) pos.x = 11.3;
      if (pos.z > 2 && pos.x > 8.55) pos.z = 2;
    }

    // 3. PARED NORTE DERECHA (Línea 3)
    // x = 8, z > 8  (parte superior del tramo)
    if (pos.x > 8 && pos.z > 8) pos.z = 8;

    // 4. PARED NORTE CENTRAL (Línea 4)
    // z = 13.5, x ∈ [-9.25, 8.05]
    if (pos.x >= -9.25 && pos.x <= 8.05 && pos.z > 13.5) pos.z = 13.5;

    // 5. PARED NORTE IZQUIERDA (Línea 5)
    // x = -8.5, z > 8
    if (pos.x < -8.5 && pos.z > 8) pos.z = 8;

    // 6. ESQUINA SUPERIOR IZQUIERDA (Líneas 6 + 5)
    // Línea 6: z = 1.5, x ∈ [-14.65, -8.95]
    if (pos.x < -11.8 && pos.z > 2) {
      if (pos.x < -11.8) pos.x = -11.8;
      if (pos.z > 2 && pos.x < -8.95) pos.z = 2;
    }

    // 7. PARED OESTE (Línea 7)
    // x = -14.5, z ∈ [-2, 2]
    if (pos.x < -14.5 && pos.z >= -2 && pos.z <= 2) pos.x = -14.5;

    // 8. ESQUINA INFERIOR IZQUIERDA (Líneas 8 + 9)
    // Línea 8: z = -1.5, x ∈ [-14.65, -8.95]
    if (pos.x < -11.8 && pos.z < -2) {
      if (pos.x < -11.8) pos.x = -11.8;
      if (pos.z < -2 && pos.x < -8.95) pos.z = -2;
    }

    // 9. PARED SUR IZQUIERDA (Línea 9)
    // x = -8.5, z < -8
    if (pos.x < -8.5 && pos.z < -8) pos.z = -8;

    // 10. PARED SUR CENTRAL (Línea 10)
    // z = -13.5, x ∈ [-9.25, 8.05]
    if (pos.x >= -9.25 && pos.x <= 8.05 && pos.z < -13.5) pos.z = -13.5;

    // 11. PARED SUR DERECHA (Línea 11)
    // x = 8, z < -8
    if (pos.x > 8 && pos.z < -8) pos.z = -8;

    // 12. ESQUINA INFERIOR DERECHA (Líneas 12 + 11)
    // Línea 12: z = -1.5, x ∈ [8.55, 14.05]
    if (pos.x > 11.3 && pos.z < -2) {
      if (pos.x > 11.3) pos.x = 11.3;
      if (pos.z < -2 && pos.x > 8.55) pos.z = -2;
    }

    // Límites de altura (pequeño ajuste si quieres)
    if (pos.y < 1.6) pos.y = 1.6;
    if (pos.y > 5) pos.y = 5;
  }
});

export default AFrameControls;
