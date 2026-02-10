package de.kesselops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KesselOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(KesselOpsApplication.class, args);
    }

}
