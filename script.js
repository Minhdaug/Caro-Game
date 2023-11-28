const dimensionButton = document.getElementById('dimension-button');
//thay đổi kích thước của bàn cờ.
const dimensionElement = document.getElementById('dimension');
//hiển thị kích thước hiện tại của bàn cờ.
const statusElement = document.getElementById('status');
//hiển thị trạng thái hiện tại của trò chơi (ví dụ: người chiến thắng, lượt đi tiếp theo).
const restartButton = document.getElementById('restart-btn');
//khởi động lại trò chơi.
const singlePlayerToggle = document.getElementById('single-player-toggle');
//chuyển đổi chế độ chơi 
const boardElement = document.getElementById('board');
// phần tử chứa bàn cờ.


const undoButton = document.getElementById('undo')
undoButton.addEventListener('click', undoMove);
//button thực hiện chức năng hoàn tác

const winButton = document.getElementById('WinHistory')
winButton.addEventListener('click', renderWinHistory);
//button thực hiện chức năng hiển thị lịch sử chiến thắng



let dataSaved = false; //để cho vui

let dimension = 12; // Giá trị mặc định

dimensionButton.textContent = `${dimension}x${dimension}`;
const dimensions = [12]; //để lưu trữ chỉ số của kích thước hiện tại trong mảng dimensions.
let dimensionIndex = 0; 

let singlePlayerMode = false; //biến boolean để xác định chế độ chơi đơn người hay hai người.

let squares = Array(dimension).fill(Array(dimension).fill(null)); //mảng hai chiều đại diện cho các ô trên bàn cờ, ban đầu tất cả các ô đều là null.

let xIsNext = true;  // Chọn ngẫu nhiên người chơi đi trước , nhỏ hơn 0.5, xIsNext sẽ được gán giá trị true (người chơi X đi trước)

let theWinner = null; //biến để lưu trữ người chiến thắng (null nếu chưa có người chiến thắng).

let moveHistory = []; //tạo mảng lưu nước đi

let winningLine = []; //khởi tạo với một mảng rỗng để lưu trữ các ô thắng nếu có

let winningBoard = [null, null, null, null, null]; //mảng lưu trữ bàn cờ có đường chiến thắng

let boardWin  = [null, null, null, null, null];  //tạo mảng giống bàn cờ để lưu bàn cờ chiến thắng

let winHistory = []; //lưu trữ giá trị người chiến thắng: X hay O


let saveBoard = Array(dimension).fill(Array(dimension).fill(null));

let saveWinHistory =[null, null, null, null,];

//xử lý sự kiện khi người dùng click vào nút thay đổi kích thước bàn cờ.
dimensionButton.addEventListener('click', function () {
    dimensionIndex = (dimensionIndex + 1) % dimensions.length;
    dimension = dimensions[dimensionIndex];
    dimensionButton.textContent = `${dimension}x${dimension}`;
    restartGame();
  });

restartButton.addEventListener('click', restartGame); //hàm restartGame sẽ được gọi, gắn với sự kiện click

singlePlayerToggle.addEventListener('click', function () {
    toggleSinglePlayerMode();
    restartGame();    
  });



function handleClick(row, col) {
    if (theWinner || squares[row][col]) {
      return;
    }
    
    const newSquares = squares.map((row) => [...row]);
    newSquares[row][col] = xIsNext ? 'X' : 'O';// Sử dụng 'X' hoặc 'O' tùy thuộc vào người chơi hiện tại
    squares = newSquares;
    xIsNext = !xIsNext;// Chuyển lượt đi cho người chơi tiếp theo

    // Sau khi thực hiện nước đi, lưu lại vào mảng
    moveHistory.push({
      row: row,
      col: col,
      value: xIsNext ? 'X' : 'O'
    });
    
    saveBoard = newSquares;
    
    const winner = calculateWinner(newSquares, row, col);
    if (winner) {
      theWinner = winner;
      winningLine = findWinningLine(newSquares, row, col, winner);

      boardWin.unshift(newSquares); //khai báo mảng boardWin có giá trị là bàn cờ chiến thắng
      if (boardWin.length >5){
        boardWin.pop();
      }

      winHistory.unshift(winner); //khai báo mảng winHistory lưu giá trị người chiến thắng (X hay 0)     
      if (winHistory.length > 5) {
        winHistory.pop(); // Giới hạn lịch sử chiến thắng chỉ có tối đa 5 ván
      }

      winningBoard.unshift(winningLine);
      if (winningBoard.length > 5){
        winningBoard.pop();
      }
      
    }
    renderBoard();
    updateStatus();

    if (singlePlayerMode && !theWinner && !xIsNext) {
      makeComputerMove();
    }
   
}

