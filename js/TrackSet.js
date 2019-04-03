// particle track set object, can be queried for particle track
// updates

// based off of the THREE.LightningStrike object by @author yomboprime

async function parse_track_file(file, track_set) {

    fetch(file)
        .then(response => response.json()) // parse string to json
        .then(json => make_track_sets(json, track_set)); // add source to source_group
}

function make_track_sets(track_data, track_set) {

    for (var i = 0; i < track_data.length; i++) {

        //console.log(track_data[i].tracks);

        //var geometry = new THREE.BufferGeometry();
        //geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( track_data[i].tracks, 3 ) );
        ////geometry.computeBoundingSphere();

        //var material = new THREE.LineBasicMaterial({ color: get_particle_colour(track_data[i].charge) });
        //var mesh = new THREE.Line( geometry, material );

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


TrackSet = function ( track_group ) {
    this.master_group = track_group;
    this.group = track_group;
    this.charge_array       = [];
    this.master_track_array = [];
    this.curr_track_array   = [];
    this.max_length = 0;
};

TrackSet.prototype.add = function (track_verts, charge) {

    // full set of tracks
    this.master_track_array.push([...track_verts]);

    // charge colour for drawing
    this.charge_array.push(charge);

    // current display set for movies
    this.curr_track_array.push([...track_verts]);

    if (track_verts.length > this.max_length) { this.max_length = track_verts.length; }

    console.log(this.max_length);
}

TrackSet.prototype.update = function (scene, timeStep) {

    // get rid of old scene
    scene.remove(this.group);

    // scale the timestep so we can see
    var track_step = Math.floor(timeStep / 30) % (this.max_length / 3);

    var last_index = (track_step + 1) * 3;

    console.log(track_step);
    console.log(last_index);

    this.group = new THREE.Group();

    // go over all tracks and try and draw them
    for (var i = 0; i < this.master_track_array.length; i++) {
        let currTrack = this.master_track_array[i];

        // draw the entire track
        if (last_index >= currTrack.length) {
            this.group.add(makeTrackMesh(currTrack, this.charge_array[i]));
        } else {
            this.group.add(makeTrackMesh(currTrack.slice(0,last_index), this.charge_array[i]));
        }
    }



    // refresh with new scene
    scene.add(this.group);
}

TrackSet.prototype.reset = function (scene) {
    scene.remove(this.group);
    this.group = this.master_group.clone();
    scene.add(this.group);
}
