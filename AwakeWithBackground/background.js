let camera3D, scene, renderer, cube;
let dir = 0.01;
let banana = [];
let positionLimit = 40;
let directionalLight;
let mixer;

const clock = new THREE.Clock();

let onPointerDownLon;
let onPointerDownLat;
init3D();

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    //scene.add(directionalLight);

    let light = new THREE.PointLight(0xc4c4c4, 1);
    light.position.set(0, 300, 500);
    scene.add(light)

    let light2 = new THREE.PointLight(0xc4c4c4, 1);
    light2.position.set(500, 100, 0);
    scene.add(light2)

    let light3 = new THREE.PointLight(0xc4c4c4, 1);
    light3.position.set(0, 100, -500);
    scene.add(light3)

    let light4 = new THREE.PointLight(0xc4c4c4, 2);
    light4.position.set(-700, 300, 0);
    scene.add(light4);



   let bgGeometery = new THREE.SphereGeometry(1000, 60, 40);
   // let bgGeometery = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    bgGeometery.scale(-1, 1, 1);
    // has to be power of 2 like (4096 x 2048) or(8192x4096).  i think it goes upside down because texture is not right size
    let panotexture = new THREE.TextureLoader().load("3.jpg");
    // var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);

    for (let index = 0; index < 5; index++) {

        let loader = new THREE.GLTFLoader();
        loader.load('banana.glb', function(gltf){
            banana[index] =  new Banana(gltf.scene.children[0]);
    
            scene.add(gltf.scene);

        });
        
    }

    let loader = new THREE.GLTFLoader();
    loader.load('shape.gltf', function(gltf){
        gltf.scene.children[0].position.set(10, 10, 1)
        scene.add(gltf.scene);
    });

    moveCameraWithMouse();

    camera3D.position.z = 5;

    const fbxLoader = new THREE.FBXLoader()
    fbxLoader.load(
        'man.fbx',
        (object) => {


            mixer = new THREE.AnimationMixer( object );

            const action = mixer.clipAction( object.animations[ 0 ] );
            action.play();

            object.traverse( function ( child ) {

                if ( child.isMesh ) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            } );
            // object.traverse(function (child) {
            //     if ((child as THREE.Mesh).isMesh) {
            //         // (child as THREE.Mesh).material = material
            //         if ((child as THREE.Mesh).material) {
            //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
            //         }
            //     }
            // })
            // object.scale.set(.01, .01, .01)
            object.scale.set(0.07,0.07,0.07);
            object.position.set(-25, -15, 0)
            object.rotation.y = Math.PI/2;
            scene.add(object)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )




    animate();
}


function animate() {
    requestAnimationFrame(animate);
    for (let index = 0; index < banana.length; index++) {
        if(banana[index].model != undefined){
            banana[index].model.rotation.y += banana[index].rotationSpeed;
        }        
    }
    const delta = clock.getDelta();
    if ( mixer ) mixer.update( delta );
    renderer.render(scene, camera3D);
}



/////MOUSE STUFF

var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
var lon = -90, onMouseDownLon = 0;
var lat = 0, onMouseDownLat = 0;
var isUserInteracting = false;


function moveCameraWithMouse() {
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera3D.target = new THREE.Vector3(0, 0, 0);
}

function onDocumentKeyDown(event) {
    //if (event.key == " ") {
    //in case you want to track key presses
    //}
}

function onDocumentMouseDown(event) {
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        computeCameraOrientation();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    camera3D.fov += event.deltaY * 0.05;
    camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera3D.target.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera3D.target.y = 100 * Math.cos(phi);
    camera3D.target.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera3D.lookAt(camera3D.target);
}


function onWindowResize() {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}



class Banana{
    constructor(model){
        this.positionX = Math.random() * positionLimit - positionLimit/2;
        this.positionY = Math.random() * 10 - 5;
        this.positionZ = Math.random() * positionLimit - positionLimit/2;

        this.model = model;

        this.model.scale.set(0.5, 0.5, 0.5)

        this.model.position.set(this.positionX, this.positionY, this.positionZ);
        this.model.rotation.z = Math.PI/4;

        this.rotationSpeed = Math.random() * 0.3 - 0.15

    }

}