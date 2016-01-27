var fs = require('fs');
var JSFtp = require("jsftp");
var JexiaClient = require('jexia-sdk-js').JexiaClient;
var jstoxml = require('jstoxml');
//var notifier = require('node-notifier');

//FTP CREDENTIALS
var Ftp = new JSFtp({
    host: "ftp.domain.nl",
    port: 21,
    user: "",
    pass: "",
    debugMode: true
});

//JEXIA CREDENTIALS
//LOGIN TO JEXIA AND GET CREDENTIALS
var Jexia = new JexiaClient({
    appId: '',
    appKey: '',
    appSecret: ''
}).then(function (app) {
    //WORK WITH DataSet "invoices"
    var invoces = app.dataset('invoices');

    //SUBSCRIBE TO ALL JEXIA EVENT ON DataSet "invoices"
    invoces.subscribe('*', function (message) {
        console.log(message);

        var inv_data = message.data;

        var file_name = 'gen-' + new Date() + '.xml';
        var x = jstoxml.toXML({export: inv_data}, {header: true, indent: '  '});
        //CREATE XML LOCALLY
        fs.writeFile(file_name, x, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved [" + file_name + "]");
            //UPLOAD FILE TO FTP
            Ftp.put(file_name, file_name, function (err) {
                if (!err) {
                    //REMOVE FROM LOCAL
                    console.log("Upload DONE!");
                    fs.unlinkSync(file_name);

                    //OS LOCAL NOTIFICATION
                    //notifier.notify({
                    //    'title': 'Jexia Notification',
                    //    'message': 'File created and uploaded!'
                    //});

                } else {
                    console.log("Upload failed");
                }
            });

        });
    });
});
