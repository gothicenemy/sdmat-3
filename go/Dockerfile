FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

FROM gcr.io/distroless/static-debian11

WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=builder /app/templates ./templates/

EXPOSE 8080
CMD ["/app/server", "serve"]