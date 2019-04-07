// particle track set object, can be queried for particle track
// updates

// When I was writing this, I first tried to base it off of the
// THREE.LightningStrike object by @author yomboprime
//
// As it turned out, the two objects have less in common than I thought,
// because the lighting strike parameters are made recursively (rays to subrays, etc).
// and using a random number generator.
//
// Instead, particle tracks follow set paths and (usually -- except for pair production)
// don't split recursively like lightning rays.
//
// Anyways, the update method is the only one that has anything in common with LightningStrike


// a TrackSet takes a collection of vertices and will draw them
TrackSet = function ( track_group ) {
    this.master_group = track_group;
    this.group = track_group;
    this.charge_array       = [];
    this.master_track_array = [];
    this.curr_track_array   = [];
    this.max_length = 0;
};

async function parse_track_file(file, track_set) {

    fetch(file)
        .then(response => response.json()) // parse string to json
        .then(json => make_track_sets(json, track_set)); // add source to source_group
}

function make_track_sets(track_data, track_set) {

    for (var i = 0; i < track_data.length; i++) {

        var mesh = makeTrackMesh(track_data[i].tracks, track_data[i].charge);

        track_set.group.add(mesh);
        track_set.add(track_data[i].tracks, track_data[i].charge);
    }
}

function makeTrackMesh(vertices, charge) {
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    var material = new THREE.LineBasicMaterial({ color: get_particle_colour(charge) });
    var mesh = new THREE.Line( geometry, material );
    return new THREE.Line(geometry, material);
}


TrackSet.prototype.add = function (track_verts, charge) {

    // full set of tracks
    this.master_track_array.push([...track_verts]);

    // charge colour for drawing
    this.charge_array.push(charge);

    // current display set for movies
    this.curr_track_array.push([...track_verts]);

    if (track_verts.length > this.max_length) { this.max_length = track_verts.length; }

    console.log("maximum track vertex array length: " + this.max_length);
}

// This method is very slow -> will have to move to a geometry shader in between
// vertex and fragment shader stages to speed it up
TrackSet.prototype.update = function (scene, timeStep) {

    // scale the timestep so we can see
    var track_step = Math.floor(timeStep / 30) % (this.max_length / 3);

    var first_index = track_step * 3;
    var last_index = first_index + 6;

    // get rid of old group if we're restarting
    if (first_index === 0) {
        scene.remove(this.group);
        this.group = new THREE.Group();
        scene.add(this.group);
    }

    // debug
    //console.log(track_step);
    //console.log("first " + first_index);
    //console.log("last " + last_index);

    // go over all tracks and try and draw them
    for (var i = 0; i < this.master_track_array.length; i++) {
        let currTrack = this.master_track_array[i];

        // draw the entire track
        if (last_index >= currTrack.length) {
            this.group.add(makeTrackMesh(currTrack, this.charge_array[i]));
        } else {
            this.group.add(makeTrackMesh(currTrack.slice(first_index,last_index), this.charge_array[i]));
        }
    }
}

TrackSet.prototype.reset = function (scene) {
    scene.remove(this.group);
    this.group = this.master_group.clone();
    scene.add(this.group);
}
