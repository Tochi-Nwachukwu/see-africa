const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')


const audio = new Audio('data/audio/file-1.mp3');
audio.controls = true;

document.body.style.backgroundColor = "#232022"


window.addEventListener("load", initMp3Player, false);
document.body.addEventListener("mousemove", function () {
  audio.play()
  audio.controls = true;
});

var fbc_array;
var analyser;
var source;
var audioContext;


function initMp3Player() {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  // reroute the audio into the processing graph of the AudioContext;

  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  frameLooper();

}

function frameLooper() {
  window.requestAnimationFrame(frameLooper)
  fbc_array = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbc_array)
  console.log(-(Math.max(...fbc_array) + 30) - (Math.min(...fbc_array) + 30))
}

const settings = {
  dimensions: [window.innerWidth, window.innerHeight],
  animate: true
};


// const animate = () => {
//   console.log('domestika');
//   requestAnimationFrame(animate);
// }

// animate()

const sketch = ({ context, width, height }) => {

  const agents = [];
  for (let i = 0; i < 60; i++) {

    const x = random.range(0, width)
    const y = random.range(0, height)
    agents.push(new Agent(x, y))
  }

  return ({ context, width, height }) => {
    context.fillStyle = '#232022';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j]
        const dist = agent.pos.getDistance(other.pos)

        if (dist > 200) continue;

        context.lineWidth = math.mapRange(dist, 0, 200, 12, 1);
        context.strokeStyle = 'white'
        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();

      }
    }


    agents.forEach(agent => {
      agent.update((Math.max(...fbc_array) + 30) - 30)
      agent.draw(context)
      agent.bounce(width, height)
    })

  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;

    return Math.sqrt(dx * dx + dy * dy)
  }
}

class Agent {
  constructor(x, y) {

    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1))
    this.radius = random.range(4, 12);

  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1;

    if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1;

  }

  update(audio) {
    this.pos.x += this.vel.x * audio * 0.1;
    this.pos.y += this.vel.y * audio * 0.1;
  }
  draw(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y);

    context.lineWidth = 4
    context.fillStyle = "white";
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);

    context.fill();
    context.stroke();
    context.restore();
  }
}

