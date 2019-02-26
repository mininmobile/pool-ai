let Engine = Matter.Engine;
let World = Matter.World;
let Body = Matter.Body;
let Composite = Matter.Composite;
let Runner = Matter.Runner;
let Mouse = Matter.Mouse;
let Bodies = Matter.Bodies;
let Composites = Matter.Composites;

let canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;
document.body.appendChild(canvas);

// create engine
let engine = Engine.create();

engine.world.gravity.scale = 0;

let runner = Runner.create({
	delta: 1000 / 30,
	isFixed: false,
	enabled: true,
});

// create bodies
let walls = [
	Bodies.rectangle(250, 100, 300, 25, { isStatic: true }),
	Bodies.rectangle(100, 350, 25, 500, { isStatic: true }),
	Bodies.rectangle(250, 600, 300, 25, { isStatic: true }),
	Bodies.rectangle(400, 350, 25, 500, { isStatic: true }),
]

World.add(engine.world, walls);

let balls = Composites.pyramid(165, 275, 9, 8, 0, -40, (x, y) => {
	return Bodies.circle(x, y, 10, { label: y == 235 ? "eight" : "ball", render: { fillStyle: y == 235 ? "#000": undefined } });
});

World.add(engine.world, balls);

let poolBall = Bodies.circle(250, 500, 10, { label: "ball", render: { fillStyle: "#fff" } });
World.add(engine.world, poolBall);

Body.applyForce(poolBall, poolBall.position, { x: 0, y: -0.015 })

// start engine
Runner.run(runner, engine);

// start rendering
let ctx = canvas.getContext("2d");
ctx.lineWidth = 2;
ctx.font = "1em Arial";

(function render() {
	let bodies = Composite.allBodies(engine.world);

	window.requestAnimationFrame(render);

	ctx.fillStyle = "#161621";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < bodies.length; i += 1) {
		let body = bodies[i];
		let vertices = body.vertices;

		if (!body.render.visible) continue;

		if (body.label == "eight" || body.label == "ball") {
			ctx.beginPath();

			ctx.ellipse(body.position.x, body.position.y, body.circleRadius, body.circleRadius, 0, 0, Math.PI * 2);
		} else {
			ctx.beginPath();
	
			ctx.moveTo(vertices[0].x, vertices[0].y);
	
			for (let j = 1; j < vertices.length; j += 1) {
				ctx.lineTo(vertices[j].x, vertices[j].y);
			}
	
			ctx.lineTo(vertices[0].x, vertices[0].y);
		}
	
		ctx.fillStyle = body.render.fillStyle;

		ctx.fill();
	}
})();
