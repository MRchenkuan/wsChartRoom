/**
 * Created by chenkuan on 2017/3/9.
 */
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io');
var Msg = require('./Msg');
var Member = require('./Member');
var nameMap = {};
var onlineList = [];
var Color = {
    success:'#green',
    danger:'#red'
};

app.use('/static',express.static(path.resolve(__dirname,'./static')));

app.get('/', function (req, res) {
    res.sendfile('index.html')
});

app.get('/index.html', function (req, res) {
    res.sendfile('index.html')
});

// 启动服务器
var server = http.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
    console.log('static in ', path.resolve(__dirname,'./static'));
});

var socket= io.listen(server);

// 添加一个连接监听器
socket.on('connection', function(client){


    // 收到姓名提交事件
    client.on('entername',function (name) {
        var member = new Member(name);
        member.client = client;
        nameMap[client.id] = member;
        client.emit('named',name);

        // 通知用户当前在线人数
        refreshOnlineList();
        for(var clientId in nameMap){
            var _member = nameMap[clientId];
            var _client = _member.client;
            if(_client)_client.emit('memberInfos',onlineList);
        }
    });

    if(!nameMap.hasOwnProperty(client.id))
        client.emit('unnamed','请输入一个名字');

    // 成功！现在开始监听接收到的消息
    client.on('message',function(msgdate){
        var author  = nameMap[client.id];
        if(!author){
            client.emit("offline",'你已经离线，请刷新重试');
            return;
        }
        var msg = new Msg(msgdate,Color.success);
        msg.author = author.name;
        // 广播消息
        for(var clientId in nameMap){
            var member = nameMap[clientId];
            var _client = member.client;
            if(_client)_client.send(msg);
        }
    });

    client.on('disconnect',function(){
        delete nameMap[client.id];
        // 通知用户当前在线人数
        refreshOnlineList();
        for(var clientId in nameMap){
            var _member = nameMap[clientId];
            var _client = _member.client;
            if(_client)_client.emit('memberInfos',onlineList);
        }
        console.log(onlineList)
    });
});

// 在线用户列表
function refreshOnlineList() {
    onlineList = [];
    for(var clientId in nameMap) {
        var _member = nameMap[clientId];
        onlineList.push(_member.name);
    }
}
