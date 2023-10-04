let games = [{ name: 'Tic Tac Toe', url: 'https://playtictactoe.org/' }, { name: 'a Chess Game', url: 'https://www.chess.com/play/computer' }];
let selectedGame = games[Math.floor(Math.random() * games.length)];
NewWindow = window.open(selectedGame.url, '_blank');
Reply('Let\'s play ' + selectedGame.name + '!');
