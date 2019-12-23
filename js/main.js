/*----- cached element references -----*/
const $table = $('.board-table')
const $restartBtn = $('.restart')
const $difficulty = $('.difficulty')
const $totalMines = $('.total-mines')
const $totalFlags = $('.total-flags')
const $time = $('.time')
const $win = $('.win')
const $lose = $('.lose')
const $gameOver = $('.game-over')

/*----- app state variables-----*/
var timer
var timeUsedInSeconds
var game
var clickCount
var flagCount

/*----- event listeners -----*/

$(document).ready(function() {
    createBoardTable(EASY_MODE)
    attachListeners()
})


/*----- constants -----*/

const EASY_MODE = {
    totalMine : 10,
    width: 8,
    height: 10
}
const MEDIUM_MODE = {
    totalMine : 40,
    width : 14,
    height : 18
}
const HARD_MODE = {
    totalMine: 99,
    width: 20,
    height: 24
}

const FLAG_ICON_HTML = "<i class=\"fa fa-flag\" aria-hidden=\"true\"></i>"
const MINE_CSS = "mine"
const REVEALED_CSS = "revealed"
const DEFAULT_CSS = "default"
const FLAG_CSS = "flag"
const UNCLICKABLE_CSS = "unclickable"
const HIDE_CSS = "hide"


/*----- functions -----*/

class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.isMine = false
        this.hasHint = false
        this.hint = 0
        this.hasFlag = false
        this.hasRevealed = false;
    }

    equals(cell) {
        return this.x === cell.x && this.y === cell.y 
    }

    getID() {
        return '#' + this.x + "-" + this.y;
    }
}

class Game {
    constructor(difficulty = EASY_MODE) {
        this.difficulty = difficulty
        this.board = []
        this.mines = []
        this.isGameOver = false;
    }

    init() {
        this.createBoard()
    }

    createBoard() {
        for (let i = 0; i < this.difficulty.width; i++) {
            let currentColumn = [];
            for (let j = 0; j < this.difficulty.height; j++) {
                currentColumn.push(new Cell(i, j))
            }
            this.board.push(currentColumn);
        }
    }

    populateMines(cell) {
        // To prevent players lose on the first click, the cell being clicked and its neighbors should be excluded from being mines
        let excludedCells = this.getNeighbors(cell)
        excludedCells.push(cell)
        while (this.mines.length < this.difficulty.totalMine) {
            let randomX = Math.floor(Math.random() * this.difficulty.width)
            let randomY = Math.floor(Math.random() * this.difficulty.height)
            let mine = this.board[randomX][randomY]
            // Check the random cell is a mine or not to avoid duplicates
            if (!mine.isMine) {
                if (!excludedCells.includes(mine)){
                    mine.isMine = true
                    this.mines.push(mine)
                }
            }
        }
    }

    populateHints() {
        for (let mine of this.mines) {
            let neighborsOfMine = this.getNeighbors(mine)
            for (let neighbor of neighborsOfMine) {
                if (!neighbor.hasHint) {
                    let neighborsOfNeighbor = this.getNeighbors(neighbor)
                    let hint = 0
                    for (let neighborOfNeighbor of neighborsOfNeighbor) {
                        if (neighborOfNeighbor.isMine) {
                            hint++
                        }
                    }
                    neighbor.hint = hint
                    if (neighbor.hint > 0) {
                        neighbor.hasHint = true;
                    }
                }
            }
        }

    }

    getNeighbors(cell) {
        let listOfNeighbors = []
        let maximumColumnIndex = this.difficulty.width-1
        let maximumRowIndex = this.difficulty.height-1
        
        for (let i = Math.max(0, cell.x-1); i <= Math.min(maximumColumnIndex, cell.x+1); i++) {
            for (let j = Math.max(0, cell.y-1); j <= Math.min(maximumRowIndex, cell.y+1); j++) {
                if (cell.x !== i || cell.y !== j) {
                    listOfNeighbors.push(this.board[i][j])
                }
            }
        }
        return listOfNeighbors;
    }

    getCellByID(stringID) {
        let arr = stringID.split('-');
        let x = Number(arr[0])
        let y = Number(arr[1])
        return this.board[x][y]
    }

    revealAllMines() {
       for (let mine of this.mines) {
           mine.hasRevealed = true;
       }
    }

    revealCell(cell) {
        if (!cell.hasRevealed && !cell.hasFlag) {
            cell.hasRevealed = true
            if (!cell.hasHint) {
                let neighbors = this.getNeighbors(cell)
                for (let neighbor of neighbors) {
                    this.revealCell(neighbor)
                }
            }
        }
    }

    getNumOfOpenCells() {
        let numberOfOpenCells = 0;
        for (let column of this.board) {
            for (let cell of column) {
                if (cell.hasRevealed && !cell.isMine){
                    numberOfOpenCells++
                }
            }
        }
        return numberOfOpenCells
    }

