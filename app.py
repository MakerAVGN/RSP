import os
import redis
from flask import Flask

app = Flask(__name__)
redis_client = redis.StrictRedis(host='redis', port=6379, decode_responses=True)

@app.route('/')
def home():
    redis_client.set('message', 'Hello, Redis!')
    return redis_client.get('message')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
