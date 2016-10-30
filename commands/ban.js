exports.names = ['ban', 'unban'];
exports.hidden = true;
exports.enabled = true;
exports.cdAll = 10;
exports.cdUser = 10;
exports.cdStaff = 10;
exports.minRole = PERMISSIONS.BOUNCER;
exports.handler = function (data) {

    var input = data.message.split(' ');
    var command = _.first(input);
    var params = _.rest(input);
    var username = '';
    var duration = 'PERMA';
    var message = '';

    if (params.length >= 2) {
        username = _.initial(params).join(' ').trim();
        duration = _.last(params).toUpperCase();
    }
    else if (params.length == 1) {
        username = params.join(' ').trim();
    }
    else {
        bot.sendChat('Usage: .[ban|unban|kick] username [PERMA|DAY|HOUR]');
        return;
    }

    var usernameFormatted = S(username).chompLeft('@').s;

    // Don't let bouncers get too feisty (API should prohibit this, but just making sure!
    if (!settings.bouncerplus && data.from.role < 3) {
        duration = 'HOUR';
    }

    switch (duration) {
        case 'DAY':
            apiDuration = PlugAPI.BAN.DAY;
            break;
        case 'PERMA':
            apiDuration = PlugAPI.BAN.PERMA;
            break;
        case 'HOUR':
        default:
            apiDuration = PlugAPI.BAN.HOUR;
            break;

    }

    models.User.find({where: {username: usernameFormatted, site: config.site}}).then(function (row) {
        if (row === null) {
            bot.sendChat('/me ' + usernameFormatted + ' was not found.');
        } else {
            switch (command) {
                case 'ban':
                    console.log('[BAN] ' + usernameFormatted + ' attempting ban for ' + duration + ' (' + apiDuration + ') by ' + data.from.username);
                    bot.moderateBanUser(row.site_id, 0, apiDuration);
                    break;
                case 'unban':
                    bot.moderateUnbanUser(row.site_id, function () {
                        bot.sendChat('/me unbanning ' + usernameFormatted + '. This can take a few moments...');
                    });
                    break;
            }
        }
    });


};
