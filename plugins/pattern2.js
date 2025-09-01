// 🎨 30 ASCII Art Patterns
const patterns = {
    hi: `
H   H  IIIII
H   H    I
HHHHH    I
H   H    I
H   H  IIIII
`,
    hello: `
H   H  EEEEE  L      L       OOO
H   H  E      L      L      O   O
HHHHH  EEEE   L      L      O   O
H   H  E      L      L      O   O
H   H  EEEEE  LLLLL  LLLLL   OOO
`,
    love: `
L      OOO   V   V  EEEEE
L     O   O  V   V  E
L     O   O  V   V  EEEE
L     O   O   V V   E
LLLL   OOO     V    EEEEE
`,
    sourav: `
S OOO U   U RRRR   A  V   V
S O O U   U R   R A A V   V
S O O U   U RRRR  AAA  V V
S O O U   U R R  A   A  V
S OOO  UUU  R  RR A   A  V
`,
    india: `
I  N   N DDDD  I   A
I  NN  N D   D I  A A
I  N N N D   D I AAAAA
I  N  NN D   D I A   A
I  N   N DDDD  I A   A
`,
    star: `
    *
   ***
  *****
   ***
    *
`,
    heart: `
  **   **
 ****** ******
 *************
  ***********
   *********
    *******
     *****
      ***
       *
`,
    smile: `
  *****
 *     *
* 0   0 *
*   ^   *
 * \\___/ *
  *****
`,
    crown: `
   *   *   *
    * * * *
     * * *
      * *
       *
`,
    sun: `
 \\   |   /
  .-----.
 -  ☼ ☼  -
  '-----'
 /   |   \\
`,
    moon: `
   ______
  /      \\
 |  ()    |
  \\______/
`,
    cat: `
 /\\_/\\  
( o.o ) 
 > ^ <
`,
    dog: `
 /\\_/\\  
( •_• ) 
/ >🍖   
`,
    bird: `
 \\
  \\
   (o>
\\_//)
 \_/_)
  _|_
`,
    tree: `
   &&& &&  & &&
  && &\\/&\\|& ()|/ @, &&
  &\\/(/&/&||/& /_/)_&/_&
 &() &\\/&|()|/&\\/ '%" &
 &_\\_&&_\\ |& |&&/&__%_&
`,
    rose: `
     @@@
   @@@@@@@
  @@@@@@@@@
   @@@@@@@
     @@@
`,
    diamond: `
    /\\
   /  \\
  /    \\
  \\    /
   \\  /
    \\/
`,
    fire: `
   (  .      )
   )           (              )
          .  '   .   '  .  '  .
  (    , )       (.   )  (   ',    )
   .' ) ( . )    ,  ( ,     )   ( .
`,
    water: `
 ~    ~     ~
~     ~    ~
    ~     ~
`,
    dragon: `
          / \\  //\\
   |\\___/|      /   \\//  \\\\
   /O  O  \\__  /    //  | \\ \\    
  /     /  \\/_/    //   |  \\  \\  
  \\_^_\\'/   \\/_   //    |   \\   \\ 
   //        \\/_ //     |    \\    \\
  ( |         \\///      |     \\     \\
`,
    lion: `
  ,w.
 ,YWMMw  ,M  ,
__   __   __
'YMb_w_d8P'
   "YMMMP"
`,
    music: `
 ♪ ♫ ♬ ♭ ♮ ♯
(  )   (  )
| /     \\ |
| \\     / |
`,
    dance: `
\\o/   \\o/ 
 |     |  
/ \\   / \\
`,
    firework: `
     *
   * | *
 * --*-- *
   * | *
     *
`,
    arrow: `
   ^
  / \\
 /   \\
<     >
 \\   /
  \\ /
   v
`,
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
   '--------'
`,
    skull: `
     _____
   .-'     '-.
  /           \\
 | ,  .-.  .-. |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
 | |  | |  | | |
  \\           /
   '-._____.-'
`,
    crown2: `
    _/\\_
   /    \\
  |      |
  | (__) |
   \\____/
`
};

module.exports = {
    name: "pattern2",
    command: ["pattern2", "tp"],
    execute: async (sock, m, args) => {
        try {
            const jid = m?.key?.remoteJid;
            if (!jid) return;

            if (!args || args.length === 0) {
                return await sock.sendMessage(
                    jid,
                    { text: "❌ Please provide a word!\nExample: .pattern2 hi" },
                    { quoted: m }
                );
            }

            const input = args[0].toLowerCase();
            const art = patterns[input];

            if (!art) {
                return await sock.sendMessage(
                    jid,
                    { text: `❌ No pattern found for "${input}". Try: hi, hello, love, sourav, india, star, heart, smile, crown, sun, moon, cat, dog, bird, tree...` },
                    { quoted: m }
                );
            }

            await sock.sendMessage(jid, { text: art }, { quoted: m });

        } catch (err) {
            console.error("Error in pattern2.js:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error while generating pattern." }, { quoted: m });
        }
    }
};
