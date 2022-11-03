package com.priamoryki.ETHMonitor;

import com.priamoryki.ETHMonitor.generated.abi.ExchangeRate;
import io.reactivex.disposables.Disposable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.EventValues;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.protocol.Web3j;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * @author Pavel Lymar
 */
public class ContractsMonitor {
    private final static Event event = ExchangeRate.ANSWERUPDATED_EVENT;
    private final Map<String, Disposable> subscriptions;

    public ContractsMonitor(Web3j web3, Map<String, String> addresses) {
        subscriptions = new HashMap<>();
        addresses.forEach((name, address) ->
                subscriptions.put(
                        name,
                        web3.logsNotifications(
                                List.of(address),
                                List.of(EventEncoder.encode(event))
                        ).subscribe(
                                log -> {
                                    System.out.println(log.getParams().getResult().getData());
                                    EventValues values = parseData(
                                            log.getParams().getResult().getData(),
                                            log.getParams().getResult().getTopics()
                                    );
                                    BigInteger current = (BigInteger) values.getIndexedValues().get(0).getValue();
                                    BigInteger roundId = (BigInteger) values.getIndexedValues().get(1).getValue();
                                    String result = values.getIndexedValues().stream().map(
                                            value -> value.getTypeAsString() + ": " + value.getValue()
                                    ).collect(Collectors.joining(", "));
                                    BigInteger updatedAt = (BigInteger) values.getNonIndexedValues().get(0).getValue();
                                    System.out.printf(
                                            "%s update: ts=%d, current=%d, roundId=%d%n",
                                            name,
                                            updatedAt,
                                            current,
                                            roundId
                                    );
                                }
                        )
                )
        );
    }

    public void disposeByName(String name) {
        subscriptions.get(name).dispose();
    }

    private EventValues parseData(String data, List<String> topics) {
        List<TypeReference<Type>> params = event.getIndexedParameters();
        return new EventValues(
                IntStream.range(0, params.size())
                        .mapToObj(i -> FunctionReturnDecoder.decodeIndexedValue(
                                topics.get(i + 1), params.get(i)
                        )).collect(Collectors.toList()),
                FunctionReturnDecoder.decode(
                        data,
                        event.getNonIndexedParameters()
                )
        );
    }
}
