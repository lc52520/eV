// main viewer script
//
// multiple scenes layout adapted from the three.js example "lightning strike"
// https://threejs.org/examples/webgl_lightningstrike.html
//
// mxo, March 2019

"use strict";

if ( WEBGL.isWebGLAvailable() === false ) {

	document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var container, stats;

var camera, scene, renderer, composer

// gui parameters
// materialFolder is a specific sub-gui of gui used by asynchronous functions
var gui, material_gui;

var currentSceneIndex = 0;

var currentStep = 0;

var sceneCreators = [
	createPlasmaBallScene,
    createWaterPhantomScene,
];

var textureLoader;

var clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

init();
animate();

function init() {

	container = document.getElementById( 'container' );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	container.appendChild( renderer.domElement );

	composer = new THREE.EffectComposer( renderer );

	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize, false );

	textureLoader = new THREE.TextureLoader();

	createScene();

}

function createScene() {

	scene = sceneCreators[ currentSceneIndex ]();

	createGUI();

}

function onWindowResize() {

	scene.userData.camera.aspect = window.innerWidth / window.innerHeight;
	scene.userData.camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	composer.setSize( window.innerWidth, window.innerHeight );

}

//

function createGUI() {

	if ( gui ) {
		gui.destroy();
	}

	gui = new dat.GUI( { width: 350 } );

	var sceneFolder = gui.addFolder( "Model" );

	scene.userData.sceneIndex = currentSceneIndex;

	sceneFolder.add( scene.userData, 'sceneIndex', { "Tantalum plate": 0, "Water phantom": 1} ).name( 'Model' ).onChange( function ( value ) {
		currentSceneIndex = value;
		createScene();
	} );

    sceneFolder.open();

    // Miscellaneous options
    var miscFolder = gui.addFolder( "General" )

    // visibility
    scene.userData.axesVisible = false;
	miscFolder.add( scene.userData, "axesVisible" ).name( "Show axes" );

	//miscFolder.open();

    // source parameters
    var sourceFolder = gui.addFolder( "Particle sources" )

    // visibility
    scene.userData.sourcesVisible = true;
	sourceFolder.add( scene.userData, "sourcesVisible" ).name( "Show particle sources" );

    //

    // material parameters
    var materialFolder = gui.addFolder( "Materials" )

    // visibility
    scene.userData.vacuumVisible = true;
	materialFolder.add( scene.userData, "vacuumVisible" ).name( "Show vacuum outlines" );

    // material_gui is a global for as-needed use by the shape loader
    material_gui = materialFolder

    //

    // track parameters
    var trackFolder = gui.addFolder( "Particle tracks" )

    scene.userData.tracksVisible = false;
	trackFolder.add( scene.userData, "tracksVisible" ).name( "Show particle tracks" );
    scene.userData.loop = false;
    scene.userData.loop_toggle = function() {
        currentStep = 0;
        scene.userData.loop = !scene.userData.loop;
    }
	trackFolder.add( scene.userData, "loop_toggle" ).name( "Loop particle tracks" );

    // reset particle track state
    scene.userData.resetTracks = false;
    scene.userData.resetTracksFn = function() {
        scene.userData.resetTracks = true;
        console.log("reset tracks");
    }

	trackFolder.add( scene.userData, "resetTracksFn" ).name( "Reset particle tracks" );
}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	//currentTime += scene.userData.timeRate * clock.getDelta();

    currentStep += 1;

	if ( currentStep < 0 ) {

		currentStep = 0;

	}

	scene.userData.render( currentStep );

}

// taken from LightningStrike example to render seperate scenes
function createOutline( scene, objectsArray, visibleColor ) {

	var outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, scene.userData.camera, objectsArray );
	outlinePass.edgeStrength = 2.5;
	outlinePass.edgeGlow = 0.7;
	outlinePass.edgeThickness = 2.8;
	outlinePass.visibleEdgeColor = visibleColor;
	outlinePass.hiddenEdgeColor.set( 0 );
	composer.addPass( outlinePass );

	scene.userData.outlineEnabled = true;

	return outlinePass;

}

//

