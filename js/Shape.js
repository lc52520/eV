// Shape objects (aka media that particles interact with)
//
// mxo 2019

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
    let vacuumFlag;

    switch( raw_shape["type"] ) {

        case "slab":
            var shape_data = make_slab(raw_shape);
            //console.log(shape_data);
            shape = shape_data.shape;
            vacuumFlag = shape_data.vacuumFlag;

            let origin = get_shape_origin(raw_shape);
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

// memoized material lookup, can change in the GUI
function match_material(medium_name) {

    let material;

    switch (medium_name) {
        case "tantalum":
            material = new THREE.MeshBasicMaterial( {color: 0x78FF78} );
            //material = new THREE.MeshPhysicalMaterial( {color: 0x78FF78, roughness: 0.5, metalness: 1, lights: true} );
    }

    return material;
}
