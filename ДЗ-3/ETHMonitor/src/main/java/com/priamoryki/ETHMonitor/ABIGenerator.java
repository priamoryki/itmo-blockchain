package com.priamoryki.ETHMonitor;

import org.web3j.codegen.SolidityFunctionWrapperGenerator;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

/**
 * @author Pavel Lymar
 */
public class ABIGenerator {
    public static void main(String[] args) throws IOException {
        try (Stream<Path> paths = Files.walk(Paths.get("src/main/resources/abi"))) {
            paths.filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            new SolidityFunctionWrapperGenerator(
                                    null,
                                    path.toFile(),
                                    new File("src/main/java"),
                                    path.toFile().getName().substring(0, path.toFile().getName().lastIndexOf('.')),
                                    "com.priamoryki.ETHMonitor.generated.abi",
                                    true,
                                    false,
                                    20
                            ).generate();
                        } catch (IOException | ClassNotFoundException e) {
                            System.out.println(e.getMessage());
                        }
                    });
        }
    }
}
