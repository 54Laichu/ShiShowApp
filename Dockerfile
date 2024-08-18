# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Install Tailwind CSS
RUN npm init -y && \
    npm install tailwindcss@latest postcss@latest autoprefixer@latest

# Initialize Tailwind config if it doesn't exist
RUN if [ ! -f tailwind.config.js ]; then \
        npx tailwindcss init; \
    fi

# Build Tailwind CSS
RUN npx tailwindcss -i ./app/static/css/main.css -o ./app/static/css/output.css --minify

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "ENV=${ENV:-dev} uvicorn main:app --host 0.0.0.0 --port 8000"]
