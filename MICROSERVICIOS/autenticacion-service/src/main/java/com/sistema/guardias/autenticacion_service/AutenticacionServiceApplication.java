package com.sistema.guardias.autenticacion_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AutenticacionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutenticacionServiceApplication.class, args);
	}

}

