
user click
event fire

if clicked grid is a mine  
    game over .. open all mines
else
    openGrid(clicked grid)



// call if user click on a grid that is not a mine
openGrid(current grid){
    if (cuurent grid == opened)
        return false
    else {
        set current grid to opened
        neighbors = get all neighbor girds
        if current grid is not a  hint
            openNeighborGrids(neighbors)
       // else if currentGrid == hint
       //     return false;
    }
}
        

        

}


// call if user click on a grid that is not a mine
openNeighborGrids(arr of neighbors){
    foreach x of neighbors {
        if x is not a hint 
            openGrid(x)
    }


}


class Grid {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.hasMine = false;
        this.hasHint = false;
        this.hint = 0;
    }
    
}

// neighbor, mine are all just an instance of Grid Class


//
populateHints(arrayOfMines){
    foreach mine of arrayOfMines {
        array neighborsOfMine = getNeighbors(mine.grid);
        foreach neighbor of neighborsOfMine {
            if hasHint() === false {
                array neighborsOfNeighbor = getNeighbors(neighbor) 
                //
                let numberOfMines = 0;
                foreach x of neighborsOfNeighbor {
                    if x is a mine{
                        numberOfMines++
                    }
                }
                neighbor.hint = numberOfMines;
                if neighbor.hint > 0
                    neighbor.hasHint() = true;
            }
        }
    }
}