function createPlasmaBallScene() {

	var scene = new THREE.Scene();

	scene.userData.canGoBackwardsInTime = true;

	//scene.userData.camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 100, 50000 );
	scene.userData.camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 5000 );

	var ballScene = new THREE.Scene();
	ballScene.background = new THREE.Color( 0x454545 );

    // axes for all
    var axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

	// Lights

	var ambientLight = new THREE.AmbientLight( 0x444444 );
	ballScene.add( ambientLight );
	scene.add( ambientLight );

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );

	var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	ballScene.add( light1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( -0.5, 1, 0.2 );
	ballScene.add( light2 );
	scene.add( light2 );

    // Particle sources
    let source_file_array = [];
    let source_json = "examples/tantalum-plate/source.json";

    source_file_array.push(source_json);

    // create three.js representations of all particle source objects
    let source_group = new THREE.Group();
    ballScene.add(source_group);

    // add outlines for source objects
    var outlineMeshArray = [];

    // outline color
	scene.userData.outlineColor = new THREE.Color( 0xFF00FF );

    let particle_sources = make_sources(source_group, source_file_array, outlineMeshArray);

    console.log(outlineMeshArray);

    //

    // create three.js representations of all materials

    let shape_file_array = [];
    let tantalum_box = "examples/tantalum-plate/plate.json";
    let tantalum_box2 = "examples/tantalum-plate/plate2.json";
   // let water_cyl =    "examples/water-phantom/phantom.json";

    let vacuumA     = "examples/tantalum-plate/vacuumA.json";
    let vacuumB     = "examples/tantalum-plate/vacuumB.json";

    shape_file_array.push(tantalum_box);
    shape_file_array.push(tantalum_box2);

    shape_file_array.push(vacuumA);
    shape_file_array.push(vacuumB);

    let shape_group = new THREE.Group();
    let vacuum_group = new THREE.Group();

    ballScene.add(shape_group);
    ballScene.add(vacuum_group);

    let media = make_shapes(shape_group, vacuum_group, shape_file_array);

    // particle tracks
    let track_file = "examples/tantalum-plate/tracks.json";
    let track_array = [];

    let track_group = new THREE.Group();
    let tracks = new TrackSet(track_group);

    ballScene.add(tracks.group);

    parse_track_file(track_file, tracks);

    //

	scene.userData.camera.position.set(100, 60, 50);

	// Compose rendering

	composer.passes = [];

	composer.addPass( new THREE.RenderPass( ballScene, scene.userData.camera ) );

	var rayPass = new THREE.RenderPass( scene, scene.userData.camera );
	rayPass.clear = false;
	composer.addPass( rayPass );

	var outlinePass = createOutline( scene, outlineMeshArray, scene.userData.outlineColor );

	scene.userData.render = function ( time ) {

        // check for toggling axes
        axesHelper.visible = scene.userData.axesVisible;

        // check if we want sources visible
        source_group.visible = scene.userData.sourcesVisible;

        // check if we want vacuum outlines visible
        vacuum_group.visible = scene.userData.vacuumVisible;

        tracks.group.visible = scene.userData.tracksVisible;

        if (scene.userData.resetTracks) {

            //console.log("showing all tracks");
            tracks.reset(ballScene);
            // reset the flag
            scene.userData.resetTracks = false;
            scene.userData.loop = false;

            // restart time
            currentStep = 0;

        } else if(scene.userData.loop) {
            tracks.update(ballScene, time);
        }

		controls.update();

		outlinePass.enabled = true;

		composer.render();

	};

	// Controls

	var controls = new THREE.OrbitControls( scene.userData.camera, renderer.domElement );

	return scene;
}

function createWaterPhantomScene() {

	var scene = new THREE.Scene();

	scene.userData.camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 5000 );

	var currentScene = new THREE.Scene();
	currentScene.background = new THREE.Color( 0x454545 );

    // axes for all
    var axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

	// Lights

	var ambientLight = new THREE.AmbientLight( 0x444444 );
	currentScene.add( ambientLight );
	scene.add( ambientLight );

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );

	var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	currentScene.add( light1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( -0.5, 1, 0.2 );
	currentScene.add( light2 );
	scene.add( light2 );

    // Particle sources
    let source_file_array = [];
    let source_json = "examples/water-phantom/source.json";

    source_file_array.push(source_json);

    // create three.js representations of all particle source objects
    let source_group = new THREE.Group();
    currentScene.add(source_group);

    // add outlines for source objects
    var outlineMeshArray = [];

    // outline color
	scene.userData.outlineColor = new THREE.Color( 0xFF00FF );

    let particle_sources = make_sources(source_group, source_file_array, outlineMeshArray);

    console.log(outlineMeshArray);

    //

    // create three.js representations of all materials

    let shape_file_array = [];
    let phantom     = "examples/water-phantom/phantom.json";
    let vacuum      = "examples/water-phantom/vacuum.json";

    shape_file_array.push(phantom);
    shape_file_array.push(vacuum);

    let shape_group = new THREE.Group();
    let vacuum_group = new THREE.Group();

    currentScene.add(shape_group);
    currentScene.add(vacuum_group);

    let media = make_shapes(shape_group, vacuum_group, shape_file_array);

    // TODO fix for given shape size
	scene.userData.camera.position.set(100, 60, 150);

	// Compose rendering

	composer.passes = [];

	composer.addPass( new THREE.RenderPass( currentScene, scene.userData.camera ) );

	var rayPass = new THREE.RenderPass( scene, scene.userData.camera );
	rayPass.clear = false;
	composer.addPass( rayPass );

	var outlinePass = createOutline( scene, outlineMeshArray, scene.userData.outlineColor );

	scene.userData.render = function ( time ) {

        // check for toggling axes
        axesHelper.visible = scene.userData.axesVisible;

        // check if we want sources visible
        source_group.visible = scene.userData.sourcesVisible;

        // check if we want vacuum outlines visible
        vacuum_group.visible = scene.userData.vacuumVisible;

		controls.update();

		outlinePass.enabled = true;

		composer.render();

	};

	// Controls

	var controls = new THREE.OrbitControls( scene.userData.camera, renderer.domElement );

	return scene;
}
