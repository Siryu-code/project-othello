var N = 8;
var DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
var grid, turn, over;
var mode, aiColor, level;
var aiTimer;

mode = "black";
level = "easy"

function $(id) {
  return document.getElementById(id);
}
var boardEl = $("board");

function name(p) {
  return p === 1 ? "Hitam" : "Putih";
}
function inside(y, x) {
  return y >= 0 && y < N && x >= 0 && x < N;
}

function init() {
  clearTimeout(aiTimer);
  grid = [];
  for (var r = 0; r < N; r++) {
    grid.push([]);
    for (var c = 0; c < N; c++) grid[r].push(0);
  }
  grid[3][3] = 2;
  grid[4][4] = 2;
  grid[3][4] = 1;
  grid[4][3] = 1;
  turn = 1;
  over = false;
  render("");
  maybeAITurn();
}

// Mengembalikan daftar bidak lawan yang akan terbalik jika pemain p menaruh di (r,c)
function flips(r, c, p) {
  var out = [];
  if (grid[r][c] !== 0) return out;
  for (var i = 0; i < DIRS.length; i++) {
    var dr = DIRS[i][0],
      dc = DIRS[i][1];
    var line = [];
    var y = r + dr,
      x = c + dc;
    while (inside(y, x) && grid[y][x] === 3 - p) {
      line.push([y, x]);
      y += dr;
      x += dc;
    }
    if (line.length > 0 && inside(y, x) && grid[y][x] === p) {
      out = out.concat(line);
    }
  }
  return out;
}

function hasMove(p) {
  for (var r = 0; r < N; r++) {
    for (var c = 0; c < N; c++) {
      if (flips(r, c, p).length > 0) return true;
    }
  }
  return false;
}

function validMoves(p) {
  var moves = [];
  for (var r = 0; r < N; r++) {
    for (var c = 0; c < N; c++) {
      if (flips(r, c, p).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function pickMove(moves) {
  var randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

function maybeAITurn() {
  if (over || turn !== aiColor) return;

  aiTimer = setTimeout(function () {
    if (over || turn !== aiColor) return;

    var moves = validMoves(aiColor);
    var move = pickMove(moves);

    if (move) {
      play(move[0], move[1]);
    }
  }, 600);
}

function bindOpt(btn) {
  btn.onclick = function () {
    var siblings = btn.parentElement.querySelectorAll(".opt");

    for (var i = 0; i < siblings.length; i++) {
      siblings[i].classList.remove('sel');
    }

    btn.classList.add("sel");

    var modeVal = btn.getAttribute("data-mode");
    var levelVal = btn.getAttribute("data-level");

    if (modeVal !== null) {
      mode = modeVal;

      var levelBox = document.getElementById("levelBox");
      if (mode === "two") {
        levelBox.classList.add('hidden');
      } else {
        levelBox.classList.remove("hidden");
      }
    }

    if (levelVal !== null) {
      level = levelVal;
    }
  };
}

var optButtons = document.querySelectorAll(".opt");
for (var i = 0; i < optButtons.length; i++) {
  bindOpt(optButtons[i]);
}

document.getElementById("start").onclick = function () {
  if (mode === "two") {
    aiColor = 0;
  } else if (mode === "black") {
    aiColor = 2;
  } else if (mode === "white") {
    aiColor = 1;
  }
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  init();
};

document.getElementById("menu").onclick = function () {
  clearTimeout(aiTimer);

  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("game").classList.add("hidden");
};

function play(r, c) {
  if (over) return;
  var f = flips(r, c, turn);
  if (f.length === 0) return;

  grid[r][c] = turn;
  for (var i = 0; i < f.length; i++) grid[f[i][0]][f[i][1]] = turn;

  var next = 3 - turn;
  var note = "";
  if (hasMove(next)) {
    turn = next;
  } else if (hasMove(turn)) {
    note = name(next) + " tidak punya langkah, giliran dilewati.";
  } else {
    over = true;
  }
  render(note);
  maybeAITurn();
}

function setOn(el, on) {
  if (on) el.classList.add("on");
  else el.classList.remove("on");
}

// Fungsi terpisah supaya r dan c "terkunci" untuk tiap tombol (hindari masalah closure di dalam loop var)
function makeCell(r, c) {

  var v = grid[r][c];
  var cell = document.createElement("button");
  cell.className = "c";
  cell.setAttribute("role", "gridcell");
  cell.setAttribute("aria-label", "Baris " + (r + 1) + " kolom " + (c + 1));
  
  if (v) {
    var d = document.createElement("span");
    d.className = "d " + (v === 1 ? "b" : "w");
    cell.appendChild(d);
  } else if (!over && turn !== aiColor && flips(r, c, turn).length > 0) {
    cell.classList.add("ok");
  }

  cell.onclick = function () {
    if (turn !== aiColor) {
      play(r, c);
    }
  };
  return cell;
}

function render(note) {
  boardEl.innerHTML = "";
  var b = 0,
    w = 0;
  for (var r = 0; r < N; r++) {
    for (var c = 0; c < N; c++) {
      if (grid[r][c] === 1) b++;
      if (grid[r][c] === 2) w++;
      boardEl.appendChild(makeCell(r, c));
    }
  }
  $("sb").textContent = b;
  $("sw").textContent = w;
  setOn($("pb"), !over && turn === 1);
  setOn($("pw"), !over && turn === 2);

  var text;
  if (over) {
    if (b === w) text = "Seri " + b + "-" + w + ".";
    else
      text =
        (b > w ? "Hitam" : "Putih") +
        " menang " +
        Math.max(b, w) +
        "-" +
        Math.min(b, w) +
        ".";
  } else {
    text = note || "Giliran " + name(turn) + ".";
  }
  $("msg").textContent = text;
}

$("reset").onclick = init;