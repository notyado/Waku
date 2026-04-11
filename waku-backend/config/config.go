package config

import "os"

type Config struct {
	Addr    string
	NATSUrl string
}

func Load() *Config {
	return &Config{
		Addr:    getEnv("ADDR", ":8080"),
		NATSUrl: getEnv("NATS_URL", "nats://localhost:4222"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
