const { VK, API, Keyboard } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const drawMeme = require('./lib/drawMeme');
const dataBase = require('./lib/dataBase');
const config = require('./lib/config.json');

const vk = new VK({
    token: config.token,
});
const api = new API({
    token: config.token,
});
const hearManager = new HearManager();

vk.updates.on('message_new', hearManager.middleware);
dataBase.initialize();

hearManager.hear(/начать|помощь|старт|команды|start|help|привет|hello/i, async (context) => {
    if(!(await dataBase.user.findOne({ id: context.senderId }))){
        console.log('Регистрируем пользователя');
        const newUser = new dataBase.user({
            id: context.senderId,
            author:'',
            text: '', 
            photoUrl: '',
            lastAsk: 0,
        });
        newUser.save();
    }
    await context.send(
    `
Привет, я помогу сделать цитату в нашем дизайне!
Задай три параметра с помощью команд:
автор *имя автора*
цитата *текст цитаты*
фото *к сообщению нужно прикрепить фото для фона*
Фото будет обрезано под размер, так что постарайся отредактировать его так, чтобы ничего не потерять!
Когда закончишь напиши "готово"!
Вот так:`
    ); 
    await context.sendPhotos({value: './lib/example.jpg'});
    await context.send('Или перешли сообщение от любого пользователя с командой "мем", чтобы бот сделал из него цитату.');
});

hearManager.hear(/автор\s(.*)/i, async (context) => {
    if(!(await dataBase.user.findOne({ id: context.senderId }))){
        console.log('Регистрируем пользователя');
        const newUser = new dataBase.user({
            id: context.senderId,
            author:'',
            text: '', 
            photoUrl: '',
            lastAsk: 0,
        });
        newUser.save();
    }
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                author: context.$match[1],
            }
        });
    await context.send(`Установлен автор "${context.$match[1]}"`);
});

hearManager.hear(/цитата\s(.*)/i, async (context) => {
    if(!(await dataBase.user.findOne({ id: context.senderId }))){
        console.log('Регистрируем пользователя');
        const newUser = new dataBase.user({
            id: context.senderId,
            author:'',
            text: '', 
            photoUrl: '',
            lastAsk: 0,
        });
        newUser.save();
    }
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                text: context.$match[1],
            }
        });
    await context.send(`Установлена цитата "${context.$match[1]}"`);
});

hearManager.hear(/фото/i, async (context) => {
    if(!(await dataBase.user.findOne({ id: context.senderId }))){
        console.log('Регистрируем пользователя');
        const newUser = new dataBase.user({
            id: context.senderId,
            author:'',
            text: '', 
            photoUrl: '',
            lastAsk: 0,
        });
        newUser.save();
    }
    await dataBase.user.updateOne({id:context.senderId},
        {
            $set: {
                photoUrl: context.attachments[0].largeSizeUrl,
            }
        });
    await context.send("Установлено фото");
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
        await context.send('Чтобы сделать новую цитату просто задай нового автора, текст и фото, и повтори команду "готово"')
    }
    else{
        await context.send('Кажется, какой то параметр не задан!');
    }

    today = new Date().getDate();
    const user = await dataBase.user.findOne({ id: context.senderId });
    lastAsk = user.lastAsk;

    if((!(await api.groups.isMember({
        group_id: config.groupId,
        user_id: context.senderId,
    })) && lastAsk != today)){ // здесь допущение, что два использования неподписанным пользователем не должны произойти в то же число разных месяцев
        await context.send({
            message: 'Кажется, ты не подписан на паблик! Подпишись, чтобы не потерять.',
            keyboard: Keyboard.builder().urlButton({
                label: 'Подписаться',
                url: 'https://vk.com/widget_community.php?act=a_subscribe_box&oid=-' + config.groupId + '&state=1'
            }),
        });
        await dataBase.user.updateOne({id:context.senderId},
            {
                $set: {
                    lastAsk: today,
                }
        });
    }
});

hearManager.hear(/мем/i, async (context) => {
    if(!(await dataBase.user.findOne({ id: context.senderId }))){
        console.log('Регистрируем пользователя');
        const newUser = new dataBase.user({
            id: context.senderId,
            author:'',
            text: '', 
            photoUrl: '',
            lastAsk: 0,
        });
        newUser.save();
    }
    if(context.forwards){
        let users = await api.users.get(
        {
            user_ids: context.forwards[0].senderId,
            fields: "photo_max_orig",
        });
        if(users[0].first_name && users[0].last_name && context.forwards[0].text && users[0].photo_max_orig){
            let img = await drawMeme.draw(context.forwards[0].text, users[0].first_name+" "+users[0].last_name, users[0].photo_max_orig);
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
            context.send('Кажется, что-то пошло не так...');
        }

        today = new Date().getDate();
        const user = await dataBase.user.findOne({ id: context.senderId });
        lastAsk = user.lastAsk;

        if((!(await api.groups.isMember({
            group_id: config.groupId,
            user_id: context.senderId,
        })) && lastAsk != today)){ // здесь допущение, что два использования неподписанным пользователем не должны произойти в то же число разных месяцев
            await context.send({
                message: 'Кажется, ты не подписан на паблик! Подпишись, чтобы не потерять.',
                keyboard: Keyboard.builder().urlButton({
                    label: 'Подписаться',
                    url: 'https://vk.com/widget_community.php?act=a_subscribe_box&oid=-' + config.groupId + '&state=1'
                }),
            });
            await dataBase.user.updateOne({id:context.senderId},
                {
                    $set: {
                        lastAsk: today,
                    }
            });
        }
    }
});

console.log('Бот запущен!');
vk.updates.start().catch(console.error);