const body = document.querySelector("body");
const matrix = document.querySelector("#matrix");
const list = document.querySelector("ul");

(function rotate() {
  var rotation = 0;
  setInterval(() => {
    rotation = (rotation + 0.35) % 360;
    body.style.background = `linear-gradient(${rotation}deg, #1e1f28, #2c3064, #2e41a6, #1454ee)`;
  }, 10);
})();

var insertCost = 1;
var deleteCost = 1;
var substituteCost = 2;

function minimumEditDistance(source, target) {
  const matrix = Array.from({ length: target.length + 1 }, () => Array(source.length + 1).fill(0));
  const path = [];
  const operations = [];

  for (let index = 1; index <= target.length; index++) matrix[index][0] = matrix[index - 1][0] + insertCost;

  for (let index = 1; index <= source.length; index++) matrix[0][index] = matrix[0][index - 1] + deleteCost;

  for (let x = 1; x <= target.length; x++)
    for (let y = 1; y <= source.length; y++)
      if (source[y - 1] === target[x - 1]) matrix[x][y] = matrix[x - 1][y - 1];
      else
        matrix[x][y] = Math.min(
          matrix[x - 1][y] + insertCost,
          matrix[x - 1][y - 1] + substituteCost,
          matrix[x][y - 1] + deleteCost
        );

  let x = target.length;
  let y = source.length;

  while (x !== 0 && y !== 0) {
    path.push(`${x}-${y}`);

    if (target[x - 1] === source[y - 1]) {
      x--;
      y--;
    } else if (matrix[x][y] === matrix[x - 1][y - 1] + substituteCost)
      operations.push({
        name: "Substitute",
        source: y-- - 1,
        target: x-- - 1,
      });
    else if (matrix[x][y] === matrix[x - 1][y] + insertCost)
      operations.push({
        name: "Insert",
        target: x-- - 1,
      });
    else
      operations.push({
        name: "Delete",
        source: y-- - 1,
      });
  }

  while (y !== 0)
    operations.push({
      name: "Delete",
      source: y-- - 1,
    });

  while (x !== 0)
    operations.push({
      name: "Insert",
      target: x-- - 1,
    });

  operations.reverse();

  return {
    matrix,
    cost: matrix[target.length][source.length],
    operations,
    path,
  };
}

function calculate() {
  let source = document.querySelector("input:first-of-type").value;
  let target = document.querySelector("input:last-of-type").value;

  if (!source || !target) return;

  let result = minimumEditDistance(source, target);

  console.log(result);

  matrix.innerHTML = "";
  list.innerHTML = "";
  matrix.style.gridTemplateColumns = "35px ".repeat(target.length + 1) + "35px";

  for (let index = -2; index < target.length; index++)
    matrix.innerHTML += `<div class="main">${index >= 0 ? target[index] : "╳"}</div>`;

  for (let y = 0; y < source.length + 1; y++)
    for (let x = -1; x < target.length + 1; x++) {
      if (x == -1) matrix.innerHTML += `<div class="main">${y ? source[y - 1] : "╳"}</div>`;
      else
        matrix.innerHTML +=
          result.path.includes(`${x}-${y}`) || (!x && !y)
            ? `<div class="path">${result.matrix[x][y]}</div>`
            : `<div>${result.matrix[x][y]}</div>`;
    }

  result.operations.forEach((operation) => {
    switch (operation.name) {
      case "Insert":
        list.innerHTML += `<li>${operation.name} the character "${target[operation.target]}"</li>`;
        break;
      case "Delete":
        list.innerHTML += `<li>${operation.name} the character "${source[operation.source]}"</li>`;
        break;
      case "Substitute":
        list.innerHTML += `<li>${operation.name} the character "${source[operation.source]}" with "${
          target[operation.target]
        }"</li>`;
        break;
    }
  });

  list.innerHTML += `<li>Total cost is ${result.cost}</li>`;
}
