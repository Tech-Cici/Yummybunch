package com.backend.Yummybunch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@ComponentScan(basePackages = "com.backend.Yummybunch")
public class YummybunchApplication {
	private static final Logger logger = LoggerFactory.getLogger(YummybunchApplication.class);

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(YummybunchApplication.class);
		Environment env = app.run(args).getEnvironment();
		
		logger.info("Application '{}' is running! Access URLs:", env.getProperty("spring.application.name"));
		logger.info("Local: http://localhost:{}", env.getProperty("server.port"));
		logger.info("Active profiles: {}", env.getActiveProfiles());
	}

}
