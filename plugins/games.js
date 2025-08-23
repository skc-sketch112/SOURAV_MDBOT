// games.js
const ludoGames = {};
const chessGames = {};

module.exports = {
  name: "games",
  command: ["games", "ludo", "chess"],
  description: "Play Ludo, Chess and more 🎮",

  async execute(sock, m, args, command) {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // ───── 📜 GAMES MENU ─────
    if (command === "games") {
      const menu = `
🎮 *Games Menu* 🎮

1️⃣ Ludo Game
   - .ludo → create game
   - .ludo join → join game
   - .ludo start → start game
   - .ludo roll → roll dice

2️⃣ Chess Game
   - .chess → start game
   - .chess move e2e4 → make a move
   - .chess history → view moves
   - .chess end → end game
`;
      return sock.sendMessage(jid, { text: menu }, { quoted: m });
    }

    // ───── 🎲 LUDO GAME ─────
    if (command === "ludo") {
      if (!ludoGames[jid]) {
        ludoGames[jid] = { turn: sender, players: [sender], positions: {}, started: false };
        ludoGames[jid].positions[sender] = 0;
        return sock.sendMessage(jid, { text: "🎲 *Ludo Created!* Type `.ludo join` to join, `.ludo start` to begin." }, { quoted: m });
      }

      const game = ludoGames[jid];

      if (args[0] === "join") {
        if (game.started) return sock.sendMessage(jid, { text: "⚠️ Game already started!" }, { quoted: m });
        if (game.players.includes(sender)) return sock.sendMessage(jid, { text: "⚠️ You already joined!" }, { quoted: m });
        game.players.push(sender);
        game.positions[sender] = 0;
        return sock.sendMessage(jid, { text: `✅ Player joined! Total players: ${game.players.length}` }, { quoted: m });
      }

      if (args[0] === "start") {
        if (game.started) return sock.sendMessage(jid, { text: "⚠️ Game already running!" }, { quoted: m });
        if (game.players.length < 2) return sock.sendMessage(jid, { text: "⚠️ Need at least 2 players!" }, { quoted: m });
        game.started = true;
        return sock.sendMessage(jid, { text: `🎮 Ludo started!\nFirst turn: @${game.turn.split('@')[0]}`, mentions: [game.turn] }, { quoted: m });
      }

      if (args[0] === "roll") {
        if (!game.started) return sock.sendMessage(jid, { text: "⚠️ Game not started!" }, { quoted: m });
        if (game.turn !== sender) return sock.sendMessage(jid, { text: "⏳ Not your turn!" }, { quoted: m });

        const roll = Math.floor(Math.random() * 6) + 1;
        game.positions[sender] += roll;

        let msg = `🎲 @${sender.split('@')[0]} rolled a *${roll}*!\nPosition: ${game.positions[sender]}`;
        if (game.positions[sender] >= 30) {
          msg += `\n🏆 @${sender.split('@')[0]} WINS LUDO!`;
          delete ludoGames[jid];
        } else {
          const nextIndex = (game.players.indexOf(sender) + 1) % game.players.length;
          game.turn = game.players[nextIndex];
          msg += `\n👉 Next turn: @${game.turn.split('@')[0]}`;
        }

        return sock.sendMessage(jid, { text: msg, mentions: game.players }, { quoted: m });
      }

      return sock.sendMessage(jid, { text: "⚠️ Use `.ludo join | start | roll`" }, { quoted: m });
    }

    // ───── ♟️ CHESS GAME ─────
    if (command === "chess") {
      if (!chessGames[jid]) {
        chessGames[jid] = { player: sender, moves: [] };
        return sock.sendMessage(jid, { text: "♟️ *Chess Started!* Use `.chess move e2e4`" }, { quoted: m });
      }

      const game = chessGames[jid];

      if (args[0] === "move") {
        if (!args[1]) return sock.sendMessage(jid, { text: "⚠️ Example: `.chess move e2e4`" }, { quoted: m });
        const move = args[1];
        game.moves.push({ player: sender, move });

        let reply = `♟️ @${sender.split('@')[0]} played *${move}*`;

        // Bot random move
        const files = "abcdefgh";
        const ranks = "12345678";
        const botMove =
          files[Math.floor(Math.random() * 8)] +
          ranks[Math.floor(Math.random() * 8)] +
          files[Math.floor(Math.random() * 8)] +
          ranks[Math.floor(Math.random() * 8)];
        game.moves.push({ player: "BOT", move: botMove });
        reply += `\n🤖 BOT replies with *${botMove}*`;

        return sock.sendMessage(jid, { text: reply, mentions: [sender] }, { quoted: m });
      }

      if (args[0] === "history") {
        let history = game.moves.map(mv => `${mv.player === "BOT" ? "🤖 BOT" : "👤 Player"}: ${mv.move}`).join("\n");
        return sock.sendMessage(jid, { text: `📜 *Moves:*\n${history || "No moves yet!"}` }, { quoted: m });
      }

      if (args[0] === "end") {
        delete chessGames[jid];
        return sock.sendMessage(jid, { text: "✅ Chess game ended!" }, { quoted: m });
      }

      return sock.sendMessage(jid, { text: "⚠️ Use `.chess move | history | end`" }, { quoted: m });
    }
  }
};
