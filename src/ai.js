let Events = Matter.Events;
let Engine = Matter.Engine;
let Runner = Matter.Runner;
let World = Matter.World;
let Body = Matter.Body;
let Composite = Matter.Composite;
let Bodies = Matter.Bodies;
let Composites = Matter.Composites;

let canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;
document.body.appendChild(canvas);

// ai configuration
let layers = 100;
let iterations = 1;

// create engines
let bestEngine;
let engines = [];
let runners = [];

for (let i = 0; i < layers; i++) {
	let engine = Engine.create();
	engines.push(engine);

	engine.best = 0;
	engine.enableSleeping = true;
	engine.world.gravity.scale = 0;

	Events.on(engine, "collisionActive", (e) => {
		e.pairs.forEach((pair) => {
			if (pair.bodyA.label == "hole" || pair.bodyB.label == "hole") {
				let hole = pair.bodyA.label == "hole" ? pair.bodyA : pair.bodyB;
				let ball = pair.bodyA.label == "hole" ? pair.bodyB : pair.bodyA;

				World.remove(engine.world, ball);

				engine.best++;
			}
		});
	});

	let runner = Runner.create({
		delta: 1000 / 30,
		isFixed: false,
		enabled: true,
	});
	runners.push(runner);

	{ // create holes
		let holes = [
			Bodies.rectangle(250, 123, 300, 25,  { label: "hole", isStatic: true, isSensor: true, render: { fillStyle: "#000" } }),
			Bodies.rectangle(250, 577, 300, 25,  { label: "hole", isStatic: true, isSensor: true, render: { fillStyle: "#000" } }),
			Bodies.rectangle(123, 350, 25,  500, { label: "hole", isStatic: true, isSensor: true, render: { fillStyle: "#000" } }),
			Bodies.rectangle(377, 350, 25,  500, { label: "hole", isStatic: true, isSensor: true, render: { fillStyle: "#000" } }),
		]

		World.add(engine.world, holes);
	}

	{ // create world
		let walls = [
			Bodies.rectangle(250, 100, 325, 25,  { label: "wall", isStatic: true }),
			Bodies.rectangle(250, 600, 325, 25,  { label: "wall", isStatic: true }),
			Bodies.rectangle(100, 350, 25,  500, { label: "wall", isStatic: true }),
			Bodies.rectangle(400, 350, 25,  500, { label: "wall", isStatic: true }),

			Bodies.trapezoid(250, 123, 220, 25, toRad(15), { label: "wall", angle: toRad(180), isStatic: true }),
			Bodies.trapezoid(123, 245, 210, 25, toRad(15), { label: "wall", angle: toRad(90), isStatic: true }),
			Bodies.trapezoid(123, 455, 210, 25, toRad(15), { label: "wall", angle: toRad(90), isStatic: true }),
			Bodies.trapezoid(377, 245, 210, 25, toRad(15), { label: "wall", angle: toRad(-90), isStatic: true }),
			Bodies.trapezoid(377, 455, 210, 25, toRad(15), { label: "wall", angle: toRad(-90), isStatic: true }),
			Bodies.trapezoid(250, 577, 220, 25, toRad(15), { label: "wall", isStatic: true }),
		]

		World.add(engine.world, walls);
	}

	// create balls
	let balls = Composites.pyramid(165, 275, 9, 8, 0, -40, (x, y) => {
		return Bodies.circle(x, y, 10, { label: y == 235 ? "eight" : "ball", render: { fillStyle: y == 235 ? "#000": undefined } });
	});

	World.add(engine.world, balls);

	let cueBall = Bodies.circle(250, 500, 10, { label: "cueball", render: { fillStyle: "#fff" } });
	World.add(engine.world, cueBall);

	Body.applyForce(cueBall, cueBall.position, { x: ((Math.random() - 0.5) * 2) / 100, y: (Math.random() * -1.5) / 100 });

	// start
	Runner.run(runner, engine);
}

// start rendering
let ctx = canvas.getContext("2d");
ctx.lineWidth = 2;
ctx.font = "1em Arial";

(function render() {
	window.requestAnimationFrame(render);

	ctx.fillStyle = "#161621";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < engines.length; i += 1) {
		let engine = engines[i];

		let bodies = Composite.allBodies(engine.world);

		for (let u = 0; u < bodies.length; u += 1) {
			let body = bodies[u];
			let vertices = body.vertices;

			if (!body.render.visible) continue;
			if ((body.label == "hole" || body.label == "wall") && i != 0) continue;

			if (body.label == "eight" || body.label == "ball" || body.label == "cueball") {
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
	}
})();

setTimeout(() => {
	let best = 0;

	engines.forEach((e, i) => {
		if (e.best > best) {
			best = e.best;
			bestEngine = e;
		}

		Runner.stop(runners[i]);
	});

	engines = [bestEngine];
	console.log(best);
}, 15000);

function toDeg(angle) {
	return angle * (180/Math.PI)
}

function toRad(angle) {
	return angle * (Math.PI/180)
}
