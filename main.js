import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d); // dark gray background

// === Camera ===
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 6);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === Lights ===
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
scene.add(dirLight);

// Subtle warm spotlight for better tone
const spotLight = new THREE.SpotLight(0xffcc88, 1.5, 50, Math.PI / 6, 0.3);
spotLight.position.set(0, 5, 5);
spotLight.castShadow = true;
scene.add(spotLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Loaders ===
const loader = new GLTFLoader();
let tigerMixer = null;

// ✅ IMPORTANT: Use absolute paths for public folder assets
// (Ensure both folders are inside your project's /public directory)

// === Load ROAD MODEL ===
loader.load(
  '/road_with_substance_designer/scene.gltf', // path from /public
  (gltf) => {
    const road = gltf.scene;
    road.scale.set(3, 3, 3);
    road.position.set(0, -1.2, 0);

    road.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.side = THREE.DoubleSide;
          node.material.transparent = false;
          node.material.opacity = 1.0;
          node.material.needsUpdate = true;
        }
      }
    });

    scene.add(road);
  },
  undefined,
  (error) => console.error('Error loading road model:', error)
);

// === Load TIGER MODEL ===
loader.load(
  '/running_tiger/scene.gltf', // path from /public
  (gltf) => {
    const tiger = gltf.scene;
    tiger.scale.set(0.015, 0.015, 0.015);
    tiger.position.set(0, -1.05, 0);

    tiger.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.side = THREE.DoubleSide;
          node.material.transparent = false; // fully solid
          node.material.opacity = 1.0;
          node.material.depthWrite = true;
          node.material.needsUpdate = true;
        }
      }
    });

    scene.add(tiger);

    // === Animation ===
    if (gltf.animations && gltf.animations.length > 0) {
      tigerMixer = new THREE.AnimationMixer(tiger);
      let walkClip = gltf.animations.find((clip) =>
        clip.name.toLowerCase().includes('walk')
      );
      const action = tigerMixer.clipAction(walkClip || gltf.animations[0]);
      action.play();
    }

    // Focus camera on tiger
    const box = new THREE.Box3().setFromObject(tiger);
    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    controls.update();
  },
  undefined,
  (error) => console.error('Error loading tiger model:', error)
);

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animate ===
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (tigerMixer) tigerMixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();
