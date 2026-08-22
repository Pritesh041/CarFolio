package com.carfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CarfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarfolioApplication.class, args);
    }
}