function renderWinHistory() {
  const winHistoryElement = document.getElementById("win-history"); // hiển thị lịch sử chiến thắng
  const boardElement = document.getElementById("win-history"); //hiển thị bảng cờ chiến thắng.
  
  // Xóa nội dung hiện tại của boardElement
  boardElement.innerHTML = "";
  // Xóa nội dung hiện tại của winHistoryElement
  winHistoryElement.innerHTML = "";

  // Duyệt qua lịch sử chiến thắng và tạo các phần tử HTML tương ứng
  for (let i = 0; i < winHistory.length; i++) {
    const winResult = winHistory[i];
    const squaresWin = boardWin[i];
    const lineWin = winningBoard[i];

    if (winResult) {
      const winResultElement = document.createElement("div");
      winResultElement.textContent = `Trận trước thứ ${i + 1}: Người chiến thắng - ${winResult}`;
      winHistoryElement.appendChild(winResultElement);
      
      
      for (let row = 0; row < dimension; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'board-win';
      
        for (let col = 0; col < dimension; col++) {

          const value = squaresWin[row][col];

          const isWinningBoardWin = lineWin.some(([winRow, winCol]) => winRow === row && winCol === col);
      
          const squareButton = document.createElement('button');
          squareButton.className = 'square';
          squareButton.style.backgroundColor = isWinningBoardWin ? 'yellow' : 'white';
          squareButton.style.color = value === 'X' ? 'blue' : 'red';
          squareButton.style.fontWeight = isWinningBoardWin ? 'bold' : 'normal';
          squareButton.textContent = value;
      
          rowElement.appendChild(squareButton);
        }
      
        boardElement.appendChild(rowElement);
      }
    }
  }
}


function renderBoard() { boardElement.innerHTML = '';
     for (let row = 0; row < dimension; row++) {
            const rowElement = document.createElement('div');
               rowElement.className = 'board-row';

     for (let col = 0; col < dimension; col++) {
            const value = squares[row][col];
            const isWinningSquare = winningLine.some(([winRow, winCol]) => winRow === row && winCol === col);
            const squareButton = document.createElement('button');
               squareButton.className = 'square';
               squareButton.style.backgroundColor = isWinningSquare ? 'yellow' : 'white';
               squareButton.style.color = value === 'X' ? 'blue' : 'red';
               squareButton.style.fontWeight = isWinningSquare ? 'bold' : 'normal';
               squareButton.textContent = value;
               squareButton.addEventListener('click', () => {
            if (!singlePlayerMode || (singlePlayerMode && xIsNext)) {
                        handleClick(row, col);
                                                 }
                                       });

              rowElement.appendChild(squareButton);
                             }

              boardElement.appendChild(rowElement);
                   }
         }