    getSizeOfBoard() {
        return this.board.length * this.board[0].length
    }

    isWin() {
        return this.getNumOfOpenCells() === (this.getSizeOfBoard() - this.difficulty.totalMine)
    }
}

// Set state to default or starting state:
// Default level is easy
// Choose total number of mines based on level
// Populates mines randomly over the grids -- populateMines()
// Populates hints around mines
// Call render
function init(difficulty = EASY_MODE) {
    game = new Game(difficulty)
    clickCount = 0
    timeUsedInSeconds = 0
    flagCount = 0
    game.init()
    $totalMines.text(game.difficulty.totalMine);
    $totalFlags.text(flagCount)
    render()
}

function stopAndClear() {
    clearInterval(timer)
    clearClassesAndContent()
    resetDisplay()
}

function restart() {
    stopAndClear()
    init(game.difficulty)
}

function createBoardTable(difficulty) {
    $table.html("")
    let table = $table[0]
    for (let i = 0; i < difficulty.width; i++) {
        let tr = table.insertRow()
        for (let j = 0; j < difficulty.height; j++) {
            let td = tr.insertCell()
            td.id = i + "-" + j
        }
    }
    init(difficulty)
    stopAndClear()
}

function changeDifficulty() {
    let option = this.value;
    let difficulty
    if (option === "easy"){
        difficulty = EASY_MODE
    } else if (option === "medium") {
        difficulty = MEDIUM_MODE
    } else if (option === "hard") {
        difficulty = HARD_MODE
    } else {
        return;
    }
    createBoardTable(difficulty)
}

function attachListeners() {
    $restartBtn.on('click', restart)
    $difficulty.on('change', changeDifficulty)
    $table.on('click', 'td', cellClicked)
    $table.on('contextmenu', 'td', markFlag)
    $('body').on('keyup', restart)
    $gameOver.on('click', ()=>$gameOver.addClass(HIDE_CSS))
}

// Changed the view based on state
function render() {

    for (let columns of game.board) {
        for (let cell of columns) {
            let cellID = cell.getID()
            let $cellEle = $(cellID)
            if (game.isGameOver || game.isWin()) {
                $cellEle.addClass(UNCLICKABLE_CSS)
            }
            if (cell.hasFlag) {
                $cellEle.html(FLAG_ICON_HTML)
                $cellEle.addClass(FLAG_CSS)
            } else {
                $cellEle.html("")
                $cellEle.removeClass(FLAG_CSS)
            }
            if (cell.hasRevealed) {
                $cellEle.addClass(REVEALED_CSS)
                if (cell.isMine) {
                    $cellEle.addClass(MINE_CSS)
                } else if (cell.hasHint) {
                    $cellEle.text(cell.hint)
                }
            }
        }
    }
    
    $totalFlags.text(flagCount)

    if (game.isGameOver || game.isWin()) {
        $gameOver.removeClass(HIDE_CSS)
        if (game.isWin()) {
            $win.removeClass(HIDE_CSS)
        } else {
            $lose.removeClass(HIDE_CSS)
        }
        clearInterval(timer)
    }
}

function clearClassesAndContent() {
    for (let columns of game.board) {
        for (let cell of columns) {
            let $cellEle = $(cell.getID())
            $cellEle.removeClass()
            $cellEle.text("")
        }
    }
}

function unclickable(element) {
    return $(element).hasClass(UNCLICKABLE_CSS);
}

function cellClicked() {
    let cell = game.getCellByID(this.id)
    if (unclickable(this)) {
        return;
    }
    if (clickCount === 0){
        timer = startTimer();
        game.populateMines(cell)
        game.populateHints()
    }
    if (!cell.hasRevealed && !cell.hasFlag) {
        if (cell.isMine) {
            game.revealAllMines()
            game.isGameOver = true
        } else {
            game.revealCell(cell)
            if (game.isWin()) {
                game.isGameOver = true
                game.revealAllMines()
            }
        }
        clickCount++
        render()
    }

}

// let user be a le to right click to indicate possible mine
// render()
function markFlag() {
    let $td = $(this)
    if (unclickable(this)) {
        return false;
    }
    let id = $td.attr("id")
    let cell = game.getCellByID(id);
    if (!cell.hasRevealed) {
        if (cell.hasFlag) {
            cell.hasFlag = false
            flagCount--
        } else {
            cell.hasFlag = true
            flagCount++
        }
        render()
    }
    return false
} 

// Record the time used to clear the game
function startTimer() {
    return setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeUsedInSeconds++
    $time.text(timeUsedInSeconds + " sec")
}

function resetDisplay() {
    $win.addClass(HIDE_CSS)
    $lose.addClass(HIDE_CSS)
    $gameOver.addClass(HIDE_CSS)
    $time.text("0 sec");
    $totalFlags.text("0");
}