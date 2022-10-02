const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;
const G = 2.5;
let bird_should_jump = false;
let wall_arr = [];
let stopAnimation = false;
let score = 0;

let app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x18181b,
});

document.getElementById("game").appendChild(app.view);

let bird = new PIXI.Sprite.from(PIXI.Texture.WHITE);
bird.width = 40;
bird.height = 40;
bird.tint = 0xff1b0a;
bird.x = bird.width;
bird.y = APP_HEIGHT - bird.height;
bird.speed = 0;

app.stage.addChild(bird);

let all_time = localStorage.getItem("score");
let txt_all_time;
if (all_time) {
  txt_all_time = app.stage.addChild(
    new PIXI.Text(`All time high: ${all_time}`, {
      fill: 0xffd700,
      align: "center",
    })
  );
  txt_all_time.anchor.set(0.5);
  txt_all_time.resolution = 8;
  txt_all_time.x = APP_WIDTH / 2;
  txt_all_time.y = APP_HEIGHT - 20;
}

const text = app.stage.addChild(
  new PIXI.Text(score, {
    fill: 0xffd700,
    align: "center",
  })
);
text.anchor.set(0.5);
text.resolution = 8;
text.x = APP_WIDTH / 2;
text.y = 20;

let game_interval = setInterval(() => {
  game();
}, 4);

window.addEventListener("keyup", (e) => {
  if (e.key == " ") {
    bird_should_jump = true;
  }
});

function game() {
  if (bird_should_jump) {
    bird_jump();
    remove_trails();
    bird_should_jump = false;
  }

  check_if_should_generate_new_wall();
  // move_wall();
  check_bird_hit_wall();

  console.log(bird.y, bird.speed);
  // console.log(bird.y, APP_HEIGHT - bird.height);
  if (bird.y <= APP_HEIGHT - bird.height) {
    bird.y += bird.speed;
  }

  if (bird.y != APP_HEIGHT - bird.height) bird.speed += G;
}

generate_wall();

function bird_jump() {
  let count = 0;
  leave_trails();
  let x = setInterval(() => {
    if (count > 5 || bird.y <= 0 || stopAnimation) return clearInterval(x);
    bird.speed -= 5;
    // console.log(bird.speed);
    // if (count <= 40) bird.speed -= 3;
    // else if (count <= 50) bird.speed -= 2;
    // else bird.speed--;
    count++;
  }, 4);
}

function leave_trails() {
  for (let i = bird.x; i < bird.x + bird.width; i += 5) {
    let trail = new PIXI.Sprite.from(PIXI.Texture.WHITE);
    trail.width = 1;
    trail.height = 30;
    trail.tint = 0xff1b0a;
    trail.x = i;
    trail.y = bird.y + bird.height;
    trail.sign = "TRAIL";
    app.stage.addChild(trail);
  }
}

function remove_trails() {
  for (let i = 0; i < app.stage.children.length; i++) {
    if (app.stage.children[i].sign == "TRAIL") {
      let interval = setInterval(() => {
        if (
          app.stage.children[i].y >=
          APP_HEIGHT + app.stage.children[i].height
        ) {
          //   app.stage.children.splice(i, 1);
          return clearInterval(interval);
        }
        app.stage.children[i].y += 5;
      }, 10);
    }
  }
}

function generate_wall() {
  // choose random y

  let y = Math.floor(Math.random() * (APP_HEIGHT - 0 + 1)) + 0;

  let wall_up = new PIXI.Sprite.from(PIXI.Texture.WHITE);
  wall_up.width = 30;
  if (y - 100 < 0) wall_up.height = 0;
  else wall_up.height = y - 100;
  wall_up.tint = 0xffffff;
  wall_up.x = APP_WIDTH + wall_up.width;
  wall_up.y = 0;
  app.stage.addChild(wall_up);

  let wall_down = new PIXI.Sprite.from(PIXI.Texture.WHITE);
  wall_down.width = 30;
  wall_down.height = APP_HEIGHT;
  wall_down.tint = 0xffffff;
  wall_down.x = APP_WIDTH + wall_down.width;
  wall_down.y = y + 100;
  app.stage.addChild(wall_down);

  wall_arr.push([wall_up, wall_down]);
}

function move_wall() {
  for (let j = 0; j < wall_arr.length; j++) {
    wall_arr[j][0].x--;
    wall_arr[j][1].x--;
  }
}

function check_if_should_generate_new_wall() {
  if (!wall_arr[wall_arr.length - 1]) return;
  if (wall_arr[wall_arr.length - 1][0].x <= APP_WIDTH / 2) generate_wall();
}

function check_bird_hit_wall() {
  for (let i = 0; i < wall_arr.length; i++) {
    if (
      wall_arr[i].sign != "PASS" &&
      bird.x > wall_arr[i][0].x + wall_arr[i][0].width
    ) {
      score++;
      if (score > all_time) {
        localStorage.setItem("score", score);
      }
      text.text = score;
      wall_arr[i].sign = "PASS";
    }

    if (
      (bird.x + bird.width >= wall_arr[i][0].x &&
        bird.x + bird.width <= wall_arr[i][0].x + wall_arr[i][0].width) ||
      (bird.x >= wall_arr[i][0].x &&
        bird.x <= wall_arr[i][0].x + wall_arr[i][0].width)
    ) {
      // same x

      // check wall_up
      if (wall_arr[i][0].height > 0 && bird.y <= wall_arr[i][0].height) {
        clearInterval(game_interval);
        stopAnimation = true;
        restart();
      }

      // check wall_down
      if (bird.y + bird.height >= wall_arr[i][1].y) {
        clearInterval(game_interval);
        stopAnimation = true;
        restart();
      }
    }
  }
}

function restart() {
  const reset_text = app.stage.addChild(
    new PIXI.Text(`Game will reset in 1.5 seconds...`, {
      fill: 0xffd700,
      align: "center",
    })
  );
  reset_text.anchor.set(0.5);
  reset_text.resolution = 8;
  reset_text.x = APP_WIDTH / 2;
  reset_text.y = APP_HEIGHT / 2;

  setTimeout(() => {
    window.location.reload();
  }, 1500);
}
