import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

const constraints = {
    audio: false,
    video: { width: 1280, height: 720, facingMode: "environment" }
}

const video = document.getElementById( 'video' ) as HTMLVideoElement

navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
    video.srcObject = mediaStream
    video.onloadedmetadata = () => {
        video.play()
    }
}).catch((err) => {
    console.error('${err.name}: ${err.message}')
})

const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 1, 1)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x87CEEB, 1.0)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry()
const texture = new THREE.VideoTexture( video )
const loader = new THREE.TextureLoader()
const material = new THREE.MeshBasicMaterial({
    wireframe: false,
    map: texture,
})

const cube = new THREE.Mesh(geometry, material)
cube.scale.set(500, 500, 1)
cube.position.set(0, 0, -150)
scene.add(cube)

let mixer: THREE.AnimationMixer
let modelReady = false
const animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction

const fbxLoader = new FBXLoader()
fbxLoader.load(
    'models/model.fbx',
    (object) => {
        object.position.set(0, 0, -1)
        object.scale.set(0.01, 0.01, 0.01)
        mixer = new THREE.AnimationMixer(object)

        const animationAction = mixer.clipAction(
            (object as THREE.Object3D).animations[0]
        )
        animationActions.push(animationAction)
        animationsFolder.add(animations, 'default')
        activeAction = animationActions[0]

        scene.add(object)

        // Add an animation from another file
        fbxLoader.load(
            'models/samba.fbx',
            (object) => {
                console.log('loaded samba')
                modelReady = true
                
                const animationAction = mixer.clipAction(
                    (object as THREE.Object3D).animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'samba')
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const animations = {
    default: function() {
        setAction(animationActions[0])
    },
    samba: function() {
        setAction(animationActions[1])
    },
    test: function() {
        console.log('WHAT!?')
    }
}

const setAction = (toAction: THREE.AnimationAction) => {

    console.log('setAction() was called.')

    if (toAction != activeAction) 
    {
        lastAction = activeAction
        activeAction = toAction
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.play()
    }
}

const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

const clock = new THREE.Clock()

function animate()
{
    requestAnimationFrame(animate)

    if (modelReady) mixer.update(clock.getDelta())

    render()
}

function render() 
{
    renderer.render(scene, camera)
}

animate()