// main viewer script
//
// adapted from the three.js example "lightning strike"
// https://threejs.org/examples/webgl_lightningstrike.html
//
// mxo, March 2019

"use strict";

if ( WEBGL.isWebGLAvailable() === false ) {

	document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var container, stats;

var camera, scene, renderer, composer, gui;

var currentSceneIndex = 0;

var currentTime = 0;

var sceneCreators = [
	createPlasmaBallScene,
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

    // source parameters
    var sourceFolder = gui.addFolder( "Particle sources" )

    // visibility
    scene.userData.sourcesVisible = true;
	sourceFolder.add( scene.userData, "sourcesVisible" ).name( "Show particle sources" );

	sourceFolder.open();

////////////////////////////////////////////////////////////////////////////////

	//var sceneFolder = gui.addFolder( "Scene" );

	//scene.userData.sceneIndex = currentSceneIndex;

	//sceneFolder.add( scene.userData, 'sceneIndex', { "Electric Cones": 0, "Plasma Ball": 1, "Storm": 2 } ).name( 'Scene' ).onChange( function ( value ) {

	//	currentSceneIndex = value;

	//	createScene();

	//} );

	//scene.userData.timeRate = 1;
	//sceneFolder.add( scene.userData, 'timeRate', scene.userData.canGoBackwardsInTime ? -1 : 0, 1 ).name( 'Time rate' );

	//sceneFolder.open();

	var graphicsFolder = gui.addFolder( "Graphics" );

	graphicsFolder.add( scene.userData, "outlineEnabled" ).name( "Glow enabled" );

	//scene.userData.lightningColorRGB = [
	//	scene.userData.lightningColor.r * 255,
	//	scene.userData.lightningColor.g * 255,
	//	scene.userData.lightningColor.b * 255
	//];
	//graphicsFolder.addColor( scene.userData, 'lightningColorRGB' ).name( 'Color' ).onChange( function ( value ) {
	//	scene.userData.lightningMaterial.color.setRGB( value[ 0 ], value[ 1 ], value[ 2 ] ).multiplyScalar( 1 / 255 );
	//} );
	//scene.userData.outlineColorRGB = [
	//	scene.userData.outlineColor.r * 255,
	//	scene.userData.outlineColor.g * 255,
	//	scene.userData.outlineColor.b * 255
	//];
	//graphicsFolder.addColor( scene.userData, 'outlineColorRGB' ).name( 'Glow color' ).onChange( function ( value ) {
	//	scene.userData.outlineColor.setRGB( value[ 0 ], value[ 1 ], value[ 2 ] ).multiplyScalar( 1 / 255 );
	//} );

	//graphicsFolder.open();

	//var rayFolder = gui.addFolder( "Ray parameters" );

	//rayFolder.add( scene.userData.rayParams, 'straightness', 0, 1 ).name( 'Straightness' );
	//rayFolder.add( scene.userData.rayParams, 'roughness', 0, 1 ).name( 'Roughness' );
	//rayFolder.add( scene.userData.rayParams, 'radius0', 0.1, 10 ).name( 'Initial radius' );
	//rayFolder.add( scene.userData.rayParams, 'radius1', 0.1, 10 ).name( 'Final radius' );
	//rayFolder.add( scene.userData.rayParams, 'radius0Factor', 0, 1 ).name( 'Subray initial radius' );
	//rayFolder.add( scene.userData.rayParams, 'radius1Factor', 0, 1 ).name( 'Subray final radius' );
	//rayFolder.add( scene.userData.rayParams, 'timeScale', 0, 5 ).name( 'Ray time scale' );
	//rayFolder.add( scene.userData.rayParams, 'subrayPeriod', 0.1, 10 ).name( 'Subray period (s)' );
	//rayFolder.add( scene.userData.rayParams, 'subrayDutyCycle', 0, 1 ).name( 'Subray duty cycle' );

	//if ( scene.userData.recreateRay ) {

	//	// Parameters which need to recreate the ray after modification

	//	var raySlowFolder = gui.addFolder( "Ray parameters (slow)" );

	//	raySlowFolder.add( scene.userData.rayParams, 'ramification', 0, 15 ).step( 1 ).name( 'Ramification' ).onFinishChange( function () {

	//		scene.userData.recreateRay();

	//	} );

	//	raySlowFolder.add( scene.userData.rayParams, 'maxSubrayRecursion', 0, 5 ).step( 1 ).name( 'Recursion' ).onFinishChange( function () {

	//		scene.userData.recreateRay();

	//	} );

	//	raySlowFolder.add( scene.userData.rayParams, 'recursionProbability', 0, 1 ).name( 'Rec. probability' ).onFinishChange( function () {

	//		scene.userData.recreateRay();

	//	} );

	//	raySlowFolder.open();

	//}

	//rayFolder.open();

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	currentTime += scene.userData.timeRate * clock.getDelta();

	if ( currentTime < 0 ) {

		currentTime = 0;

	}

	scene.userData.render( currentTime );

}

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

	// Lights

	var ambientLight = new THREE.AmbientLight( 0x444444 );
	ballScene.add( ambientLight );
	scene.add( ambientLight );

	//var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	//light1.position.set( 1, 1, 1 );
	//ballScene.add( light1 );
	//scene.add( light1 );

	//var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	//light2.position.set( -0.5, 1, 0.2 );
	//ballScene.add( light2 );
	//scene.add( light2 );

    // Particle sources
    let source_file_array = [];
    let source_json = "examples/tantalum-plate/source.json";
    let source2 =     "examples/tantalum-plate/shifted.json";

    source_file_array.push(source_json);
    source_file_array.push(source2);

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

    shape_file_array.push(tantalum_box);

    let shape_group = new THREE.Group();
    ballScene.add(shape_group);

    let media = make_shapes(shape_group, shape_file_array);

    // TODO check if there's some race condition here because of async IO
    //console.log("printing all particle sources");
    //console.log(particle_sources);

    //for (let i = 0; i < particle_sources.length; i++) {
    //    //console.log(particle_sources[i]);
    //    ballScene.add(particle_sources[i]);
    //}

	// Plasma ball

	//scene.userData.lightningColor = new THREE.Color( 0xFFB0FF );
	//scene.userData.outlineColor = new THREE.Color( 0xFF00FF );

	//scene.userData.lightningMaterial =  new THREE.MeshBasicMaterial( { color: scene.userData.lightningColor, side: THREE.DoubleSide } );

	//var r = "textures/cube/Bridge2/";
	//var urls = [ r + "posx.jpg", r + "negx.jpg",
	//			 r + "posy.jpg", r + "negy.jpg",
	//			 r + "posz.jpg", r + "negz.jpg" ];

	//var textureCube = new THREE.CubeTextureLoader().load( urls );
	//textureCube.format = THREE.RGBFormat;
	//textureCube.mapping = THREE.CubeReflectionMapping;

	//var sphereMaterial = new THREE.MeshPhysicalMaterial( {
	//	transparent: true,
	//	depthWrite: false,
	//	opacity: 0.15,
	//	color: 0,
	//	metalness: 1,
	//	roughness: 0,
	//	reflectivity: 0,
	//	envMap: textureCube
	//} );

	//var sphereHeight = 300;
	//var sphereRadius = 200;

    // TODO fix for given shape size
	scene.userData.camera.position.set(100, 60, 50);
	//scene.userData.camera.position.set( 5 * sphereRadius, 2 * sphereHeight, 6 * sphereRadius );

	//var sphereMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( sphereRadius, 80, 40 ), sphereMaterial );
	//sphereMesh.position.set( 0, sphereHeight, 0 );
	//ballScene.add( sphereMesh );

	//var sphere = new THREE.Sphere( sphereMesh.position, sphereRadius );

	//var spherePlasma = new THREE.Mesh( new THREE.SphereBufferGeometry( sphereRadius * 0.05, 24, 12 ), scene.userData.lightningMaterial );
	//spherePlasma.position.copy( sphereMesh.position );
	//spherePlasma.scale.y = 0.6;
	//scene.add( spherePlasma );

	//var post = new THREE.Mesh(
	//	new THREE.CylinderBufferGeometry( sphereRadius * 0.06, sphereRadius * 0.06, sphereHeight, 6, 1, true ),
	//	new THREE.MeshLambertMaterial( { color: 0x020202 } )
	//);
	//post.position.y = sphereHeight * 0.5 - sphereRadius * 0.05 * 1.2;
	//scene.add( post );

	//var box = new THREE.Mesh( new THREE.BoxBufferGeometry( sphereHeight * 0.5, sphereHeight * 0.1, sphereHeight * 0.5 ), post.material );
	//box.position.y = sphereHeight * 0.05 * 0.5;
	//scene.add( box );

	//var rayDirection = new THREE.Vector3();
	//var rayLength = 0;
	//var vec1 = new THREE.Vector3();
	//var vec2 = new THREE.Vector3();

	//scene.userData.rayParams = {

	//	sourceOffset: sphereMesh.position,
	//	destOffset: new THREE.Vector3( sphereRadius, 0, 0 ).add( sphereMesh.position ),
	//	radius0: 4,
	//	radius1: 4,
	//	radius0Factor: 0.82,
	//	minRadius: 2.5,
	//	maxIterations: 6,
	//	isEternal: true,

	//	timeScale: 0.6,
	//	propagationTimeFactor: 0.15,
	//	vanishingTimeFactor: 0.87,
	//	subrayPeriod: 0.8,
	//	ramification: 5,
	//	recursionProbability: 0.8,

	//	roughness: 0.85,
	//	straightness: 0.7,

	//	onSubrayCreation: function ( segment, parentSubray, childSubray, lightningStrike ) {

	//		lightningStrike.subrayConePosition( segment, parentSubray, childSubray, 0.6, 0.9, 0.7 );

	//		// Sphere projection

	//		vec1.subVectors( childSubray.pos1, lightningStrike.rayParameters.sourceOffset );
	//		vec2.set( 0, 0, 0 );
	//		if ( lightningStrike.randomGenerator.random() < 0.7 ) {
	//			vec2.copy( rayDirection ).multiplyScalar( rayLength * 1.0865 );
	//		}
	//		vec1.add( vec2 ).setLength( rayLength );
	//		childSubray.pos1.addVectors( vec1, lightningStrike.rayParameters.sourceOffset );

	//	}

	//};

	//var lightningStrike;
	//var lightningStrikeMesh;
	//var outlineMeshArray = [];

    //outlineMeshArray = source_group.children;
    //console.log(outlineMeshArray);

	//scene.userData.recreateRay = function () {

	//	if ( lightningStrikeMesh ) {
	//		scene.remove( lightningStrikeMesh );
	//	}

	//	lightningStrike = new THREE.LightningStrike( scene.userData.rayParams );
	//	lightningStrikeMesh = new THREE.Mesh( lightningStrike, scene.userData.lightningMaterial );

	//	outlineMeshArray.length = 0;
	//	outlineMeshArray.push( lightningStrikeMesh );
	//	outlineMeshArray.push( spherePlasma );

	//	scene.add( lightningStrikeMesh );

	//}

	//scene.userData.recreateRay();

	// Compose rendering

	composer.passes = [];

	composer.addPass( new THREE.RenderPass( ballScene, scene.userData.camera ) );

	var rayPass = new THREE.RenderPass( scene, scene.userData.camera );
	rayPass.clear = false;
	composer.addPass( rayPass );

	var outlinePass = createOutline( scene, outlineMeshArray, scene.userData.outlineColor );

	scene.userData.render = function ( time ) {

        // check if we want sources visible
        source_group.visible = scene.userData.sourcesVisible;

		//rayDirection.subVectors( lightningStrike.rayParameters.destOffset, lightningStrike.rayParameters.sourceOffset );
		//rayLength = rayDirection.length();
		//rayDirection.normalize();

		//lightningStrike.update( time );

		controls.update();

		//outlinePass.enabled = scene.userData.outlineEnabled;
		outlinePass.enabled = true;

		composer.render();

	};

	// Controls

	var controls = new THREE.OrbitControls( scene.userData.camera, renderer.domElement );
	//controls.target.copy( sphereMesh.position );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;

	// Sphere mouse raycasting

	window.addEventListener( 'mousemove', onTouchMove );
	window.addEventListener( 'touchmove', onTouchMove );

	function onTouchMove( event ) {

		var x, y;

		if ( event.changedTouches ) {

			x = event.changedTouches[ 0 ].pageX;
			y = event.changedTouches[ 0 ].pageY;

		} else {

			x = event.clientX;
			y = event.clientY;

		}

		mouse.x = ( x / window.innerWidth ) * 2 - 1;
		mouse.y = - ( y / window.innerHeight ) * 2 + 1;

		checkIntersection();

	}

	var intersection = new THREE.Vector3();

	function checkIntersection() {

		raycaster.setFromCamera( mouse, scene.userData.camera );

		//var result = raycaster.ray.intersectSphere( sphere, intersection );

		//if ( result !== null ) {

		//	lightningStrike.rayParameters.destOffset.copy( intersection );

		//}

	}

	return scene;

}