function undoMove() {
    if (moveHistory.length > 0) {
      // Xóa nước đi cuối cùng của người chơi
      const lastMove = moveHistory.pop();
      const { row, col, value } = lastMove;


      squares[row][col] = null; // Xóa giá trị của ô đã đánh
  
      xIsNext = value === 'X' ? true : false; // Cập nhật người chơi hiện tại
      xIsNext = value === 'O' ? true : false; 
  
      if (moveHistory.length > 0 && singlePlayerMode == true) {
        // Xóa nước đi cuối cùng của máy tính
        if(theWinner !== null){
          
          //nếu win thì chỉ xóa nước 1 nước đi

        } else {
          const lastMoveComputer = moveHistory.pop();
          const { row: computerRow, col: computerCol } = lastMoveComputer;
          squares[computerRow][computerCol] = null;
          xIsNext = value === 'X';
        }
        
      }
  
      // Reset thông tin về người chiến thắng và lượt chơi
      if (theWinner !== null) {
        theWinner = null;
        winningLine = [];
        
        winHistory.shift();
        boardWin.shift();
        winningBoard.shift();
      }
  
      // Cập nhật lại giao diện bàn cờ
      renderBoard();
      updateStatus();
    }
}


function makeComputerMove() {
    if (!singlePlayerMode || theWinner) {
      return;
    }
  
    
  
    const availableMoves = [];
    const humanPlayer = xIsNext ? 'X' : 'O';
    const computerPlayer = xIsNext ? 'O' : 'X';
  
    squares.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (!squares[rowIndex][colIndex]) {
          availableMoves.push([rowIndex, colIndex]);
        }
      });
    });
  
    if (availableMoves.length > 0) {
      // Check if the computer can win in the next move
      for (let i = 0; i < availableMoves.length; i++) {
        const [row, col] = availableMoves[i];
        const newSquares = squares.map((row) => [...row]);
        newSquares[row][col] = computerPlayer;
  
        if (calculateWinner(newSquares, row, col) === computerPlayer) {
          handleClick(row, col);
          return;
        }
      }
  
      // Check if the human player can win in the next move
      for (let i = 0; i < availableMoves.length; i++) {
        const [row, col] = availableMoves[i];
        const newSquares = squares.map((row) => [...row]);
        newSquares[row][col] = humanPlayer;
  
        if (calculateWinner(newSquares, row, col) === humanPlayer) {
          handleClick(row, col);
          return;
        }
      }
  
      // Random move for normal difficulty
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      const [row, col] = availableMoves[randomIndex];
  
      // Choose a winning move for hard difficulty
      if (availableMoves.length >= 3) {
        for (let i = 0; i < availableMoves.length; i++) {
          const [row, col] = availableMoves[i];
          const newSquares = squares.map((row) => [...row]);
          newSquares[row][col] = computerPlayer;
  
          if (isWinningMove(newSquares, computerPlayer)) {
            handleClick(row, col);
            return;
          }
        }
      }
      handleClick(row, col);
    }
}


function calculateWinner(currentSquares, row, col) {
        const currentPlayer = currentSquares[row][col];
        
        // Check horizontally
        let count = 1;
        let leftCol = col - 1;
        while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
          count++;
          leftCol--;
        }
        let rightCol = col + 1;
        while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
          count++;
          rightCol++;
        }
        if (count >= 5) {
          
          return currentPlayer;
        }

        // Check vertically
        count = 1;
        let topRow = row - 1;
        while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
          count++;
          topRow--;
        }
        let bottomRow = row + 1;
        while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
          count++;
          bottomRow++;
        }
        if (count >= 5) {
          
          return currentPlayer;
        }

        // Check diagonally (top-left to bottom-right)
        count = 1;
        let topLeftRow = row - 1;
        let topLeftCol = col - 1;
        while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
          count++;
          topLeftRow--;
          topLeftCol--;
        }
        let bottomRightRow = row + 1;
        let bottomRightCol = col + 1;
        while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
          count++;
          bottomRightRow++;
          bottomRightCol++;
        }
        if (count >= 5) {
         
          return currentPlayer;
        }

        // Check diagonally (top-right to bottom-left)
        count = 1;
        let topRightRow = row - 1;
        let topRightCol = col + 1;
        while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
          count++;
          topRightRow--;
          topRightCol++;
        }
        let bottomLeftRow = row + 1;
        let bottomLeftCol = col - 1;
        while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
          count++;
          bottomLeftRow++;
          bottomLeftCol--;
        }
        if (count >= 5) {
          
          return currentPlayer;
        }
        window.addEventListener('beforeunload', function (event) {
          // Lưu trữ bàn cờ hiện tại
          const currentSquares = localStorage.setItem('currentSquares', JSON.stringify(currentSquares));
        });

        
      
        return null;
}


