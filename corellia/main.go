package main

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"

	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/go-chi/chi/v5"
)

func main() {
	err := sentry.Init(sentry.ClientOptions{
		// TODO: Replace this with your own DSN. This DSN points to a demo project that doesn't exist.
		Dsn:              "https://29aeb047f6b24c3153f2906bc0040fb4@sentry.teknologiumum.com/23",
		SampleRate:       1.0,
		EnableTracing:    true,
		TracesSampleRate: 1.0,
		Environment:      "production",
	})
	if err != nil {
		fmt.Printf("failed to initialize sentry: %v\n", err)
		return
	}

	tlsConfig, err := createTlsConfig()
	if err != nil {
		fmt.Printf("failed to create tls config: %v\n", err)
		return
	}

	httpServer := &http.Server{
		Addr:      net.JoinHostPort("", "7153"),
		Handler:   createMuxHandler(),
		TLSConfig: tlsConfig,
	}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, os.Kill)

	go func() {
		<-sig
		if err := httpServer.Close(); err != nil {
			fmt.Printf("failed to close server: %v\n", err)
		}
	}()

	if err := httpServer.ListenAndServeTLS("", ""); err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("failed to start server: %v\n", err)
	}
}

func createTlsConfig() (*tls.Config, error) {
	certificateAuthorityPool := x509.NewCertPool()
	certificateAuthorityFile, err := os.ReadFile("../certs/rootCA.crt")
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate authority file: %w", err)
	}

	if !certificateAuthorityPool.AppendCertsFromPEM(certificateAuthorityFile) {
		return nil, fmt.Errorf("failed to append certificate authority to pool")
	}

	certificate, err := tls.LoadX509KeyPair("../certs/corellia.crt", "../certs/corellia.key")
	if err != nil {
		return nil, fmt.Errorf("failed to load certificate: %w", err)
	}

	return &tls.Config{
		Certificates:       []tls.Certificate{certificate},
		RootCAs:            certificateAuthorityPool,
		ClientAuth:         tls.RequireAndVerifyClientCert,
		ClientCAs:          certificateAuthorityPool,
		InsecureSkipVerify: false,
		MinVersion:         tls.VersionTLS13,
	}, nil
}

func createMuxHandler() http.Handler {
	mux := chi.NewRouter()
	sentryHandler := sentryhttp.New(sentryhttp.Options{})
	mux.Use(sentryHandler.Handle)
	mux.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.Get("/user", func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		if id == "john" {
			span := sentry.StartSpan(r.Context(), "user.john")
			defer span.Finish()

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{
"id": "john",
"email": "johndoe@example.com",
"first_name": "John",
"last_name": "Doe",
"address": "56 Main St, Springfield, IL 62701",
"phone": "217-555-5555"
}`))
		} else {
			w.WriteHeader(http.StatusNotFound)
		}
	})

	return mux
}
