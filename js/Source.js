// Particle source objects
//
// mxo, March 2019

// go over file names and try and make Source objects from them
function make_sources(source_group, source_files) {

    for (let i = 0; i < source_files.length; i++) {
        parse_source(source_group, source_files[i]);
    }
}

// For each file, make a Source asynchronously
// -- wanted to use the nice fetch API
// -- other shapes can render while waiting
//
// careful with this! should only pass vetted file names to it
async function parse_source(source_group, source_json) {

    fetch(source_json)
        .then(response => response.json()) // parse string to json
        .then(json => Source(source_group, json)); // add source to source_group
}

// given a three.js group and a raw parsed source object,
// add the three.js components needed to view it
function Source(source_group, raw_source) {

    console.log(raw_source);

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
    source_group.add( make_source_shape(source_shape) );

    // if the particle source has a direction, add a direction helper
    if ( raw_source.hasOwnProperty("direction") ) {
        let direction = new THREE.Vector3(raw_source.direction.x,
                                          raw_source.direction.y,
                                          raw_source.direction.z);

        let origin = get_shape_origin(source_shape);
        source_group.add( make_direction_helper(direction, origin) );

    } else {
        console.log("no direction property for source: ");
    }
}

// make particle source shape
// Assumes that given shapes have an origin
function make_source_shape(source_shape) {
    let origin = get_shape_origin(source_shape);

    // add to shape cstors as required
    if (! source_shape.hasOwnProperty("type")) {
        console.log("no type given for source shape, cannot build source object");
        return;
    }



    switch( source_shape["type"] ) {

        case "point":

            break;

        default:
            console.log("unsupported source shape type: " + source_shape["type"]);
    }
}

// direction helper setup
function make_direction_helper(direction, origin) {
    // normalize just in case
    direction.normalize();
    let len = 10; // arbitrary for now
    let colour = 0xffff00; // default yellow colour
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

// error reporting using strings
function source_creation_error(preamble, source_obj) {}
