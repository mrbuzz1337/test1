const { Collection } = require("discord.js");

const databaseCache = new Collection();

module.exports = {

    /**
     * Gets the users data
     * @param {object} client The discord client
     * @param {array} users The users to gets data
     * @returns The users data
     */
    async getUsersData(client, users){
        return new Promise(async function(resolve, reject){
            let usersData = [];
            for(const user of users){
                if(databaseCache.get(user.id)){
                    return databaseCache.get(user.id);
                } else {
                    const foundUserData = await client.usersData.findOne({ id: user.id });
                    if(foundUserData){
                        usersData.push(foundUserData);
                        databaseCache.set(user.id, foundUserData);
                    } else {
                        const userData = new client.usersData({ id: user.id });
                        databaseCache.set(user.id, userData);
                        usersData.push(userData);
                        databaseCache.set(user.id, foundUserData);
                    }
                }
            }
            resolve(usersData);
        });
    },

    /**
     * Gets message prefix
     * @param {object} message The Discord message
     * @returns The prefix
     */
    getPrefix(message, data){
        if(message.channel.type !== "dm"){
            const prefixes = [
                `<@${message.client.user.id}>`,
                data.config.botname,
                data.guild.prefix
            ];
            let prefix = null;
            prefixes.forEach((p) => {
                if(message.content.startsWith(p)){
                    prefix = p;
                }
            });
            return prefix;
        } else {
            return true;
        }
    },

    // This function return a valid link to the support server
    async supportLink(client){
        return new Promise(async function(resolve, reject) {
            let guild = client.guilds.get(client.config.support.id);
            let member = guild.me;
            let channel = guild.channels.find((ch) => ch.permissionsFor(member.id).has("CREATE_INSTANT_INVITE"));
            if(channel){
                let invite = await channel.createInvite({maxAge :0}).catch((err) => {});
                resolve(invite ? invite.url : null);
            } else {
                resolve("https://atlanta-bot.fr");
            }
        });
    },

    // This function sort an array 
    sortByKey(array, key) {
        return array.sort(function(a, b) {
            let x = a[key];
            let y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    },

    // This function return a shuffled array
    shuffle(pArray) {
        let array = [];
        pArray.forEach(element => array.push(element));
        let currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },

    // This function return a random number between min and max
    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
};