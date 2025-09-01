module.exports = {
  name: "tp",
  alias: ["pattern", "tp"],
  desc: "Generate ASCII art patterns",
  category: "fun",
  usage: ".tp <pattern>",
  async execute(sock, msg, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(
          msg.key.remoteJid,
          { text: "❌ Usage: .tp <pattern>\n👉 Example: .tp heart" },
          { quoted: msg }
        );
      }

      const pattern = args[0].toLowerCase();

      const arts = {
        heart: `
   .:::.   .:::.
  :::::::.:::::::
  :::::::::::::::
  ':::::::::::::'
    ':::::::::'
      ':::::'
        ':'`,

        smallheart: `
  ,d88b.d88b,
  88888888888
  'Y8888888Y'
    'Y888Y'  
      'Y'`,

        tree: `
    &&& &&  & &&
   && &\\/&\\|& ()|/ @, &&
   &\\/(/&/&||/& /_/)_&/_&
 &() &\\/&|()|/&\\/ '%" &
  &_\\_&&_\\ |& |&&/&__%_/
 &&   && & &| &| /& & % ()&
    ()&_---()&\\&\\|&&-&&--%
          &&     \\|||
                  |||
                  |||
                  |||`,

        rocket: `
        /\\
       |==|
       |  |
       |  |
      /____\\
      |    |
      |🚀 |
      |    |
     /| |  |\\
    /_|_|__|_\\`,

        cat: `
 /\\_/\\  
( o.o ) 
 > ^ <`,

        dog: `
 / \\__
(    @\\____
 /         O
/   (_____/
/_____/   U`,

        rabbit: `
  (\\_/)
  ( •_•)
  />🥕`,

        fish: `
><(((('>`,

        bird: `
  \\
   \\\\
    (o>
\\\\_//)
 \\_/_)
  _|_`,

        owl: `
 ,_,  
(o,o) 
(   ) 
 " " `,

        penguin: `
   (o_>
  //\\
  V_/_`,

        elephant: `
   /  \\~~~/  \\
  (    . .    )
  (    \\_v/   )`,

        monkey: `
  w  c( .. )o
   \\__(- )
      /\`-\\`,

        skull: `
  _____
 /     \\
| () () |
 \\  ^  /
  |||||
  |||||`,

        ghost: `
 .-"      "-.
 /            \\
|,  .-.  .-.  ,|
| )(_o/  \\o_)( |
|/     /\\     \\|
(_     ^^     _)
 \\__|IIIIII|__/
  | \\IIIIII/ |
  \\          /
   \`--------\``,

        flower: `
   @@@
  @@@@@
 @@@@@@@
  @@@@@
   @@@
    |`,

        crown: `
   .-=========-.
   \\'-=======-'/
   _|   .=.   |_
  ((|  {{1}}  |))
   \\|   /|\\   |/
    \\__\\'-'__/`,

        car: `
    ______
 __//__|__\\\\___
| _ | -|-  _ |
'-(_)--(_)--(_)'`,

        bike: `
   __o
 _ \\<_
(_)/(_)`,

        boat: `
     |    |    |
    )_)  )_)  )_)
   )___))___))___)
  )____)____)_____)
\\_____|____|____|____/
 \\                   /
~~~~~~~~~~~~~~~~~~~~~~~~`,

        plane: `
     __|__
--@--@--(_)--@--@--`,

        sword: `
     />======================
[########[]==================>
     \\>`,

        gun: `
   _,--=--._
 ,'          '.
 /    _..._    \\
|   /_...._\\    |
|                |
 \\              /
  \`'--......--'`,

        house: `
    /\\
   /  \\
  /____\\
 |      |
 | [] []|
 |      |`,

        robot: `
 [::]   [::]
 [::]   [::]
   \\_____/ 
   / 0 0 \\
  (   -   )
   \\_____/
   /     \\
  (_______)`,

        alien: `
   .-""-.
  /[] _ _\\_
 _|_o_LII|_|
/ | ==== | \\
||  ====  ||`,

        banner: `
██████╗  █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗ 
██╔══██╗██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗
██████╔╝███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
██╔═══╝ ██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
██║     ██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝`,

        smiley: `
   _____
  /     \\
 | () () |
  \\  ^  /
   |||||
   |||||`
      };

      if (!arts[pattern]) {
        return await sock.sendMessage(
          msg.key.remoteJid,
          { text: "❌ Pattern not found!\n👉 Try: heart, tree, rocket, cat, dog, rabbit, fish, bird, penguin, skull, ghost, crown, car, bike, boat, plane, sword, house, robot, banner, etc." },
          { quoted: msg }
        );
      }

      // ✅ monospace always
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "```" + arts[pattern].trim() + "```" },
        { quoted: msg }
      );
    } catch (e) {
      console.error("❌ Error in tp plugin:", e);
    }
  }
};