function findWinningLine(currentSquares, row, col, winner) {
  const currentPlayer = currentSquares[row][col];
  const lines = [];

  // Check horizontally
  let leftCol = col - 1;
  while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
            lines.push([row, leftCol]);
            leftCol--;
  }
  lines.push([row, col]);
  let rightCol = col + 1;
  while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
            lines.push([row, rightCol]);
            rightCol++;
  }
  if (lines.length >= 5) {
            return lines;
  }

  // Check vertically
  let topRow = row - 1;
  while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
            lines.push([topRow, col]);
            topRow--;
  }
  lines.push([row, col]);
  let bottomRow = row + 1;
  while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
            lines.push([bottomRow, col]);
            bottomRow++;
  }
  if (lines.length >= 5) {
            return lines;
  }

  // Check diagonally (top-left to bottom-right)
  let topLeftRow = row - 1;
  let topLeftCol = col - 1;
  while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
            lines.push([topLeftRow, topLeftCol]);
            topLeftRow--;
            topLeftCol--;
  }
  lines.push([row, col]);
  let bottomRightRow = row + 1;
  let bottomRightCol = col + 1;
  while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
            lines.push([bottomRightRow, bottomRightCol]);
            bottomRightRow++;
            bottomRightCol++;
  }
  if (lines.length >= 5) {
            return lines;
  }

  // Check diagonally (top-right to bottom-left)
  let topRightRow = row - 1;
  let topRightCol = col + 1;
  while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
            lines.push([topRightRow, topRightCol]);
            topRightRow--;
            topRightCol++;
  }
  lines.push([row, col]);
  let bottomLeftRow = row + 1;
  let bottomLeftCol = col - 1;
  while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
            lines.push([bottomLeftRow, bottomLeftCol]);
            bottomLeftRow++;
            bottomLeftCol--;
  }
  if (lines.length >= 5) {
            return lines;
  }

  return [];
}


function updateStatus() {
        if (theWinner) {
          statusElement.textContent = `Chiến thắng: ${theWinner}`;
        } else {
          statusElement.textContent = `Lượt tiếp theo: ${xIsNext ? 'X' : 'O'}`;
        }
}


function restartGame() {
        saveBoard = Array(dimension).fill(Array(dimension).fill(null));
        squares = Array(dimension).fill(null).map(() => Array(dimension).fill(''));
        xIsNext = true; 
        theWinner = null;
        winningLine = [];
        moveHistory = [];       
        renderBoard();
        updateStatus();
        
}


function isWinningMove(currentSquares, player){
    for (let row = 0; row < dimension; row ++){
        for (let col = 0; col < dimension; col ++){
            if (!currentSquares[row][col]){
                const newSquares = currentSquares.map((row =>[...row]));
                newSquares[row][col] = player;
                if (calculateWinner(newSquares, row, col) === player) {
                    return true;
                }
            }
        }
    }
    return false;
}


function toggleSinglePlayerMode() {
  singlePlayerMode = !singlePlayerMode;
  if (singlePlayerMode) {
    singlePlayerToggle.innerHTML = '&#x1F4BB;';
  } else {
    singlePlayerToggle.innerHTML = '&#x1F477; ';
  }
}

renderBoard();
updateStatus();



