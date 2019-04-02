// Shape objects (aka media that particles interact with)
//
// mxo 2019

// go over file names and try and make Source objects from them
function make_shapes(scene_group, shape_files) {

    make_scene_objects(scene_group, shape_files, Shape);
}

// given a three.js group and a raw parsed shape object,
// add the three.js components needed to view it
function Shape(scene_group, raw_shape) {

    console.log(raw_shape);

    //return new THREE.
}
