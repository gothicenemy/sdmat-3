FROM golang:1.22-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /app/server .

EXPOSE 8080
CMD ["/app/server", "serve"]