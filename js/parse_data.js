// General parser functions for simulation JSON data
//
// mxo 2019

// go over file names and try and make three.js objects from them
function make_scene_objects(scene_group, data_files, data_cstor) {

    for (let i = 0; i < data_files.length; i++) {
        parse_simulation_data(scene_group, data_files[i], data_cstor);
    }
}

// For each file, make a three.js representation asynchronously
// -- wanted to use the nice fetch API
// -- other shapes can render while waiting
//
// careful with this! should only pass vetted file names to it
async function parse_simulation_data(scene_group, object_json_file, data_cstor) {

    fetch(object_json_file)
        .then(response => response.json()) // parse string to json
        .then(json => data_cstor(scene_group, json)); // add source to source_group
}
