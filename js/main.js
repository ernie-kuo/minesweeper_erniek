/*----- cached element references -----*/

const $tbodyBtn = $('.board-tbody')
const $restartBtn = $('.restart')
/*----- event listeners -----*/

$(document).ready(function() {
    var game
    init()
    attachListeners()
})


/*----- constants -----*/
// const TOTAL_NUMBER_MINES_LV1 = 10
// const TOTAL_NUMBER_MINES_LV2
// const TOTAL_NUMBER_MINES_LV3

const EASY_MODE = {
    totalMine : 15,
    width: 10,
    height: 10
}
const MEDIUM_MODE = {
    totalMine : 35,
    width : 15,
    height : 15
}


const MINE_CSS = "mine"
const REVEALED_CSS = "revealed"
const DEFAULT_CSS = "default"
const FLAG_CSS = "flag"
const CLICKABLE_CSS = "clickable"


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
        return '#' + this.x + this.y;
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
        this.populateMines()
        this.populateHints()
    }

    createBoard() {
        // console.log("Creating Board...")
        for (let i = 0; i < this.difficulty.width; i++) {
            let currentColumn = [];
            for (let j = 0; j < this.difficulty.height; j++) {
                currentColumn.push(new Cell(i, j))
            }
            this.board.push(currentColumn);
        }
        // console.log("board: ")
        // console.log(this.board)
    }

    populateMines() {
        // console.log("Populating Mines...")
        while (this.mines.length < this.difficulty.totalMine) {
            let randomX = Math.floor(Math.random() * this.difficulty.width)
            let randomY = Math.floor(Math.random() * this.difficulty.height)
            let mine = this.board[randomX][randomY]
            if (!mine.isMine) {
                mine.isMine = true
                this.mines.push(mine)
            }
        }
        // console.log(this.mines);
    }

    populateHints() {
        // console.log("Populating hints...")
        for (let mine of this.mines) {
            // console.log("this.mine: ")
            // console.log(this.mines)
            let neighborsOfMine = this.getNeighbors(mine)
            // console.log("Neighbors of Mine")
            // console.log(neighborsOfMine)
            for (let neighbor of neighborsOfMine) {
                if (!neighbor.hasHint) {
                    let neighborsOfNeighbor = this.getNeighbors(neighbor)
                    // console.log("Neighbors of Neighbor");
                    // console.log(neighborsOfNeighbor);
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
                // console.log(`Current Index: ${i}${j}`)
                // console.log("The current mine of grid");
                // console.log(grid)
                if (cell.x === i && cell.y === j) {
                   
                } else {
                    listOfNeighbors.push(this.board[i][j])
                }
            }
        }

        return listOfNeighbors;
    }

    getCellByID(stringID) {
        if (stringID.length !== 2) {
            console.log("ID format is incorrect: " + stringID)
        } else {
            // console.log("getGridByID ID: " + stringID)
            let x = Number(stringID[0])
            let y = Number(stringID[1])
            return this.board[x][y]
        }
    }

    revealAllMines() {
       for (let mine of this.mines) {
           mine.hasRevealed = true;
       }
    }

    revealCell(cell) {
        if (!cell.hasRevealed) {
            cell.hasRevealed = true
            if (!cell.hasHint) {
                let neighbors = this.getNeighbors(cell)
                for (let neighbor of neighbors) {
                    if (!neighbor.hasHint) {
                        this.revealCell(neighbor);
                    } else {
                        neighbor.hasRevealed = true;
                    }
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

    isGameOver() {
        
    }
}

// Set state to default or starting state:
// Default level is easy
// Choose total number of mines based on level
// Populates mines randomly over the grids -- populateMines()
// Populates hints around mines
// Call render
function init() {
    game = new Game(EASY_MODE)
    game.init()
    // attachListeners()
    render()
}

function attachListeners() {
    $tbodyBtn.on('click', 'td', cellClicked)
    $tbodyBtn.on('contextmenu', 'td', markFlag)
    $restartBtn.on('click', restart)
}

// Changed the view based on state
function render() {
    for (let columns of game.board) {
        for (let cell of columns) {
            // console.log(grid)
            let cellID = cell.getID()
            let $cellEle = $(cellID)
            if (cell.hasRevealed) {
                $cellEle.addClass(REVEALED_CSS)
                if (cell.isMine) {
                    $cellEle.addClass(MINE_CSS)
                } else if (cell.hasHint) {
                    $cellEle.text(cell.hint)
                }
            } else {
                (cell.hasFlag)? $cellEle.addClass(FLAG_CSS) : $cellEle.removeClass(FLAG_CSS)
            }
        }
    }
    
    if (game.isWin()) {
        alert("YOU WIN!")
    } else if (game.isGameOver) {
        alert('TRY AGAIN!')
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

function clickable() {
    return $(this).hasClass("clickable");
}

function cellClicked() {
    let cell = game.getCellByID(this.id)
    // console.log(grid);
    if (!cell.hasRevealed && !cell.hasFlag) {
        if (cell.isMine) {
            game.revealAllMines()
            game.isGameOver = true
        } else {
            game.revealCell(cell)
        }
        render()
    }

}

function restart() {
    clearClassesAndContent()
    init()
}

// function removeListeners() {
//     $('tbody').off('click', 'td', cellClicked);
//     $('tbody').off('contextmenu', 'td', markFlag)
// }

function createBoardHtml() {
    let $boardTbody = $('.board-tbody')
    for (let i of game.board) {
        
        for (let j of game[i]) {
            let grid = board[i][j]
            
        }
    }
}

// let user be a le to right click to indicate possible mine
// render()
function markFlag() {
    let $td = $(this)
    let id = $td.attr("id")
    let cell = game.getCellByID(id);
    if (!cell.hasRevealed) {
        if (cell.hasFlag) {
            cell.hasFlag = false;
        } else {
            cell.hasFlag = true;
        }
        render()
    }
    // if (!$td.hasClass("revealed")) {
    //     let cell = game.getCellByID($td.attr('id'))
    //     if ($td.hasClass("flag")) {
    //         cell.hasFlag = false
    //         $td.removeClass("flag")
    //     } else {
    //         cell.hasFlag = true
    //         $td.addClass("flag")
    //     }
    // }
    return false
} 

// Record the time needed to clear the game
// ENHANCE
function timer() {

}

// Change difficulty
// init()
function chooseDifficulty() {

}

