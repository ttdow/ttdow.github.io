import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 1, 1)

var scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientLight)

var video = document.getElementById( 'video' ) as HTMLVideoElement

var bgTexture = new THREE.VideoTexture(video)

const geometry = new THREE.BoxGeometry()
var bgMaterial = new THREE.MeshBasicMaterial({
    wireframe: false,
    map: bgTexture,
})
var cube = new THREE.Mesh(geometry, bgMaterial)
cube.scale.set(500, 500, 1)
cube.position.set(0, 0, -150)
scene.add(cube)

if (navigator.mediaDevices)
{
    const constraints = { video: { width: 1280, height: 720, facingMode: "environment" } }
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) 
    {
        // Apply the stream to the video element used in the texture
        video.srcObject = stream
        video.play()
    }).catch(function(err) 
    {
        console.error('Unable to access the camera', err)
    })
}
else
{
    console.error('MediaDevices interface not available.')
}

const renderer = new THREE.WebGLRenderer( {antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x87CEEB, 1.0)
document.body.appendChild(renderer.domElement)

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