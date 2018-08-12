import ballerina/log;
import ballerina/http;

@final string USER_NAME = "USER_NAME";
@final string POS = "POS";


map<http:WebSocketListener> connections;

@http:ServiceConfig {
    basePath: "/gameserver"
}
service<http:Service> ChatAppUpgrader bind { port: 9090 } {


    @http:ResourceConfig {
        webSocketUpgrade: {
            upgradePath: "/{username}",
            upgradeService: GameService
        }
    }
    upgrader(endpoint caller, http:Request req, string username) {
        endpoint http:WebSocketListener wsCaller;
        map<string> headers;
        wsCaller = caller->acceptWebSocketUpgrade(headers);

        if (!connections.hasKey(username)){
            wsCaller.attributes[USER_NAME] = username;
        } else {
            wsCaller->close(1003, "Username already exists.") but {
                error e => log:printError("Error sending message", err = e)
            };
            done;
        }

        string broadCastMsg;
        match req.getQueryParams()["pos"] {
            string pos => {
                wsCaller.attributes[POS] = pos;
                broadCastMsg = string `{ "user" : "{{username}}" , "pos" : "{{pos}}" }`;
            }
            () => {
                broadCastMsg = string `{{username}} connected to game`;

            }
        }

        wsCaller->pushText("{ \"name\" : \"" + username + "\" }") but {
            error e => log:printError("Error sending message", err = e)
        };

        broadcast(broadCastMsg);

        connections[username] = wsCaller;
    }
}


service<http:WebSocketService> GameService {

    onText(endpoint caller, string text) {
        string msg = string ` { "update" : "{{getAttributeStr(caller, USER_NAME)}}", "pos" : "{{text}}" }`;
        broadcast(msg);
        log:printInfo(msg);
    }

    onClose(endpoint caller, int statusCode, string reason) {
        _ = connections.remove(getAttributeStr(caller, USER_NAME));
        string msg = string `{ "left" : "{{getAttributeStr(caller, USER_NAME)}}" }`;
        broadcast(msg);
    }
}

function broadcast(string text) {
    endpoint http:WebSocketListener caller;
    foreach id, conn in connections {
        caller = conn;
        caller->pushText(text) but {
            error e => log:printError("Error sending message")
        };
    }
}

function getAttributeStr(http:WebSocketListener ep, string key) returns (string) {
    return <string>ep.attributes[key];
}
