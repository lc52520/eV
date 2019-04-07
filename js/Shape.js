// Shape objects (aka media that particles interact with)
//
// mxo 2019

// global material array for memoized material colours
let material_array = {};

// go over file names and try and make Source objects from them
function make_shapes(scene_group, vacuum_group, shape_files) {

    make_scene_objects(scene_group, shape_files, Shape, vacuum_group);
}

// given a three.js group and a raw parsed shape object,
// add the three.js components needed to view it
function Shape(scene_group, raw_shape, vacuum_group) {

    console.log(raw_shape);

    if (! raw_shape.hasOwnProperty("type")) {
        console.log("no type property for medium: ");
        return;
    }

    let shape;
    let origin;
    let vacuumFlag;

    switch( raw_shape["type"] ) {

        case "slab":
            var shape_data = make_slab(raw_shape);
            //console.log(shape_data);
            shape = shape_data.shape;
            vacuumFlag = shape_data.vacuumFlag;

            origin = get_shape_origin(raw_shape);
            shape.position.set(origin.x, origin.y, origin.z);
            break;

        case "cylinder":
            var shape_data = make_cylinder(raw_shape);
            shape = shape_data.shape;
            vacuumFlag = shape_data.vacuumFlag;

            origin = get_shape_origin(raw_shape);
            shape.position.set(origin.x, origin.y, origin.z);
            break; // looks weird but if return is ever taken out we'll be safe

        default:
            console.log("unsupported shape type: " + raw_shape["type"]);
            return;
    }

    if (vacuumFlag) {
        vacuum_group.add(shape);
        return;
    }

    // otherwise
    scene_group.add(shape);

}

function make_slab(raw_shape) {

    let material = new THREE.MeshBasicMaterial( {color: 0xcccccc} );

    let vacuumFlag = false; // vacuum shapes are rendered differently

    // check if a medium exists
    if (! raw_shape.hasOwnProperty("medium")) {
        console.log("no medium given, using default material colour");
    } else {
        let medium = raw_shape["medium"];
        material = match_material(medium);

        if (medium === "vacuum") { vacuumFlag = true; }
    }

    let geometry;

    if (! raw_shape.hasOwnProperty("dimensions")) {
        console.log("no dimensions given for slab, aborting");
        return;
    }

    geometry = new THREE.BoxGeometry(raw_shape["dimensions"].width,
                                     raw_shape["dimensions"].height,
                                     raw_shape["dimensions"].depth);

    // vacuum shapes are handled differently
    if (vacuumFlag) {
      let edges = new THREE.EdgesGeometry( geometry );
      return {
          shape: new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0xffffff })),
          vacuumFlag: true
      };
    }

    // make the slab
    return {
        shape: new THREE.Mesh(geometry, material),
        vacuumFlag: false
    };
}

function make_cylinder(raw_shape) {

    let material = new THREE.MeshBasicMaterial( {color: 0xcccccc} );

    let vacuumFlag = false; // vacuum shapes are rendered differently

    // check if a medium exists
    if (! raw_shape.hasOwnProperty("medium")) {
        console.log("no medium given, using default material colour");
    } else {
        let medium = raw_shape["medium"];
        material = match_material(medium);

        if (medium === "vacuum") { vacuumFlag = true; }
    }

    let geometry;

    if (! raw_shape.hasOwnProperty("dimensions")) {
        console.log("no dimensions given for slab, aborting");
        return;
    }

    geometry = new THREE.CylinderGeometry(raw_shape["dimensions"].radius,
                                          raw_shape["dimensions"].radius,
                                          raw_shape["dimensions"].height,
                                          32);

    // vacuum shapes are handled differently
    if (vacuumFlag) {
      let edges = new THREE.EdgesGeometry( geometry );
      return {
          shape: new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0xffffff })),
          vacuumFlag: true
      };
    }

    // make the slab
    return {
        shape: new THREE.Mesh(geometry, material),
        vacuumFlag: false
    };
}


// material lookup, goal was to change in the GUI
function match_material(medium_name) {


    let material;

    switch (medium_name) {
        case "tantalum":
            //material = new THREE.MeshBasicMaterial( {color: 0x222222} );
            material = add_material_color_to_gui({color: 0x222222}, "Tantalum");

            // couldn't get metal lighting working... always was solid black
            // -- I thought it was a lighting issue but adding lights didn't seem to change the colour
            //material = new THREE.MeshPhysicalMaterial( {color: 0x78FF78, roughness: 0.5, metalness: 1, lights: true} );
            break;

        case "water":
            material = new THREE.MeshBasicMaterial( {color: 0x00DCFF, transparent: true, opacity: 0.3} );
            //add_material_color_to_gui({color: 0x00DCFF, transparent: true, opacity: 0.3}, "Water");
            add_material_color_to_gui(material, "Water");
            break;

        default:
            console.log("unknown material: " + medium_name + " ; using default material");
            material = new THREE.MeshBasicMaterial( {color: 0xcccccc} );
            add_material_color_to_gui(material, "Water");

    }

    return material;
}


// uses the global gui object to add the material colours as they are required
function add_material_color_to_gui (material_color, material_name) {

    // if the material is already loaded, return it
    if (material_array.hasOwnProperty(material_name)) {
        return material_array[material_name];
    }

    // otherwise, make a new material and add it to the gui

    let color_str = material_name + "ColorRGB";

    // add the material to the array
    let material = new THREE.MeshBasicMaterial(material_color);

    material_array[material_name] = material;

    // NOTE: using global scene and gui parameters here
    // --> idea was to avoid pass-through parameters in favour of direct
    // asynchronous access to the scene
    scene.userData[color_str] = [
        material.color.r * 255,
        material.color.g * 255,
        material.color.b * 255
    ];

    material_gui.addColor( scene.userData, color_str ).name( material_name + ' color' ).onChange( function ( value ) {
        material.color.setRGB( value[ 0 ], value[ 1 ], value[ 2 ] ).multiplyScalar( 1 / 255 );
    } );

    return material_array[material_name];
}
