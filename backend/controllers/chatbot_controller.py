import requests, os
from flask import jsonify, request
from utils.db import mongo

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

def chatbot_message():
    data = request.get_json()
    message = data.get("message")
    userId = data.get("userId")
    userName = data.get("userName")
    print(f"[Chatbot] Received message: {message} from userId: {userId}, userName: {userName}")

    if not message:
        return jsonify({"reply": "Please send a message."}), 400

    try:
        n8n_response = requests.post(
            N8N_WEBHOOK_URL,
            json={
                "chatInput": data.get("message"),
                "userId": data.get("userId"),
                "userName": data.get("userName")
            },
            timeout=10
        )
        print(f"[Chatbot] N8N response: {n8n_response}, chatInput: {message}, userId: {userId}, userName: {userName}")
        n8n_response.raise_for_status()
        n8n_data = n8n_response.json()
        reply = n8n_data.get("reply", n8n_data.get("output", "I don't know."))
    except Exception as e:
        print(f"[Error] n8n unreachable: {e}")
        reply = "I'm having trouble connecting. Please try again later."

    return jsonify({"reply": reply}), 200