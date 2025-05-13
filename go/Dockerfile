# --- Етап 1: Збірка (Builder) ---
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Дуже важливо, щоб шляхи до шаблонів у вашому Go коді
# були відносними до робочої директорії або абсолютними,
# і відповідали тому, куди ви їх копіюєте у фінальному образі.
# У стартовому проекті, templates/index.html шукається відносно місця запуску.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

# --- Етап 2: Фінальний образ (Final) ---
FROM scratch

# Встановлюємо робочу директорію у фінальному образі.
# Якщо ваш код очікує шаблони в ./templates, то WORKDIR важливий.
WORKDIR /app

# Копіюємо скомпільований бінарник
COPY --from=builder /app/server /app/server

# Копіюємо папку з шаблонами
COPY --from=builder /app/templates ./templates/
# Ця команда скопіює вміст папки /app/templates з етапу builder
# у папку /app/templates у фінальному образі (оскільки WORKDIR /app).

EXPOSE 8080
CMD ["/app/server", "serve"]