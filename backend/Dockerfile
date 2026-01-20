FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

# Copy and install dependencies
COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the app code
COPY ./ /app


