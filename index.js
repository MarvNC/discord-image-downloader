const token = 'Discord Token'
const channelToScan = 'Channel to download images off of';
const userID = 'User ID';

const download = require('download');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(token);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    let channel = client.channels.get(channelToScan);
    let messages = await channel
        .fetchMessages({ limit: 100 })
        .catch(console.error);

    let newMessages = messages;
    let lastId;
    do {
        lastId = newMessages.last().id;
        newMessages = await channel
            .fetchMessages({ limit: 100, before: lastId })
            .catch(console.error);
        messages = messages.concat(messages, newMessages);
    } while (newMessages.size === 100)
    console.log(`fetched ${messages.size} messsages in total`);
    let amount = 0;
    let messageURLs = [];
    for (const message of messages.array().reverse()) {
        if (message.author.id === userID) {
            let url = false;
            for (attachment of message.attachments.array()) {
                messageURLs.push(attachment.url);
                url = true;
            }
            for (messageEmbed of message.embeds) {
                if (messageEmbed.type === 'image') {
                    //console.log(messageEmbed);
                    messageURLs.push(messageEmbed.thumbnail.url);
                    url = true;
                }
            };
            if(url){
                amount++
                console.log(amount + ' image URLs grabbed');
            }
        }
    };
    console.log(`Finished getting ${amount} URLs`);
    amount = 0;
    failed = 0;
    for(imageURL of messageURLs){
        amount++;
        console.log(`${amount} / ${messageURLs.length} images, ${failed} failed images : downloading ${imageURL}`);
        try {
            await download(imageURL, 'output')
        } catch (error) {
            console.error(error);
            failed++;
        }
    }

    console.log(`Finished downloading all ${messageURLs.length} images`);
    process.exit();
});

client.on('error', console.error);
