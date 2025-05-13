FROM python:3.10-alpine

WORKDIR /app

COPY requirements/backend.in .

RUN pip install --no-cache-dir -r backend.in

COPY . .

EXPOSE 80

CMD ["uvicorn", "spaceship.app:app", "--host", "0.0.0.0", "--port", "80"]