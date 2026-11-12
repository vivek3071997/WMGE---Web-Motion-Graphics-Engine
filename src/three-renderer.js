/* Motion Forge — deterministic, browser-only WebGL renderer for scene3d layers. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Motion3D = root.Motion3D || {};
  root.Motion3D.Renderer = api.Renderer;
  root.Motion3D.GEOMETRIES = api.GEOMETRIES;
  root.Motion3D.MATERIALS = api.MATERIALS;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GEOMETRIES = Object.freeze([
    "box",
    "sphere",
    "torus",
    "knot",
    "cone",
    "cylinder",
    "plane",
  ]);
  const MATERIALS = Object.freeze([
    "standard",
    "glass",
    "water",
    "liquidMetal",
    "gas",
  ]);
  const DEFAULT_THEME = Object.freeze({
    accent: "#8d9bff",
    secondary: "#56e0cf",
    text: "#f4f6ff",
    surface: "#182237",
    background: "#0b1020",
    muted: "#91a0b8",
    line: "#34445e",
  });
  const TRACKED_PROPERTIES = Object.freeze([
    "x",
    "y",
    "z",
    "rotationX",
    "rotationY",
    "rotationZ",
    "scaleX",
    "scaleY",
    "scaleZ",
    "roughness",
    "metalness",
    "transmission",
    "ior",
    "amplitude",
    "frequency",
    "opacity",
  ]);

  const clamp = (value, min, max, fallback) =>
    Number.isFinite(Number(value))
      ? Math.min(max, Math.max(min, Number(value)))
      : fallback;
  const degrees = (value) => (value * Math.PI) / 180;

  function resolveColor(value, theme) {
    let color = typeof value === "string" ? value : "";
    if (/^\$[a-z]+$/i.test(color)) {
      color = theme[color.slice(1)] || DEFAULT_THEME[color.slice(1)] || "";
    }
    if (/^#[\da-f]{3}$/i.test(color)) {
      color =
        "#" +
        color
          .slice(1)
          .split("")
          .map((digit) => digit + digit)
          .join("");
    }
    if (/^#[\da-f]{8}$/i.test(color)) {
      return {
        color: color.slice(0, 7),
        alpha: parseInt(color.slice(7, 9), 16) / 255,
      };
    }
    if (!/^#[\da-f]{6}$/i.test(color)) color = theme.accent || DEFAULT_THEME.accent;
    return { color, alpha: 1 };
  }

  function createEnvironment(THREE) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create the procedural reflection environment.");

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#253552");
    gradient.addColorStop(0.48, "#98a9c1");
    gradient.addColorStop(1, "#243248");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#dbe6f5";
    context.fillRect(32, 38, 105, 54);
    context.fillRect(203, 24, 66, 104);
    context.fillRect(392, 48, 82, 50);
    context.fillStyle = "rgba(255,255,255,0.42)";
    context.fillRect(0, 150, canvas.width, 12);
    context.fillRect(0, 184, canvas.width, 5);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  function createGeometry(THREE, type) {
    switch (type) {
      case "sphere":
        return new THREE.SphereGeometry(0.65, 36, 28);
      case "torus":
        return new THREE.TorusGeometry(0.52, 0.19, 20, 40);
      case "knot":
        return new THREE.TorusKnotGeometry(0.48, 0.16, 96, 16);
      case "cone":
        return new THREE.ConeGeometry(0.62, 1.25, 32);
      case "cylinder":
        return new THREE.CylinderGeometry(0.52, 0.52, 1.1, 32);
      case "plane":
        return new THREE.PlaneGeometry(1.35, 1.1, 32, 24);
      default:
        return new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    }
  }

  function materialDefaults(type) {
    if (typeof window !== "undefined" && window.MotionForge?.MATERIAL_DEFAULTS)
      return window.MotionForge.MATERIAL_DEFAULTS[type] || window.MotionForge.MATERIAL_DEFAULTS.standard;
    switch (type) {
      case "glass":
        return { color: "#d8e6ff", roughness: 0.04, metalness: 0, transmission: 0.96, ior: 1.5 };
      case "water":
        return { color: "#79d9ff", roughness: 0.08, metalness: 0.12, transmission: 0.82, ior: 1.33 };
      case "liquidMetal":
        return { color: "#c5d0df", roughness: 0.16, metalness: 0.92, transmission: 0, ior: 1.5 };
      case "gas":
        return { color: "#9da8ff", roughness: 0.48, metalness: 0, transmission: 0, ior: 1.2 };
      default:
        return { color: "#8d9bff", roughness: 0.55, metalness: 0.05, transmission: 0, ior: 1.5 };
    }
  }

  function installMaterialShaders(material, kind) {
    if (!["water", "liquidMetal", "gas"].includes(kind)) return;
    material.userData.motionShaderKind = kind;
    material.userData.motionValues = {
      time: 0,
      amplitude: 0.15,
      frequency: 2,
      phase: 0,
    };
    const uniforms = {
      uMotionTime: { value: 0 },
      uMotionAmplitude: { value: 0.15 },
      uMotionFrequency: { value: 2 },
      uMotionPhase: { value: 0 },
    };
    material.userData.motionUniforms = uniforms;
    material.onBeforeCompile = function (shader) {
      Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        "#include <common>\nuniform float uMotionTime;\nuniform float uMotionAmplitude;\nuniform float uMotionFrequency;\nuniform float uMotionPhase;\n" +
          (kind === "gas" ? "varying vec3 vMotionPosition;\n" : ""),
      );
      const displacement =
        kind === "liquidMetal"
          ? "transformed += normal * (sin(position.x * uMotionFrequency + uMotionTime + uMotionPhase) * cos(position.z * uMotionFrequency * 0.73 - uMotionTime * 0.7) + sin(position.y * uMotionFrequency * 0.61 + uMotionTime * 0.4 + uMotionPhase)) * uMotionAmplitude * 0.34;"
          : "transformed += normal * sin(position.x * uMotionFrequency + uMotionTime + uMotionPhase) * cos(position.y * uMotionFrequency * 0.8 - uMotionTime * 0.7 + uMotionPhase) * uMotionAmplitude;";
      if (kind !== "gas") {
        const gradient = kind === "liquidMetal"
          ? "vec3 motionGradient = vec3(cos(position.x*uMotionFrequency+uMotionTime+uMotionPhase)*cos(position.z*uMotionFrequency*0.73-uMotionTime*0.7), 0.61*cos(position.y*uMotionFrequency*0.61+uMotionTime*0.4+uMotionPhase), -0.73*sin(position.x*uMotionFrequency+uMotionTime+uMotionPhase)*sin(position.z*uMotionFrequency*0.73-uMotionTime*0.7))*uMotionFrequency*uMotionAmplitude*0.34;"
          : "vec3 motionGradient = vec3(cos(position.x*uMotionFrequency+uMotionTime+uMotionPhase)*cos(position.y*uMotionFrequency*0.8-uMotionTime*0.7+uMotionPhase), -0.8*sin(position.x*uMotionFrequency+uMotionTime+uMotionPhase)*sin(position.y*uMotionFrequency*0.8-uMotionTime*0.7+uMotionPhase), 0.0)*uMotionFrequency*uMotionAmplitude;";
        shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>",
          "#include <beginnormal_vertex>\n" + gradient +
          "\nobjectNormal = normalize(objectNormal - motionGradient + objectNormal * dot(motionGradient, objectNormal));");
      }
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n" +
          (kind === "gas" ? "vMotionPosition = position;\n" : "") +
          (kind === "gas" ? "" : displacement),
      );
      if (kind === "gas") {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          "#include <common>\nuniform float uMotionTime;\nuniform float uMotionAmplitude;\nuniform float uMotionFrequency;\nuniform float uMotionPhase;\nvarying vec3 vMotionPosition;\n" +
          "float gasHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }\n" +
          "float gasNoise(vec3 p) { vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(gasHash(i),gasHash(i+vec3(1,0,0)),f.x),mix(gasHash(i+vec3(0,1,0)),gasHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(gasHash(i+vec3(0,0,1)),gasHash(i+vec3(1,0,1)),f.x),mix(gasHash(i+vec3(0,1,1)),gasHash(i+vec3(1,1,1)),f.x),f.y),f.z); }\n",
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          "#include <color_fragment>\n" +
            "vec3 gasP = vMotionPosition * uMotionFrequency * 3.0 + vec3(uMotionPhase, -uMotionTime * 0.3, uMotionTime * 0.12);\n" +
            "float density = gasNoise(gasP) * 0.6 + gasNoise(gasP * 2.1) * 0.28 + gasNoise(gasP * 4.3) * 0.12;\n" +
            "float edge = 1.0 - smoothstep(0.15, 0.67, length(vMotionPosition.xy));\n" +
            "diffuseColor.rgb *= 0.65 + density * 0.8;\n" +
            "diffuseColor.a *= clamp((density - 0.22) * (1.0 + uMotionAmplitude * 3.0), 0.0, 0.75) * edge;\n",
        );
      }
    };
    material.customProgramCacheKey = () => `motion-${kind}-v1`;
  }

  function makeMaterial(THREE, type, environment) {
    const defaults = materialDefaults(type);
    const material = new THREE.MeshPhysicalMaterial({
      color: defaults.color,
      roughness: defaults.roughness,
      metalness: defaults.metalness,
      transmission: defaults.transmission,
      ior: defaults.ior,
      envMap: environment,
      envMapIntensity: type === "glass" || type === "water" ? 1.35 : 1,
      side: THREE.DoubleSide,
    });
    installMaterialShaders(material, type);
    return material;
  }

  class Renderer {
    constructor() {
      this._renderer = null;
      this._scene = null;
      this._camera = null;
      this._reflectionCamera = null;
      this._reflectionTarget = null;
      this._environment = null;
      this._environmentTarget = null;
      this._ground = null;
      this._groundBaseMaterial = null;
      this._objects = new Map();
      this._width = 0;
      this._height = 0;
      this._disposed = false;
      this._THREE = null;
      this._reflectionMaterial = null;
    }

    _initialize() {
      if (this._renderer) return;
      if (typeof window === "undefined" || !window.THREE) {
        throw new Error("Motion3D requires the locally bundled window.THREE library.");
      }
      if (typeof document === "undefined") {
        throw new Error("Motion3D requires a browser document with WebGL support.");
      }
      const THREE = window.THREE;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch (error) {
        throw new Error(`WebGL is unavailable; unable to create Motion3D renderer: ${error.message}`);
      }
      if (!renderer.getContext()) {
        renderer.dispose();
        throw new Error("WebGL is unavailable; unable to create a WebGL context.");
      }
      this._THREE = THREE;
      this._renderer = renderer;
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.setClearColor(0x000000, 0);

      this._scene = new THREE.Scene();
      this._scene.background = null;
      const environmentSource = createEnvironment(THREE);
      const environmentGenerator = new THREE.PMREMGenerator(renderer);
      try {
        this._environmentTarget = environmentGenerator.fromEquirectangular(environmentSource);
        this._environment = this._environmentTarget.texture;
      } finally {
        environmentSource.dispose();
        environmentGenerator.dispose();
      }
      this._scene.environment = this._environment;
      this._camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
      this._reflectionCamera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);

      const hemisphere = new THREE.HemisphereLight(0xe9f0ff, 0x253047, 0.75);
      this._scene.add(hemisphere);
      const keyLight = new THREE.DirectionalLight(0xffffff, 3);
      keyLight.position.set(-4, 7, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 80;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 12;
      keyLight.shadow.camera.bottom = -12;
      keyLight.shadow.bias = -0.00015;
      keyLight.shadow.normalBias = 0.02;
      this._scene.add(keyLight);

      const groundGeometry = new THREE.PlaneGeometry(80, 80);
      this._groundBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0x263249,
        roughness: 0.38,
        metalness: 0.3,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      this._ground = new THREE.Mesh(groundGeometry, this._groundBaseMaterial);
      this._ground.rotation.x = -Math.PI / 2;
      this._ground.position.y = -1.6;
      this._ground.receiveShadow = true;
      this._scene.add(this._ground);

      this._reflectionTarget = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true,
        stencilBuffer: false,
      });
      this._reflectionMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this._reflectionTarget.texture,
        roughness: 0.18,
        metalness: 0.5,
        transparent: true,
        opacity: 0.46,
        side: THREE.DoubleSide,
      });
      this._reflectionMatrix = new THREE.Matrix4();
      this._reflectionClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.6);
      this._reflectionMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.uReflectionMatrix = { value: this._reflectionMatrix };
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          "#include <common>\nuniform mat4 uReflectionMatrix;\nvarying vec4 vReflectionCoord;",
        ).replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvReflectionCoord = uReflectionMatrix * vec4(position, 1.0);",
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          "#include <common>\nvarying vec4 vReflectionCoord;",
        ).replace(
          "#include <map_fragment>",
          "vec4 reflectedColor = texture2DProj(map, vReflectionCoord);\n" +
          "diffuseColor *= vec4(reflectedColor.rgb, reflectedColor.a);",
        );
      };
      this._reflectionMaterial.customProgramCacheKey = () => "motion-planar-mirror-v1";
    }

    _removeObject(record) {
      this._scene.remove(record.mesh);
      record.geometry.dispose();
      record.material.dispose();
    }

    _syncObjects(layer, time, theme) {
      const THREE = this._THREE;
      const source = Array.isArray(layer.objects) ? layer.objects.slice(0, 40) : [];
      const seen = new Set();
      for (let index = 0; index < source.length; index++) {
        const object = source[index] || {};
        const id = String(object.id === undefined ? index : object.id);
        const geometryType = GEOMETRIES.includes(object.geometry) ? object.geometry : "box";
        const materialType = MATERIALS.includes(object.material) ? object.material : "standard";
        const structure = `${geometryType}/${materialType}`;
        seen.add(id);
        let record = this._objects.get(id);
        if (record && record.structure !== structure) {
          this._removeObject(record);
          this._objects.delete(id);
          record = null;
        }
        if (!record) {
          const geometry = createGeometry(THREE, geometryType);
          const material = makeMaterial(THREE, materialType, this._environment);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = materialType !== "gas";
          material.depthWrite = materialType !== "gas";
          mesh.receiveShadow = true;
          this._scene.add(mesh);
          record = { id, structure, geometry, material, mesh, alpha: 1, transparent: false };
          this._objects.set(id, record);
        }

        const values = {
          x: clamp(object.x, -50, 50, 0),
          y: clamp(object.y, -50, 50, 0),
          z: clamp(object.z, -50, 50, 0),
          rotationX: clamp(object.rotationX, -36000, 36000, 0),
          rotationY: clamp(object.rotationY, -36000, 36000, 0),
          rotationZ: clamp(object.rotationZ, -36000, 36000, 0),
          scaleX: clamp(object.scaleX, 0.001, 100, 1),
          scaleY: clamp(object.scaleY, 0.001, 100, 1),
          scaleZ: clamp(object.scaleZ, 0.001, 100, 1),
          speed: clamp(object.speed, -10, 10, 0),
          roughness: clamp(object.roughness, 0, 1, materialDefaults(materialType).roughness),
          metalness: clamp(object.metalness, 0, 1, materialDefaults(materialType).metalness),
          transmission: clamp(object.transmission, 0, 1, materialDefaults(materialType).transmission),
          ior: clamp(object.ior, 1, 2.5, materialDefaults(materialType).ior),
          amplitude: clamp(object.amplitude, 0, 1, 0.15),
          frequency: clamp(object.frequency, 0.1, 20, 2),
          seed: clamp(object.seed, 0, 65535, 1),
          opacity: clamp(object.opacity, 0, 1, 1),
        };
        if (Array.isArray(object.tracks) && object.tracks.length) {
          const engine =
            (typeof window !== "undefined" && window.MotionForge) ||
            (typeof globalThis !== "undefined" && globalThis.MotionForge);
          if (!engine || typeof engine.trackValue !== "function") {
            throw new Error("Motion3D animation tracks require MotionForge.trackValue.");
          }
          for (const track of object.tracks) {
            if (!track || !TRACKED_PROPERTIES.includes(track.property)) continue;
            values[track.property] = engine.trackValue(track, time, theme);
          }
        }
        for (const [property, min, max, fallback] of [
          ["x", -50, 50, 0],
          ["y", -50, 50, 0],
          ["z", -50, 50, 0],
          ["rotationX", -36000, 36000, 0],
          ["rotationY", -36000, 36000, 0],
          ["rotationZ", -36000, 36000, 0],
          ["scaleX", 0.001, 100, 1],
          ["scaleY", 0.001, 100, 1],
          ["scaleZ", 0.001, 100, 1],
          ["roughness", 0, 1, materialDefaults(materialType).roughness],
          ["metalness", 0, 1, materialDefaults(materialType).metalness],
          ["transmission", 0, 1, materialDefaults(materialType).transmission],
          ["ior", 1, 2.5, materialDefaults(materialType).ior],
          ["amplitude", 0, 1, 0.15],
          ["frequency", 0.1, 20, 2],
          ["opacity", 0, 1, 1],
        ]) {
          values[property] = clamp(values[property], min, max, fallback);
        }
        const resolved = resolveColor(object.color || materialDefaults(materialType).color, theme);
        const alpha = clamp(values.opacity * resolved.alpha, 0, 1, 1);
        const material = record.material;
        material.color.set(resolved.color);
        material.roughness = values.roughness;
        material.metalness = values.metalness;
        material.transmission = values.transmission;
        material.ior = values.ior;
        const transparent = alpha < 1 || materialType === "gas";
        const transmissionEnabled = values.transmission > 0;
        if (
          record.transparent !== transparent ||
          record.transmissionEnabled !== transmissionEnabled
        ) {
          material.transparent = transparent;
          material.needsUpdate = true;
          record.transparent = transparent;
          record.transmissionEnabled = transmissionEnabled;
        }
        record.alpha = alpha;
        material.opacity = alpha;

        const mesh = record.mesh;
        mesh.position.set(values.x, values.y, values.z);
        mesh.rotation.set(
          degrees(values.rotationX),
          degrees(values.rotationY) + time * values.speed,
          degrees(values.rotationZ),
        );
        mesh.scale.set(values.scaleX, values.scaleY, values.scaleZ);
        const shaderValues = material.userData.motionValues;
        if (shaderValues) {
          shaderValues.time = time * (layer.effectTimeScale ?? 1);
          shaderValues.amplitude = values.amplitude;
          shaderValues.frequency = values.frequency;
          shaderValues.phase = values.seed * 2.399963229728653;
          const uniforms = material.userData.motionUniforms;
          if (uniforms) {
            uniforms.uMotionTime.value = shaderValues.time;
            uniforms.uMotionAmplitude.value = shaderValues.amplitude;
            uniforms.uMotionFrequency.value = shaderValues.frequency;
            uniforms.uMotionPhase.value = shaderValues.phase;
          }
        }
      }
      for (const [id, record] of this._objects) {
        if (!seen.has(id)) {
          this._removeObject(record);
          this._objects.delete(id);
        }
      }
    }

    _setCamera(layer, width, height, theme) {
      const THREE = this._THREE;
      const distance = clamp(layer.cameraDistance, 2, 30, 6);
      const azimuth = degrees(clamp(layer.cameraAzimuth, -36000, 36000, 25));
      const elevation = degrees(clamp(layer.cameraElevation, -85, 85, 15));
      const fov = clamp(layer.fov, 15, 100, 45);
      const camera = this._camera;
      camera.fov = fov;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      camera.position.set(
        distance * Math.cos(elevation) * Math.sin(azimuth),
        distance * Math.sin(elevation),
        distance * Math.cos(elevation) * Math.cos(azimuth),
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);

      const lightColor = resolveColor(layer.lightColor || "$text", theme);
      for (const child of this._scene.children) {
        if (child.isDirectionalLight) {
          child.intensity = clamp(layer.lightIntensity, 0, 20, 3);
          child.color.set(lightColor.color);
        }
      }
      this._reflectionCamera.fov = fov;
      this._reflectionCamera.aspect = width / height;
      this._reflectionCamera.near = camera.near;
      this._reflectionCamera.far = camera.far;
      this._reflectionCamera.updateProjectionMatrix();
      return THREE;
    }

    render(layer, time, width, height, theme) {
      if (this._disposed) throw new Error("Cannot render with a disposed Motion3D renderer.");
      this._initialize();
      const THREE = this._THREE;
      const w = Math.max(1, Math.floor(clamp(width, 1, 16384, 1)));
      const h = Math.max(1, Math.floor(clamp(height, 1, 16384, 1)));
      const t = Number.isFinite(Number(time)) ? Number(time) : 0;
      const palette = theme && typeof theme === "object" ? { ...DEFAULT_THEME, ...theme } : DEFAULT_THEME;
      const input = layer && typeof layer === "object" ? layer : {};
      if (w !== this._width || h !== this._height) {
        this._renderer.setSize(w, h, false);
        this._reflectionTarget.setSize(w, h);
        this._width = w;
        this._height = h;
      }
      this._syncObjects(input, t, palette);
      this._setCamera(input, w, h, palette);

      const mirror = input.mirror === true;
      this._ground.visible = input.ground !== false || mirror;
      const groundMaterial = mirror ? this._reflectionMaterial : this._groundBaseMaterial;
      if (this._ground.material !== groundMaterial) this._ground.material = groundMaterial;
      if (mirror) {
        const groundY = this._ground.position.y;
        const source = this._camera;
        const reflected = this._reflectionCamera;
        const target = new THREE.Vector3(0, 0, 0);
        source.getWorldDirection(target);
        target.add(source.position);
        reflected.position.set(source.position.x, 2 * groundY - source.position.y, source.position.z);
        reflected.up.set(source.up.x, -source.up.y, source.up.z);
        target.y = 2 * groundY - target.y;
        reflected.lookAt(target);
        reflected.updateMatrixWorld(true);
        this._ground.updateMatrixWorld(true);
        this._reflectionMatrix.set(
          0.5, 0, 0, 0.5,
          0, 0.5, 0, 0.5,
          0, 0, 0.5, 0.5,
          0, 0, 0, 1,
        );
        this._reflectionMatrix
          .multiply(reflected.projectionMatrix)
          .multiply(reflected.matrixWorldInverse)
          .multiply(this._ground.matrixWorld);

        const visible = this._ground.visible;
        const clippingPlanes = this._renderer.clippingPlanes;
        this._ground.visible = false;
        try {
          this._renderer.clippingPlanes = [this._reflectionClip];
          this._renderer.setRenderTarget(this._reflectionTarget);
          this._renderer.clear(true, true, true);
          this._renderer.render(this._scene, reflected);
        } finally {
          this._ground.visible = visible;
          this._renderer.clippingPlanes = clippingPlanes;
          this._renderer.setRenderTarget(null);
        }
      }
      this._renderer.setRenderTarget(null);
      this._renderer.clear(true, true, true);
      this._renderer.render(this._scene, this._camera);
      return this._renderer.domElement;
    }

    dispose() {
      if (this._disposed) return;
      this._disposed = true;
      if (!this._renderer) return;
      for (const record of this._objects.values()) this._removeObject(record);
      this._objects.clear();
      this._scene.remove(this._ground);
      this._ground.geometry.dispose();
      this._groundBaseMaterial.dispose();
      this._reflectionMaterial.dispose();
      this._reflectionTarget.dispose();
      this._environmentTarget.dispose();
      for (const child of this._scene.children) {
        if (child.shadow && typeof child.shadow.dispose === "function") child.shadow.dispose();
      }
      this._renderer.dispose();
      this._renderer = null;
      this._scene = null;
      this._camera = null;
      this._reflectionCamera = null;
      this._reflectionTarget = null;
      this._environment = null;
      this._environmentTarget = null;
      this._ground = null;
      this._groundBaseMaterial = null;
      this._reflectionMaterial = null;
    }
  }

  return {
    Renderer,
    GEOMETRIES,
    MATERIALS,
    TRACKED_PROPERTIES,
    resolveColor,
  };
});
