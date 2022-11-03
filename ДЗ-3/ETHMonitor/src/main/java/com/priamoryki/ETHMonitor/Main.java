package com.priamoryki.ETHMonitor;

import org.json.JSONException;
import org.json.JSONObject;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.websocket.WebSocketService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Pavel Lymar
 */
public class Main {
    private final static String CONFIG_PATH = "src/main/resources/config.json";
    private final static List<String> CONTRACT_NAMES = List.of("ETH_USDT", "LINK_ETH", "USDT_ETH");

    public static void main(String[] args) throws IOException, JSONException {
        JSONObject config = new JSONObject(new String(Files.readAllBytes(Paths.get(CONFIG_PATH))));

        WebSocketService service = new WebSocketService(System.getenv("WEBSOCKET_LINK"), false);
        Web3j web3 = Web3j.build(service);
        service.connect();

        BlocksMonitor blocksMonitor = new BlocksMonitor(web3);

        Map<String, String> addresses = new HashMap<>();
        for (String name : CONTRACT_NAMES) {
            addresses.put(name, config.getString(name));
        }

        ContractsMonitor contractsMonitor = new ContractsMonitor(web3, addresses);
    }
}