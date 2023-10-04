(async () => {
    let req = await FetchJSON('http://ip-api.com/json');
    console.log('OK')
    Reply('You are at ' + req.city + ', ' + req.regionName + ', ' + req.country);
})();