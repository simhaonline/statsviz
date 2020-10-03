(function () {
    function $(id) {
        return document.getElementById(id);
    }

    function buildWebsocketURI() {
        var loc = window.location, ws_prot = "ws:";
        if (loc.protocol === "https:") {
            ws_uri = "wss:";
        }
        return ws_prot + "//" + loc.host + loc.pathname + "ws"
    }

    const dataRetentionSeconds = 60;

    function updateStats(memStats) {
        stats.pushData(new Date(), memStats);

        if (ui.isPaused()) {
            return
        }

        let data = stats.slice(dataRetentionSeconds);

        if (ui.plots == null) {
            if (stats.length() < 2) {
                return
            }
            stats.initClassSizes(memStats.Mem.BySize);

            let elts = {
                heap: $("heap-plot"),
                bySizes: $("bysizes-plot"),
            };

            ui.createPlots(opts, data, elts);
        }

        // let xScale = {
        //     min: now - 60,
        //     max: now,
        // };

        ui.updatePlots(/*xScale*/ null, data);
    }


    /* WebSocket callbacks */

    let socket = new WebSocket(buildWebsocketURI());
    console.log("Attempting Connection...");

    socket.onopen = () => {
        console.log("Successfully Connected");
        stats.init(dataRetentionSeconds);
    };

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        socket.send("Client Closed!")
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };

    socket.onmessage = event => {
        updateStats(JSON.parse(event.data));
    }
}());
