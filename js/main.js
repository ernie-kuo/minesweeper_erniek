console.log("testing");

$(document).ready(function() {
    var game;
    init();
})


/*----- constants -----*/
// const TOTAL_NUMBER_MINES_LV1 = 10
// const TOTAL_NUMBER_MINES_LV2
// const TOTAL_NUMBER_MINES_LV3

const EASY_MODE = {
    totalMine : 10,
    width: 10,
    height: 10
}

const MINE_CSS = "mine"
const REVEALED_CSS = "revealed"
const DEFAULT_CSS = "default"


// const GAME_BOARD = [];
/*----- app's state (variables) -----*/


/*----- cached element references -----*/


/*----- event listeners -----*/
/*----- functions -----*/

class Grid {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.hasMine = false
        this.hasHint = false
        this.hint = 0
        this.hasFlag = false
        this.hasRevealed = true;
    }

    equals(grid) {
        return this.x === grid.x && this.y === grid.y 
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
    }

    init() {
        this.createBoard()
        this.populateMines()
        this.populateHints()
    }

    createBoard() {
        console.log("Creating Board...")
        for (let i = 0; i < this.difficulty.width; i++) {
            let currentColumn = [];
            for (let j = 0; j < this.difficulty.height; j++) {
                currentColumn.push(new Grid(i, j))
            }
            this.board.push(currentColumn);
        }
        console.log("board: ")
        console.log(this.board)
    }

    populateMines() {
        console.log("Populating Mines...")
        while (this.mines.length < this.difficulty.totalMine) {
            let randomX = Math.floor(Math.random() * this.difficulty.width)
            let randomY = Math.floor(Math.random() * this.difficulty.height)
            let mine = this.board[randomX][randomY]
            if (!mine.hasMine) {
                mine.hasMine = true
                this.mines.push(mine)
            }
        }
        console.log(this.mines);
    }

    populateHints() {
        console.log("Populating hints...")
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
                        if (neighborOfNeighbor.hasMine) {
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

    getNeighbors(grid) {
        let listOfNeighbors = []
        let maximumColumnIndex = this.difficulty.width-1
        let maximumRowIndex = this.difficulty.height-1
        
        for (let i = Math.max(0, grid.x-1); i <= Math.min(maximumColumnIndex, grid.x+1); i++) {
            for (let j = Math.max(0, grid.y-1); j <= Math.min(maximumRowIndex, grid.y+1); j++) {
                // console.log(`Current Index: ${i}${j}`)
                // console.log("The current mine of grid");
                // console.log(grid)
                if (grid.x === i && grid.y === j) {
                   
                } else {
                    listOfNeighbors.push(this.board[i][j])
                }
            }
        }

        return listOfNeighbors;
    }

}

// Set state to default or starting state:
// Default level is easy
// Choose total number of mines based on level
// Populates mines randomly over the grids -- populateMines()
// Populates hints around mines
// Call render
function init() {
    game = new Game(EASY_MODE);
    game.init();
    render();
}

// Changed the view based on state
function render() {
    for (let columns of game.board) {
        for (let grid of columns) {
            // console.log(grid)
            let gridID = grid.getID()
            let $gridEle = $(gridID)
            if (grid.hasRevealed) {
                $gridEle.addClass(REVEALED_CSS)
                if (grid.hasMine) {
                    $gridEle.addClass(MINE_CSS)
                } else if (grid.hasHint) {
                    $gridEle.text(grid.hint)
                }
            } else {
                $gridEle.addClass(DEFAULT_CSS)
            }
        }
    }
}


// function createBoardHtml() {
//     let $boardTbody = $('.board-tbody')
//     for (let i of game.board) {
        
//         for (let j of game[i]) {
//             let grid = board[i][j]
            
//         }
//     }
// }

// When user click on an not-yet-revealed grid,
// check whether the gird is a mine.
// If true, the game is over.
// If false, reveal the grid, and invoke checkNearbyArea() if the grid is not a hint
//      check isGameOver() again to see if no more bombs left
// render()
function clickedUnknown() {

}


//REWORK/REDEFINE
// Check nearby grids are mines or hints or not.
// If false, keep extending until one is hit.
// If true, start generating hint of numbers of nearnby mines.
function checkNearbyArea() {

}

// let user be a le to right click to indicate possible mine
// render()
function makeflag() {

}


// When the user lose, reveal all mines
// init()
function revealAllMines() {

}

// Contain win/lose logic
function isGameOver() {
    // number of open grid === total number of mines
} 

// Record the time needed to clear the game
// ENHANCE
function timer() {

}

// Change difficulty
// init()
function chooseDifficulty() {

}

