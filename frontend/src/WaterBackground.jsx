import { useEffect, useRef } from "react";
import * as THREE from "three";

import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./waterShaders.js";

function WaterBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // --------------------------------
    // SCENE
    // --------------------------------

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();

    // --------------------------------
    // CAMERA
    // --------------------------------

    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      1
    );

    // --------------------------------
    // RENDERER
    // --------------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.pointerEvents = "none";

    container.appendChild(renderer.domElement);

    // --------------------------------
    // MOUSE
    // --------------------------------

    const mouse = new THREE.Vector2(-10, -10);

    let frame = 0;

    // --------------------------------
    // RESOLUTION
    // --------------------------------

    const getResolution = () => ({
      width:
        window.innerWidth *
        window.devicePixelRatio,

      height:
        window.innerHeight *
        window.devicePixelRatio,
    });

    let { width, height } = getResolution();

    // --------------------------------
    // RENDER TARGET OPTIONS
    // --------------------------------

    const options = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    // --------------------------------
    // RENDER TARGETS
    // --------------------------------

    let rtA = new THREE.WebGLRenderTarget(
      width,
      height,
      options
    );

    let rtB = new THREE.WebGLRenderTarget(
      width,
      height,
      options
    );

    // --------------------------------
    // SIMULATION MATERIAL
    // --------------------------------

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: {
          value: null,
        },

        mouse: {
          value: mouse,
        },

        resolution: {
          value: new THREE.Vector2(
            width,
            height
          ),
        },

        time: {
          value: 0,
        },

        frame: {
          value: 0,
        },
      },

      vertexShader: simulationVertexShader,

      fragmentShader: simulationFragmentShader,
    });

    // --------------------------------
    // RENDER MATERIAL
    // --------------------------------

    const renderMaterial = new THREE.ShaderMaterial({
      transparent: true,

      uniforms: {
        textureA: {
          value: null,
        },

        time: {
          value: 0,
        },
      },

      vertexShader: renderVertexShader,

      fragmentShader: renderFragmentShader,
    });

    // --------------------------------
    // FULLSCREEN PLANE
    // --------------------------------

    const plane = new THREE.PlaneGeometry(
      2,
      2
    );

    const simQuad = new THREE.Mesh(
      plane,
      simMaterial
    );

    const renderQuad = new THREE.Mesh(
      plane,
      renderMaterial
    );

    simScene.add(simQuad);

    scene.add(renderQuad);

    // --------------------------------
    // MOUSE MOVE
    // --------------------------------

    const handleMouseMove = (e) => {
      mouse.x =
        e.clientX *
        window.devicePixelRatio;

      mouse.y =
        (window.innerHeight - e.clientY) *
        window.devicePixelRatio;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    // --------------------------------
    // MOUSE LEAVE
    // --------------------------------

    const handleMouseLeave = () => {
      mouse.set(-10, -10);
    };

    window.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    // --------------------------------
    // RESIZE
    // --------------------------------

    const handleResize = () => {
      const newWidth =
        window.innerWidth *
        window.devicePixelRatio;

      const newHeight =
        window.innerHeight *
        window.devicePixelRatio;

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );

      rtA.setSize(
        newWidth,
        newHeight
      );

      rtB.setSize(
        newWidth,
        newHeight
      );

      simMaterial.uniforms.resolution.value.set(
        newWidth,
        newHeight
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // --------------------------------
    // ANIMATION
    // --------------------------------

    let animationFrame;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(animate);

      frame++;

      const currentTime =
        performance.now() / 1000;

      simMaterial.uniforms.frame.value =
        frame;

      simMaterial.uniforms.time.value =
        currentTime;

      renderMaterial.uniforms.time.value =
        currentTime;

      // Simulation input
      simMaterial.uniforms.textureA.value =
        rtA.texture;

      // Render simulation
      renderer.setRenderTarget(rtB);

      renderer.render(
        simScene,
        camera
      );

      // Render water
      renderMaterial.uniforms.textureA.value =
        rtB.texture;

      renderer.setRenderTarget(null);

      renderer.render(
        scene,
        camera
      );

      // Swap buffers
      const temp = rtA;

      rtA = rtB;

      rtB = temp;
    };

    animate();

    // --------------------------------
    // CLEANUP
    // --------------------------------

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      plane.dispose();

      simMaterial.dispose();

      renderMaterial.dispose();

      rtA.dispose();

      rtB.dispose();

      renderer.dispose();

      if (
        renderer.domElement &&
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="water-background"
    />
  );
}

export default WaterBackground;