/**
 * Created by hass on 7/8/2015.
 */
var express = require('express');
var application=express();
application.use(express.static(__dirname + '/musictube'));

application.listen(process.env.PORT || 3000);