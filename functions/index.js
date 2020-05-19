"use-strict"
//import firebase
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, Payload } = require('dialogflow-fulfillment');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
var admin = require("firebase-admin");
var cors = require('cors')({ orgin: true });
var serviceAccount = require("");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://agricornchatbot.firebaseio.com/"
});
exports.shanbCorn = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    // trigger when value is not mathch with intents
    function DefaultFallbackIntent() {
        if (request.body.queryResult.outputContexts == undefined || request.body.queryResult.outputContexts.length <= 1) {
            agent.add("哎呀，難倒我傻玉米機器人了\n等我老闆回來，會盡快聯繫你ㄋㄟ ！\n如果有問題，也可以先問我哦");
            if (request.body.originalDetectIntentRequest.source == "line") {
                const optionMessage = {
                    "type": "sticker",
                    "packageId": "11539",
                    "stickerId": "52114124",

                    "quickReply": {
                        "items": [{
                                "type": "action",
                                "action": {
                                    "type": "message",
                                    "label": "我有問題",
                                    "text": "我有問題"
                                }
                            },
                            {
                                "type": "action",
                                "action": {
                                    "type": "message",
                                    "label": "我能做什麼?",
                                    "text": "我能做什麼?"
                                }
                            }
                        ]
                    }
                }
                var payload = new Payload('LINE', optionMessage, {
                    sendAsMessage: true
                });
                agent.add(payload);
            }

            if (request.body.originalDetectIntentRequest.source == "facebook") {
                agent.add(new Payload(agent.FACEBOOK, {
                    "text": "哎呀，難倒我傻玉米機器人了\n等我老闆回來，會盡快聯繫你ㄋㄟ ！\n如果有問題，也可以先問我哦",
                    "quick_replies": [{
                            "content_type": "text",
                            "title": "我有問題",
                            "image_url": "http://example.com/img/red.png",
                            "payload": "我有問題"
                        },
                        {
                            "content_type": "text",
                            "title": "我能做什麼?",
                            "image_url": "http://example.com/img/red.png",
                            "payload": "我能做什麼?"
                        }
                    ]
                }));
            }

        } else {
            if (request.body.originalDetectIntentRequest.source == "line") {
                agent.add('你的問題我轉達了喔');
                const lineStickerMessage = {
                    "type": "sticker",
                    "packageId": "11539",
                    "stickerId": "52114117",
                }
                var stickerPayload = new Payload('LINE', lineStickerMessage, {
                    sendAsMessage: true
                });
                agent.add(stickerPayload);
            }
            if (request.body.originalDetectIntentRequest.source == "facebook") {
                agent.add('你的問題我轉達了喔');
            }
        }
    };

    // trigger when value is  mathch "我有問題"
    function haveQs() {
        if (request.body.originalDetectIntentRequest.source == "line") {
            agent.add("來來來，快問我，我會盡力回答你\n如果我有不會的，我會請我老闆來回答");
            const lineStickerMessage = {
                "type": "sticker",
                "packageId": "11539",
                "stickerId": "52114129",
            }
            var stickerPayload = new Payload('LINE', lineStickerMessage, {
                sendAsMessage: true
            });
            agent.add(stickerPayload);
        }
        if (request.body.originalDetectIntentRequest.source == "facebook") {
            agent.add("來來來，快問我，我會盡力回答你\n如果我有不會的，我會請我老闆來回答");
        }
    };

    // trigger when value is  mathch "聯絡專人"
    function ContackButton() {
        if (request.body.originalDetectIntentRequest.source == "line") {
            agent.add("好的，立馬幫你聯繫我老闆，會請他盡快回覆你");
            const lineStickerMessage = {
                "type": "sticker",
                "packageId": "11537",
                "stickerId": "52002740",
            }
            var stickerPayload = new Payload('LINE', lineStickerMessage, {
                sendAsMessage: true
            });
            agent.add(stickerPayload);
        }
        if (request.body.originalDetectIntentRequest.source == "facebook") {
            agent.add("好的，立馬幫你聯繫我老闆，會請他盡快回覆你");
        }
    };
    // trigger when value is  mathch "採訪報導"
    async function reportButton() {
        await new Promise((resolve, reject) => {
            const readReport = admin.database().ref("/cardInfo");
            readReport.once('value', (snapshot) => {
                // for-loop generate multi cards
                if (request.body.originalDetectIntentRequest.source == "line") {
                    const reportMessage = {
                        "type": "template",
                        "altText": "this is a carousel template",
                        "template": {
                            "type": "carousel",
                            "columns": [],
                            "imageAspectRatio": "rectangle",
                            "imageSize": "cover"
                        }
                    }
                    for (let i = 0; i < snapshot.val().reportUrl.length; i++) {
                        reportMessage.template.columns.push({
                            "thumbnailImageUrl": snapshot.val().reportThumbnailImageUrl[i],
                            "imageBackgroundColor": "#FFFFFF",
                            "title": snapshot.val().reportTitle[i],
                            "text": snapshot.val().reportDescribe[i],
                            "defaultAction": {
                                "type": "uri",
                                "label": "View detail",
                                "uri": snapshot.val().reportUrl[i]
                            },
                            "actions": [{
                                "type": "uri",
                                "label": "看影片",
                                "uri": snapshot.val().reportUrl[i]
                            }]
                        });
                    }
                    var reportPayload = new Payload('LINE', reportMessage, {
                        sendAsMessage: true
                    });
                    agent.add(reportPayload);
                    resolve(reportPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const reportMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    for (let i = 0; i < snapshot.val().reportUrl.length; i++) {
                        reportMessage.attachment.payload.elements.push({
                            "title": snapshot.val().reportTitle[i],
                            "image_url": snapshot.val().reportThumbnailImageUrl[i],
                            "subtitle": snapshot.val().reportDescribe[i],
                            "default_action": {
                                "type": "web_url",
                                "url": snapshot.val().reportUrl[i],
                                "messenger_extensions": "false",
                                "webview_height_ratio": "full"
                            },
                            "buttons": [{
                                "type": "web_url",
                                "url": snapshot.val().reportUrl[i],
                                "title": "看影片"
                            }]
                        });
                    }
                    var reportPayload = new Payload(agent.FACEBOOK, reportMessage, {
                        sendAsMessage: true
                    });
                    agent.add(reportPayload);
                    resolve(reportPayload)
                }
            });
        });
    };
    // trigger when value is  mathch "產品介紹"
    async function productIntro() {
        await new Promise((resolve, reject) => {
            const readProduct = admin.database().ref("/cardInfo");
            readProduct.once('value', (snapshot) => {

                if (request.body.originalDetectIntentRequest.source == "line") {
                    const productMessage = {
                            "type": "template",
                            "altText": "this is a carousel template",
                            "template": {
                                "type": "carousel",
                                "columns": [],
                                "imageAspectRatio": "rectangle",
                                "imageSize": "cover"
                            }
                        }
                        // for-loop generate multi cards
                    for (let i = 0; i < snapshot.val().productUrl.length; i++) {
                        productMessage.template.columns.push({
                            "thumbnailImageUrl": snapshot.val().productThumbnailImageUrl[i],
                            "imageBackgroundColor": "#FFFFFF",
                            "title": snapshot.val().productTitle[i],
                            "text": snapshot.val().productDescribe[i],
                            "defaultAction": {
                                "type": "uri",
                                "label": "View detail",
                                "uri": snapshot.val().productUrl[i]
                            },
                            "actions": [{
                                    "type": "message",
                                    "label": "詳細介紹",
                                    "text": "詳細介紹"
                                },
                                {
                                    "type": "message",
                                    "label": "如何購買",
                                    "text": "如何購買"
                                },
                                {
                                    "type": "message",
                                    "label": "怎麼吃?",
                                    "text": "怎麼吃?"
                                }
                            ]
                        });
                    }
                    var productPayload = new Payload('LINE', productMessage, {
                        sendAsMessage: true
                    });
                    agent.add(productPayload);
                    resolve(productPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const productMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    for (let i = 0; i < snapshot.val().productUrl.length; i++) {
                        productMessage.attachment.payload.elements.push({
                            "title": snapshot.val().productTitle[i],
                            "image_url": snapshot.val().productThumbnailImageUrl[i],
                            "subtitle": snapshot.val().productDescribe[i],
                            "default_action": {
                                "type": "web_url",
                                "url": snapshot.val().productUrl[i],
                                "messenger_extensions": "false",
                                "webview_height_ratio": "full"
                            },
                            "buttons": [{
                                    "type": "postback",
                                    "title": "詳細介紹",
                                    "payload": "詳細介紹"
                                },
                                {
                                    "type": "postback",
                                    "title": "如何購買",
                                    "payload": "如何購買"
                                },
                                {
                                    "type": "postback",
                                    "title": "怎麼吃?",
                                    "payload": "怎麼吃?"
                                }
                            ]
                        });
                    }
                    var productPayload = new Payload(agent.FACEBOOK, productMessage, {
                        sendAsMessage: true
                    });
                    agent.add(productPayload);
                    resolve(productPayload)
                }


            })
        })
    };

    async function product_environment() {
        await new Promise((resolve, reject) => {
            const readEnvironment = admin.database().ref("/cardInfo");
            readEnvironment.once('value', (snapshot) => {

                if (request.body.originalDetectIntentRequest.source == "line") {
                    const environmenMessage = {
                        "type": "template",
                        "altText": "this is a carousel template",
                        "template": {
                            "type": "carousel",
                            "columns": [],
                            "imageAspectRatio": "rectangle",
                            "imageSize": "cover"
                        }
                    }
                    environmenMessage.template.columns.push({
                        "thumbnailImageUrl": "https://i.imgur.com/G1NxT3M.png",
                        "imageBackgroundColor": "#FFFFFF",
                        "text": "生產環境",
                        "actions": [{
                                "type": "message",
                                "label": "育苗",
                                "text": "育苗"
                            },
                            {
                                "type": "message",
                                "label": "耕種",
                                "text": "耕種"
                            },
                            {
                                "type": "message",
                                "label": "收成",
                                "text": "收成"
                            }
                        ]
                    });
                    var environmentPayload = new Payload('LINE', environmenMessage, {
                        sendAsMessage: true
                    });
                    agent.add(environmentPayload);
                    resolve(environmentPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const environmenMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    environmenMessage.attachment.payload.elements.push({
                        "title": "生產環境",
                        "image_url": "https://i.imgur.com/G1NxT3M.png",
                        "buttons": [{
                                "type": "postback",
                                "title": "育苗",
                                "payload": "育苗"
                            }, {
                                "type": "postback",
                                "title": "耕種",
                                "payload": "耕種"
                            },
                            {
                                "type": "postback",
                                "title": "收成",
                                "payload": "收成"
                            }
                        ]
                    });
                    var environmentPayload = new Payload(agent.FACEBOOK, environmenMessage, {
                        sendAsMessage: true
                    });
                    agent.add(environmentPayload);
                    resolve(environmentPayload)
                }
            })
        })
    };

    async function nursery() {
        await new Promise((resolve, reject) => {
            const readNursery = admin.database().ref("/cardInfo");
            readNursery.once('value', (snapshot) => {

                if (request.body.originalDetectIntentRequest.source == "line") {
                    const nurseryMessage = {
                        "type": "template",
                        "altText": "在不支援顯示樣板的地方顯示的文字",
                        "template": {
                            "type": "image_carousel",
                            "columns": []
                        }
                    }

                    for (let i = 0; i < snapshot.val().nursery.length; i++) {
                        nurseryMessage.template.columns.push({
                            "imageUrl": snapshot.val().nursery[i],
                            "action": {
                                "type": "postback",
                                "data": "action=buy&itemid=111"
                            }
                        });
                    }

                    var nurseryPayload = new Payload('LINE', nurseryMessage, {
                        sendAsMessage: true
                    });
                    agent.add(nurseryPayload);
                    resolve(nurseryPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const nurseryMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    for (let i = 0; i < snapshot.val().nursery.length; i++) {
                        nurseryMessage.attachment.payload.elements.push({
                            "title": "第" + (i + 1) + "張圖",
                            "image_url": snapshot.val().nursery[i]
                        });
                    }
                    var nurseryPayload = new Payload(agent.FACEBOOK, nurseryMessage, {
                        sendAsMessage: true
                    });
                    agent.add(nurseryPayload);
                    resolve(nurseryPayload)
                }
            })
        })
    };


    async function cultivation() {
        await new Promise((resolve, reject) => {
            const readCultivation = admin.database().ref("/cardInfo");
            readCultivation.once('value', (snapshot) => {

                if (request.body.originalDetectIntentRequest.source == "line") {
                    const cultivationMessage = {
                        "type": "template",
                        "altText": "在不支援顯示樣板的地方顯示的文字",
                        "template": {
                            "type": "image_carousel",
                            "columns": []
                        }
                    }

                    for (let i = 0; i < snapshot.val().cultivation.length; i++) {
                        cultivationMessage.template.columns.push({
                            "imageUrl": snapshot.val().cultivation[i],
                            "action": {
                                "type": "postback",
                                "data": "action=buy&itemid=111"
                            }
                        });
                    }

                    var cultivationPayload = new Payload('LINE', cultivationMessage, {
                        sendAsMessage: true
                    });
                    agent.add(cultivationPayload);
                    resolve(cultivationPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const cultivationMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    for (let i = 0; i < snapshot.val().cultivation.length; i++) {
                        cultivationMessage.attachment.payload.elements.push({
                            "title": "第" + (i + 1) + "張圖",
                            "image_url": snapshot.val().cultivation[i]
                        });
                    }
                    var cultivationPayload = new Payload(agent.FACEBOOK, cultivationMessage, {
                        sendAsMessage: true
                    });
                    agent.add(cultivationPayload);
                    resolve(cultivationPayload)
                }


            })
        })
    };

    async function harvest() {
        await new Promise((resolve, reject) => {
            const readHarvest = admin.database().ref("/cardInfo");
            readHarvest.once('value', (snapshot) => {

                if (request.body.originalDetectIntentRequest.source == "line") {
                    const harvestMessage = {
                        "type": "template",
                        "altText": "在不支援顯示樣板的地方顯示的文字",
                        "template": {
                            "type": "image_carousel",
                            "columns": []
                        }
                    }

                    for (let i = 0; i < snapshot.val().harvest.length; i++) {
                        harvestMessage.template.columns.push({
                            "imageUrl": snapshot.val().harvest[i],
                            "action": {
                                "type": "postback",
                                "data": "action=buy&itemid=111"
                            }
                        });
                    }

                    var harvestPayload = new Payload('LINE', harvestMessage, {
                        sendAsMessage: true
                    });
                    agent.add(harvestPayload);
                    resolve(harvestPayload)
                }
                if (request.body.originalDetectIntentRequest.source == "facebook") {
                    const harvestMessage = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }
                    for (let i = 0; i < snapshot.val().harvest.length; i++) {
                        harvestMessage.attachment.payload.elements.push({
                            "title": "第" + (i + 1) + "張圖",
                            "image_url": snapshot.val().harvest[i]
                        });
                    }
                    var harvestPayload = new Payload(agent.FACEBOOK, harvestMessage, {
                        sendAsMessage: true
                    });
                    agent.add(harvestPayload);
                    resolve(harvestPayload)
                }
            })
        })
    };


    let intentMap = new Map();
    //unknow message intent (Default Fallback Intent)
    intentMap.set('Default Fallback Intent', DefaultFallbackIntent);

    //get "我有問題" reply
    intentMap.set('haveQs', haveQs);

    // six menu button intent part
    intentMap.set('ContackButton', ContackButton);
    intentMap.set('reportButton', reportButton);
    intentMap.set('productIntro', productIntro);

    //sections
    intentMap.set('environment', product_environment);
    intentMap.set('nursery', nursery);
    intentMap.set('cultivation', cultivation);
    intentMap.set('harvest', harvest);

    //request handler
    agent.handleRequest(intentMap);
});