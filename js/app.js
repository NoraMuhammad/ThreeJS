import * as THREE from '../build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import {WebGLRenderer} from '/src/renderers/WebGLRenderer.js';

import { EffectComposer } from '/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/examples/jsm/postprocessing/ShaderPass.js';
import { SepiaShader } from '/shaders/SepiaShader.js';
import { GlitchPass } from '/examples/jsm/postprocessing/GlitchPass.js';

///// global
var container;
var scene;
var camera;
var renderer;
var controls;
var mesh;
var planeMesh;
var meshes = [];
const SPACETXTURE = 'spacebg.jpg';
var raycaster;
var mouse;
var composer;
var renderPass;
///// Main function

function Main() {

  // Get a reference to the container element that will hold our scene
  container = document.querySelector( '#scene-container' );
  document.addEventListener( 'mousedown', onMouseClicked, false );
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2( 1, 1 );

  createScene();
  createCamera();
  createPlane();
  createLights();
  createControls();
  createRenderer();

  ApplyGlitchEffect();

  renderLoop();

} onload = Main;

function ApplyGlitchEffect()
{
  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  var pass1 = new ShaderPass(SepiaShader);
  composer.addPass(pass1);
  
  var pass2 = new GlitchPass(0);
  composer.addPass(pass2);
  pass2.renderToScreen = true;
}

function checkMouseRaycaster(event, planeToCheck)
{
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersection;
  if(planeToCheck.length > 1)
    intersection = raycaster.intersectObjects( planeToCheck );
  else
    intersection = raycaster.intersectObject(planeToCheck);

  return intersection;
}

function onMouseClicked(event)
{
  let _intersection = checkMouseRaycaster(event, planeMesh);

  if(_intersection.length > 0)
  {
    createMesh(_intersection[0].point.x, _intersection[0].point.y + 0.5, _intersection[0].point.z);
  }
}

function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');
}

function createCamera() {
  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-4, 4, 10);
}

function createPlane() {
  mesh = createCube();
  mesh.material.color = new THREE.Color("#351c75");
  mesh.position.set(0, 0, 0);
  mesh.scale.set(10, 0.3, 10);
  planeMesh = mesh;
  scene.add(mesh);
}

function createLights() {

  const ambientLight = new THREE.HemisphereLight(
    0xddeeff, // sky color
    0x202020, // ground color
    5, // intensity
    );

    const light = new THREE.DirectionalLight(0xffffff, 5.0);
    // move the light back and up a bit
    light.position.set(10, 10, 10);
    light.castShadow = true;

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;    // default
    light.shadow.camera.far = 500;     // default

    // remember to add the light to the scene
    scene.add(ambientLight,light);
}

function createControls() {
   controls = new OrbitControls(camera, container);
}

function render() {
  renderer.render(scene, camera);
  composer.render();
}

function createRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  // add the automatically created <canvas> element to the page
  container.appendChild(renderer.domElement);
}

function renderLoop() {
  var then = 0;
  // Draw the scene repeatedly
  renderer.setAnimationLoop((now) => {
    //calculate deltaTime
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    render();
  });
}

function createMesh(x = 0, y = 0.6 , z = 0) {
  const texture = createTexture(SPACETXTURE);
  // create a geometry
  mesh = createCube();
  mesh.material.map = texture;
  mesh.position.set(x, y, z);
  // add the mesh to the scene
  scene.add(mesh);
}

//#region  helper functions
function createTexture(src) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(src);
  // set the "color space" of the texture
  texture.encoding = THREE.sRGBEncoding;
  // reduce blurring at glancing angles
  texture.anisotropy = 16;
  return texture;
}

function createCube() {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  // create a default (white) Basic material
  const material = new THREE.MeshStandardMaterial();
  // const material = new THREE.MeshPhongMaterial( { flatShading: true } );
  // create a Mesh containing the geometry and material
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  meshes.push(mesh);

  return mesh;
}
//#endregion