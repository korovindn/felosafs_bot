const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const drawMeme = require('./lib/drawMeme');
const dataBase = require('./lib/dataBase');
const config = require('./lib/config.json');

const vk = new VK({
    token: config.token,
});
const hearManager = new HearManager();

vk.updates.on('message_new', hearManager.middleware);
dataBase.initialize();

hearManager.hear(/начать/i, async (context) => {
        if(!(await dataBase.user.findOne({ id: context.senderId }))){
            console.log('Регистрируем пользователя');
            const newUser = new dataBase.user({
                id: context.senderId,
                author:'',
                text: '', 
                photoUrl: '',
            });
            newUser.save();
        }
		context.send(
        `Привет, я помогу сделать цитату в нашем дизайне!
        Задай три параметра с помощью команд:
        автор *имя автора*
        цитата *текст цитаты*
        фото *к сообщению нужно прикрепить фото для фона*
        Когда закончишь напиши "готово"!
        Вот так:`
        ); 
        await context.sendPhotos({value: './lib/example.jpg'});
        context.send('Фото будет обрезано под размер, так что постарайся отредактировать его так, чтобы ничего не потерять!');
});

hearManager.hear(/автор\s(.*)/i, async (context) => {
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                author: context.$match[1],
            }
        });
    context.send(`Установлен автор "${context.$match[1]}"`);
});

hearManager.hear(/цитата\s(.*)/i, async (context) => {
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                text: context.$match[1],
            }
        });
    context.send(`Установлен текст "${context.$match[1]}"`);
});

hearManager.hear(/фото/i, async (context) => {
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                photoUrl: context.attachments[0].largeSizeUrl,
            }
        });
    context.send("Установлено фото");
    await context.sendPhotos({value: context.attachments[0].largeSizeUrl});
});

hearManager.hear(/готово/i, async (context) => {
    let toDraw = await dataBase.user.findOne({ id: context.senderId });
    if(toDraw.author && toDraw.text && toDraw.photoUrl){
        let img = await drawMeme.draw(toDraw.text, toDraw.author, toDraw.photoUrl);
        const imgBuffer = Buffer.from(img.replace('data:image/png;base64,', ''), 'base64');
        await Promise.all([
            context.send('Рисую'),
            context.sendPhotos({
                value: imgBuffer
            }),
        ]);
        context.send('Чтобы сделать новую цитату просто задай нового автора, текст и фото, и повтори команду "готово"')
    }
    else{
        context.send('Кажется, какой то параметр не задан!');
    }
});

console.log('Бот запущен!');
vk.updates.start().catch(console.error);