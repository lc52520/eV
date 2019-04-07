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
	createPlateScene,
    createWaterPhantomScene,
];

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

	createScene();

}

function createScene() {

    // TODO pass in data folder as parameter here
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

    // TODO generalize the sceneIndex for a arbitrary number of scenes
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

    currentStep += 1;

	if ( currentStep < 0 ) {

		currentStep = 0;

	}

	scene.userData.render( currentStep );

}

function createPlateScene() {

	var scene = new THREE.Scene();

	scene.userData.camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 5000 );

	var plateScene = new THREE.Scene();
	plateScene.background = new THREE.Color( 0x454545 );

    // axes for all
    var axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

	// Lights

	var ambientLight = new THREE.AmbientLight( 0x444444 );
	plateScene.add( ambientLight );

    // Particle sources
    let source_file_array = [];
    let source_json = "examples/tantalum-plate/source.json";

    source_file_array.push(source_json);

    // create three.js representations of all particle source objects
    let source_group = new THREE.Group();
    plateScene.add(source_group);

    let particle_sources = make_sources(source_group, source_file_array);

    // create three.js representations of all materials

    let shape_file_array = [];
    let tantalum_box = "examples/tantalum-plate/plate.json";

    // uncomment to render another plate
    // let tantalum_box2 = "examples/tantalum-plate/plate2.json";
    //shape_file_array.push(tantalum_box2);

    let vacuumA     = "examples/tantalum-plate/vacuumA.json";
    let vacuumB     = "examples/tantalum-plate/vacuumB.json";

    shape_file_array.push(tantalum_box);

    shape_file_array.push(vacuumA);
    shape_file_array.push(vacuumB);

    let shape_group = new THREE.Group();
    let vacuum_group = new THREE.Group();

    plateScene.add(shape_group);
    plateScene.add(vacuum_group);

    let media = make_shapes(shape_group, vacuum_group, shape_file_array);

    // particle tracks
    let track_file = "examples/tantalum-plate/tracks.json";
    let track_array = [];

    let track_group = new THREE.Group();
    let tracks = new TrackSet(track_group);

    plateScene.add(tracks.group);

    parse_track_file(track_file, tracks);

    //

	scene.userData.camera.position.set(100, 60, 50);

	// Compose rendering

	composer.passes = [];

	composer.addPass( new THREE.RenderPass( plateScene, scene.userData.camera ) );

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
            tracks.reset(plateScene);
            // reset the flag
            scene.userData.resetTracks = false;
            scene.userData.loop = false;

            // restart time
            currentStep = 0;

        } else if(scene.userData.loop) {
            tracks.update(plateScene, time);
        }

		controls.update();

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

    // Particle sources
    let source_file_array = [];
    let source_json = "examples/water-phantom/source.json";

    source_file_array.push(source_json);

    // create three.js representations of all particle source objects
    let source_group = new THREE.Group();
    currentScene.add(source_group);

    let particle_sources = make_sources(source_group, source_file_array);

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

    // need a better solution than multiple render calls ... they're essentially the same call
    // for each scene -> maybe in a higher-order function for particle scenes

	scene.userData.render = function ( time ) {

        // check for toggling axes
        axesHelper.visible = scene.userData.axesVisible;

        // check if we want sources visible
        source_group.visible = scene.userData.sourcesVisible;

        // check if we want vacuum outlines visible
        vacuum_group.visible = scene.userData.vacuumVisible;

		controls.update();

		composer.render();

	};

	// Controls

	var controls = new THREE.OrbitControls( scene.userData.camera, renderer.domElement );

	return scene;
}

