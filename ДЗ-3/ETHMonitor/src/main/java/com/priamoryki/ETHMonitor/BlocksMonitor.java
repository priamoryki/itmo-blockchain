package com.priamoryki.ETHMonitor;

import io.reactivex.disposables.Disposable;
import org.web3j.protocol.Web3j;

/**
 * @author Pavel Lymar
 */
public class BlocksMonitor {
    private final Disposable subscription;

    public BlocksMonitor(Web3j web3) {
        subscription = web3.blockFlowable(true).subscribe(
                block -> System.out.printf(
                        "New Block with params: ts=%d, number=%d, hash=%s%n",
                        block.getBlock().getTimestamp(),
                        block.getBlock().getNumber(),
                        block.getBlock().getHash()
                )
        );
    }

    public void dispose() {
        subscription.dispose();
    }

    public boolean isDisposed() {
        return subscription.isDisposed();
    }
}
