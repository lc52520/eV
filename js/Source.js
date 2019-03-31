// Particle source objects
//
// mxo, March 2019

async function make_sources(scene, source_files) {
    //var source_array = Array(source_files.length);

    for (let i = 0; i < source_files.length; i++) {
        parse_source(scene, source_files[i]);
        //source_array[i] = await Source( await parse_source(source_files[i]) );
    }

    //return source_array;
}

// careful with this! should only pass vetted file names to it
async function parse_source(scene, source_json) {
    fetch(source_json)
        .then(response => response.json()) // parse string to json
        .then(json => Source(scene, json)); // add source to scene
    //console.log(source);
    //return source;
}

// given a raw parsed source object, add the three.js components needed to view
// it
function Source(scene, raw_source) {

    console.log(raw_source);

    var source_group = new THREE.Group();

    // check if the source has a shape (hopefully)
    if ( raw_source.hasOwnProperty("shape") ) {

        let source_shape = raw_source["shape"];

        if ( source_shape.hasOwnProperty("position") ) {

            let origin = new THREE.Vector3(source_shape.position.x,
                                           source_shape.position.y,
                                           source_shape.position.z);

            // if the particle source has a direction, add a direction helper
            if ( raw_source.hasOwnProperty("direction") ) {
                let direction = new THREE.Vector3(raw_source.direction.x,
                                                  raw_source.direction.y,
                                                  raw_source.direction.z);
                // normalize just in case
                direction.normalize();
                let len = 1000;
                var source_direction = new THREE.ArrowHelper(direction, origin, len);
                source_group.add(source_direction);

            } else {
                console.log("no source direction given");
            }
        } else {
            console.log("no source position given");
        }
    }

    scene.add(source_group);
    // return source_group;
}