window.addEventListener('beforeunload', function (event) {
  if (!dataSaved) {
    const data = {
      currentBoard: saveBoard,
      winHistory: winHistory,
      moveHistory: moveHistory,
      xIsNext: xIsNext,
      winningBoard: winningBoard,
      boardWin: boardWin
    };
    
    // Cập nhật lịch sử chiến thắng
    const lastWinResult = winHistory[winHistory.length - 1];
    if (lastWinResult) {
      data.winHistory = winHistory.slice(); // Tạo một bản sao của winHistory để lưu trữ
    }
    
    // Lưu trữ dữ liệu vào Local Storage
    localStorage.setItem('gameData', JSON.stringify(data));
    dataSaved = true;
  }
});

window.addEventListener('load', function () {
  const savedData = localStorage.getItem('gameData');

  if (savedData) {
    const data = JSON.parse(savedData);
    const currentBoard = data.currentBoard;
    const savedWinHistory = data.winHistory;
    const moveHistory = data.moveHistory || [];
    const savedWinningBoard = data.winningBoard;
    const savedBoardWin = data.boardWin;

    // Cập nhật lịch sử chiến thắng từ dữ liệu được khôi phục
    if (savedWinHistory && Array.isArray(savedWinHistory)) {
      winHistory = savedWinHistory.slice(); // Cập nhật winHistory từ dữ liệu khôi phục
    }
    if (savedWinningBoard && Array.isArray(savedWinningBoard)){
      winningBoard = savedWinningBoard.slice();
    }
    if (savedBoardWin && Array.isArray(savedBoardWin)){
      boardWin = savedBoardWin.slice();
    }
    // Khôi phục trạng thái trò chơi
    restoreGameState(currentBoard, winHistory, moveHistory, winningBoard, boardWin);
  }
  
  function restoreGameState(currentBoard, winHistory, moveHistory, winningBoard, boardWin) {
    // Sử dụng dữ liệu để hiển thị trên giao diện người dùng
    const boardElement = document.getElementById('board');
    renderBoard(currentBoard);
  
    // Hiển thị lịch sử chiến thắng
    const winHistoryElement = document.getElementById('win-history');
    renderWinHistory(winHistory); // Gọi hàm renderWinHistory để hiển thị lịch sử chiến thắng
  
    // Thực hiện lại các nước đi trong moveHistory
    for (let i = 0; i < moveHistory.length; i++) {
      const { row, col } = moveHistory[i];
      handleClick(row, col);
    }

    function renderWinHistory(winHistory) {
      const winHistoryElement = document.getElementById("win-history"); // hiển thị lịch sử chiến thắng
      const boardElement = document.getElementById("win-history"); //hiển thị bảng cờ chiến thắng.
      
      // Xóa nội dung hiện tại của boardElement
      boardElement.innerHTML = "";
      // Xóa nội dung hiện tại của winHistoryElement
      winHistoryElement.innerHTML = "";
    
      // Duyệt qua lịch sử chiến thắng và tạo các phần tử HTML tương ứng
      for (let i = 0; i < winHistory.length; i++) {
        const winResult = winHistory[i];
        const squaresWin = boardWin[i];
        const lineWin = winningBoard[i];
    
        if (winResult) {
          const winResultElement = document.createElement("div");
          winResultElement.textContent = `Trận trước thứ ${i + 1}: Người chiến thắng - ${winResult}`;
          winHistoryElement.appendChild(winResultElement);
          
          
          for (let row = 0; row < dimension; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'board-win';
          
            for (let col = 0; col < dimension; col++) {
    
              const value = squaresWin[row][col];
    
              const isWinningBoardWin = lineWin.some(([winRow, winCol]) => winRow === row && winCol === col);
          
              const squareButton = document.createElement('button');
              squareButton.className = 'square';
              squareButton.style.backgroundColor = isWinningBoardWin ? 'yellow' : 'white';
              squareButton.style.color = value === 'X' ? 'blue' : 'red';
              squareButton.style.fontWeight = isWinningBoardWin ? 'bold' : 'normal';
              squareButton.textContent = value;
          
              rowElement.appendChild(squareButton);
            }
          
            boardElement.appendChild(rowElement);
          }
        }
      }
    }
  }
});