// Particle source objects
//
// mxo, March 2019

// go over file names and try and make Source objects from them
function make_sources(source_group, source_files, outlineMeshArray) {

    make_scene_objects(source_group, source_files, Source, outlineMeshArray);
}

// given a three.js group and a raw parsed source object,
// add the three.js components needed to view it
function Source(source_group, raw_source, outlineMeshArray) {

    console.log(raw_source);


    // check for the source's charge (must have one)
    if (! raw_source.hasOwnProperty("charge")) {
        // TODO print source property types
        console.log("no charge for source: " + raw_source + "; aborting");
        return;
    }

    let particle_colour = get_particle_colour(raw_source["charge"]);

    // check if the source has a shape (hopefully)
    // currently can't handle IAEA phsp files as they don't have regular shapes
    if (! raw_source.hasOwnProperty("shape")) {
        // TODO print source property types
        console.log("no shape property for source: ");
        return;
    }

    // continue property check with the inner shape object of the source
    let source_shape = raw_source["shape"];

    if (! source_shape.hasOwnProperty("position")) {
        console.log("no shape position for source: ");
        return;
    }

    // add a solid shape to represent the source
    source_group.add( make_source_shape(source_shape, particle_colour, outlineMeshArray) );

    // if the particle source has a direction, add a direction helper
    if ( raw_source.hasOwnProperty("direction") ) {
        let direction = new THREE.Vector3(raw_source.direction.x,
                                          raw_source.direction.y,
                                          raw_source.direction.z);

        let origin = get_shape_origin(source_shape);
        source_group.add( make_direction_helper(direction, origin, particle_colour) );

    } else {
        console.log("no direction property for source: ");
    }

    // check if the source is isotropic
    if ( raw_source.hasOwnProperty("type") ) {
        switch (raw_source["type"]) {

        case "point_source":
            let origin = get_shape_origin(source_shape);
            let dir_helpers = [];
            dir_helpers.push(new THREE.Vector3(1,0,0));
            dir_helpers.push(new THREE.Vector3(-1,0,0));
            dir_helpers.push(new THREE.Vector3(0,1,0));
            dir_helpers.push(new THREE.Vector3(0,-1,0));
            dir_helpers.push(new THREE.Vector3(0,0,1));
            dir_helpers.push(new THREE.Vector3(0,0,-1));

            for (let i = 0; i < dir_helpers.length; i++) {
                source_group.add(make_direction_helper(dir_helpers[i], origin));
            }

            break;
        default:
            console.log("unknown source type: " + raw_source["type"]);

        }
    }
}

// make particle source shape
// Assumes that given shapes have an origin
function make_source_shape(source_shape, particle_colour, outlineMeshArray) {

    // add to shape cstors as required
    if (! source_shape.hasOwnProperty("type")) {
        console.log("no type given for source shape, cannot build source object");
        return;
    }

    // three.js shape needs a material and a mesh
    let shape;

    // all sources have the same colour for now
    let material = new THREE.MeshBasicMaterial( {color: particle_colour} );

    switch( source_shape["type"] ) {

        case "point":
            let radius = 0.25;
            let origin = get_shape_origin(source_shape);
            var geometry = new THREE.SphereGeometry( radius );
            shape = new THREE.Mesh( geometry, material );
            console.log(get_shape_origin(source_shape));
            shape.position.set(origin.x, origin.y, origin.z);

            break;

        default:
            console.log("unsupported source shape type: " + source_shape["type"]);
            return;
    }

    outlineMeshArray.push(shape);

    return shape;
}

// direction helper setup
function make_direction_helper(direction, origin, colour) {
    // normalize just in case
    direction.normalize();
    let len = 3; // arbitrary for now
    //let colour = 0xffff00; // default yellow colour
    return new THREE.ArrowHelper(direction, origin, len, colour);
}

// get origin of a shape with a given position
function get_shape_origin(source_shape) {
    if (! source_shape.hasOwnProperty("position")) {
        console.log("no position given for source: ");
        return;
    }

    // careful -> assume here that all positions have xyz coords
    return new THREE.Vector3(source_shape.position.x,
                             source_shape.position.y,
                             source_shape.position.z);
}

// match particles to arbitrary colours
function get_particle_colour(charge_number) {
    let colour = 0x000000;
    switch (charge_number) {
        // electrons
        case -1:
            colour = 0x9afeff;
            break;
        case 0:
            colour = 0xffff00;
            break;
        default:
            console.log("unhandled charge: " + charge_number);
    }
    return colour;
}
// error reporting using strings
function source_creation_error(preamble, source_obj) {}
