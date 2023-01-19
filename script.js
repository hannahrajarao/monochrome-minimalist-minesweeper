const size = 9;
const mineCount = 10;
let remainingMines = mineCount;
updateMineCount(remainingMines);
let grid = createGrid(size, 0);
let flagMode = false;
let gameOver = false;

coords = generateMineCoordinates(mineCount, size);
enterFlags(coords);
enterNumbers(coords);

chooseColorScheme(localStorage.getItem('color'));
if(localStorage.getItem('dark-mode') === 'dark')
    document.body.classList.add('dark-mode');

printInTerminal(grid);
display(grid);

function createGrid(size, value) {
    let grid = new Array(size);
    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(grid.length);
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = value;
        }
    }
    return grid;
}

function generateRandomNumbers(mineCount, size) {
    const numbers = [];
    while (numbers.length < mineCount) {
        const randomNumber = Math.floor(Math.random() * size ** 2);
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    return numbers;
}

function generateMineCoordinates(mineCount, size) {
    numbers = generateRandomNumbers(mineCount, size);
    coords = new Array(numbers.length);
    for (let i = 0; i < coords.length; i++) {
        num = numbers[i];
        coords[i] = new Array(2);
        coords[i][0] = Math.floor(num / size)
        coords[i][1] = num % size
    }
    return coords
}

function enterFlags(coords) {
    for (let i = 0; i < coords.length; i++) {
        let c = coords[i]
        grid[c[0]][c[1]] = '*';
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
    for (let i = 0; i < coords.length; i++) {
        let currentCoord = coords[i]; //get current coordinate
        //get surrounding coordinates
        // let surroundings = new Array(8);
        for (let i = 0; i < augmentInfo.length; i++) {
            let aug = augmentInfo[i]
            let s = [currentCoord[0] + aug[0], currentCoord[1] + aug[1]]
            if (s[0] >= 0 && s[0] < grid.length && s[1] >= 0 && s[1] < grid.length) {
                //check that value is within array bounds
                //check that adjacent square is >=0 (not a mine)
                if (grid[s[0]][s[1]] >= 0) {
                    grid[s[0]][s[1]] += 1
                }
            }
        }
    }
}

function disableAllCells() {
    for (const button of document.getElementsByClassName('cell'))
        button.disabled = true;
}

function revealMines(text) {
    for(const mineCoord of coords) {
        let button = getButton(mineCoord[0], mineCoord[1]);
        if(button) {
            if(!button.classList.contains('flagged')){
                button.style.color = getColor('--light-color');
                button.style.backgroundColor = getColor('--dark-color');
                button.appendChild(document.createTextNode(text));
            }
        }
    }
    let coordsString = coords.toString();
    flags = document.getElementsByClassName('flagged');
    for (let k = 0; k < flags.length; k++) {
        const i = flags[k].id.charAt(5);
        const j = flags[k].id.charAt(7)
        flagCoord = i + ',' + j;
        if (!coordsString.includes(flagCoord)) {
            let cell = getButton(i, j);
            cell.style.color = getColor('--dark-color');
            cell.style.backgroundColor = getColor('--light-color');
            cell.appendChild(document.createTextNode(text));
        }
    }
}

function numberLogic(grid, i, j) {
    number = grid[i][j];
    if (number === "*") {
        gameOver = true;
        document.body.append(document.createTextNode("Game Over!"));
        document.body.appendChild(document.createElement("br"));
        playAgain = document.createElement('Button');
        playAgain.textContent = 'Play again';
        playAgain.onclick = function(){location=location};
        document.body.append(playAgain);
        revealMines("*");
        disableAllCells();
    }
    else if (number === 0) {
        zeroes(grid, i, j);
    }
}

function zeroes(grid, i, j) {
    if (grid[i][j] === 0) {
        if (getButton(i, j)) {
            removeTileAndShowNumber(getButton(i, j), 0, document.getElementById('td-' + i + '-' + j));
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
        for (let k = 0; k < augmentInfo.length; k++) {
            let i_1 = i + augmentInfo[k][0];
            let j_1 = j + augmentInfo[k][1];
            if (i_1 < 0 || i_1 >= grid.length || j_1 < 0 || j_1 >= grid.length) continue;
            button = getButton(i_1, j_1);
            if (!button || button.classList.contains('flagged')) continue;
            removeTileAndShowNumber(button, grid[i_1][j_1], document.getElementById('td-' + i_1 + '-' + j_1))
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
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            s += grid[i][j] + ' '
        }
        console.log(s)
        s = ''
    }
}

function display(grid) {
    const body = document.body, tbl = document.getElementById('board');
    for (let i = 0; i < grid.length; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < grid[i].length; j++) {
            const td = tr.insertCell();
            td.id = 'td-' + i + '-' + j;
            let button = document.createElement("Button");
            button.id = 'cell-' + i + '-' + j;
            button.classList.add('cell');
            button.addEventListener("click", function () {
                if (flagMode) {
                    rightClick(button);
                }
                else {
                    if (!button.classList.contains('flagged')) {
                        removeTileAndShowNumber(button, grid[i][j], td);
                        numberLogic(grid, i, j);
                        let allMinesExposed = document.getElementsByClassName('cell').length === document.getElementsByClassName('flagged').length
                        if (remainingMines === 0 && allMinesExposed)
                            winCheck();
                    }
                    if(document.getElementsByClassName('cell').length === mineCount) {
                        for(const cell of document.getElementsByClassName('cell')) {
                            if(!cell.classList.contains('flagged'))
                                rightClick(cell);
                        }
                    }
                }
            });
            button.addEventListener("contextmenu", function () {
                event.preventDefault();
                rightClick(button)
            });
            td.appendChild(button);

        }
        body.appendChild(tbl);
    }
}

function rightClick(button) {
    if (!button.classList.contains('flagged')) {
        button.classList.add('flagged');
        button.style.backgroundColor = getColor('--dark-color');
        remainingMines -= 1;
        updateMineCount();
        let allMinesExposed = document.getElementsByClassName('cell').length === document.getElementsByClassName('flagged').length
        if (remainingMines === 0 && allMinesExposed)
            winCheck();
    }
    else {
        button.classList.remove('flagged')
        button.style.backgroundColor = '';
        remainingMines += 1;
        updateMineCount();
    }
    return false;
}

function getButton(i, j) {
    return document.getElementById('cell-' + i + '-' + j);
}

function updateMineCount() {
    document.getElementById('remaining-mines').innerHTML = remainingMines;
}

function winCheck() {
    let won = true;
    let coordsString = coords.toString();
    flags = document.getElementsByClassName('flagged');
    for (i = 0; i < flags.length; i += 2) {
        flagCoord = flags[i].id.charAt(5) + ',' + flags[i].id.charAt(7);
        if (!coordsString.includes(flagCoord)) {
            won = false;
            break;
        }
    }
    if (won) {
        gameOver = true;
        document.body.append(document.createTextNode("You Won!"));
        document.body.appendChild(document.createElement("br"));
        playAgain = document.createElement('Button');
        playAgain.textContent = 'Play again';
        playAgain.onclick = function(){location=location};
        document.body.append(playAgain);
        disableAllCells();
    }
}

function getColor(varName) {
    return getComputedStyle(document.body).getPropertyValue(varName);
}

function toggleFlagMode() {
    toggleButton = document.getElementById('toggle-flag');
    if (flagMode === true) {
        toggleButton.style = '';
        flagMode = false;
    }
    else {
        flagMode = true;
        toggleButton.style.color = getColor('--light-color');
        toggleButton.style.backgroundColor = getColor('--dark-color');
    }
}

function printTable(grid) {
    const body = document.body, tbl = document.createElement('table');
    for (let i = 0; i < grid.length; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < grid[i].length; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(grid[i][j]));
        }
    }
    body.appendChild(tbl);
}

function toggleDarkMode() {
    if(localStorage.getItem('dark-mode') == 'dark')
        localStorage.setItem('dark-mode', 'light');
    else
        localStorage.setItem('dark-mode', 'dark');
    document.body.classList.toggle('dark-mode');
    toggleFlagMode(); //refresh flag mode to update button color
    toggleFlagMode();
    if(gameOver)
        revealMines('');
}

function chooseColorScheme(color) {
    const colors = {
        'pink': ['rgb(255, 208, 234)', 'deeppink'],
        'purple': ['plum', 'purple'],
        'blue': ['lightblue', 'blue'],
        'green': ['limegreen', 'green']
    };
    localStorage.setItem("color", color);
    document.documentElement.style.setProperty('--light-color', colors[color][0]);
    document.documentElement.style.setProperty('--dark-color', colors[color][1]);
    toggleFlagMode(); //refresh flag mode to update button color
    toggleFlagMode();
    for(const flaggedCell of document.getElementsByClassName('flagged')) {
        flaggedCell.style.backgroundColor = getColor('--dark-color');
    }
    if(gameOver)
        revealMines('');
}