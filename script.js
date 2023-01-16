const size = 9;
const mineCount = 10;
let remainingMines = mineCount;
updateMineCount(remainingMines);
let grid = createGrid(size, 0);
let flagMode = false;

coords = generateMineCoordinates(mineCount, size);
enterFlags(coords);
enterNumbers(coords);
let topGrid = createGrid(size, 1);
let ended = false;

printInTerminal(grid);
display(grid);

function createGrid(size, value) {
  let grid = new Array(size);
  for(let i=0; i<grid.length; i++) {
    grid[i] = new Array(grid.length);
    for(let j=0; j<grid[i].length; j++) {
      grid[i][j] = value;
    }
  }
  return grid;
}

function generateRandomNumbers(mineCount, size) {
  const numbers = [];
  while (numbers.length < mineCount) {
    const randomNumber = Math.floor(Math.random() * size**2);
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  return numbers;
}

function generateMineCoordinates(mineCount, size) {
  numbers = generateRandomNumbers(mineCount, size);
  coords = new Array(numbers.length);
  for(let i=0; i < coords.length; i++) {
    num = numbers[i];
    coords[i] = new Array(2);
    coords[i][0] = Math.floor(num/size)
    coords[i][1] = num%size
  }
  return coords
}

function enterFlags(coords) {
  for(let i=0; i<coords.length; i++) {
    let c = coords[i]
    grid[c[0]][c[1]] = 'f'
  }
}

function enterNumbers(coords) {
  const augmentInfo = [
    [-1, -1],
    [-1, 0],
    [0, -1],
    [-1, 1],
    [1, -1],
    [0, 1],
    [1, 0],
    [1, 1]
  ]
  for(let i=0; i<coords.length; i++) {
    let currentCoord = coords[i]; //get current coordinate
    //get surrounding coordinates
    // let surroundings = new Array(8);
    for(let i=0; i<augmentInfo.length; i++) {
      let aug = augmentInfo[i]
      let s = [currentCoord[0]+aug[0], currentCoord[1]+aug[1]]
      if(s[0]>=0 && s[0]<grid.length && s[1]>=0 && s[1]<grid.length) {
        //check that value is within array bounds
        //check that adjacent square is >=0 (not a mine)
        if(grid[s[0]][s[1]]>=0) {
            grid[s[0]][s[1]] += 1
        }
      }
    }
  }
}

function disableAllButtons() {
  for(const button of document.getElementsByClassName('cell'))
    button.disabled = true;
}

function numberLogic(grid, i, j) {
  number = grid[i][j];
  if(number === "f") {
    document.body.append(document.createTextNode("Game Over!"));
    disableAllButtons();
    //TODO: revealMines();
  }
  else if(number === 0) {
    zeroes(grid, i, j);
  }
}

function zeroes(grid, i, j) {
  if(grid[i][j] === 0) {
    if(getButton(i, j)) {
      removeTileAndShowNumber(getButton(i, j), 0, document.getElementById('td-'+i+'-'+j));
    }
    const augmentInfo = [
      [-1, -1],
      [-1, 0],
      [0, -1],
      [-1, 1],
      [1, -1],
      [0, 1],
      [1, 0],
      [1, 1]
    ]
    for(let k=0; k<augmentInfo.length; k++) {
      let i_1 = i + augmentInfo[k][0];
      let j_1 = j + augmentInfo[k][1];
      if (i_1 < 0 || i_1 >= grid.length || j_1 < 0 || j_1 >= grid.length) continue;
      button = getButton(i_1, j_1);
      if(!button || button.classList.contains('flagged')) continue;
      removeTileAndShowNumber(button, grid[i_1][j_1], document.getElementById('td-'+i_1+'-'+j_1))
      zeroes(grid, i_1, j_1);
  }
  
  }
}

function removeTileAndShowNumber(button, value, td) {
  button.parentNode.removeChild(button);
  number = document.createTextNode(value);
  td.appendChild(number);
}

function printInTerminal(grid) {
  let s = '';
  for(let i=0; i<grid.length; i++) {
    for(let j=0; j<grid[i].length; j++) {
      s += grid[i][j] + ' '
    }
    console.log(s)
    s = ''
  }
}

function display(grid) {
  const body = document.body,
          tbl = document.createElement('table');
  for (let i = 0; i < grid.length; i++) {
      const tr = tbl.insertRow();
      for (let j = 0; j < grid[i].length; j++) {
          const td = tr.insertCell();
          td.id = 'td-'+i+'-'+j;
          let button = document.createElement("Button");
          button.id = 'cell-'+i+'-'+j;
          button.classList.add('cell');
          button.addEventListener("click", function() {
            if(!button.classList.contains('flagged')) {
              removeTileAndShowNumber(button, grid[i][j], td);
              numberLogic(grid, i, j);
              let allMinesExposed = document.getElementsByClassName('cell').length === document.getElementsByClassName('flagged').length
              if(remainingMines === 0 && allMinesExposed)
                winCheck();
            }
          });
          button.addEventListener("contextmenu", function() {
            event.preventDefault();
            if(!button.classList.contains('flagged')) {
              button.classList.add('flagged');
              button.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--dark-color');
              remainingMines -= 1;
              updateMineCount();
              let allMinesExposed = document.getElementsByClassName('cell').length === document.getElementsByClassName('flagged').length
              // console.log(remainingMines === 0 && allMinesExposed)
              if(remainingMines === 0 && allMinesExposed)
                winCheck();
            }
            else {
              button.classList.remove('flagged')
              button.style.backgroundColor = '';
              remainingMines += 1;
              updateMineCount();
            }
            return false;
          });
          td.appendChild(button);
      }
  }
  body.appendChild(tbl);
}

function getButton(i, j) {
  return document.getElementById('cell-'+i+'-'+j);
}

function updateMineCount() {
  document.getElementById('remaining-mines').innerHTML = remainingMines;
}

function winCheck() {
  console.log('winCheck')
  let won = true;
  let coordsString = coords.toString();
  console.log(coordsString)
  flags = document.getElementsByClassName('flagged');
  console.log('coords', coordsString);
  for(i=0; i<flags.length; i+=2) {
    flagCoord = flags[i].id.charAt(5)+','+flags[i].id.charAt(7);
    console.log(flagCoord);
    if(!coordsString.includes(flagCoord)) {
      won = false;
      break;
    }
  }
  if(won) {
    document.body.append(document.createTextNode("You Won!"));
    disableAllButtons();
  }
}

function getColor(varName) {
  return getComputedStyle(document.body).getPropertyValue(varName);
}

function toggleFlagMode() {
  toggleButton = document.getElementById('toggle-flag');
  if(flagMode === true) {
    toggleButton.style.color = getColor('--light-color');
    toggleButton.style.backgroundColor = getColor('--dark-color');
    flagMode = false;
  }
  else {
    toggleButton.style = '';
    flagMode = true;
  }
}

function printTable(grid) {
  const body = document.body,
          tbl = document.createElement('table');
  for (let i = 0; i < grid.length; i++) {
      const tr = tbl.insertRow();
      for (let j = 0; j < grid[i].length; j++) {
          const td = tr.insertCell();
          td.appendChild(document.createTextNode(grid[i][j]));
      }
  }
  body.appendChild(tbl);
}