function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

export function startAmbientSoundtrack() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  const context = new AudioCtx();
  const master = context.createGain();
  const masterFilter = context.createBiquadFilter();
  const activeIntervals = [];

  master.gain.value = 0.6;
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 2400; 
  master.connect(masterFilter);
  masterFilter.connect(context.destination);

  const bufferSize = context.sampleRate * 2;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const bpm = 78;
  const beatMs = (60 / bpm) * 1000;
  const sixteenth = beatMs / 4000;

  const chords = [
    [57, 60, 64, 67], // A minor 7
    [55, 59, 62, 66], // G major 7
    [53, 57, 60, 64], // F major 7
    [55, 59, 62, 66], // G major 7
  ];
  let chordIndex = 0;
  let tick = 0;
  let nextNoteTime = context.currentTime + 0.1;

  function playKick(time) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.5);
  }

  function playHat(time, velocity = 0.03) {
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "bandpass";
    filter.frequency.value = 8000;

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    noise.start(time);
    noise.stop(time + 0.1);
  }

  function playChord(notes, time) {
    notes.forEach((note) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(midiToFrequency(note), time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.1);
      gain.gain.setTargetAtTime(0.001, time + 0.4, 0.4);

      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + 2.5);
    });
  }

  function playPluck(note, time, velocity) {
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const pan = context.createStereoPanner();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(midiToFrequency(note), time);
    filter.type = "lowpass";
    filter.frequency.value = 1400;

    pan.pan.value = Math.random() * 1.2 - 0.6;

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(master);
    osc.start(time);
    osc.stop(time + 1.5);
  }

  function scheduleRhythm() {
    while (nextNoteTime < context.currentTime + 0.25) {
      const step = tick % 16;

      if (step === 0 || step === 10) {
        playKick(nextNoteTime);
      }

      if (step % 2 === 0) {
        playHat(nextNoteTime, step % 4 === 0 ? 0.025 : 0.01);
      }

      if (step === 4 || step === 12) {
        playHat(nextNoteTime, 0.06);
      }

      if (step === 0 || step === 6 || step === 14) {
        if (step === 0 || Math.random() > 0.4) {
          playChord(chords[chordIndex], nextNoteTime);
        }
      }

      if (step % 3 === 0 || step % 7 === 0) {
        if (Math.random() > 0.4) {
          const c = chords[chordIndex];
          const note = c[Math.floor(Math.random() * c.length)] + 12;
          playPluck(note, nextNoteTime, 0.04 + Math.random() * 0.03);
        }
      }

      tick++;
      if (tick % 16 === 0) {
        chordIndex = (chordIndex + 1) % chords.length;
      }

      nextNoteTime += sixteenth;
    }
  }

  scheduleRhythm();
  activeIntervals.push(window.setInterval(scheduleRhythm, 50));

  return {
    context,
    stop() {
      activeIntervals.forEach((id) => window.clearInterval(id));
      if (master && context) {
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(0.0001, context.currentTime, 0.3);
        window.setTimeout(() => {
          if (context.state !== 'closed') {
            context.close().catch(() => {});
          }
        }, 500);
      }
    },
  };
}
