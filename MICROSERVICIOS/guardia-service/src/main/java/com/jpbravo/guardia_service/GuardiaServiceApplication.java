package com.jpbravo.guardia_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class GuardiaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GuardiaServiceApplication.class, args);
	}

}
