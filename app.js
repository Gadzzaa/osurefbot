const Banchojs = require("bancho.js");
const client = new Banchojs.BanchoClient(require("./config.json"));
const settings = require("./settings.json")

let lobby;

const p1 = settings.Player1Name;
const p2 = settings.Player2Name;
const roomsize = settings.RoomSize;
const prefix = settings.Prefix;
const movefeatr = settings.MoveFeature;
let playerjnd1 = false;
let playerjnd2 = false;

client.connect().then(async () => {
        console.log("Log : Connected to bancho!");
        const channel = await client.createLobby(prefix + " : " + p1 + " VS " + p2);
        lobby = channel.lobby;
        const password = Math.random().toString(36).substring(8);
        await Promise.all([lobby.setPassword(password)]);
        console.log("Log : Lobby created! Name: " + lobby.name + ", password: " + password);
        console.log("Multiplayer link: https://osu.ppy.sh/mp/" + lobby.id);
        console.log("Creation Passed")
        await lobby.invitePlayer(p1);
        console.log("Invite 1 Passed")
        await lobby.invitePlayer(p2);
        console.log("Invite 2 Passed")
        if(movefeatr === true)
        {
            lobby.on("playerJoined", (obj) => {
                console.log("Player Joined")
                if (obj.player.user.username === p1) {
                    playerjnd1 = true
                    if(lobby.getPlayerSlot(obj.player) !== 0 )
                    {
                        console.log("Got Player Slot")
                        lobby.movePlayer(obj.player,0);
                        console.log("Move Request sent")
                    }
    
                } else {
                    if (obj.player.user.username === p2) {
                        playerjnd2 = true
                        if(lobby.getPlayerSlot(obj.player) !== 1 )
                        {
                            console.log("Got Player Slot")
                            lobby.movePlayer(obj.player,1);
                            console.log("Move Request sent")
                        }
                    } else {
                        lobby.kickPlayer(obj.player.user.username);
                        console.log("Player Kicked")
                    }
                }
            });
        }else
        {
            lobby.on("playerJoined", (obj) => {
                console.log("Player Joined")
                if (obj.player.user.username === p1) {
                    playerjnd1 = true;
                } else {
                    if (obj.player.user.username === p2) {
                        playerjnd2 = true;
                    } else {
                        lobby.kickPlayer(obj.player.user.username);
                        console.log("Player Kicked")
                    }
                }
            });
        }

        lobby.on("playerLeft", (obj) => {
            console.log("Player Left")
            if (obj.user.username === p1) {
                playerjnd1 = false;
            } else {
                if (obj.user.username === p2) {
                    playerjnd2 = false;
                }
            }
        });
        
        client.on("CM", (message) => {
            if(message.message.indexOf("!rSlots") === 0)
            {
                if(playerjnd1 === true && playerjnd2 === true)
                {
                    lobby.setSize(roomsize+1);
                    lobby.movePlayer(lobby.getPlayerByName(p2),2);
                    lobby.movePlayer(lobby.getPlayerByName(p1),0);
                    lobby.movePlayer(lobby.getPlayerByName(p2),1);
                    lobby.setSize(roomsize);
                }else
                {
                    console.log("Error. One or more players are not in the lobby!")
                }
            }
        });
        await lobby.setSettings(0, 4, roomsize);
        console.log("Settings Passed")
}).catch(console.error);

process.on("SIGINT", async () => {
    console.log("Closing lobby and disconnecting...");
    await lobby.closeLobby();
    console.log("Lobby Closed")
    await client.disconnect();
    console.log("Disconnected")
});


