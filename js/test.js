//import {THREE} from 'three.js'
//import { FBXLoader } from 'node_modules/three/examples/jsm/loaders/FBXLoader'

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5))

/*
const light = new THREE.PointLight()
light.position.set(0.8, 1.4, 1.0)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)
*/
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

/*
const fbxLoader = new FBXLoader()
fbxLoader.load(
    'assets/model.fbx',
    (object) => {
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
*/

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();