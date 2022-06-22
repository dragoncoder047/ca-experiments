class Beetle extends Ant {
    constructor(...args) {
        super(...args);
        this.drum = new Tone.PolySynth(Tone.MembraneSynth).toDestination();
    }
    do_play(arg) {
        this.drum.triggerAttackRelease(arg, "0.4n");
    }
}

class Cricket extends Ant {
    constructor(...args) {
        super(...args);
        this.synth = new Tone.PolySynth(Tone.AMSynth).toDestination();
    }
    do_play(arg) {
        this.synth.triggerAttackRelease(arg, "0.4n");
    }
}