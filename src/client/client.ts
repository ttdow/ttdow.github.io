import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

var qAngles = new THREE.Quaternion()

let distance: number
let maxDistance: number

maxDistance = -1

function handleOrientation(event: any)
{
    var alpha = THREE.MathUtils.degToRad(event.alpha) // yaw
    var beta = THREE.MathUtils.degToRad(event.beta)   // pitch
    var gamma = THREE.MathUtils.degToRad(event.gamma) // roll

    var text = document.getElementById('text') as HTMLElement

    if (alpha != null && beta != null && gamma != null)
    {
        text.innerHTML = "Alpha: " + alpha + ", Beta: " + beta + ", Gamma: " + gamma
        qAngles = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, gamma, 0))
        camera.setRotationFromQuaternion(qAngles)
    }
    else
    {
        text.innerHTML = "Shit is goofed."
    }
}

document.querySelector('button[data-action="dance"')?.addEventListener('click', function() {
    setAction(animationActions[1])
})

function orient()
{
    var text = document.getElementById('text') as HTMLElement
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function')
    {
        // Handle iOS13+ devices
        (DeviceOrientationEvent as any).requestPermission().then((state: string) => 
        {
            if (state === 'granted')
            {
                window.addEventListener('deviceorientation', handleOrientation)
            }
            else
            {
                text.innerHTML = 'Request to access the orientation was rejected.'
            }
        }).catch(text.innerHTML = 'Error.')
    }
    else
    {
        // Handle non-iOS13+ devices
        window.addEventListener('deviceorientation', handleOrientation)
    }
}

document.querySelector('button[data-action="orient"')?.addEventListener('click', orient)

let id

function locate()
{
    const text = document.getElementById('text') as HTMLElement

    function success(position: { coords: { latitude: any; longitude: any; altitude: any; accuracy: any; altitudeAccuracy: any; heading: any; speed: any } })
    {
        // Device coords
        const latitude0 = position.coords.latitude
        const longitude0 = position.coords.longitude
        const altitude = position.coords.altitude
        const accuracy = position.coords.accuracy
        const altAccuracy = position.coords.altitudeAccuracy
        const heading = position.coords.heading
        const speed = position.coords.speed

        // Destination coords
        const latitude1 = 51.07680517824372
        const longitude1 =  -114.12244255073777

        // Haversine distance algorithm
        const r = 6371 * 1000
        const phi0 = latitude0 * Math.PI/180
        const phi1 = latitude1 * Math.PI/180
        const deltaPhi = (latitude1 - latitude0) * Math.PI/180
        const deltaLambda = (longitude1 - longitude0) * Math.PI/180
        const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi0) * Math.cos(phi1) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const d = r * c
        distance = d

        if (maxDistance < 0)
        {
            maxDistance = distance
        }

        text.innerHTML = 'Latitude: ' + latitude0 + ', Longitude: ' + longitude0 + ', Distance: ' + d
    } 

    function error() 
    {
        text.innerHTML = 'Unable to retrieve your location'
    }

    if (!navigator.geolocation)
    {
        text.innerHTML = 'Geolocation is not supported by your browser'
    }
    else
    {
        text.innerHTML = 'Locating...'
        id = navigator.geolocation.watchPosition(success, error)
    }
}

document.querySelector('button[data-action="locate"')?.addEventListener('click', locate)

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

const gpsTexture = new THREE.TextureLoader().load("gps.png")
var gpsMaterial = new THREE.MeshBasicMaterial({
    map: gpsTexture
}) 
var gpsMarker = new THREE.Mesh(geometry, gpsMaterial)
gpsMarker.scale.set(1, 1, 1)
gpsMarker.position.set(0, 1, 0.9)
scene.add(gpsMarker)

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
        //animationsFolder.add(animations, 'default')
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
                //animationsFolder.add(animations, 'samba')
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

const clock = new THREE.Clock()

function animate()
{
    requestAnimationFrame(animate)

    if (modelReady) mixer.update(clock.getDelta())

    var scaleFactor = 0

    if (maxDistance > 0)
    {
        if (distance > 0)
        {
            scaleFactor = (1.0 / (distance / maxDistance)) - 0.5
        }
        else
        {
            scaleFactor = 1
        }

        gpsMarker.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }

    render()
}

function render() 
{
    renderer.render(scene, camera)
}

animate()